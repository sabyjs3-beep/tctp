# TCTP - Too Cool To Party

Ephemeral, anonymous, crowd-verified nightlife discovery for Goa.

**No logins. No AI. Just vibes.**

---

## What is TCTP?

TCTP is an event truth engine for nightlife. It aggregates events from Instagram and other sources, then lets the crowd verify what's actually happening through anonymous voting.

### Core Features
- 📍 **Event Discovery** - Tonight & This Weekend views
- 🗳️ **Crowd Verification** - 6 voting modules (legit, packed, queue, lineup, safety, sound)
- 💬 **Ephemeral Threads** - Live updates that expire with the event
- 👥 **Presence Counter** - See who's actually there
- ⚠️ **Warning Banners** - Crowd-sourced safety alerts
- 🔗 **Smart Sharing** - Share with crowd status snapshot

### Philosophy
- **Event-first, not user-first** - No profiles, no followers
- **Anonymous by design** - Device-based identity only
- **Ephemeral by default** - Content expires with events
- **Crowd democracy** - Thresholds, not moderation
- **Information is the product** - Not social clout

---

## Tech Stack

- **Framework:** Next.js 15 (React 19)
- **Database:** Vercel Postgres (Prisma ORM)
- **Styling:** Vanilla CSS (dark theme)
- **Deployment:** Vercel
- **Cron:** Vercel Cron (lifecycle automation)

---

## Local Development

### Prerequisites
- Node.js 20+
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL

# Initialize database
npx prisma generate
npx prisma db push

# Seed with Goa data
npm run db:seed

# Start dev server
npm run dev
```

Open http://localhost:3000

### Database Commands
```bash
# Reset database (WARNING: deletes all data)
npm run db:reset

# Push schema changes
npm run db:push

# Seed data
npm run db:seed
```

---

## Production Deployment

See [PRODUCTION_LAUNCH.md](./PRODUCTION_LAUNCH.md) for complete deployment guide.

### Quick Deploy to Vercel
1. Push code to GitHub
2. Import repo to Vercel
3. Add environment variables:
   - `DATABASE_URL` (from Vercel Postgres)
   - `CRON_SECRET` (generate with `openssl rand -base64 32`)
4. Deploy

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `CRON_SECRET` - Secret for cron endpoint authentication

---

## Project Structure

```
tctp/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── cron/         # Cron jobs
│   │   └── events/       # Event endpoints
│   ├── event/[id]/       # Event detail pages
│   ├── create/           # Create event page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page (city feed)
├── components/            # React components
├── lib/                   # Utilities
│   ├── db.ts             # Prisma client
│   ├── device.ts         # Device token management
│   ├── rateLimit.ts      # Rate limiting
│   └── rules.ts          # Voting rules & thresholds
├── prisma/               # Database schema & migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed data
└── public/               # Static assets
```

---

## Key Concepts

### Event Lifecycle
1. **CREATED** - Event scheduled but not started
2. **LIVE** - Event is happening now
3. **COOLING** - Event ended, thread still active (6 hours)
4. **ARCHIVED** - Read-only (48 hours)
5. **DELETED** - Purged from database

Lifecycle transitions happen automatically via cron job every 10 minutes.

### Voting Modules
- **Legit** - Is this event real? (positive/negative)
- **Packed** - How crowded? (empty/moderate/packed/insane)
- **Queue** - Entry wait time (walkin/short/long/notGettingIn)
- **Lineup** - DJ lineup accuracy (accurate/fake/changed)
- **Safety** - Safety concerns (safe/sketchy/cops)
- **Sound** - Sound quality (good/bad/broken)

### Warning Banners
Automatically shown when crowd votes cross thresholds:
- **Danger** - 60%+ negative legit votes (25+ votes)
- **Warning** - 30%+ fake lineup votes or 40%+ safety concerns

---

## API Endpoints

### Events
- `GET /api/events` - List events (tonight/weekend)
- `POST /api/events` - Create event
- `GET /api/events/[id]` - Get event details

### Voting
- `POST /api/events/[id]/vote` - Submit vote
- `GET /api/events/[id]/vote` - Get user's votes

### Presence
- `POST /api/events/[id]/presence` - Mark presence (here/going/skipped)

### Threads
- `POST /api/events/[id]/post` - Create post
- `POST /api/events/[id]/post/[postId]/vote` - Vote on post (upvote/downvote)

### Cron
- `GET /api/cron/lifecycle` - Event lifecycle automation (requires CRON_SECRET)

---

## Contributing

This is a focused MVP. We're not accepting features until we validate with real users.

**Current focus:**
- Bug fixes
- Performance improvements
- Mobile UX polish

---

## License

Proprietary - All rights reserved

---

## Contact

For questions or issues, contact the team.

**Remember:** This is V1. Ship it, learn, improve.
