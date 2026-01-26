'use client';

import { useState, useEffect } from 'react';
import { getDeviceToken } from '@/lib/device';
import VoteModule, { VOTE_MODULES } from '@/components/VoteModule';
import PresenceCounter from '@/components/PresenceCounter';
import WarningBanner from '@/components/WarningBanner';

interface SerializedEvent {
    id: string;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string | null;
    vibeTags: string | null;
    ctaType: string;
    ticketUrl: string | null;
    sourceType: string;
    status: string;
    presenceCount: number;
    venue: {
        id: string;
        name: string;
        address: string | null;
        mapUrl: string | null;
    };
    djs: {
        id: string;
        name: string;
        genres: string;
        vibeTags: string | null;
        soundcloud: string | null;
        instagram: string | null;
    }[];
    votes: {
        module: string;
        value: string;
        deviceId: string;
    }[];
    posts: {
        id: string;
        content: string | null;
        quickTag: string | null;
        score: number;
        createdAt: string;
        deviceId: string;
        votes: { deviceId: string; value: number }[];
    }[];
}

const QUICK_TAGS = [
    { value: 'cops_outside', label: '🚔 Cops outside' },
    { value: 'sound_bad', label: '🔇 Sound bad' },
    { value: 'entry_strict', label: '🚪 Entry strict' },
    { value: 'hidden_costs', label: '💸 Hidden costs' },
    { value: 'vibes_good', label: '✨ Vibes good' },
    { value: 'music_fire', label: '🔥 Music fire' },
];

