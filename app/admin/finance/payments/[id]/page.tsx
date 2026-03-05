import Link from "next/link";
import Card from "../../../../components/Card";
import PaymentReceipt from "@/app/components/PaymentReceipt";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabaseServer } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PaymentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const paymentId = Number(id);

  if (!Number.isFinite(paymentId)) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Link
            href="/admin/finance/payments"
            className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Payments</span>
          </Link>
        </div>
        <Card>
          <div className="text-center py-12">
            <p className="text-xl font-semibold text-[#0F172A] mb-2">
              Payment Not Found
            </p>
            <p className="text-[#64748B] mb-6">
              The payment you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button
              asChild
              className="gradient-purple text-white"
            >
              <Link href="/admin/finance/payments">Back to Payments</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { data: payment, error } = await supabaseServer
    .from("payments")
    .select(`
      id,
      created_at,
      invoice_id,
      amount,
      remarks,
      payment_date,
      invoices:invoice_id (
        id,
        total,
        amount_paid,
        amount_due,
        is_paid,
        client,
        profiles:client (
          id,
          name,
          email
        )
      )
    `)
    .eq("id", paymentId)
    .single();

  if (error || !payment) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Link
            href="/admin/finance/payments"
            className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Payments</span>
          </Link>
        </div>
        <Card>
          <div className="text-center py-12">
            <p className="text-xl font-semibold text-[#0F172A] mb-2">
              Payment Not Found
            </p>
            <p className="text-[#64748B] mb-6">
              The payment you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button
              asChild
              className="gradient-purple text-white"
            >
              <Link href="/admin/finance/payments">Back to Payments</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const invoiceRecord = Array.isArray(payment.invoices)
    ? payment.invoices[0]
    : payment.invoices;
  const invoice = invoiceRecord && typeof invoiceRecord === "object"
    ? invoiceRecord as {
        id: number;
        total: number;
        amount_paid: number;
        amount_due: number;
        is_paid: boolean;
        client: string | null;
        profiles: { id: string; name: string; email: string } | { id: string; name: string; email: string }[] | null;
      }
    : null;
  const profileRecord = Array.isArray(invoice?.profiles)
    ? invoice?.profiles[0]
    : invoice?.profiles;

  const clientName = profileRecord?.name || "Unknown Client";
  const clientEmail = profileRecord?.email || "No email";
  const formatCurrency = (value: number | null | undefined) => {
    return `$${Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };
  const formattedPaymentDate = payment.payment_date
    ? new Date(payment.payment_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not set";
  const receiptData = {
    paymentId: payment.id as number,
    paymentDate: formattedPaymentDate,
    amount: formatCurrency(payment.amount),
    invoiceId: payment.invoice_id || null,
    remarks: payment.remarks || "No remarks",
    clientName,
    clientEmail,
    companyName: "Elvin Kakomo",
    companyTitle: "Product Engineer",
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link
          href="/admin/finance/payments"
          className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Payments</span>
        </Link>
      </div>

      <div className="mb-8 flex justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#0F172A] mb-2">
            Payment #{payment.id}
          </h1>
          <p className="text-[#64748B]">Payment Details</p>
        </div>
        <PaymentReceipt data={receiptData} />
      </div>

      <Card className="max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-[#64748B] mb-1">Amount</p>
            <p className="text-2xl font-bold text-[#0F172A]">
              ${Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#64748B] mb-1">Payment Date</p>
            <p className="text-base font-semibold text-[#0F172A]">
              {payment.payment_date
                ? new Date(payment.payment_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Not set"}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#64748B] mb-1">Invoice</p>
            <p className="text-base font-semibold text-[#0F172A]">
              #{payment.invoice_id || "Unlinked"}
            </p>
          </div>
          <div>
            <p className="text-sm text-[#64748B] mb-1">Client</p>
            <p className="text-base font-semibold text-[#0F172A]">{clientName}</p>
            <p className="text-sm text-[#64748B]">{clientEmail}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-[#64748B] mb-1">Remarks</p>
            <p className="text-base text-[#0F172A]">
              {payment.remarks || "No remarks"}
            </p>
          </div>
        </div>

        {invoice && (
          <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
            <h2 className="text-lg font-semibold text-[#0F172A] mb-4">
              Invoice Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-[#64748B] mb-1">Invoice Total</p>
                <p className="text-base font-semibold text-[#0F172A]">
                  ${Number(invoice.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#64748B] mb-1">Amount Paid</p>
                <p className="text-base font-semibold text-[#0F172A]">
                  ${Number(invoice.amount_paid).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#64748B] mb-1">Amount Due</p>
                <p className="text-base font-semibold text-[#0F172A]">
                  ${Number(invoice.amount_due).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#64748B] mb-1">Status</p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    invoice.is_paid
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                  }`}
                >
                  {invoice.is_paid ? "Paid" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
