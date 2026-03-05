"use client";

import { use, useState, useEffect } from "react";
import Card from "../../../../components/Card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import jsPDF from "jspdf";

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
  clientName?: string;
  is_paid: boolean;
  notes: string | null;
  items: InvoiceItem[];
  total: number;
  amount_paid: number;
  amount_due: number;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InvoiceDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  // Fetch invoice from Supabase
  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const invoiceId = parseInt(id);
        if (isNaN(invoiceId)) {
          setLoading(false);
          return;
        }

        const { data: invoiceData, error: invoiceError } = await supabase
          .from("invoices")
          .select(`
            id,
            created_at,
            client,
            is_paid,
            notes,
            amount_paid,
            amount_due,
            profiles:client (
              id,
              name,
              email
            ),
            invoice_items (
              id,
              item_description,
              quantity,
              price,
              total
            )
          `)
          .eq("id", invoiceId)
          .single();

        if (invoiceError) {
          console.error("Error fetching invoice:", invoiceError);
          setLoading(false);
          return;
        }

        if (invoiceData) {
          const clientInfo = invoiceData.profiles && typeof invoiceData.profiles === 'object' && !Array.isArray(invoiceData.profiles) && 'name' in invoiceData.profiles
            ? (invoiceData.profiles as { name: string; id: string })
            : null;

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
            clientName: clientInfo?.name || "Unknown Client",
            is_paid: invoiceData.is_paid,
            notes: invoiceData.notes,
            items,
            total,
            amount_paid: invoiceData.amount_paid,
            amount_due: invoiceData.amount_due,
          });
        }
      } catch (error) {
        console.error("Error fetching invoice:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-12">
          <p className="text-[#64748B]">Loading invoice...</p>
        </div>
      </div>
    );
  }

  const getStatusDisplay = (isPaid: boolean) => {
    return isPaid ? "Paid" : "Pending";
  };

  const getStatusClass = (isPaid: boolean) => {
    return isPaid
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";
  };

  const handleDelete = async () => {
    if (!invoice) return;

    try {
      // Delete invoice items first
      const { error: itemsError } = await supabase
        .from("invoice_items")
        .delete()
        .eq("invoice", invoice.id);

      if (itemsError) {
        console.error("Error deleting invoice items:", itemsError);
        alert("Failed to delete invoice items. Please try again.");
        return;
      }

      // Delete invoice
      const { error: invoiceError } = await supabase
        .from("invoices")
        .delete()
        .eq("id", invoice.id);

      if (invoiceError) {
        console.error("Error deleting invoice:", invoiceError);
        alert("Failed to delete invoice. Please try again.");
        return;
      }

      router.push("/admin/finance/billing");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert("Failed to delete invoice. Please try again.");
    }
  };

  if (!invoice) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Link
            href="/admin/finance/billing"
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
              The invoice you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button
              onClick={() => router.push("/admin/finance/billing")}
              className="gradient-purple text-white"
            >
              Back to Billing
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const handleDownload = () => {
    if (!invoice) return;

    setIsGeneratingPDF(true);

    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 20;
      const col1 = margin;
      const col2 = 60;
      const col3 = 110;
      const col4 = 140;
      const col5 = pageW - margin;
      let y = margin;

      const line = (yPos: number) => {
        doc.setDrawColor(229, 231, 235);
        doc.line(margin, yPos, pageW - margin, yPos);
      };

      // Header
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("INVOICE", col1, y);
      y += 6;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`Invoice #${invoice.id}`, col1, y);
      y += 10;

      // Status + company (right)
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text(invoice.is_paid ? "Paid" : "Pending", col5, y - 10, { align: "right" });
      doc.setTextColor(100, 116, 139);
      doc.text("Elvin Kakomo", col5, y - 4, { align: "right" });
      doc.text("Product Engineer", col5, y + 2, { align: "right" });
      y += 4;

      line(y);
      y += 14;

      // Bill To
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("BILL TO", col1, y);
      y += 6;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(invoice.clientName || "Unknown Client", col1, y);
      y += 10;

      // Invoice Date (right)
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Invoice Date", col5, y - 10, { align: "right" });
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      const invoiceDate = new Date(invoice.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.text(invoiceDate, col5, y - 4, { align: "right" });
      y += 12;

      // Table header
      line(y);
      y += 7;
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Description", col1, y);
      doc.text("Quantity", col4, y, { align: "right" });
      doc.text("Price", col3, y, { align: "right" });
      doc.text("Total", col5, y, { align: "right" });
      y += 6;
      line(y);
      y += 8;

      // Table rows
      doc.setTextColor(15, 23, 42);
      const itemDescMaxW = col3 - col2 - 4;
      for (const item of invoice.items) {
        const descLines = doc.splitTextToSize(item.item_description, itemDescMaxW);
        const rowH = Math.max(6, descLines.length * 5);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text(descLines, col1, y + rowH / 2 - (descLines.length - 1) * 2.5);
        doc.text(String(item.quantity), col4, y + rowH / 2 - 1.5, { align: "right" });
        doc.text(`$${parseFloat(item.price.toString()).toFixed(2)}`, col3, y + rowH / 2 - 1.5, { align: "right" });
        doc.text(`$${parseFloat(item.total.toString()).toFixed(2)}`, col5, y + rowH / 2 - 1.5, { align: "right" });
        y += rowH + 2;
        if (y > 260) {
          doc.addPage();
          y = margin;
        }
      }

      y += 6;
      line(y);
      y += 12;

      // Totals (right-aligned block)
      const totX = col5 - 50;
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("Subtotal", totX, y, { align: "right" });
      doc.setTextColor(15, 23, 42);
      doc.text(`$${invoice.total.toFixed(2)}`, col5, y, { align: "right" });
      y += 6;
      doc.setTextColor(100, 116, 139);
      doc.text("Tax (0%)", totX, y, { align: "right" });
      doc.setTextColor(15, 23, 42);
      doc.text("$0.00", col5, y, { align: "right" });
      y += 8;
      doc.setDrawColor(229, 231, 235);
      doc.line(totX, y - 2, col5, y - 2);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Total", totX, y + 5, { align: "right" });
      doc.text(`$${invoice.total.toFixed(2)}`, col5, y + 5, { align: "right" });
      y += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text("Amount Paid", totX, y, { align: "right" });
      doc.setTextColor(15, 23, 42);
      doc.text(`$${invoice.amount_paid.toFixed(2)}`, col5, y, { align: "right" });
      y += 6;
      doc.setTextColor(100, 116, 139);
      doc.text("Amount Due", totX, y, { align: "right" });
      doc.setTextColor(220, 38, 38);
      doc.text(`$${invoice.amount_due.toFixed(2)}`, col5, y, { align: "right" });
      y += 14;

      // Notes
      if (invoice.notes) {
        doc.setDrawColor(229, 231, 235);
        doc.line(margin, y, pageW - margin, y);
        y += 10;
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text("NOTES", margin, y);
        y += 6;
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        const noteLines = doc.splitTextToSize(invoice.notes, pageW - 2 * margin);
        doc.text(noteLines, margin, y);
        y += noteLines.length * 5 + 10;
      }

      // Footer
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, y, pageW - margin, y);
      y += 10;
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Thank you for your business!", pageW / 2, y, { align: "center" });

      doc.save(`Invoice-${invoice.id}.pdf`);
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
            href="/admin/finance/billing"
            className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Billing</span>
          </Link>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isGeneratingPDF ? "Generating..." : "Download PDF"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="max-w-4xl mx-auto px-8 py-12">
        <div data-invoice-content>
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
              <p className="text-lg font-semibold text-[#0F172A] mb-1">{invoice.clientName || "Unknown Client"}</p>
            </div>
            <div className="text-right md:text-left">
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
              <div className="flex justify-between text-sm text-[#64748B]">
                <span>Amount Paid</span>
                <span className="text-[#0F172A] font-medium">
                  ${invoice.amount_paid.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-[#64748B]">
                <span>Amount Due</span>
                <span className="text-red-500 font-bold">${invoice.amount_due.toFixed(2)}</span>
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
          </div>
        </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
