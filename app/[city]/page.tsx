import { notFound } from 'next/navigation';
import { getEvents } from '@/lib/events';
import EventCard from '@/components/EventCard';
import { Metadata } from 'next';

export async function generateMetadata(props: { params: Promise<{ city: string }> }): Promise<Metadata> {
    const params = await props.params;
    const city = params.city.charAt(0).toUpperCase() + params.city.slice(1);
    return {
        title: `Parties in ${city} Tonight | TCTP`,
        description: `Find the best parties in ${city}. Verified guestlists, prices, and vibe checks.`,
    };
}

export default async function CityPage(props: {
    params: Promise<{ city: string }>;
    searchParams: Promise<{ filter?: string }>;
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    // Support legacy query param ?filter=weekend, but prefer /city/weekend route
    const filter = (searchParams.filter === 'weekend' ? 'weekend' : 'tonight') as 'tonight' | 'weekend';

    if (params.city === 'api' || params.city === 'create') {
        notFound();
    }

    const data = await getEvents(params.city, filter);

    if (!data) {
        notFound();
    }

    const { events, city } = data;

    // Helpers
    const calculateLegitPercent = (votes: any[]) => {
        const legitVotes = votes.filter(v => v.module === 'legit');
        if (legitVotes.length < 5) return undefined;
        const positive = legitVotes.filter(v => v.value === 'positive').length;
        return Math.round((positive / legitVotes.length) * 100);
    };

    const calculateStatus = (votes: any[], module: string, labels: Record<string, string>) => {
        const filtered = votes.filter(v => v.module === module);
        if (filtered.length < 5) return undefined;
        const counts: Record<string, number> = {};
        filtered.forEach(v => counts[v.value] = (counts[v.value] || 0) + 1);
        const max = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b);
        return labels[max[0]] || undefined;
    };


    return (
        <div>
            {/* Filter Tabs - Updated to link to new routes */}
            <div className="tabs" style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
                <a
                    href={`/${params.city}`}
                    className={`tab ${filter === 'tonight' ? 'tab--active' : ''}`}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '100px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        textDecoration: 'none',
                        background: filter === 'tonight' ? 'var(--color-accent-primary)' : 'rgba(255,255,255,0.05)',
                        color: filter === 'tonight' ? 'white' : 'var(--color-text-secondary)',
                        border: '1px solid',
                        borderColor: filter === 'tonight' ? 'var(--color-accent-primary)' : 'rgba(255,255,255,0.1)'
                    }}
                >
                    Tonight
                </a>
                <a
                    href={`/${params.city}/weekend`}
                    className={`tab ${filter === 'weekend' ? 'tab--active' : ''}`}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '100px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        textDecoration: 'none',
                        background: filter === 'weekend' ? 'var(--color-accent-primary)' : 'rgba(255,255,255,0.05)',
                        color: filter === 'weekend' ? 'white' : 'var(--color-text-secondary)',
                        border: '1px solid',
                        borderColor: filter === 'weekend' ? 'var(--color-accent-primary)' : 'rgba(255,255,255,0.1)'
                    }}
                >
                    This Weekend
                </a>
                <a
                    href={`/${params.city}/all`}
                    className="tab"
                    style={{
                        padding: '8px 16px',
                        borderRadius: '100px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        textDecoration: 'none',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--color-text-secondary)',
                        border: '1px solid',
                        borderColor: 'rgba(255,255,255,0.1)'
                    }}
                >
                    All Upcoming
                </a>
            </div>

            <div style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.2rem', opacity: 0.9, fontWeight: '600', letterSpacing: '-0.5px' }}>
                    {events.length} {events.length === 1 ? 'Party' : 'Parties'} in {city.name} {filter === 'tonight' ? 'Tonight' : 'This Weekend'}
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {events.map((event) => (
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
                            slug={event.slug}
                            legitPercent={calculateLegitPercent(event.votes)}
                            presenceCount={event.presenceCount}
                            queueStatus={calculateStatus(event.votes, 'queue', { walkin: 'Walk-in', short: '10-20m', long: '30-60m', notGettingIn: 'No Entry' })}
                            packedStatus={calculateStatus(event.votes, 'packed', { empty: 'Empty', moderate: 'Moderate', packed: 'Packed', insane: 'Insane' })}
                        />
                    ))}
                </div>
            )}

            {/* FAQ Block for SEO */}
            <section style={{ marginTop: 'var(--space-12)', paddingTop: 'var(--space-8)', borderTop: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                    Nightlife in {city.name}: FAQ
                </h3>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                    <p><strong>What is the vibe in {city.name} tonight?</strong><br />
                        TCTP aggregates {city.name}'s top parties from clubs, underground promoters, and raves. Our "Crowd Signals" tell you if a place is packed or empty in real-time.</p>

                    <p style={{ marginTop: 'var(--space-3)' }}><strong>Do I need to be on a guestlist?</strong><br />
                        Most clubs in {city.name} require guestlist entry. Check the "Get Tickets" or "View Details" button on each event card for link access.</p>
                </div>
            </section>
        </div>
    );
}
