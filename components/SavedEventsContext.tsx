'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getDeviceToken } from '@/lib/device';

interface SavedEventsContextType {
    savedIds: Set<string>;
    toggleSave: (eventId: string) => Promise<void>;
    isSaved: (eventId: string) => boolean;
    isLoading: boolean;
}

const SavedEventsContext = createContext<SavedEventsContextType | undefined>(undefined);

export function SavedEventsProvider({ children }: { children: ReactNode }) {
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    // Initial fetch
    useEffect(() => {
        const fetchSaved = async () => {
            const deviceId = getDeviceToken();
            if (!deviceId) return;

            try {
                const res = await fetch(`/api/user/saved?deviceId=${deviceId}`);
                if (res.ok) {
                    const data = await res.json();
                    setSavedIds(new Set(data.ids));
                }
            } catch (error) {
                console.error('Failed to fetch saved events', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSaved();
    }, []);

    const toggleSave = async (eventId: string) => {
        const deviceId = getDeviceToken();
        if (!deviceId) return; // Should likely initialize if logic allows

        // Optimistic UI update
        const isCurrentlySaved = savedIds.has(eventId);
        const newSet = new Set(savedIds);
        if (isCurrentlySaved) {
            newSet.delete(eventId);
        } else {
            newSet.add(eventId);
        }
        setSavedIds(newSet);

        try {
            const res = await fetch('/api/user/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId, deviceId }),
            });

            if (!res.ok) {
                // Revert on failure
                setSavedIds(prev => {
                    const revertSet = new Set(prev);
                    if (isCurrentlySaved) revertSet.add(eventId);
                    else revertSet.delete(eventId);
                    return revertSet;
                });
            }
        } catch (error) {
            console.error('Save toggle failed', error);
        }
    };

    const isSaved = (eventId: string) => savedIds.has(eventId);

    return (
        <SavedEventsContext.Provider value={{ savedIds, toggleSave, isSaved, isLoading }}>
            {children}
        </SavedEventsContext.Provider>
    );
}

export function useSavedEvents() {
    const context = useContext(SavedEventsContext);
    if (context === undefined) {
        throw new Error('useSavedEvents must be used within a SavedEventsProvider');
    }
    return context;
}
