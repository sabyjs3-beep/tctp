import prisma from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  // Fetch top cities for the landing page
  const cities = await (prisma as any).city.findMany({
    where: { active: true },
    take: 6,
  });

  const stats = {
    cities: cities.length,
    events: await prisma.event.count({ where: { status: 'live' } }),
    djs: await (prisma as any).dJ.count(),
  };

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero" style={{
        position: 'relative',
        height: '50vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: 'var(--space-8)',
        overflow: 'hidden',
        borderRadius: 'var(--radius-xl)',
        marginBottom: 'var(--space-12)',
        background: 'linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-primary) 100%)',
        border: '1px solid var(--color-border)',
      }}>
        <h1 style={{
          fontSize: 'var(--text-4xl)',
          fontWeight: '800',
          marginBottom: 'var(--space-4)',
          background: 'linear-gradient(135deg, white 0%, var(--color-text-secondary) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          The Event Truth Engine
        </h1>
        <p style={{
          fontSize: 'var(--text-lg)',
          color: 'var(--color-text-secondary)',
          maxWidth: '400px',
          margin: '0 auto var(--space-8)',
          lineHeight: '1.5',
        }}>
          Ephemeral, anonymous, crowd-verified party discovery across India.
        </p>

        <div style={{
          display: 'flex',
          gap: 'var(--space-8)',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: '700', color: 'var(--color-accent-primary)' }}>{stats.cities}</div>
            <div style={{ fontSize: 'var(--text-xs)', opacity: 0.6, letterSpacing: '0.05em' }}>CITIES</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: '700', color: 'var(--color-accent-secondary)' }}>{stats.events}</div>
            <div style={{ fontSize: 'var(--text-xs)', opacity: 0.6, letterSpacing: '0.05em' }}>LIVE EVENTS</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: '700', color: 'var(--color-info)' }}>{stats.djs}</div>
            <div style={{ fontSize: 'var(--text-xs)', opacity: 0.6, letterSpacing: '0.05em' }}>ARTISTS</div>
          </div>
        </div>
      </section>

      {/* City Selection */}
      <section>
        <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-6)', textAlign: 'center', fontWeight: '600' }}>
          Select Your City
        </h2>
        <div className="city-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--space-4)',
        }}>
          {cities.map((city: any) => (
            <Link
              key={city.id}
              href={`/${city.slug}`}
              className="city-card"
              style={{
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-6)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all var(--transition-base)',
                cursor: 'pointer',
              }}
            >
              <div>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: '600' }}>{city.name}</h3>
                <p style={{ fontSize: 'var(--text-xs)', opacity: 0.5 }}>View tonight&apos;s feed</p>
              </div>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'var(--color-bg-elevated)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.2rem'
              }}>
                ➜
              </div>
            </Link>
          ))}
        </div>
      </section>

      <style dangerouslySetInnerHTML={{
        __html: `
                .city-card:hover {
                    border-color: var(--color-accent-primary);
                    background: var(--color-bg-hover);
                    transform: translateY(-4px);
                    box-shadow: 0 10px 30px -10px var(--color-accent-glow);
                }
                .city-card:hover div:last-child {
                    background: var(--color-accent-primary);
                    color: white;
                }
            `}} />
    </div>
  );
}
