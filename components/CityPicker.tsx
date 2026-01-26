'use client';

import { useRouter } from 'next/navigation';

export default function CityPicker({ currentCity }: { currentCity: string }) {
    const router = useRouter();

    return (
        <div className="header__city" style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: 'var(--space-2)' }}>📍</span>
            <select
                className="city-select"
                defaultValue={currentCity}
                onChange={(e) => router.push(`/${e.target.value}`)}
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    outline: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px'
                }}
            >
                <option value="goa" style={{ background: '#0a0a0a' }}>Goa</option>
                <option value="mumbai" style={{ background: '#0a0a0a' }}>Mumbai</option>
                <option value="bangalore" style={{ background: '#0a0a0a' }}>Bangalore</option>
            </select>
        </div>
    );
}
