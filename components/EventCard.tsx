'use client';

interface EventCardProps {
    id: string;
    title: string;
    venueName: string;
    startTime: Date;
    endTime?: Date | null;
    djs: { id: string; name: string }[];
    vibeTags: string[];
    ctaType: 'pay_at_venue' | 'external_ticket';
    ticketUrl?: string | null;
    sourceType: string;
    // Crowd signals
    legitPercent?: number;
    presenceCount: number;
    queueStatus?: string;
    packedStatus?: string;
}

export default function EventCard({
    id,
    title,
    venueName,
    startTime,
    endTime,
    djs,
    vibeTags,
    ctaType,
    ticketUrl,
    sourceType,
    legitPercent,
    presenceCount,
    queueStatus,
    packedStatus,
}: EventCardProps) {
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
        if (ctaType === 'external_ticket' && ticketUrl) {
            window.open(ticketUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <article className="event-card">
            {/* Source badge */}
            <div style={{ marginBottom: 'var(--space-2)' }}>
                {sourceType === 'automated' ? (
                    <span className="vibe-tag" style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                        📡 Automated feed sync
                    </span>
                ) : sourceType === 'community' && (
                    <span className="vibe-tag" style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                        🏷️ Community-sourced
                    </span>
                )}
            </div>

            {/* Header */}
            <header className="event-card__header">
                <a href={`/event/${id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h2 className="event-card__title">
                        {title}
                    </h2>
                </a>
                <div className="event-card__meta">
                    <span className="event-card__meta-item">
                        📍 {venueName}
                    </span>
                    <span className="event-card__meta-item">
                        🗓️ {formatDate(startTime)}
                    </span>
                    <span className="event-card__meta-item">
                        ⏰ {formatTime(startTime)}
                        {endTime && ` – ${formatTime(endTime)}`}
                    </span>
                </div>
            </header>

            {/* DJ Lineup */}
            {djs.length > 0 && (
                <div className="event-card__lineup">
                    <span style={{ marginRight: 'var(--space-2)' }}>🎧</span>
                    {djs.map((dj, index) => (
                        <a key={dj.id} href={`/dj/${dj.id}`} className="event-card__dj">
                            {dj.name}
                        </a>
                    ))}
                </div>
            )}

            {/* Vibe Tags */}
            {vibeTags.length > 0 && (
                <div className="vibe-tags">
                    {vibeTags.map((tag) => (
                        <span
                            key={tag}
                            className={`vibe-tag vibe-tag--${tag.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Crowd Signals */}
            <div className="crowd-signals">
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

            {/* CTA */}
            <div className="event-card__cta">
                {ctaType === 'pay_at_venue' ? (
                    <a href={`/event/${id}`} className="btn btn--secondary">
                        Pay at Venue
                    </a>
                ) : (
                    <button onClick={handleCTAClick} className="btn btn--primary">
                        Get Tickets →
                    </button>
                )}
            </div>
        </article>
    );
}
