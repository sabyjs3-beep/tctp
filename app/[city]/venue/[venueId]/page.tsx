import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import EventCard from '@/components/EventCard';

// -----------------------------------------------------------------------------
// Data Fetching
// -----------------------------------------------------------------------------

async function getVenue(venueId: string) {
    try {
        const venue = await prisma.venue.findUnique({
            where: { id: venueId },
            include: {
                city: true,
                events: {
                    where: {
                        status: { in: ['created', 'live'] },
                        startTime: { gte: new Date() } // Only future events
                    },
                    orderBy: { startTime: 'asc' },
                    include: {
                        venue: { select: { id: true, name: true, address: true, mapUrl: true } },
                        djs: { include: { dj: true }, orderBy: { order: 'asc' } },
                        votes: true
                    },
                    take: 10 // Limit next 10 events
                }
            }
        });
        return venue;
    } catch (error) {
        console.error('Error fetching venue:', error);
        return null;
    }
}

// -----------------------------------------------------------------------------
// Metadata (SEO)
// -----------------------------------------------------------------------------

export async function generateMetadata(props: { params: Promise<{ venueId: string }> }): Promise<Metadata> {
    const params = await props.params;
    const venue = await getVenue(params.venueId);

    if (!venue) return { title: 'Venue Not Found' };

    return {
        title: `${venue.name} - Upcoming Events & Parties | TCTP`,
        description: `Check out upcoming nightlife events at ${venue.name} in ${venue.city.name}. Get tickets, guestlist info, and real-time vibe checks.`,
        openGraph: {
            title: `${venue.name} - ${venue.city.name}`,
            description: `Upcoming parties at ${venue.name}. Don't miss out.`,
        }
    };
}

// -----------------------------------------------------------------------------
// Page Component
// -----------------------------------------------------------------------------

export default async function VenuePage(props: { params: Promise<{ city: string; venueId: string }> }) {
    const params = await props.params;
    const venue = await getVenue(params.venueId);

    if (!venue) {
        notFound();
    }

    // JSON-LD Schema.org Data for LocalBusiness
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NightClub', // or LocalBusiness
        name: venue.name,
        address: {
            '@type': 'PostalAddress',
            addressLocality: venue.city.name,
            addressCountry: 'IN',
            streetAddress: venue.address || undefined,
        },
        hasMap: venue.mapUrl || undefined,
        url: `https://toocooltoparty.com/${params.city}/venue/${venue.id}`,
        geo: undefined, // Add lat/long to schema if we ever get it
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Friday', 'Saturday', 'Sunday'],
                opens: '21:00',
                closes: '04:00'
            }
        ]
    };

    const upcomingEvents = venue.events || [];

    return (
        <main style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--space-4)' }}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Back Link */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
                <a href={`/${params.city}`} style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                    ← Back to {params.city}
                </a>
            </div>

            {/* Header */}
            <header style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px', marginBottom: 'var(--space-3)' }}>
                    {venue.name}
                </h1>

                {venue.address && (
                    <div style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                        {venue.address}
                    </div>
                )}

                {venue.mapUrl && (
                    <a
                        href={venue.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--secondary"
                        style={{ display: 'inline-block' }}
                    >
                        📍 View on Map
                    </a>
                )}
            </header>

            {/* Content Spine */}
            <section>
                <h2 style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 600,
                    borderBottom: '1px solid var(--color-border)',
                    paddingBottom: 'var(--space-2)',
                    marginBottom: 'var(--space-4)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    opacity: 0.8
                }}>
                    Upcoming Events
                </h2>

                {upcomingEvents.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                        {upcomingEvents.map((event: any) => (
                            <EventCard
                                key={event.id}
                                id={event.id}
                                title={event.title}
                                venueName={event.venue.name}
                                venueAddress={event.venue.address}
                                mapUrl={event.venue.mapUrl}
                                startTime={event.startTime}
                                endTime={event.endTime}
                                djs={event.djs.map((ed: any) => ed.dj)}
                                vibeTags={event.vibeTags ? event.vibeTags.split(',').map((t: string) => t.trim()) : []}
                                ctaType={event.ctaType as 'pay_at_venue' | 'external_ticket'}
                                ticketUrl={event.ticketUrl}
                                ticketLinks={event.ticketLinks ? (event.ticketLinks as unknown as { source: string; url: string }[]) : undefined}
                                priceRange={event.priceRange}
                                sourceType={event.sourceType}
                                citySlug={params.city}
                                legitPercent={undefined} // Don't calc complex signals for venue list to keep it fast
                                presenceCount={event.presenceCount}
                                queueStatus={undefined}
                                packedStatus={undefined}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{
                        padding: 'var(--space-8)',
                        textAlign: 'center',
                        background: 'var(--color-bg-card)',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px dashed var(--color-border)',
                        color: 'var(--color-text-secondary)'
                    }}>
                        <p>No upcoming events listed yet.</p>
                        <p style={{ fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>Check back later or view other venues in {venue.city.name}.</p>
                    </div>
                )}
            </section>
        </main>
    );
}
