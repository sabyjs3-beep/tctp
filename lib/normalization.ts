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

/**
 * Creates a URL-friendly slug.
 * Example: "Techno Party", "Goa" -> "techno-party-goa"
 */
export function generateSlug(title: string, suffix: string = ''): string {
    const base = normalizeString(title).replace(/\s+/g, '-');
    const end = normalizeString(suffix).replace(/\s+/g, '-');
    const random = Math.floor(Math.random() * 1000).toString(); // prevent collisions

    // e.g., "techno-party-goa-jan-27" (we will append date in usage)
    return `${base}-${end}-${random}`.toLowerCase();
}

/**
 * Calculates the Levenshtein distance between two strings.
 * (Number of single-character edits required to change one word into the other)
 */
export function levenshteinDistance(a: string, b: string): number {
    const matrix = [];

    // Increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // Increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) == a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1  // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Calculates similarity percentage between two strings (0 to 1).
 * 1.0 = Exact match
 * 0.0 = No similarity
 */
export function calculateSimilarity(s1: string, s2: string): number {
    const a = normalizeString(s1);
    const b = normalizeString(s2);

    if (a === b) return 1.0;
    if (a.length === 0 || b.length === 0) return 0.0;

    const distance = levenshteinDistance(a, b);
    const maxLength = Math.max(a.length, b.length);

    return 1.0 - (distance / maxLength);
}
