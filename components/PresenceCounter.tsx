'use client';

import { useState, useEffect } from 'react';
import { getDeviceToken } from '@/lib/device';

interface PresenceCounterProps {
    eventId: string;
    initialCount: number;
    currentStatus?: 'here' | 'going' | 'skipped' | null;
}

export default function PresenceCounter({
    eventId,
    initialCount,
    currentStatus,
}: PresenceCounterProps) {
    const [count, setCount] = useState(initialCount);
    const [status, setStatus] = useState<string | null>(currentStatus || null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePresence = async (newStatus: 'here' | 'going' | 'skipped') => {
        if (isSubmitting) return;

        // If clicking the same status, do nothing (can't un-mark)
        if (status === newStatus) return;

        setIsSubmitting(true);
        const deviceId = getDeviceToken();

        try {
            const response = await fetch(`/api/events/${eventId}/presence`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId, status: newStatus }),
            });

            if (response.ok) {
                const data = await response.json();
                setStatus(newStatus);
                setCount(data.presenceCount);
            }
        } catch (error) {
            console.error('Presence error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="presence-counter">
            <div className="presence-counter__count">{count}</div>
            <div className="presence-counter__label">
                {count === 1 ? 'person' : 'people'} here now
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginLeft: 'auto' }}>
                <button
                    className={`presence-counter__btn ${status === 'here' ? 'presence-counter__btn--active' : ''}`}
                    onClick={() => handlePresence('here')}
                    disabled={isSubmitting || status === 'here'}
                >
                    I'm here 📍
                </button>
                <button
                    className={`presence-counter__btn ${status === 'going' ? 'presence-counter__btn--active' : ''}`}
                    onClick={() => handlePresence('going')}
                    disabled={isSubmitting || status === 'going'}
                    style={{ background: status === 'going' ? 'var(--color-success)' : undefined }}
                >
                    Going 🏃
                </button>
            </div>
        </div>
    );
}
