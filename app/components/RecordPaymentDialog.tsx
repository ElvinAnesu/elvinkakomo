"use client";	
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";


type Invoice = {
    id: number;
    client: string;
    is_paid: boolean;
    notes: string;
    total: number;
    amount_paid: number;
    amount_due: number;
};

export default function RecordPaymentDialog() {

    const [invoiceNumber, setInvoiceNumber] = useState(0);
    const [amount, setAmount] = useState(0); 
    const [remarks, setRemarks] = useState("");
    const [paymentDate, setPaymentDate] = useState(new Date()); 
    const [invoices, setInvoices] = useState<Invoice[]>([]); 
    const [loading, setLoading] = useState(false);
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    

    
    useEffect(() => {
        const fetchInvoices = async () => {
            const { data, error } = await supabase.from("invoices").select("*");
            setInvoices(data || []);
        };
        fetchInvoices();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const { data, error } = await supabase.from("payments").insert({
            invoice_id: invoiceNumber,
            amount: amount,
            remarks: remarks,
            payment_date: paymentDate,
        });
        await supabase.from("invoices").update({
            amount_paid: (invoice?.amount_paid?? 0) + amount,
            amount_due: (invoice?.amount_due?? 0) - amount,
        }).eq("id", invoiceNumber);

        if (error) {
            console.error("Error updating invoice:", error);
            toast.error("Failed to update invoice");
        } else {
            console.log("Invoice updated successfully:", data);
            toast.success("Invoice updated successfully");
        }

        if (error) {
            console.error("Error recording payment:", error);
            toast.error("Failed to record payment");
        } else {
            console.log("Payment recorded successfully:", data);
            toast.success("Payment recorded successfully");
        }
        setInvoiceNumber(0);
        setAmount(0);
        setRemarks("");
        setPaymentDate(new Date());
        setLoading(false);
    };

  return (
    <Dialog>
        <DialogTrigger asChild>
            <button className="px-5 py-2 gradient-purple text-white rounded-lg hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-semibold">
              + New Payment
            </button>
        </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          {invoice && (
            <DialogDescription>
             Total: ${invoice.total} - Amount Paid: ${invoice.amount_paid} - Amount Due: ${invoice.amount_due}
            </DialogDescription>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div>
                <label
                  htmlFor="paymentdate  "
                  className="block text-sm font-semibold text-[#0F172A] mb-2"
                >
                  Invoice #
                </label>
                <select id="invoice" className="w-full px-3 py-2 border-2 border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-[#6B21A8] transition-all text-sm"
                value={invoiceNumber}
                onChange={(e) => {
                    setInvoiceNumber(Number(e.target.value));
                    setInvoice(invoices.find(invoice => invoice.id === Number(e.target.value)) || null);
                }}
                >
                    <option value="">Select Invoice</option>
                    {invoices.map((invoice) => (
                        <option key={invoice.id} value={invoice.id}>{invoice.id}</option>
                    ))}
                </select>
            </div>

            <div>
                <label
                  htmlFor="paymentdate  "
                  className="block text-sm font-semibold text-[#0F172A] mb-2"
                >
                  Payment Date
                </label>
                <input
                  id="paymentdate"
                  type="date"
                  required
                  className="w-full px-3 py-2 border-2 border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-[#6B21A8] transition-all text-sm"
                  placeholder="Select Payment Date"
                  value={paymentDate.toISOString().split('T')[0]}
                  onChange={(e) => setPaymentDate(new Date(e.target.value))}
                />
            </div>
            <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-semibold text-[#0F172A] mb-2"
                >
                  Amount
                </label>
                <input
                  id="amount"
                  type="number"
                  required
                  className="w-full px-3 py-2 border-2 border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-[#6B21A8] transition-all text-sm"
                  placeholder="Enter Amount"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
            </div>
            <div>
                <label
                  htmlFor="remarks"
                  className="block text-sm font-semibold text-[#0F172A] mb-2"
                >
                  Remarks
                </label>
                <textarea
                  id="remarks"
                  required  
                  className="w-full px-3 py-2 border-2 border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6B21A8] focus:border-[#6B21A8] transition-all text-sm"
                  placeholder=""
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
            </div> 
            <DialogFooter>
                <Button type="submit" disabled={loading}>
                    {loading ? "Recording..." : "Record Payment"}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
      <Toaster />
    </Dialog>
  );
}