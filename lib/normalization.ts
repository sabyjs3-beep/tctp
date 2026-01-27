import crypto from 'crypto';

/**
 * Normalizes a string by lowercasing, trimming, and removing special characters.
 * Example: "  Party!!! @ Hilltop " -> "party hilltop"
 */
export function normalizeString(str: string): string {
    if (!str) return '';
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s]/g, '') // Remove non-word chars (except spaces)
        .replace(/\s+/g, ' ');   // Collapse multiple spaces
}

/**
 * Generates a deterministic SHA256 fingerprint for an event.
 * Fingerprint = SHA256(normalized_title + normalized_venue + date)
 */
export function generateFingerprint(title: string, venueName: string, date: string): string {
    const normTitle = normalizeString(title);
    const normVenue = normalizeString(venueName);
    const normDate = date.split('T')[0]; // Ensure YYYY-MM-DD

    const raw = `${normTitle}|${normVenue}|${normDate}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
}
