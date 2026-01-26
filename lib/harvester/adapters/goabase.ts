import { HarvesterAdapter, HarvesterEvent } from '../types';

export class GoabaseAdapter implements HarvesterAdapter {
    name = 'Goabase (Psytrance)';

    async fetchEvents(): Promise<HarvesterEvent[]> {
        try {
            const url = 'https://www.goabase.net/party/?country=India&region=Goa';
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'TCTP-Harvester/1.0 (Contact: sabyj@tctp.com)',
                },
            });
            const html = await response.text();

            const events: HarvesterEvent[] = [];

            // Goabase uses structured blocks. We'll parse them roughly but effectively.
            // Pattern: <a href="/party/partyname/id" class="p-name">Party Name</a>
            // Pattern: <span class="p-venue">Venue Name</span>
            // Pattern: <span class="p-date">Date</span>

            const partyRegex = /<div class="mdl-card party-card[^>]*>([\s\S]*?)<\/div>/g;
            let match;

            while ((match = partyRegex.exec(html)) !== null) {
                const block = match[1];

                const titleMatch = block.match(/class="p-name"[^>]*>([^<]+)<\/a>/);
                const venueMatch = block.match(/class="p-venue"[^>]*>([^<]+)<\/span>/);
                const dateMatch = block.match(/class="p-date"[^>]*>([^<]+)<\/span>/);
                const urlMatch = block.match(/href="([^"]+)" class="p-name"/);

                if (titleMatch && venueMatch && dateMatch) {
                    const title = titleMatch[1].trim();
                    const venueName = venueMatch[1].trim();
                    const dateStr = dateMatch[1].trim();
                    const relativeUrl = urlMatch ? urlMatch[1] : '';

                    // Simple date parsing for Goabase format (e.g., "Sa, 26.01.2025")
                    const dateParts = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
                    if (dateParts) {
                        const startTime = new Date(`${dateParts[3]}-${dateParts[2]}-${dateParts[1]}T20:00:00Z`);

                        events.push({
                            title,
                            venueName,
                            startTime,
                            sourceType: 'goabase',
                            sourceUrl: `https://www.goabase.net${relativeUrl}`,
                            vibeTags: ['psytrance', 'underground'],
                        });
                    }
                }
            }

            return events;
        } catch (error) {
            console.error('Goabase fetch failed:', error);
            return [];
        }
    }
}
