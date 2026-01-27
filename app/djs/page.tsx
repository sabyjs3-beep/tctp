import prisma from '@/lib/db';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Top DJs in India | TCTP',
    description: 'Discover the best underground DJs performing in Mumbai, Goa, Bangalore, and more.',
};

export default async function DJsPage() {
    const djs = await (prisma as any).dJ.findMany({
        orderBy: { name: 'asc' },
        include: {
            city: { select: { name: true, slug: true } },
            _count: { select: { events: true } }
        }
    });

    return (
        <main className="container" style={{ padding: 'var(--space-4) 0' }}>
            <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                marginBottom: 'var(--space-6)',
                letterSpacing: '-1px'
            }}>
                DJ Directory
            </h1>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: 'var(--space-4)'
            }}>
                {djs.map((dj: any) => (
                    <a
                        key={dj.id}
                        href={`/dj/${dj.id}`}
                        style={{
                            display: 'block',
                            background: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-4)',
                            textDecoration: 'none',
                            color: 'inherit',
                            transition: 'transform 0.2s'
                        }}
                    >
                        <div style={{ fontWeight: 600, fontSize: '1.2rem', marginBottom: 'var(--space-1)' }}>
                            {dj.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: 'var(--space-2)' }}>
                            {dj.city.name}
                        </div>
                        {dj.genres && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {dj.genres.split(',').slice(0, 2).map((g: string) => (
                                    <span key={g} style={{
                                        fontSize: '0.7rem',
                                        background: 'rgba(255,255,255,0.1)',
                                        padding: '2px 6px',
                                        borderRadius: '4px'
                                    }}>
                                        {g}
                                    </span>
                                ))}
                            </div>
                        )}
                        <div style={{ marginTop: 'var(--space-3)', fontSize: '0.8rem', color: 'var(--color-accent-primary)' }}>
                            {dj._count.events} gigs tracked
                        </div>
                    </a>
                ))}
            </div>
        </main>
    );
}
