'use client';

export default function SkeletonCard() {
    return (
        <div className="event-card" style={{
            height: '180px',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Shimmer Effect Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite linear',
            }} />

            <div style={{ marginBottom: 'var(--space-3)' }}>
                <div style={{ width: '60%', height: '24px', background: 'var(--color-bg-elevated)', borderRadius: '4px', marginBottom: '8px' }} />
                <div style={{ width: '40%', height: '16px', background: 'var(--color-bg-elevated)', borderRadius: '4px' }} />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--space-3)' }}>
                <div style={{ width: '80px', height: '20px', background: 'var(--color-bg-elevated)', borderRadius: '12px' }} />
                <div style={{ width: '80px', height: '20px', background: 'var(--color-bg-elevated)', borderRadius: '12px' }} />
            </div>
        </div>
    );
}
