import Link from "next/link";
import Card from "../../../components/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabaseServer } from "@/lib/supabase-server";
import RecordPaymentDialog from "@/app/components/RecordPaymentDialog";

export const dynamic = 'force-dynamic';

export default async function AdminPayments() { 

  const { data: payments, error } = await supabaseServer
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Error fetching payments:", error);
    return;
  }



  return (
    <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[#0F172A]">Payments Management</h1>
          <RecordPaymentDialog />
        </div>

        <Card className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Remarks</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments && payments.length > 0 ? (
                payments.map((payment) => {
                  
                  
                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-semibold text-[#0F172A]">
                        {payment.invoice_id}
                      </TableCell>
                      <TableCell className="text-[#64748B] max-w-md">
                        {payment.amount}
                      </TableCell>
                      <TableCell className="text-[#64748B] max-w-md">
                        {new Date(payment.payment_date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-[#64748B] max-w-md">
                        {payment.remarks}
                      </TableCell>

                      <TableCell className="text-right">
                        <Link href={`/admin/finance/payments/${payment.id}`}>
                          <button className="px-3 py-1.5 bg-[#6B21A8] text-white rounded-lg text-xs font-medium hover:opacity-90">
                            View
                          </button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : ( 
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-[#64748B] py-8">
                    No projects found. Create your first project to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
    </div>
  );
}
