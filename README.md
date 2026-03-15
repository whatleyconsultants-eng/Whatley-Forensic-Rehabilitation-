# Life Care Planning Portal

A secure web portal for lawyers to view contracts, sign agreements, and process payments for life care planning services.

## Features

✅ **Email Authentication** - Passwordless magic link login  
✅ **Contract Management** - View, sign, and download contracts  
✅ **Invoice System** - View invoices and make secure payments  
✅ **Stripe Integration** - PCI-compliant payment processing  
✅ **Admin Portal** - Upload contracts and invoices  
✅ **Email Notifications** - Automated emails for invoices and payments  

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Payments**: Stripe
- **Email**: Microsoft SMTP (Office 365)
- **Hosting**: Vercel

## Prerequisites

Before deploying, you'll need:

1. **Vercel Account** (free) - [Sign up here](https://vercel.com/signup)
2. **Database** - PostgreSQL database (recommended: Vercel Postgres or Supabase)
3. **Stripe Account** - [Sign up here](https://stripe.com)
4. **Microsoft 365 Email** - For sending emails via SMTP

## Quick Start (Local Development)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# Database (Vercel Postgres or Supabase)
DATABASE_URL="postgresql://username:password@host:5432/database"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-secret-key-here"

# Email Configuration (Microsoft SMTP)
SMTP_HOST="smtp.office365.com"
SMTP_PORT=587
SMTP_USER="your-email@yourdomain.com"
SMTP_PASSWORD="your-email-password"
SMTP_FROM="your-email@yourdomain.com"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Admin Email (your email to receive notifications)
ADMIN_EMAIL="your-admin-email@yourdomain.com"
```

### 3. Set Up Database

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your portal!

## Deployment to Vercel

### Step 1: Push to GitHub

1. Create a new repository on GitHub
2. Initialize git and push your code:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/life-care-portal.git
git push -u origin main
```

### Step 2: Set Up Database

**Option A: Vercel Postgres (Recommended)**

1. Go to your Vercel dashboard
2. Create new project → Storage → Create Database
3. Select Postgres
4. Copy the `DATABASE_URL` connection string

**Option B: Supabase**

1. Go to [Supabase](https://supabase.com)
2. Create new project
3. Go to Settings → Database → Connection string
4. Copy the connection string

### Step 3: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure environment variables:
   - Add all variables from your `.env` file
   - Update `NEXT_PUBLIC_APP_URL` to your Vercel domain
5. Click "Deploy"

### Step 4: Run Database Migrations

After deployment, run migrations:

```bash
npx prisma migrate deploy
```

Or use Vercel CLI:

```bash
vercel env pull .env.local
npx prisma migrate deploy
```

### Step 5: Configure Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your API keys:
   - Developers → API keys
   - Copy "Publishable key" and "Secret key"
3. Set up webhooks (optional, for production):
   - Developers → Webhooks → Add endpoint
   - Endpoint URL: `https://your-domain.vercel.app/api/stripe/webhook`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### Step 6: Point Your Domain

1. In Vercel, go to your project settings
2. Domains → Add Domain
3. Add your Bluehost domain (e.g., `portal.yourdomain.com`)
4. In Bluehost, update DNS:
   - Type: CNAME
   - Host: portal (or subdomain you want)
   - Points to: cname.vercel-dns.com
   - TTL: Automatic

## File Storage Setup

For production, you need proper file storage for PDFs:

### Option 1: Vercel Blob (Recommended)

1. Install Vercel Blob:
```bash
npm install @vercel/blob
```

2. Update upload endpoints to use Vercel Blob
3. Enable Vercel Blob in your project settings

### Option 2: AWS S3

1. Create S3 bucket
2. Install AWS SDK:
```bash
npm install @aws-sdk/client-s3
```
3. Update upload endpoints to use S3

## Usage Guide

### For Lawyers:

1. **Login**: Go to portal URL → Enter email → Click login link in email
2. **View Contracts**: Dashboard → Click contract → Review → Check "I agree" → Sign
3. **Download**: Click "Download PDF" button
4. **Pay Invoice**: Dashboard → Click invoice → Pay Now → Enter card details

### For Admin (You):

1. Go to `/admin` route
2. **Upload Invoice**:
   - Enter lawyer's email
   - Enter invoice details
   - Upload PDF
   - Click "Upload Invoice & Send Email"
3. **Upload Contract**:
   - Enter lawyer's email
   - Upload PDF
   - Click "Upload Contract"

## Security Features

- ✅ Magic link authentication (no passwords)
- ✅ HTTP-only cookies for session management
- ✅ JWT tokens with 7-day expiration
- ✅ IP address tracking for contract signatures
- ✅ PCI compliance via Stripe (no card data touches your server)
- ✅ HTTPS enforced in production
- ✅ CSRF protection via SameSite cookies

## Email Templates

The portal sends three types of emails:

1. **Magic Link Login** - Sent when user requests login
2. **Invoice Notification** - Sent when admin uploads new invoice
3. **Payment Confirmation** - Sent when payment is successful

All emails are sent via Microsoft SMTP (Office 365).

## Testing Payment Flow

### Test Mode (Stripe Test Keys):

Use these test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

### Going Live:

1. Get Stripe live keys from dashboard
2. Update environment variables with live keys
3. Remove test mode indicators
4. Test with real small payment

## Troubleshooting

### Issue: Emails not sending

**Solution**: Check Microsoft SMTP settings:
- Ensure "SMTP AUTH" is enabled in Microsoft 365 admin center
- Use app-specific password if 2FA is enabled
- Port 587 with STARTTLS

### Issue: Database connection fails

**Solution**: 
- Verify `DATABASE_URL` format
- Check if IP is whitelisted (Supabase)
- Ensure SSL mode is correct

### Issue: File uploads fail

**Solution**:
- Set up Vercel Blob or S3
- Update upload endpoints
- Check file size limits

### Issue: Stripe payments fail

**Solution**:
- Verify API keys are correct
- Check Stripe dashboard for errors
- Ensure webhook endpoint is set up

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET` | Secret for JWT tokens | Generate with `openssl rand -base64 32` |
| `SMTP_HOST` | Email server host | `smtp.office365.com` |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USER` | Email username | `your-email@domain.com` |
| `SMTP_PASSWORD` | Email password | Your password |
| `SMTP_FROM` | From email address | `your-email@domain.com` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` or `sk_live_...` |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` or `pk_live_...` |
| `NEXT_PUBLIC_APP_URL` | Your portal URL | `https://portal.yourdomain.com` |
| `ADMIN_EMAIL` | Your admin email | `admin@yourdomain.com` |

## Support

For issues or questions:
- Check the troubleshooting section above
- Review Vercel deployment logs
- Check Stripe dashboard for payment errors
- Verify email delivery in Microsoft 365 admin center

## License

Private - All Rights Reserved

---

Built with ❤️ for Life Care Planning
