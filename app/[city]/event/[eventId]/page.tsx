import prisma from '@/lib/db';
import EventCard from '@/components/EventCard';
import VoteModule, { VOTE_MODULES } from '@/components/VoteModule';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

// -----------------------------------------------------------------------------
// Data Fetching
// -----------------------------------------------------------------------------

async function getEvent(eventId: string) {
    try {
        const event = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                venue: { select: { id: true, name: true, address: true, mapUrl: true, city: true } },
                djs: {
                    include: { dj: true },
                    orderBy: { order: 'asc' },
                },
                votes: true,
            },
        });
        return event as any;
    } catch (error) {
        console.error('Error fetching event:', error);
        return null;
    }
}

// -----------------------------------------------------------------------------
// Metadata (SEO)
// -----------------------------------------------------------------------------

export async function generateMetadata(props: { params: Promise<{ eventId: string }> }): Promise<Metadata> {
    const params = await props.params;
    const event = await getEvent(params.eventId);

    if (!event) return { title: 'Event Not Found' };

    const date = new Date(event.startTime).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric'
    });

    return {
        title: `${event.title} at ${event.venue.name} | ${date} | TCTP`,
        description: event.description || `Join the party at ${event.venue.name} on ${date}. Validated by the community.`,
        openGraph: {
            title: `${event.title} @ ${event.venue.name}`,
            description: `Check out ${event.title}. Real-time vibe check available.`,
        }
    };
}

// -----------------------------------------------------------------------------
// Page Component
// -----------------------------------------------------------------------------

