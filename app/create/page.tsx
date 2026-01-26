'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface FormData {
    instagramUrl: string;
    title: string;
    description: string;
    venueName: string;
    venueAddress: string;
    date: string;
    startTime: string;
    endTime: string;
    djNames: string;
    vibeTags: string;
    ctaType: 'pay_at_venue' | 'external_ticket';
    ticketUrl: string;
}

export default function CreateEventPage() {
    const router = useRouter();
    const [step, setStep] = useState<'paste' | 'form'>('paste');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState<FormData>({
        instagramUrl: '',
        title: '',
        description: '',
        venueName: '',
        venueAddress: '',
        date: '',
        startTime: '22:00',
        endTime: '04:00',
        djNames: '',
        vibeTags: '',
        ctaType: 'pay_at_venue',
        ticketUrl: '',
    });

    const handleInstagramPaste = () => {
        // For MVP, we just move to the form
        // In production, we'd fetch metadata from the IG post
        if (!formData.instagramUrl) {
            setError('Please paste an Instagram URL');
            return;
        }

        if (!formData.instagramUrl.includes('instagram.com')) {
            setError('Please paste a valid Instagram URL');
            return;
        }

        setError('');
        setStep('form');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            const response = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    djs: formData.djNames.split(',').map((n) => n.trim()).filter(Boolean),
                    vibeTags: formData.vibeTags.split(',').map((t) => t.trim()).filter(Boolean),
                }),
            });

            if (response.ok) {
                const data = await response.json();
                router.push(`/event/${data.event.id}`);
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to create event');
            }
        } catch (err) {
            setError('Failed to create event');
        } finally {
            setIsSubmitting(false);
        }
    };

    const updateField = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div>
            <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 'var(--space-6)' }}>
                Add an Event
            </h1>

            {step === 'paste' && (
                <div>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
                        Found an event on Instagram? Paste the post link below and we'll help you add it.
                    </p>

                    <div style={{ marginBottom: 'var(--space-4)' }}>
                        <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
                            Instagram Post URL
                        </label>
                        <input
                            type="url"
                            placeholder="https://www.instagram.com/p/..."
                            value={formData.instagramUrl}
                            onChange={(e) => updateField('instagramUrl', e.target.value)}
                            style={{
                                width: '100%',
                                padding: 'var(--space-3)',
                                background: 'var(--color-bg-card)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                                color: 'var(--color-text-primary)',
                                fontSize: 'var(--text-base)',
                            }}
                        />
                    </div>

                    {error && (
                        <div className="warning-banner warning-banner--danger" style={{ marginBottom: 'var(--space-4)' }}>
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <button className="btn btn--primary" onClick={handleInstagramPaste} style={{ cursor: 'pointer' }}>
                        Continue
                    </button>

                    <div style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
                        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                            Don't have an Instagram link?{' '}
                            <button
                                onClick={() => setStep('form')}
                                style={{ color: 'var(--color-text-link)', background: 'none', fontSize: 'inherit', cursor: 'pointer' }}
                                className="hover:opacity-80 transition-opacity"
                            >
                                Add event manually →
                            </button>
                        </p>
                    </div>
                </div>
            )}

            {step === 'form' && (
                <form onSubmit={handleSubmit}>
                    {formData.instagramUrl && (
                        <div className="warning-banner warning-banner--info" style={{ marginBottom: 'var(--space-4)' }}>
                            <span>🔗</span>
                            <span>Source: {formData.instagramUrl}</span>
                        </div>
                    )}

                    {/* Basic Info */}
                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                            Event Details
                        </h2>

                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
                                Event Name *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g., Dark Matter"
                                value={formData.title}
                                onChange={(e) => updateField('title', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: 'var(--space-3)',
                                    background: 'var(--color-bg-card)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--color-text-primary)',
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
                                Description
                            </label>
                            <textarea
                                placeholder="What's the vibe? (optional)"
                                value={formData.description}
                                onChange={(e) => updateField('description', e.target.value)}
                                rows={2}
                                style={{
                                    width: '100%',
                                    padding: 'var(--space-3)',
                                    background: 'var(--color-bg-card)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--color-text-primary)',
                                    resize: 'vertical',
                                }}
                            />
                        </div>
                    </div>

                    {/* Venue */}
                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                            Venue
                        </h2>

                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
                                Venue Name *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g., Club Cubana, Hilltop"
                                value={formData.venueName}
                                onChange={(e) => updateField('venueName', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: 'var(--space-3)',
                                    background: 'var(--color-bg-card)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--color-text-primary)',
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
                                Address (optional)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Arpora Hill, Goa"
                                value={formData.venueAddress}
                                onChange={(e) => updateField('venueAddress', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: 'var(--space-3)',
                                    background: 'var(--color-bg-card)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--color-text-primary)',
                                }}
                            />
                        </div>
                    </div>

                    {/* Date & Time */}
                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                            Date & Time
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-3)' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
                                    Date *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.date}
                                    onChange={(e) => updateField('date', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: 'var(--space-3)',
                                        background: 'var(--color-bg-card)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--color-text-primary)',
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
                                    Start Time *
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={formData.startTime}
                                    onChange={(e) => updateField('startTime', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: 'var(--space-3)',
                                        background: 'var(--color-bg-card)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--color-text-primary)',
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
                                    End Time
                                </label>
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => updateField('endTime', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: 'var(--space-3)',
                                        background: 'var(--color-bg-card)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--color-text-primary)',
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* DJs & Vibe */}
                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                            Lineup & Vibe
                        </h2>

                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
                                DJs (comma-separated)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Kohra, BLOT!, Arjun Vagale"
                                value={formData.djNames}
                                onChange={(e) => updateField('djNames', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: 'var(--space-3)',
                                    background: 'var(--color-bg-card)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--color-text-primary)',
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
                                Vibe Tags (comma-separated)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., dark, warehouse, underground, melodic"
                                value={formData.vibeTags}
                                onChange={(e) => updateField('vibeTags', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: 'var(--space-3)',
                                    background: 'var(--color-bg-card)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-md)',
                                    color: 'var(--color-text-primary)',
                                }}
                            />
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)' }}>
                                Suggestions: dark, warehouse, underground, melodic, high-energy, chill, sunset, sunrise
                            </p>
                        </div>
                    </div>

                    {/* Tickets */}
                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                            Tickets
                        </h2>

                        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                            <button
                                type="button"
                                onClick={() => updateField('ctaType', 'pay_at_venue')}
                                className={`btn ${formData.ctaType === 'pay_at_venue' ? 'btn--primary' : 'btn--secondary'}`}
                                style={{ flex: 1, cursor: 'pointer' }}
                            >
                                Pay at Venue
                            </button>
                            <button
                                type="button"
                                onClick={() => updateField('ctaType', 'external_ticket')}
                                className={`btn ${formData.ctaType === 'external_ticket' ? 'btn--primary' : 'btn--secondary'}`}
                                style={{ flex: 1, cursor: 'pointer' }}
                            >
                                External Tickets
                            </button>
                        </div>

                        {formData.ctaType === 'external_ticket' && (
                            <div>
                                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
                                    Ticket URL
                                </label>
                                <input
                                    type="url"
                                    placeholder="https://insider.in/..."
                                    value={formData.ticketUrl}
                                    onChange={(e) => updateField('ticketUrl', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: 'var(--space-3)',
                                        background: 'var(--color-bg-card)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--color-text-primary)',
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="warning-banner warning-banner--danger" style={{ marginBottom: 'var(--space-4)' }}>
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <button type="submit" className="btn btn--primary" disabled={isSubmitting} style={{ cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                        {isSubmitting ? 'Creating...' : 'Create Event'}
                    </button>

                    <p style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                        This event will be marked as <strong>Community-sourced</strong> until claimed by the promoter.
                    </p>
                </form>
            )}
        </div>
    );
}
