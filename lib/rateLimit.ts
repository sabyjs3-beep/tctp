// Rate limiting for fresh device tokens
// Prevents abuse from users clearing storage repeatedly

interface RateLimitEntry {
    count: number;
    firstSeen: number;
    lastAction: number;
}

const deviceRateLimits = new Map<string, RateLimitEntry>();

// Clean up old entries every hour
setInterval(() => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [deviceId, entry] of deviceRateLimits.entries()) {
        if (entry.lastAction < oneHourAgo) {
            deviceRateLimits.delete(deviceId);
        }
    }
}, 60 * 60 * 1000);

export function checkRateLimit(deviceId: string, action: 'vote' | 'post' | 'presence'): {
    allowed: boolean;
    delaySeconds?: number;
} {
    const now = Date.now();
    const entry = deviceRateLimits.get(deviceId);

    if (!entry) {
        // First time seeing this device
        deviceRateLimits.set(deviceId, {
            count: 1,
            firstSeen: now,
            lastAction: now,
        });
        return { allowed: true };
    }

    const timeSinceFirstSeen = now - entry.firstSeen;
    const timeSinceLastAction = now - entry.lastAction;

    // Soft friction for fresh tokens acting too fast
    if (timeSinceFirstSeen < 5 * 60 * 1000) { // Less than 5 minutes old
        if (action === 'vote' && entry.count > 10) {
            return { allowed: false, delaySeconds: 60 };
        }
        if (action === 'post' && entry.count > 3) {
            return { allowed: false, delaySeconds: 120 };
        }
    }

    // General rate limiting
    if (action === 'post' && timeSinceLastAction < 3 * 60 * 1000) {
        // 3 minutes between posts
        const remainingSeconds = Math.ceil((3 * 60 * 1000 - timeSinceLastAction) / 1000);
        return { allowed: false, delaySeconds: remainingSeconds };
    }

    // Update entry
    entry.count++;
    entry.lastAction = now;
    deviceRateLimits.set(deviceId, entry);

    return { allowed: true };
}

export function resetRateLimit(deviceId: string) {
    deviceRateLimits.delete(deviceId);
}
