// Anonymous Device Identity for TCTP
// No logins - just device-based anonymous tokens

const DEVICE_TOKEN_KEY = 'tctp_device';

/**
 * Get or create an anonymous device token.
 * Stored in localStorage for persistence.
 */
export function getDeviceToken(): string {
    if (typeof window === 'undefined') {
        // Server-side: return empty string (will be set client-side)
        return '';
    }

    let token = localStorage.getItem(DEVICE_TOKEN_KEY);

    if (!token) {
        token = crypto.randomUUID();
        localStorage.setItem(DEVICE_TOKEN_KEY, token);
    }

    return token;
}

/**
 * Check if this is a new device (useful for welcome messages).
 */
export function isNewDevice(): boolean {
    if (typeof window === 'undefined') return true;
    return !localStorage.getItem(DEVICE_TOKEN_KEY);
}

/**
 * Clear device token (for testing/debugging only).
 */
export function clearDeviceToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(DEVICE_TOKEN_KEY);
}
