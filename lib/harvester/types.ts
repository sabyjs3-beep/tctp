export interface HarvesterEvent {
    title: string;
    description?: string;
    startTime: Date;
    endTime?: Date;
    venueName: string;
    venueAddress?: string;
    sourceUrl?: string;
    sourceType: string; // e.g., 'goabase', 'resident_advisor'
    vibeTags?: string[];
}

export interface HarvesterAdapter {
    name: string;
    fetchEvents(): Promise<HarvesterEvent[]>;
}
