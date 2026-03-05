"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

type PaymentReceiptData = {
  paymentId: number;
  paymentDate: string;
  amount: string;
  invoiceId: number | null;
  remarks: string;
  clientName: string;
  clientEmail: string;
  companyName: string;
  companyTitle: string;
};

export default function PaymentReceipt({ data }: { data: PaymentReceiptData }) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownload = () => {
    setIsGeneratingPDF(true);

    try {
      const doc = new jsPDF("p", "mm", "a4");
      const pageW = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = margin;

      // Title
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("RECEIPT", margin, y);
      y += 6;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(`Payment #${data.paymentId}`, margin, y);
      y += 4;
      doc.text(`Date: ${data.paymentDate}`, margin, y);
      y += 10;

      // Company (right-aligned)
      doc.text(data.companyName, pageW - margin, y, { align: "right" });
      y += 4;
      doc.text(data.companyTitle, pageW - margin, y, { align: "right" });
      y += 12;

      // Line
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, y, pageW - margin, y);
      y += 16;

      // Bill To
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("BILL TO", margin, y);
      y += 8;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(data.clientName, margin, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(data.clientEmail, margin, y);
      y += 12;

      // Payment details (right side)
      const rightY = y - 12 - 5 - 8;
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("PAYMENT DETAILS", pageW - margin, rightY, { align: "right" });
      doc.text("Amount", pageW - margin, rightY + 8, { align: "right" });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(data.amount, pageW - margin, rightY + 14, { align: "right" });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Invoice", pageW - margin, rightY + 22, { align: "right" });
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text(data.invoiceId ? `#${data.invoiceId}` : "Unlinked", pageW - margin, rightY + 28, { align: "right" });

      y += 16;

      // Line
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, y, pageW - margin, y);
      y += 12;

      // Remarks
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("REMARKS", margin, y);
      y += 6;
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      const splitRemarks = doc.splitTextToSize(data.remarks, pageW - 2 * margin);
      doc.text(splitRemarks, margin, y);
      y += splitRemarks.length * 5 + 16;

      // Footer line + text
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, y, pageW - margin, y);
      y += 10;
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("Thank you for your business!", pageW / 2, y, { align: "center" });

      doc.save(`Payment-${data.paymentId}.pdf`);
    } catch (error) {
      console.error("Error generating receipt PDF:", error);
      alert("Failed to generate receipt PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
      disabled={isGeneratingPDF}
      className="flex items-center gap-2"
    >
      {isGeneratingPDF ? "Generating..." : "Download Receipt"}
    </Button>
  );
}
