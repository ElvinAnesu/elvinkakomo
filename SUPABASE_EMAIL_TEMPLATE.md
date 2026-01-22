# Supabase Email Template Configuration

## Invitation Email Template

To configure the invitation email template in Supabase that won&apos;t be flagged as spam, follow these steps:

### 1. Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Select **Invite User** template

### 2. Email Template Configuration

Use the following template to ensure it passes spam filters:

**Subject:**
```
You&apos;ve been invited to collaborate with Elvin Kakomo
```

**Body (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #0F172A; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; border: 1px solid #E5E7EB;">
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #6B21A8; font-size: 24px; font-weight: 700; margin: 0 0 10px 0;">
        You&apos;ve Been Invited!
      </h1>
      <p style="color: #64748B; font-size: 16px; margin: 0;">
        Welcome to the collaboration platform
      </p>
    </div>

    <div style="background-color: #FAFAFA; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
      <p style="margin: 0 0 15px 0; font-size: 16px; color: #0F172A;">
        Hi {{ .Name }},
      </p>
      <p style="margin: 0 0 15px 0; font-size: 16px; color: #0F172A;">
        You&apos;ve been invited to collaborate with Elvin Kakomo. To get started, please set your password by clicking the button below.
      </p>
    </div>

    <div style="text-align: center; margin-bottom: 30px;">
      <a href="{{ .ConfirmationURL }}" 
         style="display: inline-block; background: linear-gradient(to right, #6B21A8, #9333EA); color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Set Your Password
      </a>
    </div>

    <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; margin-top: 30px;">
      <p style="font-size: 14px; color: #64748B; margin: 0 0 10px 0;">
        If the button doesn&apos;t work, copy and paste this link into your browser:
      </p>
      <p style="font-size: 12px; color: #6B21A8; word-break: break-all; margin: 0;">
        {{ .ConfirmationURL }}
      </p>
    </div>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
      <p style="font-size: 12px; color: #64748B; margin: 0;">
        This invitation link will expire in 24 hours. If you didn&apos;t request this invitation, you can safely ignore this email.
      </p>
    </div>
  </div>

  <div style="text-align: center; margin-top: 20px;">
    <p style="font-size: 12px; color: #64748B; margin: 0;">
      © 2024 Elvin Kakomo. All rights reserved.
    </p>
  </div>
</body>
</html>
```

**Body (Plain Text):**
```
Hi {{ .Name }},

You&apos;ve been invited to collaborate with Elvin Kakomo. To get started, please set your password by clicking the link below:

{{ .ConfirmationURL }}

This invitation link will expire in 24 hours. If you didn&apos;t request this invitation, you can safely ignore this email.

© 2024 Elvin Kakomo. All rights reserved.
```

### 3. Spam Prevention Best Practices

To ensure emails aren&apos;t flagged as spam:

1. **Use a custom domain** for sending emails (not @supabase.co)
2. **Set up SPF, DKIM, and DMARC records** in your domain DNS
3. **Use a professional sender name**: "Elvin Kakomo" or "Elvin Kakomo Team"
4. **Avoid spam trigger words**: 
   - ✅ Use: "invited", "collaborate", "welcome"
   - ❌ Avoid: "free", "urgent", "act now", excessive exclamation marks
5. **Include unsubscribe link** (if required by law)
6. **Test email deliverability** using tools like Mail-Tester.com

### 4. Redirect URL Configuration

In the Supabase dashboard:
1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your production domain
3. Add redirect URLs:
   - `https://yourdomain.com/auth/set-password`
   - `http://localhost:3000/auth/set-password` (for development)

### 5. Environment Variables

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SECRET_KEY=your_secret_key
```

### 6. Testing

After configuration:
1. Test the invitation flow from the admin panel
2. Check spam folder if email doesn&apos;t arrive
3. Verify the link redirects correctly to `/auth/set-password`
4. Test password setting functionality

### Notes

- Supabase uses Go templates for email variables
- `{{ .ConfirmationURL }}` contains the magic link with token
- `{{ .Name }}` contains the user&apos;s name from user_metadata
- The email will be sent automatically when using `inviteUserByEmail()`
