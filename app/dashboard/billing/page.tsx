"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "../../components/Card";
import { supabase } from "@/lib/supabase";
import { resolveDashboardClientContext } from "@/lib/dashboard-impersonation";

interface Payment {
  id: number;
  amount: number;
  payment_date: string;
  remarks: string | null;
}

interface Invoice {
  id: number;
  created_at: string;
  client: string;
  is_paid: boolean;
  notes: string | null;
  total: number;
  amount_paid: number;
  amount_due: number;
  invoice_items: InvoiceItem[];
  payments?: Payment[] | null;
}

interface InvoiceItem {
  id: number;
  item_description: string;
  quantity: number;
  price: number;
  total: number;
}

// Format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function BillingPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "paid" | "outstanding">("all");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);

      const dashboardContext = await resolveDashboardClientContext();
      if (!dashboardContext.authenticated) {
        router.push("/auth/login");
        return;
      }

      if (!dashboardContext.effectiveClientId) {
        setError("Failed to load profile");
        setLoading(false);
        return;
      }

      // Fetch invoices for this client (with items and payment history)
      const { data: invoicesData, error: invoicesError } = await supabase
        .from("invoices")
        .select(
          `
          *,
          invoice_items (
            id,
            item_description,
            quantity,
            price,
            total
          ),
          payments (
            id,
            amount,
            payment_date,
            remarks
          )
        `
        )
        .eq("client", dashboardContext.effectiveClientId)
        .order("created_at", { ascending: false });

      // Sort payments by payment_date desc within each invoice
      if (!invoicesError && invoicesData) {
        invoicesData.forEach((inv: Invoice) => {
          if (inv.payments && inv.payments.length > 0) {
            inv.payments.sort(
              (a, b) =>
                new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime()
            );
          }
        });
      }

      if (invoicesError) {
        console.error("Error fetching invoices:", invoicesError);
        setError("Failed to load invoices");
      } else {
        setInvoices(invoicesData || []);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total invoice amount
  const calculateInvoiceTotal = (invoice: Invoice): number => {
    if (!invoice.invoice_items || invoice.invoice_items.length === 0) return 0;
    return invoice.invoice_items.reduce(
      (sum, item) => sum + parseFloat(item.total.toString() || "0"),
      0
    );
  };

  // Filter invoices
  const filteredInvoices =
    filter === "all"
      ? invoices
      : filter === "paid"
      ? invoices.filter((inv) => inv.is_paid)
      : invoices.filter((inv) => !inv.is_paid);

  // Summary totals from adjusted invoice values (amount_paid, amount_due in DB)
  const totalPaid = invoices.reduce(
    (sum, inv) => sum + parseFloat(String(inv.amount_paid ?? 0)),
    0
  );
  const totalOutstanding = invoices.reduce(
    (sum, inv) => sum + parseFloat(String(inv.amount_due ?? 0)),
    0
  );

  const toNum = (n: number | string): number =>
    typeof n === "number" ? n : parseFloat(String(n ?? 0));

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B21A8] mx-auto mb-4"></div>
          <p className="text-[#64748B]">Loading invoices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex items-center justify-center min-h-full">
        <Card className="max-w-md">
          <h2 className="text-xl font-semibold text-[#0F172A] mb-4">Error</h2>
          <p className="text-[#64748B] mb-4">{error}</p>
          <button
            onClick={fetchInvoices}
            className="px-4 py-2 bg-[#6B21A8] text-white rounded-lg hover:bg-[#7C3AED]"
          >
            Try Again
          </button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
          <h1 className="text-3xl font-bold text-[#0F172A] mb-8">Billing & Invoices</h1>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <p className="text-sm text-[#64748B] mb-2">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">
                ${totalPaid.toFixed(2)}
              </p>
            </Card>
            <Card>
              <p className="text-sm text-[#64748B] mb-2">Outstanding</p>
              <p className="text-2xl font-bold text-yellow-600">
                ${totalOutstanding.toFixed(2)}
              </p>
            </Card>
            <Card>
              <p className="text-sm text-[#64748B] mb-2">Total Invoices</p>
              <p className="text-2xl font-bold text-[#0F172A]">{invoices.length}</p>
            </Card>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "all"
                  ? "bg-[#6B21A8] text-white"
                  : "bg-[#F9FAFB] text-[#64748B] hover:bg-[#E5E7EB]"
              }`}
            >
              All ({invoices.length})
            </button>
            <button
              onClick={() => setFilter("paid")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "paid"
                  ? "bg-[#6B21A8] text-white"
                  : "bg-[#F9FAFB] text-[#64748B] hover:bg-[#E5E7EB]"
              }`}
            >
              Paid ({invoices.filter((inv) => inv.is_paid).length})
            </button>
            <button
              onClick={() => setFilter("outstanding")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "outstanding"
                  ? "bg-[#6B21A8] text-white"
                  : "bg-[#F9FAFB] text-[#64748B] hover:bg-[#E5E7EB]"
              }`}
            >
              Outstanding ({invoices.filter((inv) => !inv.is_paid).length})
            </button>
          </div>

          {/* Invoices List */}
          {filteredInvoices.length === 0 ? (
            <Card>
              <p className="text-[#64748B] text-center py-8">
                {filter === "all"
                  ? "No invoices found."
                  : filter === "paid"
                  ? "No paid invoices found."
                  : "No outstanding invoices found."}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => {
                const invTotal = toNum(invoice.total);
                const invPaid = toNum(invoice.amount_paid);
                const invDue = toNum(invoice.amount_due);
                const payments = invoice.payments ?? [];
                return (
                  <Link key={invoice.id} href={`/dashboard/billing/${invoice.id}`}>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[#0F172A] mb-1">
                            Invoice #{invoice.id}
                          </h3>
                          <p className="text-sm text-[#64748B] mb-3">
                            {formatDate(invoice.created_at)}
                          </p>

                          {/* Adjusted invoice values */}
                          <div className="flex flex-wrap gap-4 mb-4 p-3 bg-[#FAFAFA] rounded-lg border border-[#E5E7EB]">
                            <div>
                              <p className="text-xs text-[#64748B] uppercase tracking-wide">Total</p>
                              <p className="text-base font-semibold text-[#0F172A]">
                                ${invTotal.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#64748B] uppercase tracking-wide">Amount paid</p>
                              <p className="text-base font-semibold text-green-600">
                                ${invPaid.toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-[#64748B] uppercase tracking-wide">Amount due</p>
                              <p className="text-base font-semibold text-yellow-600">
                                ${invDue.toFixed(2)}
                              </p>
                            </div>
                          </div>

                        {/* Invoice line items */}
                        {invoice.invoice_items && invoice.invoice_items.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-sm font-semibold text-[#0F172A] mb-2">
                              Items:
                            </p>
                            {invoice.invoice_items.map((item) => (
                              <div
                                key={item.id}
                                className="flex justify-between items-start p-2 bg-[#FAFAFA] rounded-lg"
                              >
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-[#0F172A]">
                                    {item.item_description}
                                  </p>
                                  <p className="text-xs text-[#64748B]">
                                    Qty: {item.quantity} × ${parseFloat(item.price.toString()).toFixed(2)}
                                  </p>
                                </div>
                                <p className="text-sm font-semibold text-[#0F172A]">
                                  ${parseFloat(item.total.toString()).toFixed(2)}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Payment history */}
                        {payments.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <p className="text-sm font-semibold text-[#0F172A] mb-2">
                              Payment history
                            </p>
                            <ul className="space-y-2">
                              {payments.map((p) => (
                                <li
                                  key={p.id}
                                  className="flex justify-between items-start p-2 bg-white rounded-lg border border-[#E5E7EB] text-sm"
                                >
                                  <div className="flex-1">
                                    <span className="font-medium text-[#0F172A]">
                                      {formatDate(p.payment_date)}
                                    </span>
                                    {p.remarks && (
                                      <p className="text-xs text-[#64748B] mt-0.5">
                                        {p.remarks}
                                      </p>
                                    )}
                                  </div>
                                  <span className="font-semibold text-green-600 whitespace-nowrap ml-2">
                                    ${toNum(p.amount).toFixed(2)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-6">
                        <p className="text-2xl font-bold text-[#0F172A] mb-2">
                          ${invTotal.toFixed(2)}
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            invoice.is_paid
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {invoice.is_paid ? "Paid" : "Outstanding"}
                        </span>
                      </div>
                    </div>
                    {invoice.notes && (
                      <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                        <p className="text-sm text-[#64748B]">
                          <span className="font-semibold">Notes:</span> {invoice.notes}
                        </p>
                      </div>
                    )}
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
    </div>
  );
}
