# 🚀 Deployment Checklist

Follow these steps to deploy your Life Care Planning Portal:

## ✅ Pre-Deployment (5 minutes)

### 1. Get Your Accounts Ready
- [ ] Create Vercel account: https://vercel.com/signup
- [ ] Create Stripe account: https://stripe.com
- [ ] Have your Microsoft 365 email credentials ready

### 2. Set Up Database
Choose ONE:
- [ ] **Vercel Postgres** (easiest): Create in Vercel dashboard → Storage → Postgres
- [ ] **Supabase** (alternative): https://supabase.com → New Project → Get connection string

## 🔧 Setup (10 minutes)

### 3. Get Your Stripe Keys
1. Go to https://dashboard.stripe.com
2. Click "Developers" → "API keys"
3. Copy both keys:
   - Publishable key (starts with `pk_test_`)
   - Secret key (starts with `sk_test_`)

### 4. Prepare Environment Variables
You'll need these ready:

```
DATABASE_URL=postgresql://... (from Vercel or Supabase)
JWT_SECRET=<generate with: openssl rand -base64 32>
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your-email@yourdomain.com
SMTP_PASSWORD=your-password
SMTP_FROM=your-email@yourdomain.com
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app (will get this after deployment)
ADMIN_EMAIL=your-email@yourdomain.com
```

## 🚢 Deploy (5 minutes)

### 5. Push to GitHub
```bash
# In your project folder
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/life-care-portal.git
git push -u origin main
```

### 6. Deploy on Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Click "Environment Variables"
4. Add ALL the variables from step 4
5. Click "Deploy"
6. Wait 2-3 minutes ⏳

### 7. Set Up Database
After deployment succeeds:
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy
```

## 🔗 Connect Your Domain (5 minutes)

### 8. Point Your Bluehost Domain to Vercel

**In Vercel:**
1. Go to your project → Settings → Domains
2. Add your domain: `portal.yourdomain.com`
3. Copy the CNAME value

**In Bluehost:**
1. Login to Bluehost
2. Go to Domains → DNS
3. Add CNAME record:
   - Host: `portal` (or whatever subdomain you want)
   - Points to: `cname.vercel-dns.com`
   - TTL: Automatic
4. Save (takes 10 minutes - 1 hour to propagate)

### 9. Update App URL
After domain connects:
1. Go to Vercel project → Settings → Environment Variables
2. Update `NEXT_PUBLIC_APP_URL` to your domain
3. Redeploy (Deployments → click "..." → Redeploy)

## ✨ You're Live!

### 10. Test Everything

**Test Login:**
1. Go to your domain
2. Enter your email
3. Check inbox for magic link
4. Click link → Should log you in ✅

**Test Admin Upload:**
1. Go to `yourdomain.com/admin`
2. Upload a test invoice
3. Check if email is sent ✅

**Test Payment (using Stripe test card):**
1. Log in as a lawyer
2. Click on invoice
3. Pay Now
4. Use card: `4242 4242 4242 4242`
5. Any CVV and future expiry
6. Should process successfully ✅

## 📋 Post-Launch

### File Storage (Important!)
The current setup saves files locally (won't work long-term on Vercel).

Choose ONE and implement:
- [ ] **Vercel Blob** (recommended): Follow instructions in README
- [ ] **AWS S3**: Follow instructions in README

### Going Live with Stripe
When ready for real payments:
1. Complete Stripe verification
2. Get live API keys (start with `sk_live_` and `pk_live_`)
3. Update environment variables with live keys
4. Redeploy

## 🆘 Common Issues

**Problem: Emails not sending**
- Enable SMTP AUTH in Microsoft 365 admin center
- Use app-specific password if 2FA enabled

**Problem: Can't connect to database**
- Double-check `DATABASE_URL` is correct
- Ensure IP is whitelisted (Supabase only)

**Problem: Domain not connecting**
- Wait up to 1 hour for DNS propagation
- Use `nslookup portal.yourdomain.com` to check

**Problem: Files not uploading**
- Set up Vercel Blob or S3 (see README)

## 🎉 Success!

You now have a fully functional portal for your lawyers to:
- Login with just their email ✅
- View and sign contracts ✅
- Download PDFs ✅
- View invoices ✅
- Pay securely with Stripe ✅

**What You Can Do Now:**
1. Go to `/admin` to upload invoices and contracts
2. Send the portal link to your lawyers
3. They'll receive emails automatically
4. Payments go straight to your Stripe account

---

Need help? Check the full README.md for detailed troubleshooting.
