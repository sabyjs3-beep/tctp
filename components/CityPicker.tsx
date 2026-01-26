'use client';

import { useRouter, usePathname } from 'next/navigation';

interface CityPickerProps {
    cities: { name: string; slug: string }[];
}

export default function CityPicker({ cities }: CityPickerProps) {
    const router = useRouter();
    const pathname = usePathname();

    // Extract city from pathname (e.g. /mumbai -> mumbai)
    const segments = pathname.split('/').filter(Boolean);
    const currentCity = segments[0] || 'goa'; // Default to goa for root

    // Find the current city object to verify it exists
    const isValidCity = cities.some(c => c.slug === currentCity);
    const selectedValue = isValidCity ? currentCity : 'goa';

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
                    value={selectedValue}
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
                        minWidth: '120px'
                    }}
                >
                    {cities.map((city) => (
                        <option key={city.slug} value={city.slug} style={{ background: '#0a0a0b', color: 'white' }}>
                            {city.name}
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
