# Edge Functions – Invoice & Payment Emails

These functions send emails via [Resend](https://resend.com) when:

- **send-invoice-created-email** – A new invoice is created (customer is notified to log in and download the invoice).
- **send-payment-recorded-email** – A payment is recorded (customer is notified with amount and invoice number, and to log in for receipts).

They can be triggered by **Database Webhooks** (on `invoices` or `payments` INSERT) or called directly from your app with an id.

---

## 1. Secrets (required)

Set these in your Supabase project (Dashboard → Project Settings → Edge Functions → Secrets, or CLI below).

| Secret | Description |
|--------|-------------|
| `RESEND_API_KEY` | Resend API key (from [Resend](https://resend.com)) |
| `RESEND_FROM` | (Optional) Sender email, e.g. `noreply@yourdomain.com`. Defaults to `dev@elvinkakomo.xyz` |
| `APP_URL` | Your app base URL for login links, e.g. `https://yourapp.com` or `http://localhost:3000` |

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically available in deployed functions.

**CLI example:**

```bash
supabase secrets set RESEND_API_KEY=re_xxxx
supabase secrets set APP_URL=https://yourapp.com
# optional:
supabase secrets set RESEND_FROM=noreply@yourdomain.com
```

---

## 2. Deploy (no JWT for webhooks)

Database Webhooks call the function without a user JWT, so deploy with `--no-verify-jwt`:

```bash
supabase functions deploy send-invoice-created-email --no-verify-jwt
supabase functions deploy send-payment-recorded-email --no-verify-jwt
```

---

## 3. Database Webhooks (recommended)

So emails send automatically when rows are inserted:

1. In Supabase Dashboard go to **Database** → **Webhooks** (or **Integrations** → **Webhooks**).
2. Create a new webhook.

**Invoice created**

- **Name:** e.g. `Send invoice created email`
- **Table:** `public.invoices`
- **Events:** tick **Insert**
- **Type:** Supabase Edge Function
- **Function:** `send-invoice-created-email`
- **HTTP method:** POST
- Add header: **Authorization** → “Add auth header with service role key” (so the function can use the service role).
3. Save.

**Payment recorded**

- **Name:** e.g. `Send payment recorded email`
- **Table:** `public.payments`
- **Events:** tick **Insert**
- **Type:** Supabase Edge Function
- **Function:** `send-payment-recorded-email`
- **HTTP method:** POST
- Add header: **Authorization** → “Add auth header with service role key”
3. Save.

The webhook payload is `{ type: 'INSERT', table, schema, record, old_record }`. The functions read `record` and fetch client profile (and for payments, the invoice) then send the email.

---

## 4. Calling from the app (optional)

You can also invoke the functions after creating an invoice or recording a payment (e.g. after you’ve set the invoice total or want to control when the email goes out).

**Invoice created** – call after creating the invoice (and optionally after updating its `total`):

```ts
await supabase.functions.invoke('send-invoice-created-email', {
  body: { invoice_id: invoiceData.id },
});
```

**Payment recorded** – call after inserting the payment:

```ts
await supabase.functions.invoke('send-payment-recorded-email', {
  body: { payment_id: paymentData.id },
});
```

Use the **service role key** or ensure the anon key is allowed to invoke these functions if you call them from the client. Prefer calling from a server/API route with the service role if possible.

---

## 5. Invoice total and webhook timing

If you use the **Database Webhook on `invoices` INSERT**, the webhook runs as soon as the row is inserted. In your app you may insert the invoice first (e.g. with `total = 0`) and then insert `invoice_items` and later update the invoice `total`. In that case the first email might show **$0.00**.

Options:

- **A)** Trigger the “invoice created” email from the app (e.g. on the invoice detail page after save) by calling `send-invoice-created-email` with `invoice_id` once the total is set.
- **B)** Use a DB trigger that computes and sets `invoices.total` from `invoice_items` on insert/update of items, so that by the time you’re “done” with the invoice you run a single UPDATE on `invoices`; then use a webhook on **Update** for `invoices` (e.g. when `total` changes from 0) to call the same function with the updated `record`, or keep using the app to call the function with `invoice_id` after the total is set.

---

## 6. Amount format

Amounts in emails are formatted as `$X.XX`. To use another currency (e.g. KES), change the `formatAmount` helper in each function’s `index.ts` and redeploy.
