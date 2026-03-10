// supabase/functions/send-invoice-created-email/index.ts
// Triggered by Database Webhook on invoices INSERT, or called with { invoice_id }.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const INVOICE_EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="format-detection" content="telephone=no">
  <title>New Invoice - Elvin Kakomo</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #F9FAFB; line-height: 1.6; color: #0F172A;">
  <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #F9FAFB; padding: 20px;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table role="presentation" style="width: 100%; max-width: 600px; background-color: #FFFFFF; border-radius: 8px; border: 1px solid #E5E7EB; overflow: hidden;">
          <tr>
            <td style="padding: 40px 40px 30px 40px; text-align: center; background-color: #FFFFFF;">
              <h1 style="color: #6B21A8; font-size: 26px; font-weight: 600; margin: 0 0 8px 0; line-height: 1.3;">New Invoice Created</h1>
              <p style="color: #64748B; font-size: 15px; margin: 0;">An invoice has been issued for your account</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background-color: #FAFAFA; border-radius: 8px; padding: 24px;">
                <p style="margin: 0 0 18px 0; font-size: 16px; color: #0F172A; line-height: 1.6;">Hello {{ .Name }},</p>
                <p style="margin: 0 0 18px 0; font-size: 16px; color: #0F172A; line-height: 1.6;">You have one pending invoice of <strong>{{ .Amount }}</strong>.</p>
                <p style="margin: 0 0 18px 0; font-size: 16px; color: #0F172A; line-height: 1.6;">You can view and download your invoice at any time by logging into your client dashboard.</p>
                <p style="margin: 0; font-size: 16px; color: #0F172A; line-height: 1.6;">Please log in to download your invoice and view billing details.</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 30px 40px; text-align: center;">
              <table role="presentation" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: #6B21A8; border-radius: 8px;">
                    <a href="{{ .LoginURL }}" style="display: inline-block; padding: 14px 32px; color: #FFFFFF; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">Log in to download your invoice</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px 30px 40px; border-top: 1px solid #E5E7EB;">
              <p style="font-size: 14px; color: #64748B; margin: 20px 0 0 0; line-height: 1.6;">If you have any questions about this invoice, feel free to reach out. I&apos;m here to help.</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 40px; background-color: #F9FAFB; border-top: 1px solid #E5E7EB;">
              <p style="font-size: 12px; color: #94A3B8; margin: 0 0 8px 0; line-height: 1.5;">This message was sent to {{ .Email }} regarding your account with Elvin Kakomo.</p>
              <p style="font-size: 12px; color: #94A3B8; margin: 0; line-height: 1.5;">© 2026 Elvin Kakomo. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

function formatAmount(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return "$0.00";
  const n = typeof value === "string" ? parseFloat(value) : Number(value);
  if (Number.isNaN(n)) return "$0.00";
  return "$" + n.toFixed(2);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type, Authorization" } });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: { "Content-Type": "application/json" } });
  }

  try {
    const body = await req.json();
    const record = body.record ?? (body.invoice_id != null ? null : body);
    let invoice: { id: number; client: string; total?: number } | null = null;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    if (record && (record.client != null || record.id != null)) {
      invoice = { id: record.id, client: record.client, total: record.total };
    } else if (body.invoice_id != null) {
      const { data, error } = await supabaseAdmin.from("invoices").select("id, client, total").eq("id", body.invoice_id).single();
      if (error || !data) {
        console.error("Invoice fetch error:", error);
        return new Response(JSON.stringify({ error: "Invoice not found" }), { status: 404, headers: { "Content-Type": "application/json" } });
      }
      invoice = data;
    }

    if (!invoice || !invoice.client) {
      return new Response(JSON.stringify({ error: "Missing invoice or client" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const { data: client, error: clientError } = await supabaseAdmin
      .from("profiles")
      .select("name, email")
      .eq("id", invoice.client)
      .single();

    if (clientError || !client?.email) {
      console.error("Client not found or no email:", clientError);
      return new Response(JSON.stringify({ error: "Client email not found" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const appUrl = Deno.env.get("APP_URL") ?? "http://localhost:3000";
    const loginUrl = `${appUrl}/auth/login`;
    const amountStr = formatAmount(invoice.total);

    const emailHtml = INVOICE_EMAIL_TEMPLATE
      .replace(/\{\{ \.Name \}\}/g, client.name ?? "Valued Client")
      .replace(/\{\{ \.Email \}\}/g, client.email)
      .replace(/\{\{ \.Amount \}\}/g, amountStr)
      .replace(/\{\{ \.LoginURL \}\}/g, loginUrl);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: Deno.env.get("RESEND_FROM") ?? "dev@elvinkakomo.xyz",
        to: client.email,
        subject: "New invoice – Elvin Kakomo",
        html: emailHtml,
      }),
    });

    if (!resendResponse.ok) {
      const errData = await resendResponse.json().catch(() => ({}));
      console.error("Resend API error:", errData);
      return new Response(JSON.stringify({ error: "Failed to send email", details: errData }), { status: 502, headers: { "Content-Type": "application/json" } });
    }

    const emailData = await resendResponse.json();
    return new Response(
      JSON.stringify({ success: true, message: "Email sent", email_id: emailData.id, recipient: client.email }),
      { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  } catch (e) {
    console.error("send-invoice-created-email error:", e);
    return new Response(
      JSON.stringify({ error: e?.message ?? "Internal server error", details: String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
