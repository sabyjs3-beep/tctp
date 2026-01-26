import prisma from '@/lib/db';

export interface EventWithRelations {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date | null;
    vibeTags: string | null;
    ctaType: string;
    ticketUrl: string | null;
    sourceType: string;
    presenceCount: number;
    venue: { id: string; name: string; address?: string | null; mapUrl?: string | null };
    djs: { dj: { id: string; name: string; genres: string } }[];
    votes: { module: string; value: string }[];
    ticketLinks: unknown; // Prisma Json type
    priceRange: string | null;
}

export async function getEvents(
    citySlug: string,
    filter: 'tonight' | 'weekend' | 'all' | string = 'tonight'
) {
    try {
        const slug = citySlug.toLowerCase();
        // Use findFirst with insensitive mode
        const city = await (prisma as any).city.findFirst({
            where: {
                slug: {
                    equals: slug,
                    mode: 'insensitive'
                }
            }
        });

        if (!city) {
            console.error(`❌ City not found for slug: ${slug}`);
            return null;
        }

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let startDate: Date = now;
        let endDate: Date | undefined;

        // Time logic
        if (filter === 'tonight') {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            endDate = tomorrow;
        } else if (filter === 'weekend') {
            // Friday 6pm to Sunday 11:59pm
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
        } else if (filter === 'all') {
            // Next 30 days
            const thirtyDays = new Date(today);
            thirtyDays.setDate(thirtyDays.getDate() + 30);
            endDate = thirtyDays;
        } else {
            // Treat filter as a genre/vibe tag, but default time to "upcoming" (next 30 days) for genres
            const thirtyDays = new Date(today);
            thirtyDays.setDate(thirtyDays.getDate() + 30);
            endDate = thirtyDays;
        }

        const whereClause: any = {
            venue: { cityId: city.id },
            startTime: {
                gte: startDate,
                lte: endDate,
            },
            status: {
                in: ['created', 'live'],
            },
        };

        // If filter is NOT a time keyword, treat it as a genre/vibe
        if (!['tonight', 'weekend', 'all'].includes(filter)) {
            const genre = filter.toLowerCase();
            whereClause.OR = [
                { vibeTags: { contains: genre, mode: 'insensitive' } },
                { djs: { some: { dj: { genres: { contains: genre, mode: 'insensitive' } } } } }
            ];
        }

        const events = await (prisma.event as any).findMany({
            where: whereClause,
            include: {
                venue: true,
                djs: {
                    include: { dj: true },
                    orderBy: { order: 'asc' },
                },
                votes: true,
            },
            orderBy: { startTime: 'asc' },
        });

        return { events: events as unknown as EventWithRelations[], city };
    } catch (error) {
        console.error('❌ Error in getEvents:', error);
        return null;
    }
}
