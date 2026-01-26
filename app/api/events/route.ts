import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            instagramUrl,
            title,
            description,
            venueName,
            venueAddress,
            date,
            startTime,
            endTime,
            djs,
            vibeTags,
            ctaType,
            ticketUrl,
        } = body;

        // Validate required fields
        if (!title || !venueName || !date || !startTime) {
            return NextResponse.json(
                { error: 'Title, venue name, date, and start time are required' },
                { status: 400 }
            );
        }

        // Parse dates
        const startDateTime = new Date(`${date}T${startTime}:00`);
        let endDateTime: Date | null = null;

        if (endTime) {
            // Handle events that go past midnight
            const endDate = new Date(`${date}T${endTime}:00`);
            if (endDate < startDateTime) {
                // Add a day if end time is before start time (e.g., 22:00 to 04:00)
                endDate.setDate(endDate.getDate() + 1);
            }
            endDateTime = endDate;
        }

        // Find or create venue
        let venue = await prisma.venue.findFirst({
            where: { name: venueName },
        });

        if (!venue) {
            venue = await prisma.venue.create({
                data: {
                    name: venueName,
                    city: 'Goa',
                    address: venueAddress || null,
                },
            });
        }

        // Create event
        const event = await prisma.event.create({
            data: {
                title,
                description: description || null,
                startTime: startDateTime,
                endTime: endDateTime,
                venueId: venue.id,
                sourceUrl: instagramUrl || null,
                sourceType: 'community',
                ctaType: ctaType || 'pay_at_venue',
                ticketUrl: ctaType === 'external_ticket' ? ticketUrl : null,
                vibeTags: vibeTags?.join(',') || null,
                status: startDateTime <= new Date() ? 'live' : 'created',
            },
        });

        // Handle DJs
        if (djs && djs.length > 0) {
            for (let i = 0; i < djs.length; i++) {
                const djName = djs[i];

                // Find or create DJ
                let dj = await prisma.dJ.findFirst({
                    where: { name: djName },
                });

                if (!dj) {
                    dj = await prisma.dJ.create({
                        data: {
                            name: djName,
                            city: 'Goa',
                            genres: 'electronic',
                        },
                    });
                }

                // Link DJ to event
                await prisma.eventDJ.create({
                    data: {
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

        const events = await prisma.event.findMany({
            where: {
                startTime: {
                    gte: startDate,
                    lte: endDate,
                },
                status: { in: ['created', 'live'] },
            },
            include: {
                venue: { select: { id: true, name: true } },
                djs: {
                    include: { dj: { select: { id: true, name: true } } },
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { startTime: 'asc' },
        });

        return NextResponse.json({ events });
    } catch (error) {
        console.error('Get events error:', error);
        return NextResponse.json({ error: 'Failed to get events' }, { status: 500 });
    }
}
