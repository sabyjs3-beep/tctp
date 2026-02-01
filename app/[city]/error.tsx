'use client';

import { useEffect } from 'react';

export default function CityError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="container" style={{ padding: 'var(--space-8) 0', textAlign: 'center' }}>
            <div style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-8)'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📶</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
                    Signal Lost
                </h2>
                <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
                    We couldn't fetch the latest parties for this city.<br />
                    The database might be sleeping.
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
                    <button onClick={() => reset()} className="btn btn--primary">
                        Try Again
                    </button>
                    <a href="/" className="btn btn--secondary">
                        Change City
                    </a>
                </div>
            </div>
        </div>
    );
}