export default async function EventPage(props: { params: Promise<{ city: string; eventId: string }> }) {
    const params = await props.params;
    const event = await getEvent(params.eventId);

    if (!event) {
        notFound();
    }

    // JSON-LD Schema.org Data for Google
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.title,
        startDate: event.startTime.toISOString(),
        endDate: event.endTime ? event.endTime.toISOString() : undefined,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: {
            '@type': 'Place',
            name: event.venue.name,
            address: {
                '@type': 'PostalAddress',
                addressLocality: event.venue.city.name,
                addressCountry: 'IN',
                streetAddress: event.venue.address || undefined,
            },
            hasMap: event.venue.mapUrl || undefined,
        },
        description: event.description || `${event.title} at ${event.venue.name}.`,
        offers: {
            '@type': 'Offer',
            url: event.ticketUrl || `https://toocooltoparty.com/${params.city}/event/${event.id}`,
            price: event.priceRange ? event.priceRange.replace(/[^0-9-]/g, '').split('-')[0] : '0',
            priceCurrency: 'INR',
            availability: 'https://schema.org/InStock',
        },
        performer: event.djs.map((ed: any) => ({
            '@type': 'PerformingGroup',
            name: ed.dj.name,
        })),
        organizer: {
            '@type': 'Organization',
            name: event.venue.name,
            url: `https://toocooltoparty.com/${params.city}/venue/${event.venue.id}`
        }
    };

    // Format helpers
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    const formatTime = (d: Date) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    return (
        <main style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--space-4)' }}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Back Link */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
                <a href={`/${params.city}`} style={{ textDecoration: 'none', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
                    ← Back to {params.city}
                </a>
            </div>

            <article className="event-detail">
                {/* Header */}
                <header style={{ marginBottom: 'var(--space-6)' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
                        {event.vibeTags?.split(',').map((tag: string) => (
                            <span key={tag} className={`vibe-tag vibe-tag--${tag.trim().toLowerCase().replace(/\s+/g, '-')}`}>
                                {tag.trim()}
                            </span>
                        ))}
                    </div>

                    <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 'var(--space-2)' }}>
                        {event.title}
                    </h1>

                    <div style={{ fontSize: 'var(--text-lg)', color: 'var(--color-text-secondary)' }}>
                        <a href={`/${params.city}/venue/${event.venue.id}`} style={{ color: 'inherit', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,0.2)' }}>
                            {event.venue.name}
                        </a>
                    </div>
                </header>

                {/* Key Info Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 'var(--space-4)',
                    background: 'var(--color-bg-card)',
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)',
                    marginBottom: 'var(--space-6)'
                }}>
                    <div>
                        <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '4px' }}>Date</div>
                        <div style={{ fontWeight: 500 }}>{formatDate(event.startTime)}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '4px' }}>Time</div>
                        <div style={{ fontWeight: 500 }}>
                            {formatTime(event.startTime)} {event.endTime && `- ${formatTime(event.endTime)}`}
                        </div>
                    </div>
                    {event.venue.address && (
                        <div style={{ gridColumn: 'span 2' }}>
                            <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '4px' }}>Address</div>
                            <div style={{ lineHeight: 1.4 }}>
                                {event.venue.address}
                                {event.venue.mapUrl && (
                                    <a
                                        href={event.venue.mapUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ display: 'inline-block', marginLeft: '8px', color: 'var(--color-accent-primary)', fontSize: '0.9em' }}
                                    >
                                        open map ↗
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                    {event.priceRange && (
                        <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-1)' }}>
                            <div style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.6, marginBottom: '4px' }}>Price</div>
                            <div style={{ fontWeight: 600, color: 'var(--color-success)' }}>{event.priceRange}</div>
                        </div>
                    )}
                </div>

                {/* Crowd Pulse (Voting) */}
                <section style={{ marginBottom: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)', fontWeight: 600 }}>Crowd Pulse</h2>
                    <div className="vote-grid" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                        gap: 'var(--space-3)'
                    }}>
                        <VoteModule
                            eventId={event.id}
                            {...VOTE_MODULES.legit}
                        />
                        <VoteModule
                            eventId={event.id}
                            {...VOTE_MODULES.packed}
                        />
                        <VoteModule
                            eventId={event.id}
                            {...VOTE_MODULES.queue}
                        />
                    </div>
                </section>



                {/* Lineup */}
                {event.djs.length > 0 && (
                    <section style={{ marginBottom: 'var(--space-8)' }}>
                        <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)', fontWeight: 600 }}>Lineup</h2>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {event.djs.map(({ dj }: { dj: any }) => (
                                <li key={dj.id} style={{
                                    padding: 'var(--space-3) 0',
                                    borderBottom: '1px solid var(--color-border)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: 'var(--text-lg)' }}>{dj.name}</span>
                                    {/* Placeholder for future soundcloud link */}
                                    <span style={{ opacity: 0.3, fontSize: '0.8em' }}>DJ</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {/* Description */}
                {event.description && (
                    <section style={{ marginBottom: 'var(--space-8)' }}>
                        <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)', fontWeight: 600 }}>About</h2>
                        <p style={{ lineHeight: 1.6, color: 'var(--color-text-secondary)', whiteSpace: 'pre-line' }}>
                            {event.description}
                        </p>
                    </section>
                )}

                {/* Sticky CTA Bar */}
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'rgba(0,0,0,0.9)',
                    backdropFilter: 'blur(10px)',
                    borderTop: '1px solid var(--color-border)',
                    padding: 'var(--space-4)',
                    display: 'flex',
                    gap: 'var(--space-3)',
                    zIndex: 100
                }}>
                    <a
                        href={`/${params.city}`}
                        className="btn btn--secondary"
                        style={{ flex: 1, textAlign: 'center' }}
                    >
                        Back
                    </a>

                    {event.ticketUrl ? (
                        <a
                            href={event.ticketUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn--primary"
                            style={{ flex: 2, textAlign: 'center' }}
                        >
                            Get Tickets
                        </a>
                    ) : event.ticketLinks && Array.isArray(event.ticketLinks) && event.ticketLinks.length > 0 ? (
                        // If we have multiple links, we'd ideally show a modal, but for now just link to the first one or logic
                        <a
                            href={(event.ticketLinks as any)[0].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn--primary"
                            style={{ flex: 2, textAlign: 'center' }}
                        >
                            Get Tickets ({(event.ticketLinks as any).length})
                        </a>
                    ) : (
                        <button disabled className="btn btn--secondary" style={{ flex: 2, opacity: 0.5 }}>
                            Pay at Venue
                        </button>
                    )}
                </div>

                {/* Spacer for sticky bar */}
                <div style={{ height: '80px' }}></div>
            </article>
        </main>
    );
}
