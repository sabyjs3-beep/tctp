# TCTP Production Launch Checklist

**Date:** January 26, 2026  
**Deployment Method:** GitHub → Vercel Auto-Deploy  
**Domain:** toocooltoparty.com (or your chosen TLD)

---

## Pre-Deployment Preparation

### ✅ 1. Database Migration Strategy
**Current:** SQLite (local development)  
**Production:** Vercel Postgres (managed)

**Migration Steps:**
1. Create Vercel Postgres database
2. Get DATABASE_URL from Vercel
3. Run `npx prisma migrate deploy` (production-safe, no prompts)
4. Seed minimal data (Goa city + 1 test event)

### ✅ 2. Environment Variables Required
```
DATABASE_URL=postgresql://...  (from Vercel Postgres)
CRON_SECRET=<generate-random-32-char-string>
```

### ✅ 3. Vercel Configuration Files

**vercel.json** (for cron):
```json
{
  "crons": [{
    "path": "/api/cron/lifecycle",
    "schedule": "*/10 * * * *"
  }]
}
```

**package.json** (build command):
```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

---

## Deployment Steps

### Phase 1: GitHub Setup
- [ ] Create GitHub repository
- [ ] Push code to main branch
- [ ] Verify .gitignore excludes .env, node_modules, .next

### Phase 2: Vercel Project Setup
- [ ] Import GitHub repo to Vercel
- [ ] Set project name: `tctp-production`
- [ ] Framework preset: Next.js
- [ ] Root directory: `./`
- [ ] Build command: `npm run vercel-build`
- [ ] Output directory: `.next`

### Phase 3: Database Setup
- [ ] Create Vercel Postgres database
- [ ] Copy DATABASE_URL to Vercel env vars
- [ ] Generate CRON_SECRET: `openssl rand -base64 32`
- [ ] Add CRON_SECRET to Vercel env vars

### Phase 4: Preview Deployment
- [ ] Deploy to preview URL
- [ ] Wait for build to complete
- [ ] Check build logs for errors

### Phase 5: Smoke Testing (Preview URL)
Test all critical paths:
- [ ] GET / (city feed loads)
- [ ] GET /event/[id] (event detail page)
- [ ] POST /api/events (create event)
- [ ] POST /api/events/[id]/vote (voting works)
- [ ] POST /api/events/[id]/presence (presence counter)
- [ ] POST /api/events/[id]/post (thread posting)
- [ ] GET /api/cron/lifecycle (cron endpoint responds)

### Phase 6: Cron Verification
- [ ] Manually trigger: `curl -H "Authorization: Bearer $CRON_SECRET" https://preview-url/api/cron/lifecycle`
- [ ] Check response shows lifecycle transitions
- [ ] Verify cron is scheduled in Vercel dashboard
- [ ] Check cron logs after 10 minutes

### Phase 7: Production Promotion
- [ ] Promote preview to production
- [ ] Verify production URL works
- [ ] Check production logs

### Phase 8: Custom Domain Setup
- [ ] Add domain in Vercel: toocooltoparty.com
- [ ] Get DNS records from Vercel
- [ ] Add records to Hostinger DNS
- [ ] Wait for DNS propagation (5-60 min)
- [ ] Verify SSL certificate issued

### Phase 9: Final Verification
- [ ] Open domain on mobile browser
- [ ] Create test event
- [ ] Vote on event
- [ ] Post in thread
- [ ] Share event (verify snapshot in message)
- [ ] Wait 10 min, check cron ran
- [ ] Verify no secrets exposed in client code

---

## DNS Records (To Add in Hostinger)

**After Vercel gives you the records, they'll look like:**

```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**Important:** 
- Remove any existing A/CNAME records for @ and www
- Keep MX records (email) if you have them
- SSL will auto-provision after DNS propagates

---

## Rollback Procedure

If something breaks:
1. Go to Vercel dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"
4. Done in 30 seconds

---

## Post-Launch Monitoring

### First 24 Hours:
- Check Vercel logs every 2 hours
- Monitor cron executions
- Watch for database connection errors
- Test on actual mobile devices

### First Week:
- Monitor votes per event
- Check thread activity
- Verify lifecycle purges working
- Watch for abuse patterns

---

## Important Notes

### ✅ Hostinger Role
**Hostinger is ONLY for domain + DNS.**  
- No web hosting needed
- No file uploads to Hostinger
- Just point DNS to Vercel

### ✅ Database
**Production DB is Vercel Postgres, NOT SQLite.**  
- SQLite is dev-only
- Vercel Postgres is managed, backed up
- No manual DB maintenance needed

### ✅ Cron Security
**CRON_SECRET must be set.**  
- Prevents unauthorized cron triggers
- Vercel automatically includes it in cron requests
- Never expose in client code

---

## Success Criteria

Deployment is successful when:
- ✅ Domain loads on HTTPS
- ✅ All pages render correctly
- ✅ Voting/posting works
- ✅ Cron runs every 10 min
- ✅ No errors in logs
- ✅ Mobile experience is smooth

---

## Next Steps After Launch

1. **Monitor first real event** (Friday/Saturday night)
2. **Collect feedback** from first users
3. **Watch metrics:** votes per event, shares
4. **Iterate** based on real usage

**Remember:** This is V1. Ship it, learn, improve.
