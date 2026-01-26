# TCTP Deployment Guide

## Pre-Deployment Checklist

- [ ] Test all features locally
- [ ] Run `npm run build` to verify production build
- [ ] Set up production database (Postgres recommended)
- [ ] Generate secure `CRON_SECRET`

---

## Deploy to Vercel

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Login to Vercel

```bash
vercel login
```

### 3. Link Project

```bash
vercel link
```

### 4. Set Environment Variables

```bash
# Production database (Postgres recommended)
vercel env add DATABASE_URL production

# Cron secret (generate a random string)
vercel env add CRON_SECRET production
```

Example DATABASE_URL for Vercel Postgres:
```
postgresql://user:password@host:5432/database?sslmode=require
```

### 5. Update Prisma Schema for Postgres

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Changed from sqlite
  url      = env("DATABASE_URL")
}
```

### 6. Deploy

```bash
vercel --prod
```

### 7. Run Database Migration

After first deployment:

```bash
# Pull environment variables
vercel env pull .env.production

# Run migration
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2-) npx prisma migrate deploy
```

### 8. Seed Production Database (Optional)

```bash
DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2-) npx tsx prisma/seed.ts
```

---

## Vercel Postgres Setup

### Option 1: Vercel Postgres (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database** → **Postgres**
4. Copy the `DATABASE_URL` connection string
5. Add it to your environment variables

### Option 2: External Postgres (Supabase, Railway, etc.)

1. Create a Postgres database on your provider
2. Get the connection string
3. Add it to Vercel environment variables

---

## Cron Job Verification

After deployment, verify the cron job is running:

1. Go to Vercel Dashboard → Your Project → **Cron**
2. You should see `/api/cron/lifecycle` scheduled every 10 minutes
3. Check logs to verify it's running

Manual trigger for testing:
```bash
curl -X GET https://your-domain.vercel.app/api/cron/lifecycle \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Post-Deployment

### 1. Test the Live Site

- [ ] City feed loads
- [ ] Events display correctly
- [ ] Voting works
- [ ] Thread posting works
- [ ] Create event works

### 2. Monitor Logs

```bash
vercel logs --follow
```

### 3. Set Up Analytics (Optional)

Vercel Analytics is free for hobby projects:

```bash
npm install @vercel/analytics
```

Add to `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

// In the return:
<Analytics />
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
DATABASE_URL="your-url" npx prisma db pull
```

### Build Failures

```bash
# Clear cache and rebuild
vercel --force
```

### Cron Not Running

- Verify `vercel.json` is in the root
- Check Vercel Dashboard → Cron tab
- Ensure `CRON_SECRET` is set

---

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate provisioning

---

## Scaling Considerations

### Database
- Start with Vercel Postgres Hobby (free)
- Upgrade to Pro when you hit limits
- Consider connection pooling (Prisma Accelerate)

### Cron
- Vercel Cron is free for hobby projects
- Upgrade to Pro for more frequent runs

### Storage (for photo drops)
- Use Vercel Blob for image uploads
- Free tier: 1GB storage

---

## Rollback

If deployment fails:

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote <deployment-url>
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Postgres connection string |
| `CRON_SECRET` | Yes | Secret for cron authentication |
| `BLOB_READ_WRITE_TOKEN` | No | Vercel Blob token (for photos) |

---

## Next Steps After Deployment

1. Share the URL with friends in Goa
2. Manually add a few real upcoming events
3. DM local DJs on Instagram to claim their profiles
4. Monitor usage and iterate

---

> 🚀 **Your nightlife discovery platform is now live!**