export default function EventDetailClient({ event }: { event: SerializedEvent }) {
    const [deviceId, setDeviceId] = useState<string>('');
    const [myVotes, setMyVotes] = useState<Record<string, string>>({});
    const [postContent, setPostContent] = useState('');
    const [posts, setPosts] = useState(event.posts);
    const [isPosting, setIsPosting] = useState(false);
    const [lastPostTime, setLastPostTime] = useState<number>(0);

    useEffect(() => {
        const token = getDeviceToken();
        setDeviceId(token);

        // Load my existing votes
        const loadVotes = async () => {
            try {
                const res = await fetch(`/api/events/${event.id}/vote?deviceId=${token}`);
                if (res.ok) {
                    const data = await res.json();
                    setMyVotes(data.votes || {});
                }
            } catch (error) {
                console.error('Failed to load votes:', error);
            }
        };
        loadVotes();
    }, [event.id]);

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDate = (isoString: string) => {
        const d = new Date(isoString);
        return d.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
        });
    };

    const getRelativeTime = (isoString: string) => {
        const diff = Date.now() - new Date(isoString).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    // Calculate warning banners from votes
    const getWarningBanners = () => {
        const banners: { type: 'danger' | 'warning'; icon: string; message: string }[] = [];
        const voteCounts: Record<string, Record<string, number>> = {};

        event.votes.forEach((v) => {
            if (!voteCounts[v.module]) voteCounts[v.module] = {};
            voteCounts[v.module][v.value] = (voteCounts[v.module][v.value] || 0) + 1;
        });

        // Check legit
        const legitVotes = voteCounts['legit'] || {};
        const legitTotal = (legitVotes['positive'] || 0) + (legitVotes['negative'] || 0);
        if (legitTotal >= 25 && (legitVotes['negative'] || 0) / legitTotal >= 0.6) {
            banners.push({ type: 'danger', icon: '⚠️', message: "Many reports say this event isn't legit" });
        }

        // Check lineup
        const lineupVotes = voteCounts['lineup'] || {};
        const lineupTotal = Object.values(lineupVotes).reduce((a, b) => a + b, 0);
        if (lineupTotal >= 15 && (lineupVotes['fake'] || 0) / lineupTotal >= 0.3) {
            banners.push({ type: 'warning', icon: '⚠️', message: 'Lineup mismatch reported' });
        }

        // Check safety
        const safetyVotes = voteCounts['safety'] || {};
        const safetyTotal = Object.values(safetyVotes).reduce((a, b) => a + b, 0);
        const sketchyCount = (safetyVotes['sketchy'] || 0) + (safetyVotes['cops'] || 0);
        if (safetyTotal >= 15 && sketchyCount / safetyTotal >= 0.4) {
            banners.push({ type: 'warning', icon: '⚠️', message: 'Safety concerns reported' });
        }

        return banners;
    };

    const handleVote = (module: string, value: string) => {
        setMyVotes((prev) => ({ ...prev, [module]: value }));
    };

    const handlePost = async () => {
        if (!postContent.trim() || isPosting) return;

        // Rate limiting: 3 minutes between posts
        const now = Date.now();
        if (now - lastPostTime < 180000) {
            alert('Please wait before posting again');
            return;
        }

        setIsPosting(true);
        try {
            const res = await fetch(`/api/events/${event.id}/post`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId, content: postContent }),
            });

            if (res.ok) {
                const data = await res.json();
                setPosts((prev) => [data.post, ...prev]);
                setPostContent('');
                setLastPostTime(now);
            }
        } catch (error) {
            console.error('Post failed:', error);
        } finally {
            setIsPosting(false);
        }
    };

    const handleQuickTag = async (tag: string) => {
        if (isPosting) return;

        setIsPosting(true);
        try {
            const res = await fetch(`/api/events/${event.id}/post`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId, quickTag: tag }),
            });

            if (res.ok) {
                const data = await res.json();
                setPosts((prev) => [data.post, ...prev]);
            }
        } catch (error) {
            console.error('Quick tag failed:', error);
        } finally {
            setIsPosting(false);
        }
    };

    const handlePostVote = async (postId: string, value: 1 | -1) => {
        try {
            const res = await fetch(`/api/events/${event.id}/post/${postId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId, value }),
            });

            if (res.ok) {
                const data = await res.json();
                setPosts((prev) =>
                    prev.map((p) =>
                        p.id === postId ? { ...p, score: data.score } : p
                    )
                );
            }
        } catch (error) {
            console.error('Post vote failed:', error);
        }
    };

    const vibeTags = event.vibeTags ? event.vibeTags.split(',').map((t) => t.trim()) : [];
    const warningBanners = getWarningBanners();
    const isLive = event.status === 'live';

    return (
        <div>
            {/* Warning Banners */}
            {warningBanners.map((banner, i) => (
                <WarningBanner key={i} type={banner.type} icon={banner.icon} message={banner.message} />
            ))}

            {/* Event Header */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
                {event.sourceType === 'community' && (
                    <span className="vibe-tag" style={{ fontSize: '0.65rem', marginBottom: 'var(--space-2)', display: 'inline-block' }}>
                        🏷️ Community-sourced
                    </span>
                )}
                <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
                    {event.title}
                </h1>

                {event.description && (
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                        {event.description}
                    </p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
                    <span>📍 {event.venue.name}</span>
                    <span>🗓️ {formatDate(event.startTime)}</span>
                    <span>
                        ⏰ {formatTime(event.startTime)}
                        {event.endTime && ` – ${formatTime(event.endTime)}`}
                    </span>
                </div>

                {event.venue.mapUrl && (
                    <a
                        href={event.venue.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-block', marginTop: 'var(--space-3)', fontSize: 'var(--text-sm)' }}
                    >
                        📍 View on Map →
                    </a>
                )}
            </div>

            {/* DJ Lineup */}
            {event.djs.length > 0 && (
                <div style={{ marginBottom: 'var(--space-6)' }}>
                    <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
                        🎧 Lineup
                    </h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
                        {event.djs.map((dj) => (
                            <div
                                key={dj.id}
                                style={{
                                    padding: 'var(--space-3)',
                                    background: 'var(--color-bg-card)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                            >
                                <a href={`/dj/${dj.id}`} style={{ fontWeight: 500 }}>
                                    {dj.name}
                                </a>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                                    {dj.genres.split(',').slice(0, 2).join(' · ')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Vibe Tags */}
            {vibeTags.length > 0 && (
                <div className="vibe-tags" style={{ marginBottom: 'var(--space-6)' }}>
                    {vibeTags.map((tag) => (
                        <span key={tag} className={`vibe-tag vibe-tag--${tag.toLowerCase().replace(/\s+/g, '-')}`}>
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* CTA */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
                {event.ctaType === 'pay_at_venue' ? (
                    <button className="btn btn--secondary">Pay at Venue</button>
                ) : (
                    <a
                        href={event.ticketUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--primary"
                        onClick={() => {
                            // Could track click here
                        }}
                    >
                        Get Tickets →
                    </a>
                )}
            </div>

            {/* Presence Counter */}
            <PresenceCounter
                eventId={event.id}
                initialCount={event.presenceCount}
            />

            {/* Voting Section */}
            <div style={{ marginTop: 'var(--space-6)' }}>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                    Rate This Event
                </h2>
                <VoteModule
                    eventId={event.id}
                    {...VOTE_MODULES.legit}
                    currentValue={myVotes['legit']}
                    onVote={handleVote}
                />
                <VoteModule
                    eventId={event.id}
                    {...VOTE_MODULES.packed}
                    currentValue={myVotes['packed']}
                    onVote={handleVote}
                />
                <VoteModule
                    eventId={event.id}
                    {...VOTE_MODULES.queue}
                    currentValue={myVotes['queue']}
                    onVote={handleVote}
                />
                <VoteModule
                    eventId={event.id}
                    {...VOTE_MODULES.lineup}
                    currentValue={myVotes['lineup']}
                    onVote={handleVote}
                />
                <VoteModule
                    eventId={event.id}
                    {...VOTE_MODULES.safety}
                    currentValue={myVotes['safety']}
                    onVote={handleVote}
                />
                <VoteModule
                    eventId={event.id}
                    {...VOTE_MODULES.sound}
                    currentValue={myVotes['sound']}
                    onVote={handleVote}
                />
            </div>

            {/* Thread Section */}
            <div className="thread" style={{ marginTop: 'var(--space-8)' }}>
                <div className="thread__header">
                    <h2 className="thread__title">Live Updates</h2>
                    {isLive && (
                        <div className="thread__live-badge">LIVE</div>
                    )}
                </div>

                {/* Quick Tags */}
                <div className="quick-tags">
                    {QUICK_TAGS.map((tag) => (
                        <button
                            key={tag.value}
                            className="quick-tag"
                            onClick={() => handleQuickTag(tag.value)}
                            disabled={isPosting}
                        >
                            {tag.label}
                        </button>
                    ))}
                </div>

                {/* Post Input */}
                {(event.status === 'live' || event.status === 'cooling') && (
                    <div className="post-input">
                        <textarea
                            className="post-input__field"
                            placeholder="What's happening? (120 chars max)"
                            maxLength={120}
                            rows={2}
                            value={postContent}
                            onChange={(e) => setPostContent(e.target.value)}
                        />
                        <button
                            className="post-input__submit"
                            onClick={handlePost}
                            disabled={isPosting || !postContent.trim()}
                        >
                            Post
                        </button>
                    </div>
                )}

                {/* Posts */}
                <div style={{ marginTop: 'var(--space-4)' }}>
                    {posts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
                            No updates yet. Be the first to share!
                        </div>
                    ) : (
                        posts.map((post) => {
                            const myPostVote = post.votes.find((v) => v.deviceId === deviceId);
                            const quickTagLabel = QUICK_TAGS.find((t) => t.value === post.quickTag);

                            return (
                                <div
                                    key={post.id}
                                    className={`thread-post ${post.score < -3 ? 'thread-post--collapsed' : ''}`}
                                >
                                    <div className="thread-post__header">
                                        <span className="thread-post__author">Anonymous</span>
                                        <span className="thread-post__time">{getRelativeTime(post.createdAt)}</span>
                                    </div>
                                    <div className="thread-post__content">
                                        {post.quickTag ? (
                                            <span style={{ fontWeight: 500 }}>{quickTagLabel?.label || post.quickTag}</span>
                                        ) : (
                                            post.content
                                        )}
                                    </div>
                                    <div className="thread-post__footer">
                                        <div className="thread-post__vote">
                                            <button
                                                className={`thread-post__vote-btn ${myPostVote?.value === 1 ? 'thread-post__vote-btn--active-up' : ''}`}
                                                onClick={() => handlePostVote(post.id, 1)}
                                            >
                                                ▲
                                            </button>
                                            <span className="thread-post__score">{post.score}</span>
                                            <button
                                                className={`thread-post__vote-btn ${myPostVote?.value === -1 ? 'thread-post__vote-btn--active-down' : ''}`}
                                                onClick={() => handlePostVote(post.id, -1)}
                                            >
                                                ▼
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Share Section */}
            <div style={{ marginTop: 'var(--space-8)' }}>
                <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-3)' }}>
                    Share
                </h2>
                <div className="share-buttons">
                    <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                            (() => {
                                let msg = `${event.title} at ${event.venue.name}\n`;

                                // Add crowd signals
                                const voteCounts: Record<string, Record<string, number>> = {};
                                event.votes.forEach((v) => {
                                    if (!voteCounts[v.module]) voteCounts[v.module] = {};
                                    voteCounts[v.module][v.value] = (voteCounts[v.module][v.value] || 0) + 1;
                                });

                                const legitVotes = voteCounts['legit'] || {};
                                const legitTotal = (legitVotes['positive'] || 0) + (legitVotes['negative'] || 0);
                                if (legitTotal >= 5) {
                                    const legitPercent = Math.round(((legitVotes['positive'] || 0) / legitTotal) * 100);
                                    msg += `${legitPercent >= 70 ? '🔥' : legitPercent <= 40 ? '👎' : '🤷'} ${legitPercent}% Legit\n`;
                                }

                                if (event.presenceCount > 0) {
                                    msg += `👥 ${event.presenceCount} here now\n`;
                                }

                                // Add warnings
                                if (warningBanners.length > 0) {
                                    msg += `⚠️ ${warningBanners[0].message}\n`;
                                }

                                msg += `\n${typeof window !== 'undefined' ? window.location.href : ''}`;
                                return msg;
                            })()
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="share-btn"
                    >
                        WhatsApp
                    </a>
                    <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(
                            (() => {
                                let msg = `${event.title} at ${event.venue.name}\n`;

                                const voteCounts: Record<string, Record<string, number>> = {};
                                event.votes.forEach((v) => {
                                    if (!voteCounts[v.module]) voteCounts[v.module] = {};
                                    voteCounts[v.module][v.value] = (voteCounts[v.module][v.value] || 0) + 1;
                                });

                                const legitVotes = voteCounts['legit'] || {};
                                const legitTotal = (legitVotes['positive'] || 0) + (legitVotes['negative'] || 0);
                                if (legitTotal >= 5) {
                                    const legitPercent = Math.round(((legitVotes['positive'] || 0) / legitTotal) * 100);
                                    msg += `${legitPercent >= 70 ? '🔥' : legitPercent <= 40 ? '👎' : '🤷'} ${legitPercent}% Legit `;
                                }

                                if (event.presenceCount > 0) {
                                    msg += `👥 ${event.presenceCount} here`;
                                }

                                return msg;
                            })()
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="share-btn"
                    >
                        Telegram
                    </a>
                    <button
                        className="share-btn"
                        onClick={() => {
                            if (typeof navigator !== 'undefined' && navigator.clipboard) {
                                navigator.clipboard.writeText(window.location.href);
                                alert('Link copied!');
                            }
                        }}
                    >
                        Copy Link
                    </button>
                </div>
            </div>
        </div>
    );
}
