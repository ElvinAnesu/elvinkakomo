"use client";

import { use, useState, useEffect, useRef } from "react";
import Card from "../../../components/Card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface InvoiceItem {
  id: number;
  item_description: string;
  quantity: number;
  price: number;
  total: number;
}

interface Invoice {
  id: number;
  created_at: string;
  client: string | null;
  is_paid: boolean;
  notes: string | null;
  items: InvoiceItem[];
  total: number;
  customerName?: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InvoiceDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Fetch invoice from Supabase
  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.push("/auth/login");
          return;
        }

        // Get user profile to verify ownership and get name
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, name")
          .eq("id", user.id)
          .single();

        if (!profile) {
          setLoading(false);
          return;
        }

        const invoiceId = parseInt(id);
        if (isNaN(invoiceId)) {
          setLoading(false);
          return;
        }

        // Fetch invoice and verify it belongs to this client
        const { data: invoiceData, error: invoiceError } = await supabase
          .from("invoices")
          .select(`
            id,
            created_at,
            client,
            is_paid,
            notes,
            invoice_items (
              id,
              item_description,
              quantity,
              price,
              total
            )
          `)
          .eq("id", invoiceId)
          .eq("client", profile.id)
          .single();

        if (invoiceError || !invoiceData) {
          console.error("Error fetching invoice:", invoiceError);
          setLoading(false);
          return;
        }

        const items = invoiceData.invoice_items && Array.isArray(invoiceData.invoice_items)
          ? invoiceData.invoice_items as InvoiceItem[]
          : [];

        const total = items.reduce((sum, item) => {
          return sum + parseFloat(item.total?.toString() || "0");
        }, 0);

        setInvoice({
          id: invoiceData.id,
          created_at: invoiceData.created_at,
          client: invoiceData.client,
          is_paid: invoiceData.is_paid,
          notes: invoiceData.notes,
          items,
          total,
          customerName: profile.name || user.email?.split("@")[0] || "Customer",
        });
      } catch (error) {
        console.error("Error fetching invoice:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id, router]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B21A8] mx-auto mb-4"></div>
          <p className="text-[#64748B]">Loading invoice...</p>
        </div>
      </div>
    );
  }

  const getStatusDisplay = (isPaid: boolean) => {
    return isPaid ? "Paid" : "Outstanding";
  };

  const getStatusClass = (isPaid: boolean) => {
    return isPaid
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";
  };

  if (!invoice) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Billing</span>
          </Link>
        </div>
        <Card>
          <div className="text-center py-12">
            <p className="text-xl font-semibold text-[#0F172A] mb-2">
              Invoice Not Found
            </p>
            <p className="text-[#64748B] mb-6">
              The invoice you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
            </p>
            <Button
              onClick={() => router.push("/dashboard/billing")}
              className="gradient-purple text-white"
            >
              Back to Billing
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleDownload = async () => {
    if (!invoice || !invoiceRef.current) return;

    setIsGeneratingPDF(true);

    try {
      // Hide the header actions temporarily
      const headerActions = document.querySelector('[data-invoice-header]');
      if (headerActions) {
        (headerActions as HTMLElement).style.display = 'none';
      }

      // Generate canvas from invoice content
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // Restore header actions
      if (headerActions) {
        (headerActions as HTMLElement).style.display = '';
      }

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      // Add first page
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download PDF
      pdf.save(`Invoice-${invoice.id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header Actions */}
      <div className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10" data-invoice-header>
        <div className="max-w-4xl mx-auto px-8 py-4 flex justify-between items-center">
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Billing</span>
          </Link>
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={isGeneratingPDF}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isGeneratingPDF ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div ref={invoiceRef}>
          <Card className="bg-white shadow-lg">
          {/* Invoice Header */}
          <div className="border-b border-[#E5E7EB] pb-8 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-bold text-[#0F172A] mb-2">INVOICE</h1>
                <p className="text-[#64748B] text-sm">Invoice #{invoice.id}</p>
              </div>
              <div className="text-right">
                <div className="mb-4">
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-xs font-bold uppercase ${getStatusClass(invoice.is_paid)}`}
                  >
                    {getStatusDisplay(invoice.is_paid)}
                  </span>
                </div>
                <p className="text-sm text-[#64748B]">Elvin Kakomo</p>
                <p className="text-sm text-[#64748B]">Product Engineer</p>
              </div>
            </div>
          </div>

          {/* Bill To and Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-[#64748B] uppercase mb-3">Bill To</h3>
              <p className="text-lg font-semibold text-[#0F172A] mb-1">{invoice.customerName || "Customer"}</p>
            </div>
            <div className="text-right md:text-left">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#64748B] mb-1">Invoice Date</p>
                  <p className="text-base font-medium text-[#0F172A]">
                    {new Date(invoice.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#64748B] mb-1">Due Date</p>
                  <p className="text-base font-medium text-[#0F172A]">
                    {new Date(invoice.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#E5E7EB]">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#64748B] uppercase">
                    Description
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-[#64748B] uppercase">
                    Quantity
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-[#64748B] uppercase">
                    Price
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-[#64748B] uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 px-4 text-center text-[#64748B]">
                      No items found
                    </td>
                  </tr>
                ) : (
                  invoice.items.map((item) => (
                    <tr key={item.id} className="border-b border-[#E5E7EB]">
                      <td className="py-4 px-4 text-[#0F172A]">{item.item_description}</td>
                      <td className="py-4 px-4 text-right text-[#0F172A]">{item.quantity}</td>
                      <td className="py-4 px-4 text-right text-[#0F172A]">
                        ${parseFloat(item.price.toString()).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-[#0F172A]">
                        ${parseFloat(item.total.toString()).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-80 space-y-3">
              <div className="flex justify-between text-sm text-[#64748B]">
                <span>Subtotal</span>
                <span className="text-[#0F172A] font-medium">
                  ${invoice.total.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-[#64748B]">
                <span>Tax (0%)</span>
                <span className="text-[#0F172A] font-medium">$0.00</span>
              </div>
              <div className="flex justify-between pt-3 border-t-2 border-[#E5E7EB]">
                <span className="text-lg font-semibold text-[#0F172A]">Total</span>
                <span className="text-2xl font-bold text-green-600">
                  ${invoice.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="pt-8 border-t border-[#E5E7EB]">
              <h3 className="text-sm font-semibold text-[#64748B] uppercase mb-2">Notes</h3>
              <p className="text-sm text-[#0F172A]">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-[#E5E7EB]">
            <p className="text-xs text-[#64748B] text-center">
              Thank you for your business!
            </p>
            <p className="text-xs text-[#64748B] text-center mt-2">
              Payment terms: Net 30 days
            </p>
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
}
