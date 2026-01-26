// Warning Banner Rules for TCTP
// Rule-based crowd verification - no AI, just thresholds

export interface VoteAggregates {
    legit: { positive: number; negative: number; total: number };
    packed: { empty: number; moderate: number; packed: number; insane: number; total: number };
    queue: { walkin: number; short: number; long: number; notGettingIn: number; total: number };
    lineup: { asPromised: number; changed: number; fake: number; total: number };
    price: { low: number; medium: number; high: number; total: number };
    safety: { safe: number; sketchy: number; cops: number; total: number };
    sound: { good: number; meh: number; bad: number; total: number };
}

export interface WarningBanner {
    type: 'danger' | 'warning' | 'info';
    message: string;
    icon: string;
}

export interface CrowdSignal {
    type: 'positive' | 'negative' | 'warning' | 'neutral';
    label: string;
    value: string;
    icon: string;
}

const MINIMUM_VOTES = {
    legit: 25,
    lineup: 15,
    queue: 20,
    safety: 15,
    general: 10,
};

/**
 * Calculate warning banners based on vote aggregates.
 * Returns array of banners to display (can be multiple).
 */
export function getWarningBanners(votes: VoteAggregates): WarningBanner[] {
    const banners: WarningBanner[] = [];

    // Not Legit Warning
    if (votes.legit.total >= MINIMUM_VOTES.legit) {
        const negativeRatio = votes.legit.negative / votes.legit.total;
        if (negativeRatio >= 0.6) {
            banners.push({
                type: 'danger',
                message: "Many reports say this event isn't legit",
                icon: '⚠️',
            });
        }
    }

    // Fake Lineup Warning
    if (votes.lineup.total >= MINIMUM_VOTES.lineup) {
        const fakeRatio = votes.lineup.fake / votes.lineup.total;
        if (fakeRatio >= 0.3) {
            banners.push({
                type: 'warning',
                message: 'Lineup mismatch reported',
                icon: '⚠️',
            });
        }
    }

    // Entry Difficult Warning
    if (votes.queue.total >= MINIMUM_VOTES.queue) {
        const notGettingInRatio = votes.queue.notGettingIn / votes.queue.total;
        if (notGettingInRatio >= 0.4) {
            banners.push({
                type: 'danger',
                message: 'Entry difficult right now',
                icon: '⛔',
            });
        }
    }

    // Safety Concerns Warning
    if (votes.safety.total >= MINIMUM_VOTES.safety) {
        const sketchyRatio = (votes.safety.sketchy + votes.safety.cops) / votes.safety.total;
        if (sketchyRatio >= 0.4) {
            banners.push({
                type: 'warning',
                message: 'Safety concerns reported',
                icon: '⚠️',
            });
        }
    }

    return banners;
}

/**
 * Calculate crowd signals for display on event cards.
 */
export function getCrowdSignals(votes: VoteAggregates, presenceCount: number): CrowdSignal[] {
    const signals: CrowdSignal[] = [];

    // Legit Score
    if (votes.legit.total >= MINIMUM_VOTES.general) {
        const legitPercent = Math.round((votes.legit.positive / votes.legit.total) * 100);
        signals.push({
            type: legitPercent >= 70 ? 'positive' : legitPercent <= 40 ? 'negative' : 'neutral',
            label: 'Legit',
            value: `${legitPercent}%`,
            icon: legitPercent >= 70 ? '🔥' : legitPercent <= 40 ? '👎' : '🤷',
        });
    }

    // Presence Count
    if (presenceCount > 0) {
        signals.push({
            type: 'neutral',
            label: 'here',
            value: `${presenceCount}`,
            icon: '👥',
        });
    }

    // Queue Status
    if (votes.queue.total >= MINIMUM_VOTES.general) {
        const queueMode = getQueueMode(votes.queue);
        signals.push({
            type: queueMode.type,
            label: 'Queue',
            value: queueMode.label,
            icon: '⏳',
        });
    }

    // Packed Status
    if (votes.packed.total >= MINIMUM_VOTES.general) {
        const packedMode = getPackedMode(votes.packed);
        signals.push({
            type: 'neutral',
            label: 'Crowd',
            value: packedMode,
            icon: '👤',
        });
    }

    return signals;
}

function getQueueMode(queue: VoteAggregates['queue']): { label: string; type: CrowdSignal['type'] } {
    const counts = [
        { key: 'walkin', count: queue.walkin, label: 'Walk-in', type: 'positive' as const },
        { key: 'short', count: queue.short, label: '10-20 min', type: 'neutral' as const },
        { key: 'long', count: queue.long, label: '30-60 min', type: 'warning' as const },
        { key: 'notGettingIn', count: queue.notGettingIn, label: 'Not getting in', type: 'negative' as const },
    ];

    const max = counts.reduce((prev, curr) => (curr.count > prev.count ? curr : prev));
    return { label: max.label, type: max.type };
}

function getPackedMode(packed: VoteAggregates['packed']): string {
    const counts = [
        { key: 'empty', count: packed.empty, label: 'Empty' },
        { key: 'moderate', count: packed.moderate, label: 'Moderate' },
        { key: 'packed', count: packed.packed, label: 'Packed' },
        { key: 'insane', count: packed.insane, label: 'Insane' },
    ];

    const max = counts.reduce((prev, curr) => (curr.count > prev.count ? curr : prev));
    return max.label;
}

/**
 * Initialize empty vote aggregates.
 */
export function emptyVoteAggregates(): VoteAggregates {
    return {
        legit: { positive: 0, negative: 0, total: 0 },
        packed: { empty: 0, moderate: 0, packed: 0, insane: 0, total: 0 },
        queue: { walkin: 0, short: 0, long: 0, notGettingIn: 0, total: 0 },
        lineup: { asPromised: 0, changed: 0, fake: 0, total: 0 },
        price: { low: 0, medium: 0, high: 0, total: 0 },
        safety: { safe: 0, sketchy: 0, cops: 0, total: 0 },
        sound: { good: 0, meh: 0, bad: 0, total: 0 },
    };
}
