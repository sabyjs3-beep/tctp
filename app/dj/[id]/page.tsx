import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import EventCard from '@/components/EventCard';

async function getDJData(id: string) {
    // Use the accessor name Prisma generated (dJ)
    const dj = await (prisma as any).dJ.findUnique({
        where: { id },
        include: {
            city: true,
            events: {
                include: {
                    event: {
                        include: {
                            venue: { include: { city: true } },
                            djs: { include: { dj: true } },
                            votes: true,
                        }
                    }
                },
                orderBy: { event: { startTime: 'desc' } },
                take: 10,
            }
        }
    });
    return dj;
}

export default async function DJPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const dj = await getDJData(params.id);

    if (!dj) notFound();

    const events = dj.events || [];

    return (
        <div className="page">
            <header style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-2)' }}>🎧</div>
                <h1 style={{ fontSize: '2rem', marginBottom: 'var(--space-1)' }}>{dj.name}</h1>
                <div style={{ opacity: 0.7, fontSize: '0.9rem' }}>
                    📍 Based in {dj.city?.name || 'Unknown City'}
                </div>

                {dj.genres && (
                    <div className="vibe-tags" style={{ justifyContent: 'center', marginTop: 'var(--space-4)' }}>
                        {dj.genres.split(',').map((tag: string) => (
                            <span key={tag} className="vibe-tag">{tag.trim()}</span>
                        ))}
                    </div>
                )}

                <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
                    {dj.soundcloud && (
                        <a href={dj.soundcloud} target="_blank" rel="noopener noreferrer" className="btn btn--secondary" style={{ width: 'auto' }}>
                            SoundCloud ↗
                        </a>
                    )}
                    {dj.instagram && (
                        <a href={`https://instagram.com/${dj.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="btn btn--secondary" style={{ width: 'auto' }}>
                            Instagram ↗
                        </a>
                    )}
                </div>
            </header>

            <section>
                <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-4)', opacity: 0.8 }}>
                    Upcoming & Recent Gigs
                </h2>

                {events.length === 0 ? (
                    <p style={{ opacity: 0.5 }}>No gigs found in the truth engine yet.</p>
                ) : (
                    <div className="events-grid">
                        {events.map(({ event }: any) => (
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
                                presenceCount={event.presenceCount}
                                citySlug={event.venue.city.slug}
                                slug={event.slug}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
