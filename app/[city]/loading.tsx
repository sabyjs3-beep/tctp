import SkeletonCard from '@/components/SkeletonCard';

export default function Loading() {
    return (
        <div className="container" style={{ padding: 'var(--space-4) 0' }}>
            <div style={{
                height: '40px',
                width: '150px',
                background: 'var(--color-bg-elevated)',
                borderRadius: '8px',
                marginBottom: 'var(--space-4)',
                opacity: 0.5
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
        </div>
    );
}
