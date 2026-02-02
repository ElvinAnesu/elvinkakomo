"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Card from "../../../components/Card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
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
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Invoice {
  id: number;
  created_at: string;
  client: string | null;
  clientName?: string;
  is_paid: boolean;
  notes: string | null;
  total: number;
}

export default function BillingPage() {
  const [billingFilter, setBillingFilter] = useState("all");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<number | null>(null);
  const router = useRouter();

  // Fetch invoices from Supabase
  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const { data: invoicesData, error: invoicesError } = await supabase
          .from("invoices")
          .select(`
            id,
            created_at,
            client,
            is_paid,
            notes,
            total,
            profiles:client (
              id,
              name,
              email
            )
          `)
          .order("created_at", { ascending: false });

        if (invoicesError) {
          console.error("Error fetching invoices:", invoicesError);
          setLoading(false);
          return;
        }

       
        if (invoicesData) {

          // Process invoices to include client name and calculate total
          const processedInvoices = invoicesData.map((invoice) => {
            const clientInfo = invoice.profiles && typeof invoice.profiles === 'object' && !Array.isArray(invoice.profiles) && 'name' in invoice.profiles
              ? (invoice.profiles as { name: string; id: string })
              : null;

            return {
              id: invoice.id,
              created_at: invoice.created_at,
              client: invoice.client,
              clientName: clientInfo?.name || "Unknown Client",
              is_paid: invoice.is_paid,
              notes: invoice.notes,
              total: invoice.total,
            };
          });

          setInvoices(processedInvoices);
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handleDeleteClick = (invoiceId: number) => {
    setInvoiceToDelete(invoiceId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (invoiceToDelete === null) {
      setIsDeleteDialogOpen(false);
      return;
    }

    try {
      // Delete invoice items first
      const { error: itemsError } = await supabase
        .from("invoice_items")
        .delete()
        .eq("invoice", invoiceToDelete);

      if (itemsError) {
        console.error("Error deleting invoice items:", itemsError);
        alert("Failed to delete invoice items. Please try again.");
        setIsDeleteDialogOpen(false);
        return;
      }

      // Delete invoice
      const { error: invoiceError } = await supabase
        .from("invoices")
        .delete()
        .eq("id", invoiceToDelete);

      if (invoiceError) {
        console.error("Error deleting invoice:", invoiceError);
        alert("Failed to delete invoice. Please try again.");
        setIsDeleteDialogOpen(false);
        return;
      }

      // Update local state
      setInvoices(invoices.filter((inv) => inv.id !== invoiceToDelete));
      setInvoiceToDelete(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert("Failed to delete invoice. Please try again.");
      setIsDeleteDialogOpen(false);
    }
  };

  const getStatusDisplay = (isPaid: boolean) => {
    return isPaid ? "Paid" : "Pending";
  };

  const getStatusClass = (isPaid: boolean) => {
    return isPaid
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";
  };

  const renderInvoiceCard = (invoice: Invoice) => (
    <Card key={invoice.id} className="cursor-pointer hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <Link href={`/admin/finance/billing/${invoice.id}`} className="flex-1">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <h3 className="text-lg font-semibold text-[#0F172A]">
                {invoice.clientName || "Unknown Client"}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusClass(invoice.is_paid)}`}
              >
                {getStatusDisplay(invoice.is_paid)}
              </span>
            </div>
            {invoice.notes && (
              <p className="text-[#64748B] mb-2">{invoice.notes}</p>
            )}
            <p className="text-sm text-[#64748B]">
              {new Date(invoice.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-green-600">
              ${(invoice.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDeleteClick(invoice.id);
            }}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A]">Billing</h1>
          <Link href="/admin/finance/billing/new">
            <button className="px-5 py-2 gradient-purple text-white rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-semibold">
              + Add Invoice
            </button>
          </Link>
        </div>

        <Tabs value={billingFilter} onValueChange={setBillingFilter} className="mb-6">
          <TabsList className="bg-[#FAFAFA] border border-[#E5E7EB]">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#6B21A8] data-[state=active]:text-white">
              All
            </TabsTrigger>
            <TabsTrigger value="paid" className="data-[state=active]:bg-[#6B21A8] data-[state=active]:text-white">
              Paid
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-[#6B21A8] data-[state=active]:text-white">
              Pending
            </TabsTrigger>
            <TabsTrigger value="overdue" className="data-[state=active]:bg-[#6B21A8] data-[state=active]:text-white">
              Overdue
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {loading ? (
                <Card>
                  <p className="text-[#64748B] text-center py-8">Loading invoices...</p>
                </Card>
              ) : invoices.length === 0 ? (
                <Card>
                  <p className="text-[#64748B] text-center py-8">No invoices found</p>
                </Card>
              ) : (
                invoices.map((invoice) => renderInvoiceCard(invoice))
              )}
            </div>
          </TabsContent>

          <TabsContent value="paid" className="mt-6">
            <div className="space-y-4">
              {loading ? (
                <Card>
                  <p className="text-[#64748B] text-center py-8">Loading invoices...</p>
                </Card>
              ) : invoices.filter((inv) => inv.is_paid).length === 0 ? (
                <Card>
                  <p className="text-[#64748B] text-center py-8">No paid invoices found</p>
                </Card>
              ) : (
                invoices
                  .filter((inv) => inv.is_paid)
                  .map((invoice) => renderInvoiceCard(invoice))
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <div className="space-y-4">
              {loading ? (
                <Card>
                  <p className="text-[#64748B] text-center py-8">Loading invoices...</p>
                </Card>
              ) : invoices.filter((inv) => !inv.is_paid).length === 0 ? (
                <Card>
                  <p className="text-[#64748B] text-center py-8">No pending invoices found</p>
                </Card>
              ) : (
                invoices
                  .filter((inv) => !inv.is_paid)
                  .map((invoice) => renderInvoiceCard(invoice))
              )}
            </div>
          </TabsContent>

          <TabsContent value="overdue" className="mt-6">
            <div className="space-y-4">
              <Card>
                <p className="text-[#64748B] text-center py-8">No overdue invoices found</p>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

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
              <AlertDialogCancel onClick={() => setInvoiceToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
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
