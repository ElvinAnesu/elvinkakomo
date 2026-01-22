# Email Templates

This folder contains email templates for Supabase authentication emails.

## Invitation Email Template

### Files:
- `invite.html` - HTML version of the invitation email
- `invite-plain.txt` - Plain text version of the invitation email

### Usage in Supabase:

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Email Templates**
3. Select **Invite User** template
4. Copy the content from `invite.html` into the HTML template field
5. Copy the content from `invite-plain.txt` into the Plain Text template field
6. Set the subject line to: `Account Invitation - Elvin Kakomo` (or `You have been invited to Elvin Kakomo&apos;s platform`)

### Template Variables:

Supabase provides these variables in the template:
- `{{ .Name }}` - The user&apos;s name from user_metadata
- `{{ .ConfirmationURL }}` - The invitation link with token
- `{{ .Email }}` - The user&apos;s email address
- `{{ .SiteURL }}` - Your application&apos;s site URL

### Spam Prevention Features:

This template is designed to avoid spam triggers by:
- ✅ Using professional, clear language (no sales-y or promotional language)
- ✅ Avoiding excessive capitalization and exclamation marks
- ✅ Including proper HTML structure and meta tags
- ✅ Using a clean, professional design (no images that could trigger filters)
- ✅ Including a plain text version (required for deliverability)
- ✅ Providing clear instructions and alternative link
- ✅ Including expiration information and security notice
- ✅ Mentioning the recipient&apos;s email address (builds trust)
- ✅ Using &quot;Create Password&quot; instead of &quot;Set Password&quot; (more natural)
- ✅ Including &quot;Account Invitation&quot; in subject (clear, not promotional)
- ✅ No spam trigger words (avoided: free, urgent, act now, limited time, etc.)

### Best Practices for Maximum Deliverability:

1. **Custom Domain & SMTP**: 
   - Use a custom domain for sending emails (configure in Supabase Dashboard → Authentication → SMTP Settings)
   - Avoid using default Supabase email addresses (@supabase.co) as they have lower deliverability

2. **Email Authentication (CRITICAL)**:
   - Set up **SPF** record: `v=spf1 include:_spf.supabase.co ~all`
   - Set up **DKIM** (Supabase provides this automatically when using custom domain)
   - Set up **DMARC** record: `v=DMARC1; p=quarantine; rua=mailto:your-email@yourdomain.com`
   - These DNS records prove you own the domain and dramatically reduce spam classification

3. **Sender Configuration**:
   - Use a professional sender name: &quot;Elvin Kakomo&quot; or &quot;Elvin Kakomo Team&quot;
   - Use a real email address (not no-reply@) - e.g., `noreply@yourdomain.com` or `team@yourdomain.com`
   - Reply-to address should be a monitored inbox

4. **Subject Line Best Practices**:
   - Keep it under 50 characters
   - Avoid ALL CAPS, excessive punctuation, or emojis
   - Be specific: &quot;Account Invitation - Elvin Kakomo&quot; is better than &quot;Important Message&quot;
   - Test different variations

5. **Testing**:
   - Test email deliverability using [Mail-Tester.com](https://www.mail-tester.com) (aim for 9-10/10)
   - Send test emails to Gmail, Outlook, Yahoo to check spam folder placement
   - Monitor bounce rates and spam complaints

6. **Redirect URL**: 
   - Ensure your redirect URL (`/auth/set-password`) is configured in Supabase Dashboard → Authentication → URL Configuration
   - Add both production and development URLs

7. **Warm-up Your Domain** (for new domains):
   - Start with low volume and gradually increase
   - Send to engaged users first
   - Monitor reputation scores

### Additional Notes:

- **Text-to-image ratio**: This template has no images, which is good for spam filters
- **Link safety**: Supabase URLs are legitimate, but consider using a custom domain redirect if needed
- **Personalization**: The template uses `{{ .Name }}` and `{{ .Email }}` which helps with deliverability
- **Plain text version**: Always included - some email clients prefer it and it improves deliverability
