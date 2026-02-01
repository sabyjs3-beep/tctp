'use client';

import { useEffect } from 'react';

export default function GlobalError({
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
        <div className="container" style={{
            height: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
        }}>
            <h2 style={{ fontSize: '2rem', marginBottom: 'var(--space-4)' }}>System Glitch 👾</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', maxWidth: '400px' }}>
                Our engines are cooling down. It's not you, it's us.
            </p>
            <button
                onClick={() => reset()}
                className="btn btn--primary"
            >
                Retry Connection
            </button>
        </div>
    );
}
