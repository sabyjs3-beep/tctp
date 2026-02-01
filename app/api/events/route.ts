import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';
import { generateFingerprint, generateSlug, calculateSimilarity } from '@/lib/normalization';

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Security check for automated ingestion
        const authHeader = request.headers.get('Authorization');
        const ingestToken = process.env.INGEST_TOKEN;

        // If it's an automated or community submission from an API client, check token
        if (ingestToken && authHeader !== `Bearer ${ingestToken}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const {
            instagramUrl,
            title,
            description,
            venueName,
            venueAddress,
            citySlug, // Add citySlug support for national routing
            date,
            startTime,
            endTime,
            djs,
            vibeTags,
            ctaType,
            ticketUrl,
            sourceType = 'community', // default to community
            ticketLinks,
            priceRange
        } = body;

        // Validate required fields
        if (!title || !venueName || !date || !startTime) {
            return NextResponse.json(
                { error: 'Title, venue name, date, and start time are required' },
                { status: 400 }
            );
        }

        // Parse dates (Force IST context by appending offset)
        // Incoming strings are "2024-12-25" and "22:00" (Local India Time)
        // We must tell Date constructor this is +05:30, otherwise Vercel (UTC) acts as if it's +00:00
        const startDateTime = new Date(`${date}T${startTime}:00+05:30`);
        let endDateTime: Date | null = null;

        if (endTime) {
            // Handle events that go past midnight
            const endDate = new Date(`${date}T${endTime}:00+05:30`);
            if (endDate < startDateTime) {
                // Add a day if end time is before start time (e.g., 22:00 to 04:00)
                endDate.setDate(endDate.getDate() + 1);
            }
            endDateTime = endDate;
        }

        // Find or create city
        let cityId = '';
        if (citySlug) {
            const city = await (prisma as any).city.findUnique({ where: { slug: citySlug.toLowerCase() } });
            if (city) cityId = city.id;
        }

        // Fallback to Goa if no city provided or found
        if (!cityId) {
            const goa = await (prisma as any).city.findUnique({ where: { slug: 'goa' } });
            if (goa) cityId = goa.id;
        }

        // Find or create venue with Fuzzy Matching
        let venue = null;

        // 1. Try Exact Match First (Fastest)
        venue = await (prisma.venue as any).findFirst({
            where: { name: venueName, cityId },
        });

        // 2. If no exact match, try Fuzzy Match against existing venues in this city
        if (!venue) {
            const cityVenues = await (prisma.venue as any).findMany({
                where: { cityId },
                select: { id: true, name: true }
            });

            // Check if any existing venue is > 85% similar
            const bestMatch = cityVenues.find((v: any) => calculateSimilarity(v.name, venueName) > 0.85);

            if (bestMatch) {
                console.log(`Fuzzy Match: Merging "${venueName}" into existing "${bestMatch.name}" (${bestMatch.id})`);
                venue = bestMatch;
            }
        }

        // 3. If still no venue, create it
        if (!venue) {
            venue = await (prisma.venue as any).create({
                data: {
                    name: venueName,
                    city: { connect: { id: cityId } },
                    address: venueAddress || null,
                    // If Source is Automated/Google, mark as unclaimed
                    claimed: false,
                },
            });
        }

        if (!venue) throw new Error('Failed to create or find venue');

        // Data Integrity: Generate Fingerprint
        const fingerprint = generateFingerprint(title, venueName, date);

        // Check for existing event via Fingerprint
        const existingByFingerprint = await (prisma.event as any).findUnique({
            where: { fingerprint }
        });

        if (existingByFingerprint) {
            // Source Hierarchy Check:
            // If existing is 'verified' or 'community', and incoming is 'automated', REJECT.
            if (sourceType === 'automated' && existingByFingerprint.sourceType !== 'automated') {
                return NextResponse.json({
                    success: true,
                    message: 'Skipped: Higher integrity source exists',
                    id: existingByFingerprint.id
                });
            }

            // Otherwise, we could update, but for now, just return existing to prevent dupes
            return NextResponse.json({ success: true, message: 'Event already exists (Fingerprint Match)', id: existingByFingerprint.id });
        }

        // Create event
        const event = await prisma.event.create({
            data: {
                title,
                description: description || null,
                startTime: startDateTime,
                endTime: endDateTime,
                venueId: venue.id,
                sourceUrl: instagramUrl || ticketUrl || null,
                sourceType: sourceType,
                ctaType: ctaType || (ticketUrl ? 'external_ticket' : 'pay_at_venue'),
                ticketUrl: ticketUrl || null,
                ticketLinks: ticketLinks ? (ticketLinks as any) : Prisma.JsonNull as any,
                priceRange: priceRange || null,
                vibeTags: Array.isArray(vibeTags) ? vibeTags.join(',') : (vibeTags || null),
                status: startDateTime <= new Date() ? 'live' : 'created',
                fingerprint: fingerprint, // Store hash
                slug: generateSlug(title, `${citySlug || 'goa'}-${date}`),
            },
        });

        // Handle DJs
        if (djs && Array.isArray(djs) && djs.length > 0) {
            for (let i = 0; i < djs.length; i++) {
                const djName = djs[i];

                // Find or create DJ
                let dj = await (prisma as any).dJ.findFirst({
                    where: { name: djName },
                });

                if (!dj) {
                    dj = await (prisma as any).dJ.create({
                        data: {
                            name: djName,
                            city: { connect: { id: cityId } },
                            genres: 'electronic',
                        },
                    });
                }

                if (!dj) continue;

                // Link DJ to event
                await prisma.eventDJ.upsert({
                    where: {
                        eventId_djId: {
                            eventId: event.id,
                            djId: dj.id
                        }
                    },
                    update: { order: i },
                    create: {
                        eventId: event.id,
                        djId: dj.id,
                        order: i,
                    },
                });
            }
        }

        return NextResponse.json({
            success: true,
            event: {
                id: event.id,
                title: event.title,
            },
        });
    } catch (error) {
        console.error('Create event error:', error);
        return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }
}

// GET /api/events - Get events (for API access)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter') || 'tonight';
        const citySlug = searchParams.get('city') || 'goa';

        const city = await (prisma as any).city.findUnique({ where: { slug: citySlug.toLowerCase() } });
        if (!city) return NextResponse.json({ error: 'City not found' }, { status: 404 });

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let startDate: Date = now;
        let endDate: Date = tomorrow;

        if (filter === 'weekend') {
            const dayOfWeek = now.getDay();
            const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
            const friday = new Date(today);
            friday.setDate(friday.getDate() + daysUntilFriday);
            friday.setHours(18, 0, 0, 0);

            const sunday = new Date(friday);
            sunday.setDate(sunday.getDate() + 2);
            sunday.setHours(23, 59, 59, 999);

            startDate = friday;
            endDate = sunday;
        }

        const events = await (prisma.event as any).findMany({
            where: {
                venue: { cityId: city.id },
                startTime: {
                    gte: startDate,
                    lte: endDate,
                },
                status: { in: ['created', 'live'] },
            },
            include: {
                venue: { select: { id: true, name: true, address: true, mapUrl: true } },
                djs: {
                    include: { dj: { select: { id: true, name: true } } },
                    orderBy: { order: 'asc' },
                },
                votes: true,
                presence: true,
            },
            orderBy: { startTime: 'asc' },
        });

        return NextResponse.json({ events });
    } catch (error) {
        console.error('Get events error:', error);
        return NextResponse.json({ error: 'Failed to get events' }, { status: 500 });
    }
}
