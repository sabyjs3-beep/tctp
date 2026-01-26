# TCTP Production Deployment - Launch Notes

**Deployment Date:** January 26, 2026  
**Prepared by:** Antigravity AI  
**Status:** Ready for deployment

---

## 🎯 Deployment Summary

**Method:** GitHub → Vercel Auto-Deploy  
**Domain:** toocooltoparty.com (your TLD)  
**Database:** Vercel Postgres (managed)  
**Cron:** Vercel Cron (every 10 minutes)

---

## 📋 Pre-Deployment Checklist

Before you start, ensure you have:
- [ ] GitHub account
- [ ] Vercel account (sign up at vercel.com)
- [ ] Hostinger account (for DNS)
- [ ] Domain purchased on Hostinger

---

## 🚀 Step-by-Step Deployment Guide

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `tctp` (or your choice)
3. **Private** repository (recommended)
4. Do NOT initialize with README (we already have one)
5. Click "Create repository"

### Step 2: Push Code to GitHub

Run these commands in your TCTP directory:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - TCTP V1 ready for production"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/tctp.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**✅ Verify:** Go to your GitHub repo URL and confirm files are there

---

### Step 3: Create Vercel Postgres Database

1. Go to https://vercel.com/dashboard
2. Click "Storage" tab
3. Click "Create Database"
4. Select "Postgres"
5. Database name: `tctp-production`
6. Region: Choose closest to Goa (e.g., Singapore or Mumbai if available)
7. Click "Create"

