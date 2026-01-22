"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "../../components/Card";
import { supabase } from "@/lib/supabase";

interface Invoice {
  id: number;
  created_at: string;
  client: string;
  is_paid: boolean;
  notes: string | null;
  invoice_items: InvoiceItem[];
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

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/auth/login");
        return;
      }

      // Get user profile to get client ID
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        setError("Failed to load profile");
        setLoading(false);
        return;
      }

      const clientId = profile.id;

      // Fetch invoices for this client
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
          )
        `
        )
        .eq("client", clientId)
        .order("created_at", { ascending: false });

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

  // Calculate totals
  const totalPaid = invoices
    .filter((inv) => inv.is_paid)
    .reduce((sum, inv) => sum + calculateInvoiceTotal(inv), 0);

  const totalOutstanding = invoices
    .filter((inv) => !inv.is_paid)
    .reduce((sum, inv) => sum + calculateInvoiceTotal(inv), 0);

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
                const total = calculateInvoiceTotal(invoice);
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

                        {/* Invoice Items */}
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
                      </div>
                      <div className="text-right ml-6">
                        <p className="text-2xl font-bold text-[#0F172A] mb-2">
                          ${total.toFixed(2)}
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
