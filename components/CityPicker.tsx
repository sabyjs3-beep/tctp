'use client';

import { useRouter } from 'next/navigation';

const CITIES = [
    { name: 'Goa', slug: 'goa', trending: true },
    { name: 'Mumbai', slug: 'mumbai', trending: true },
    { name: 'Bangalore', slug: 'bangalore', trending: true },
    { name: 'Delhi NCR', slug: 'delhi' },
    { name: 'Pune', slug: 'pune' },
    { name: 'Hyderabad', slug: 'hyderabad' },
];

export default function CityPicker({ currentCity }: { currentCity: string }) {
    const router = useRouter();

    return (
        <div className="header__city" style={{ display: 'flex', alignItems: 'center' }}>
            <div className="city-picker-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{
                    marginRight: 'var(--space-2)',
                    fontSize: '1rem',
                    filter: 'drop-shadow(0 0 5px var(--color-accent-glow))'
                }}>📍</span>
                <select
                    className="city-select"
                    defaultValue={currentCity}
                    onChange={(e) => router.push(`/${e.target.value}`)}
                    style={{
                        appearance: 'none',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        outline: 'none',
                        padding: '6px 32px 6px 12px',
                        borderRadius: 'var(--radius-md)',
                        transition: 'all var(--transition-fast)',
                    }}
                >
                    {CITIES.map((city) => (
                        <option key={city.slug} value={city.slug} style={{ background: '#0a0a0b', color: 'white' }}>
                            {city.name} {city.trending ? '🔥' : ''}
                        </option>
                    ))}
                </select>
                <div style={{
                    position: 'absolute',
                    right: '10px',
                    pointerEvents: 'none',
                    fontSize: '0.7rem',
                    color: 'var(--color-text-muted)'
                }}>▼</div>
            </div>
        </div>
    );
}