**✅ Save this:** Copy the `DATABASE_URL` connection string (you'll need it in Step 5)

---

### Step 4: Generate CRON_SECRET

Run this command in your terminal:

```bash
openssl rand -base64 32
```

**✅ Save this:** Copy the output (you'll need it in Step 5)

---

### Step 5: Import Project to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub account
4. Find and select `tctp` repository
5. Click "Import"

**Configure Project:**
- **Project Name:** `tctp-production`
- **Framework Preset:** Next.js
- **Root Directory:** `./` (leave as is)
- **Build Command:** (leave default, will use `vercel-build` from package.json)
- **Output Directory:** `.next` (leave default)

**Environment Variables:**
Click "Add" and enter these:

```
Name: DATABASE_URL
Value: <paste the Postgres connection string from Step 3>

Name: CRON_SECRET
Value: <paste the secret from Step 4>
```

6. Click "Deploy"

**✅ Wait:** Build will take 2-3 minutes. Watch the build logs.

---

### Step 6: Verify Preview Deployment

Once build completes:

1. Click the preview URL (e.g., `tctp-production.vercel.app`)
2. Test these pages:
   - `/` - Should show city feed (might be empty if no events)
   - `/create` - Should show create event form

3. **Create a test event:**
   - Fill out the form
   - Use today's date
   - Submit
   - Should redirect to event page

4. **Test voting:**
   - On event page, vote in "Legit" module
   - Should see vote registered

5. **Test presence:**
   - Click "I'm here"
   - Counter should increment

6. **Test posting:**
   - Write a post in the thread
   - Should appear immediately

**✅ If all tests pass:** Continue to Step 7  
**❌ If anything fails:** Check Vercel logs (Functions tab) for errors

---

### Step 7: Verify Cron Job

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Cron Jobs"
3. You should see:
   ```
   Path: /api/cron/lifecycle
   Schedule: */10 * * * * (every 10 minutes)
   Status: Active
   ```

4. **Manual test:** Run this command (replace URL and SECRET):
   ```bash
   curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://tctp-production.vercel.app/api/cron/lifecycle
   ```

   Should return JSON like:
   ```json
   {
     "success": true,
     "timestamp": "2026-01-26T...",
     "results": {
       "transitionedToLive": 0,
       "transitionedToCooling": 0,
       "transitionedToArchived": 0,
       "deleted": 0
     }
   }
   ```

**✅ If cron works:** Continue to Step 8  
**❌ If 401 error:** Check CRON_SECRET is set correctly in Vercel env vars

---

### Step 8: Add Custom Domain

1. In Vercel dashboard, go to your project
2. Click "Settings" → "Domains"
3. Click "Add"
4. Enter: `toocooltoparty.com` (your domain)
5. Click "Add"

Vercel will show you DNS records to add. **Copy these exactly.**

Example (yours will be different):
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

---

### Step 9: Configure DNS in Hostinger

1. Log in to Hostinger
2. Go to "Domains" → Select your domain
3. Click "DNS / Name Servers"
4. **Delete existing records:**
   - Delete any A record for `@`
   - Delete any CNAME record for `www`
   - **Keep MX records** (if you have email)

5. **Add Vercel records:**
   - Click "Add Record"
   - Type: `A`
   - Name: `@`
   - Points to: `<paste Vercel IP>`
   - TTL: 3600
   - Save

   - Click "Add Record"
   - Type: `CNAME`
   - Name: `www`
   - Points to: `<paste Vercel CNAME>`
   - TTL: 3600
   - Save

6. **Wait for DNS propagation:** 5-60 minutes

**✅ Check propagation:** Use https://dnschecker.org with your domain

---

### Step 10: Verify SSL Certificate

1. After DNS propagates, go back to Vercel → Domains
2. Your domain should show "Valid Configuration"
3. SSL certificate will auto-provision (takes 1-5 minutes)
4. Status should change to "Active"

**✅ Test:** Open `https://toocooltoparty.com` in browser  
Should show your app with valid SSL (🔒 in address bar)

---

### Step 11: Final Production Verification

**On Desktop:**
- [ ] Open https://toocooltoparty.com
- [ ] Create an event
- [ ] Vote on the event
- [ ] Post in thread
- [ ] Share event (check WhatsApp message includes crowd status)

**On Mobile:**
- [ ] Open domain on phone
- [ ] Test all features
- [ ] Check responsive layout
- [ ] Verify touch interactions work

**Cron Verification:**
- [ ] Wait 10 minutes
- [ ] Go to Vercel → Functions → Cron Logs
- [ ] Should see successful execution
- [ ] Check if any events transitioned status

**Security Check:**
- [ ] View page source - no DATABASE_URL visible
- [ ] Check Network tab - no CRON_SECRET in responses
- [ ] Confirm .env is not in GitHub repo

**✅ If all checks pass:** You're live! 🎉

---

## 📊 Post-Launch Monitoring

### First 24 Hours

**Check every 2 hours:**
1. Vercel → Functions → Logs
2. Look for errors
3. Check cron executions
4. Monitor database connections

**Watch for:**
- 500 errors
- Database connection timeouts
- Cron failures
- High response times

### First Week

**Daily checks:**
- Event creation rate
- Voting activity
- Thread posts
- Share clicks
- Cron purges working

**Metrics to track:**
- Events created per day
- Votes per event
- Posts per event
- Shares per event

---

## 🔄 Rollback Procedure

If something breaks:

1. Go to Vercel dashboard
2. Click "Deployments"
3. Find last working deployment
4. Click "..." menu
5. Click "Promote to Production"
6. Confirm

**Done in 30 seconds.** Previous version is live again.

---

## 🐛 Common Issues & Solutions

### Issue: Build fails with Prisma error
**Solution:** Check DATABASE_URL is set in Vercel env vars

### Issue: Cron returns 401
**Solution:** Verify CRON_SECRET matches in Vercel env vars

### Issue: Domain shows "Not Found"
**Solution:** DNS not propagated yet. Wait 30 more minutes.

### Issue: SSL certificate not issuing
**Solution:** Check DNS records are exactly as Vercel specified

### Issue: Database connection errors
**Solution:** Verify Postgres database is in same region as Vercel project

---

## 📝 Deployment Record

**Fill this out after deployment:**

```
GitHub Repository: https://github.com/___________/tctp
Deployed Commit Hash: ___________
Vercel Project URL: https://vercel.com/___________/tctp-production
Production URL: https://toocooltoparty.com
Preview URL: https://tctp-production.vercel.app
Database: Vercel Postgres (region: ___________)
Deployment Date: ___________
Deployed By: ___________
```

---

## 🎯 Success Criteria

Deployment is successful when:
- ✅ Domain loads with HTTPS
- ✅ All pages render correctly
- ✅ Event creation works
- ✅ Voting works
- ✅ Posting works
- ✅ Sharing includes crowd status
- ✅ Cron runs every 10 min
- ✅ No errors in logs
- ✅ Mobile experience is smooth
- ✅ No secrets exposed

---

## 🚨 Emergency Contacts

**Vercel Support:** https://vercel.com/support  
**Hostinger Support:** https://www.hostinger.com/contact

---

## ✅ Final Checklist

Before announcing launch:
- [ ] All tests passed
- [ ] DNS propagated
- [ ] SSL active
- [ ] Cron verified
- [ ] Mobile tested
- [ ] Secrets secure
- [ ] Rollback tested
- [ ] Monitoring set up

**When all checked:** You're ready to announce! 🎉

---

## 🎊 You're Live!

**Next steps:**
1. Test with real event (Friday/Saturday night)
2. Share with small group first
3. Collect feedback
4. Monitor metrics
5. Iterate based on usage

**Remember:** This is V1. Ship it, learn, improve.

---

**Questions?** Check PRODUCTION_LAUNCH.md for detailed troubleshooting.

**Good luck! 🚀**
