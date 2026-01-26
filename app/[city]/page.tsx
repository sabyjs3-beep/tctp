import prisma from '@/lib/db';
import EventCard from '@/components/EventCard';
import { notFound } from 'next/navigation';

// Types for our page
interface EventWithRelations {
    id: string;
    title: string;
    startTime: Date;
    endTime: Date | null;
    vibeTags: string | null;
    ctaType: string;
    ticketUrl: string | null;
    sourceType: string;
    presenceCount: number;
    venue: { id: string; name: string };
    djs: { dj: { id: string; name: string } }[];
    votes: { module: string; value: string }[];
}

async function getEvents(citySlug: string, filter: 'tonight' | 'weekend' = 'tonight') {
    // Access city safely
    const city = await (prisma as any).city.findUnique({ where: { slug: citySlug } });
    if (!city) return null;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Weekend: Friday 6pm to Sunday 11:59pm
    const dayOfWeek = now.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    const friday = new Date(today);
    friday.setDate(friday.getDate() + daysUntilFriday);
    friday.setHours(18, 0, 0, 0);

    const sunday = new Date(friday);
    sunday.setDate(sunday.getDate() + 2);
    sunday.setHours(23, 59, 59, 999);

    let startDate: Date;
    let endDate: Date;

    if (filter === 'tonight') {
        startDate = now;
        endDate = tomorrow;
    } else {
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
            status: {
                in: ['created', 'live'],
            },
        },
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
}

function calculateLegitPercent(votes: any[]): number | undefined {
    const legitVotes = votes.filter(v => v.module === 'legit');
    if (legitVotes.length < 5) return undefined;

    const positive = legitVotes.filter(v => v.value === 'positive').length;
    return Math.round((positive / legitVotes.length) * 100);
}

function calculateQueueStatus(votes: any[]): string | undefined {
    const queueVotes = votes.filter(v => v.module === 'queue');
    if (queueVotes.length < 5) return undefined;

    const counts: Record<string, number> = {};
    queueVotes.forEach(v => {
        counts[v.value] = (counts[v.value] || 0) + 1;
    });

    const labels: Record<string, string> = {
        walkin: 'Walk-in',
        short: '10-20 min',
        long: '30-60 min',
        notGettingIn: 'Not getting in',
    };

    const maxValue = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b);
    return labels[maxValue[0]] || undefined;
}

function calculatePackedStatus(votes: any[]): string | undefined {
    const packedVotes = votes.filter(v => v.module === 'packed');
    if (packedVotes.length < 5) return undefined;

    const counts: Record<string, number> = {};
    packedVotes.forEach(v => {
        counts[v.value] = (counts[v.value] || 0) + 1;
    });

    const labels: Record<string, string> = {
        empty: 'Empty',
        moderate: 'Moderate',
        packed: 'Packed',
        insane: 'Insane',
    };

    const maxValue = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b);
    return labels[maxValue[0]] || undefined;
}

export default async function CityPage(props: {
    params: Promise<{ city: string }>;
    searchParams: Promise<{ filter?: string }>;
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const filter = (searchParams.filter === 'weekend' ? 'weekend' : 'tonight') as 'tonight' | 'weekend';

    const data = await getEvents(params.city, filter);
    if (!data) notFound();

    const { events, city } = data;

    return (
        <div>
            <div className="tabs">
                <a
                    href={`/${params.city}?filter=tonight`}
                    className={`tab ${filter === 'tonight' ? 'tab--active' : ''}`}
                >
                    Tonight
                </a>
                <a
                    href={`/${params.city}?filter=weekend`}
                    className={`tab ${filter === 'weekend' ? 'tab--active' : ''}`}
                >
                    This Weekend
                </a>
            </div>

            <div style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.2rem', opacity: 0.7 }}>
                    Nightlife in {city.name}
                </h1>
            </div>

            {events.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">🌙</div>
                    <h2 className="empty-state__title">No events found in {city.name}</h2>
                    <p className="empty-state__description">
                        {filter === 'tonight'
                            ? "Looks like it's a quiet night. Check back later or look at the weekend."
                            : "No events scheduled for this weekend yet. Know about one?"}
                    </p>
                    <div style={{ marginTop: 'var(--space-4)' }}>
                        <a href="/create" className="btn btn--primary" style={{ display: 'inline-flex', width: 'auto' }}>
                            Add an Event
                        </a>
                    </div>
                </div>
            ) : (
                <div>
                    {events.map((event) => (
                        <EventCard
                            key={event.id}
                            id={event.id}
                            title={event.title}
                            venueName={event.venue.name}
                            startTime={event.startTime}
                            endTime={event.endTime}
                            djs={event.djs.map((ed: any) => ed.dj)}
                            vibeTags={event.vibeTags ? event.vibeTags.split(',').map((t: string) => t.trim()) : []}
                            ctaType={event.ctaType as 'pay_at_venue' | 'external_ticket'}
                            ticketUrl={event.ticketUrl}
                            sourceType={event.sourceType}
                            legitPercent={calculateLegitPercent(event.votes)}
                            presenceCount={event.presenceCount}
                            queueStatus={calculateQueueStatus(event.votes)}
                            packedStatus={calculatePackedStatus(event.votes)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
