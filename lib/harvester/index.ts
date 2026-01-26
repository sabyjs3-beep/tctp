import { GoabaseAdapter } from './adapters/goabase';
import { RAAdapter } from './adapters/resident-advisor';
import { prisma } from '../db';
import { HarvesterEvent } from './types';

export class HarvesterEngine {
    private adapters = [
        new GoabaseAdapter(),
        new RAAdapter(),
    ];

    async run() {
        console.log('🚀 Starting Event Harvester...');
        let totalImported = 0;

        for (const adapter of this.adapters) {
            try {
                console.log(`📡 Fetching events from ${adapter.name}...`);
                const events = await adapter.fetchEvents();
                console.log(`✅ Found ${events.length} events from ${adapter.name}`);

                for (const eventData of events) {
                    const imported = await this.upsertEvent(eventData);
                    if (imported) totalImported++;
                }
            } catch (error) {
                console.error(`❌ Error in ${adapter.name} harvester:`, error);
            }
        }

        console.log(`🏁 Harvester finished! Imported ${totalImported} new events.`);
        return totalImported;
    }

    private async upsertEvent(data: HarvesterEvent): Promise<boolean> {
        try {
            // Find or create venue
            let venue = await prisma.venue.findFirst({
                where: { name: data.venueName },
            });

            if (!venue) {
                venue = await prisma.venue.create({
                    data: {
                        name: data.venueName,
                        address: data.venueAddress || null,
                        city: 'Goa',
                    },
                });
            }

            // Check for duplicate event (same title, venue, and date)
            const dateOnly = new Date(data.startTime.getFullYear(), data.startTime.getMonth(), data.startTime.getDate());
            const nextDay = new Date(dateOnly);
            nextDay.setDate(nextDay.getDate() + 1);

            const existing = await prisma.event.findFirst({
                where: {
                    title: data.title,
                    venueId: venue.id,
                    startTime: {
                        gte: dateOnly,
                        lt: nextDay,
                    },
                },
            });

            if (existing) {
                return false;
            }

            // Create event
            const event = await prisma.event.create({
                data: {
                    title: data.title,
                    description: data.description || null,
                    startTime: data.startTime,
                    endTime: data.endTime || null,
                    venueId: venue.id,
                    sourceUrl: data.sourceUrl || null,
                    sourceType: 'automated',
                    ctaType: data.sourceUrl ? 'external_ticket' : 'pay_at_venue',
                    ticketUrl: data.sourceUrl || null,
                    vibeTags: data.vibeTags?.join(',') || null,
                    status: data.startTime <= new Date() ? 'live' : 'created',
                },
            });

            return true;
        } catch (error) {
            console.error('❌ Error upserting event:', error);
            return false;
        }
    }
}
