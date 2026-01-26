'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { searchGlobal, SearchResult } from '@/lib/search';

export default function Search() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    // Focus input when modal opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Handle outside click to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true);
                const data = await searchGlobal(query);
                setResults(data as SearchResult[]);
                setLoading(false);
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (result: SearchResult) => {
        setIsOpen(false);
        setQuery('');
        if (result.type === 'venue') {
            router.push(`/${result.citySlug}/venue/${result.id}`);
        } else {
            router.push(`/dj/${result.id}`);
        }
    };

    return (
        <div style={{ marginLeft: 'var(--space-2)' }}>
            <button
                onClick={() => setIsOpen(true)}
                className="btn btn--icon"
                style={{
                    background: 'transparent',
                    border: '1px solid var(--color-border)',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    color: 'var(--color-text-primary)'
                }}
                aria-label="Search"
            >
                🔍
            </button>

            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(5px)',
                    zIndex: 200,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    paddingTop: '15vh'
                }}>
                    <div
                        ref={modalRef}
                        style={{
                            width: '90%',
                            maxWidth: '500px',
                            background: 'var(--color-bg-card)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-lg)',
                            padding: 'var(--space-4)',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                        }}
                    >
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Find a venue or DJ..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: '1px solid var(--color-border)',
                                fontSize: '1.2rem',
                                color: 'white',
                                padding: 'var(--space-2) 0',
                                outline: 'none',
                                marginBottom: 'var(--space-4)'
                            }}
                        />

                        {loading && <div style={{ opacity: 0.5, padding: 'var(--space-2)' }}>Searching...</div>}

                        {!loading && results.length === 0 && query.length >= 2 && (
                            <div style={{ opacity: 0.5, padding: 'var(--space-2)' }}>No results found.</div>
                        )}

                        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                            {results.map((result) => (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={() => handleSelect(result)}
                                    style={{
                                        display: 'flex',
                                        width: '100%',
                                        alignItems: 'center',
                                        padding: 'var(--space-3)',
                                        background: 'transparent',
                                        border: 'none',
                                        borderBottom: '1px solid var(--color-border)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    <span style={{ marginRight: 'var(--space-3)', fontSize: '1.2rem' }}>
                                        {result.type === 'venue' ? '📍' : '🎧'}
                                    </span>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{result.name}</div>
                                        <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>{result.city}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
