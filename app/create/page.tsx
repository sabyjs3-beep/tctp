'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TicketLink {
    source: string;
    url: string;
}

interface FormData {
    instagramUrl: string;
    title: string;
    description: string;
    venueName: string;
    venueAddress: string;
    mapUrl: string;
    date: string;
    startTime: string;
    endTime: string;
    djNames: string;
    vibeTags: string;
    ctaType: 'pay_at_venue' | 'external_ticket';
    ticketUrl: string;
    priceRange: string;
    additionalTickets: TicketLink[];
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
        mapUrl: '',
        date: '',
        startTime: '22:00',
        endTime: '04:00',
        djNames: '',
        vibeTags: '',
        ctaType: 'pay_at_venue',
        ticketUrl: '',
        priceRange: '',
        additionalTickets: []
    });

    const handleInstagramPaste = () => {
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

    const addTicketLink = () => {
        setFormData(prev => ({
            ...prev,
            additionalTickets: [...prev.additionalTickets, { source: '', url: '' }]
        }));
    };

    const updateTicketLink = (index: number, field: keyof TicketLink, value: string) => {
        const newTickets = [...formData.additionalTickets];
        newTickets[index][field] = value;
        setFormData(prev => ({ ...prev, additionalTickets: newTickets }));
    };

    const removeTicketLink = (index: number) => {
        const newTickets = [...formData.additionalTickets];
        newTickets.splice(index, 1);
        setFormData(prev => ({ ...prev, additionalTickets: newTickets }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            // Construct ticketLinks array combining main ticketUrl and additional ones
            const ticketLinks = [];
            if (formData.ticketUrl) {
                ticketLinks.push({ source: 'Primary', url: formData.ticketUrl });
            }
            formData.additionalTickets.forEach(t => {
                if (t.source && t.url) ticketLinks.push(t);
            });

            const response = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    djs: formData.djNames.split(',').map((n) => n.trim()).filter(Boolean),
                    vibeTags: formData.vibeTags.split(',').map((t) => t.trim()).filter(Boolean),
                    ticketLinks: ticketLinks.length > 0 ? ticketLinks : undefined,
                    ctaType: ticketLinks.length > 0 ? 'external_ticket' : 'pay_at_venue'
                }),
            });

            if (response.ok) {
                const data = await response.json();
                router.push(`/event/${data.event.id}`); // This will redirect to /[city]/event/[id]
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

                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
                                Price Range (optional)
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., ₹500 - ₹1000"
                                value={formData.priceRange}
                                onChange={(e) => updateField('priceRange', e.target.value)}
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

                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
                                Google Maps Link (optional)
                            </label>
                            <input
                                type="url"
                                placeholder="e.g., https://goo.gl/maps/..."
                                value={formData.mapUrl}
                                onChange={(e) => updateField('mapUrl', e.target.value)}
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
                        </div>
                    </div>

                    {/* Tickets */}
                    <div style={{ marginBottom: 'var(--space-6)' }}>
                        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
                            Tickets
                        </h2>

                        <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
                            {/* Only show these if no tickets added yet, or logic specific */}
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                Add ticket links below if this is a paid event.
                            </p>
                        </div>

                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
                                Primary Ticket URL
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

                        {formData.additionalTickets.map((ticket, index) => (
                            <div key={index} style={{ marginBottom: 'var(--space-4)', display: 'flex', gap: 'var(--space-2)' }}>
                                <input
                                    type="text"
                                    placeholder="Source (e.g. RA)"
                                    value={ticket.source}
                                    onChange={(e) => updateTicketLink(index, 'source', e.target.value)}
                                    style={{
                                        width: '30%',
                                        padding: 'var(--space-3)',
                                        background: 'var(--color-bg-card)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--color-text-primary)',
                                    }}
                                />
                                <input
                                    type="url"
                                    placeholder="URL"
                                    value={ticket.url}
                                    onChange={(e) => updateTicketLink(index, 'url', e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: 'var(--space-3)',
                                        background: 'var(--color-bg-card)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)',
                                        color: 'var(--color-text-primary)',
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeTicketLink(index)}
                                    style={{ padding: '0 10px', background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
                                >
                                    ✕
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addTicketLink}
                            className="btn btn--secondary"
                            style={{ fontSize: '0.9rem', padding: '6px 12px' }}
                        >
                            + Add another link
                        </button>

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
