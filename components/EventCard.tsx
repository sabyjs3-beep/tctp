'use client';

import { useState } from 'react';
import { useSavedEvents } from '@/components/SavedEventsContext';

interface EventCardProps {
    id: string;
    title: string;
    venueName: string;
    venueAddress?: string | null;
    startTime: Date;
    endTime?: Date | null;
    djs: { id: string; name: string }[];
    vibeTags: string[];
    ctaType: 'pay_at_venue' | 'external_ticket';
    ticketUrl?: string | null;
    ticketLinks?: { source: string; url: string }[] | null;
    priceRange?: string | null;
    mapUrl?: string | null;
    sourceType: string;
    citySlug: string;
    slug?: string | null;
    // Crowd signals
    legitPercent?: number;
    presenceCount: number;
    queueStatus?: string;
    packedStatus?: string;
    index?: number;
}

export default function EventCard({
    id,
    title,
    venueName,
    venueAddress,
    startTime,
    endTime,
    djs,
    vibeTags,
    ctaType,
    ticketUrl,
    ticketLinks,
    priceRange,
    mapUrl,
    sourceType,
    citySlug,
    slug,
    legitPercent,
    presenceCount,
    queueStatus,
    packedStatus,
    index = 0,
}: EventCardProps) {
    const [showTickets, setShowTickets] = useState(false);

    // Animation delay based on index
    const animationDelay = `${index * 50}ms`;

    const formatTime = (date: Date) => {
        return new Date(date).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDate = (date: Date) => {
        const d = new Date(date);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (d.toDateString() === today.toDateString()) {
            return 'Tonight';
        } else if (d.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        }
    };

    const handleCTAClick = () => {
        if (ticketLinks && ticketLinks.length > 1) {
            setShowTickets(!showTickets);
        } else if (ctaType === 'external_ticket' && ticketUrl) {
            window.open(ticketUrl, '_blank', 'noopener,noreferrer');
        }
    };

    // Check if we have any crowd signals to show
    const hasCrowdSignals = legitPercent !== undefined || presenceCount > 0 || queueStatus || packedStatus;

    // Save/Bookmark logic
    const { isSaved, toggleSave } = useSavedEvents();
    const saved = isSaved(id);

    return (
        <article
            className="event-card"
            style={{
                padding: 'var(--space-4)',
                position: 'relative',
                animation: 'fadeInUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both',
                animationDelay: animationDelay
            }}
        >
            {/* Save Button */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleSave(id);
                }}
                style={{
                    position: 'absolute',
                    top: 'var(--space-4)',
                    right: 'var(--space-4)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    zIndex: 2,
                    padding: '4px',
                    transition: 'transform 0.2s',
                    transform: saved ? 'scale(1.1)' : 'scale(1)',
                    opacity: saved ? 1 : 0.3
                }}
                title={saved ? "Remove from saved" : "Save this event"}
            >
                {saved ? '❤️' : '🤍'}
            </button>
            {/* Compact Header */}
            <header className="event-card__header" style={{ marginBottom: 'var(--space-2)' }}>
                <a href={`/${citySlug}/event/${slug || id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h2 className="event-card__title" style={{ fontSize: 'var(--text-base)', marginBottom: '2px' }}>
                        {title}
                    </h2>
                </a>
                <div className="event-card__meta" style={{ fontSize: 'var(--text-xs)', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                    <span className="event-card__meta-item">
                        📍 {venueName}
                    </span>
                    <span className="event-card__meta-item">
                        {formatDate(startTime)} · {formatTime(startTime)}
                        {endTime ? ` – ${formatTime(endTime)}` : ''}
                    </span>
                    {priceRange && (
                        <span className="event-card__meta-item" style={{ color: 'var(--color-success)', fontWeight: '500' }}>
                            💰 {priceRange}
                        </span>
                    )}
                </div>
                {venueAddress && (
                    <div style={{ fontSize: 'var(--text-xs)', opacity: 0.5, marginTop: '2px' }}>
                        {venueAddress}
                        {mapUrl && (
                            <a
                                href={mapUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ marginLeft: 'var(--space-2)', color: 'var(--color-accent-primary)' }}
                            >
                                📍 Map
                            </a>
                        )}
                    </div>
                )}
            </header>

            {/* DJ Lineup - Compact */}
            {djs.length > 0 && (
                <div className="event-card__lineup" style={{ margin: 'var(--space-2) 0', fontSize: 'var(--text-xs)' }}>
                    <span style={{ marginRight: '4px', opacity: 0.6 }}>🎧</span>
                    {djs.slice(0, 3).map((dj) => (
                        <a key={dj.id} href={`/dj/${dj.id}`} className="event-card__dj">
                            {dj.name}
                        </a>
                    ))}
                    {djs.length > 3 && <span style={{ opacity: 0.5 }}> +{djs.length - 3} more</span>}
                </div>
            )}

            {/* Vibe Tags - Inline */}
            {vibeTags.length > 0 && (
                <div className="vibe-tags" style={{ margin: 'var(--space-2) 0', gap: '4px' }}>
                    {vibeTags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className={`vibe-tag vibe-tag--${tag.toLowerCase().replace(/\s+/g, '-')}`}
                            style={{ padding: '2px 6px', fontSize: '0.65rem' }}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Crowd Signals - Only show if data exists */}
            {hasCrowdSignals && (
                <div className="crowd-signals" style={{ padding: 'var(--space-2) 0', margin: 'var(--space-2) 0', fontSize: 'var(--text-xs)' }}>
                    {legitPercent !== undefined && (
                        <div className={`crowd-signal crowd-signal--${legitPercent >= 70 ? 'positive' : legitPercent <= 40 ? 'negative' : 'neutral'}`}>
                            <span className="crowd-signal__icon">
                                {legitPercent >= 70 ? '🔥' : legitPercent <= 40 ? '👎' : '🤷'}
                            </span>
                            <span className="crowd-signal__value">{legitPercent}%</span>
                            <span>Legit</span>
                        </div>
                    )}

                    {presenceCount > 0 && (
                        <div className="crowd-signal crowd-signal--neutral">
                            <span className="crowd-signal__icon">👥</span>
                            <span className="crowd-signal__value">{presenceCount}</span>
                            <span>here</span>
                        </div>
                    )}

                    {queueStatus && (
                        <div className={`crowd-signal crowd-signal--${queueStatus === 'Walk-in' ? 'positive' : queueStatus === 'Not getting in' ? 'negative' : 'warning'}`}>
                            <span className="crowd-signal__icon">⏳</span>
                            <span className="crowd-signal__value">{queueStatus}</span>
                        </div>
                    )}

                    {packedStatus && (
                        <div className="crowd-signal crowd-signal--neutral">
                            <span className="crowd-signal__icon">👤</span>
                            <span className="crowd-signal__value">{packedStatus}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Sources & CTAs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-3)' }}>
                <span className="vibe-tag" style={{ fontSize: '0.6rem', opacity: 0.6 }}>
                    {sourceType === 'automated' ? '📡 Auto' : '🏷️ Community'}
                </span>

                <div style={{ position: 'relative' }}>
                    {ctaType === 'pay_at_venue' ? (
                        <a href={`/${citySlug}/event/${id}`} className="btn btn--secondary" style={{ padding: '6px 12px', fontSize: 'var(--text-xs)' }}>
                            View Details
                        </a>
                    ) : (
                        <button onClick={handleCTAClick} className="btn btn--primary" style={{ padding: '6px 12px', fontSize: 'var(--text-xs)' }}>
                            {ticketLinks && ticketLinks.length > 1 ? `Get Tickets (${ticketLinks.length})` : 'Get Tickets →'}
                        </button>
                    )}

                    {showTickets && ticketLinks && (
                        <div style={{
                            position: 'absolute',
                            bottom: '100%',
                            right: 0,
                            marginBottom: '5px',
                            background: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: '5px',
                            zIndex: 10,
                            minWidth: '150px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px'
                        }}>
                            {ticketLinks.map((t, i) => (
                                <a
                                    key={i}
                                    href={t.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'block',
                                        padding: '8px',
                                        fontSize: 'var(--text-xs)',
                                        textDecoration: 'none',
                                        color: 'var(--color-text-primary)',
                                        borderRadius: 'var(--radius-sm)',
                                        background: 'var(--color-bg-elevated)'
                                    }}
                                >
                                    {t.source || 'Ticket Source'} ↗
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </article>
    );
}
