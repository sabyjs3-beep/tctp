'use client';

import { SavedEventsProvider } from '@/components/SavedEventsContext';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SavedEventsProvider>
            {children}
        </SavedEventsProvider>
    );
}
