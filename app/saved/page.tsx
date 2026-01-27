'use client';

import { useEffect, useState } from 'react';
import { getDeviceToken } from '@/lib/device';
import EventCard from '@/components/EventCard';
import { useSavedEvents } from '@/components/SavedEventsContext';

export default function SavedPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { savedIds, isSaved } = useSavedEvents();

    useEffect(() => {
        const fetchSavedDetails = async () => {
            const deviceId = getDeviceToken();
            if (!deviceId) return;

            try {
                const res = await fetch(`/api/user/saved/details?deviceId=${deviceId}`);
                if (res.ok) {
                    const data = await res.json();
                    setEvents(data.events);
                }
            } catch (error) {
                console.error('Error loading saved events', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSavedDetails();
    }, [savedIds.size]); // Re-fetch if count changes substantially, though context handles toggle ID state

    // Helpers (reused from CityPage - ideally shared utils)
    const calculateLegitPercent = (votes: any[]) => {
        if (!votes) return undefined;
        const legitVotes = votes.filter(v => v.module === 'legit');
        if (legitVotes.length < 5) return undefined;
        const positive = legitVotes.filter(v => v.value === 'positive').length;
        return Math.round((positive / legitVotes.length) * 100);
    };

    const calculateStatus = (votes: any[], module: string, labels: Record<string, string>) => {
        if (!votes) return undefined;
        const filtered = votes.filter(v => v.module === module);
        if (filtered.length < 5) return undefined;
        const counts: Record<string, number> = {};
        filtered.forEach(v => counts[v.value] = (counts[v.value] || 0) + 1);
        const max = Object.entries(counts).reduce((a, b) => a[1] > b[1] ? a : b);
        return labels[max[0]] || undefined;
    };


    if (loading) {
        return (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', opacity: 0.5 }}>
                Loading your agenda...
            </div>
        );
    }

    // Filter out events that were just unsaved in the context but maybe still in the list
    const displayedEvents = events.filter(e => isSaved(e.id));

    return (
        <div className="container" style={{ padding: 'var(--space-4) 0' }}>
            <div style={{ marginBottom: 'var(--space-6)', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
                    My Agenda
                </h1>
                <p style={{ opacity: 0.6 }}>
                    {displayedEvents.length} {displayedEvents.length === 1 ? 'Event' : 'Events'} Saved
                </p>
            </div>

            {displayedEvents.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state__icon">❤️</div>
                    <h2 className="empty-state__title">No saved events yet</h2>
                    <p className="empty-state__description">
                        Heart events to build your personal party agenda.
                    </p>
                    <div style={{ marginTop: 'var(--space-4)' }}>
                        <a href="/" className="btn btn--primary">
                            Browse Events
                        </a>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                    {displayedEvents.map((event) => (
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
                            ticketLinks={event.ticketLinks ? (event.ticketLinks as any) : undefined}
                            priceRange={event.priceRange}
                            sourceType={event.sourceType}
                            citySlug={event.venue.city.slug}
                            slug={event.slug}
                            presenceCount={event.presenceCount}
                            legitPercent={calculateLegitPercent(event.votes)}
                            queueStatus={calculateStatus(event.votes, 'queue', { walkin: 'Walk-in', short: '10-20m', long: '30-60m', notGettingIn: 'No Entry' })}
                            packedStatus={calculateStatus(event.votes, 'packed', { empty: 'Empty', moderate: 'Moderate', packed: 'Packed', insane: 'Insane' })}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
