'use client';

import { useState, useEffect } from 'react';
import { getDeviceToken } from '@/lib/device';

interface VoteModuleProps {
    eventId: string;
    module: string;
    label: string;
    options: { value: string; label: string; emoji?: string }[];
    currentValue?: string;
    onVote?: (module: string, value: string) => void;
}

export default function VoteModule({
    eventId,
    module,
    label,
    options,
    currentValue,
    onVote,
}: VoteModuleProps) {
    const [selectedValue, setSelectedValue] = useState<string | null>(currentValue || null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        if (currentValue) {
            setSelectedValue(currentValue);
            setHasVoted(true);
        }
    }, [currentValue]);

    const handleVote = async (value: string) => {
        if (hasVoted || isSubmitting) return;

        setIsSubmitting(true);
        const deviceId = getDeviceToken();

        try {
            const response = await fetch(`/api/events/${eventId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId, module, value }),
            });

            if (response.ok) {
                setSelectedValue(value);
                setHasVoted(true);
                onVote?.(module, value);
            } else {
                const error = await response.json();
                console.error('Vote failed:', error);
            }
        } catch (error) {
            console.error('Vote error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="vote-module">
            <div className="vote-module__label">{label}</div>
            <div className="vote-options">
                {options.map((option) => (
                    <button
                        key={option.value}
                        className={`vote-option ${selectedValue === option.value ? 'vote-option--selected' : ''} ${hasVoted && selectedValue !== option.value ? 'vote-option--disabled' : ''}`}
                        onClick={() => handleVote(option.value)}
                        disabled={hasVoted || isSubmitting}
                    >
                        {option.emoji && <span>{option.emoji} </span>}
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

// Pre-configured vote modules for easy use
export const VOTE_MODULES = {
    legit: {
        module: 'legit',
        label: 'Is this event legit?',
        options: [
            { value: 'positive', label: 'Legit', emoji: '👍' },
            { value: 'negative', label: 'Not legit', emoji: '👎' },
        ],
    },
    packed: {
        module: 'packed',
        label: "How packed is it?",
        options: [
            { value: 'empty', label: 'Empty' },
            { value: 'moderate', label: 'Moderate' },
            { value: 'packed', label: 'Packed' },
            { value: 'insane', label: 'Insane' },
        ],
    },
    queue: {
        module: 'queue',
        label: 'Queue / Entry situation?',
        options: [
            { value: 'walkin', label: 'Walk-in' },
            { value: 'short', label: '10-20 min' },
            { value: 'long', label: '30-60 min' },
            { value: 'notGettingIn', label: 'Not getting in' },
        ],
    },
    lineup: {
        module: 'lineup',
        label: 'Is the lineup accurate?',
        options: [
            { value: 'asPromised', label: 'As promised', emoji: '✅' },
            { value: 'changed', label: 'Changed', emoji: '⚠️' },
            { value: 'fake', label: 'Fake', emoji: '❌' },
        ],
    },
    price: {
        module: 'price',
        label: 'Price level?',
        options: [
            { value: 'low', label: '₹' },
            { value: 'medium', label: '₹₹' },
            { value: 'high', label: '₹₹₹' },
        ],
    },
    safety: {
        module: 'safety',
        label: 'Safety vibes?',
        options: [
            { value: 'safe', label: 'Safe', emoji: '✅' },
            { value: 'sketchy', label: 'Sketchy', emoji: '⚠️' },
            { value: 'cops', label: 'Cops seen', emoji: '🚔' },
        ],
    },
    sound: {
        module: 'sound',
        label: 'Sound quality?',
        options: [
            { value: 'good', label: 'Good', emoji: '🔊' },
            { value: 'meh', label: 'Meh', emoji: '😐' },
            { value: 'bad', label: 'Bad', emoji: '💀' },
        ],
    },
};
