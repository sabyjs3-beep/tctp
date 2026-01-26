'use server';

import prisma from '@/lib/db';

export type SearchResult = {
    type: 'venue' | 'dj';
    id: string;
    name: string;
    citySlug: string;
    city: string;
};

export async function searchGlobal(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    const searchQuery = query.trim();

    try {
        // Parallel search for Venues and DJs
        const [venues, djs] = await Promise.all([
            (prisma as any).venue.findMany({
                where: {
                    name: { contains: searchQuery, mode: 'insensitive' }
                },
                include: { city: true },
                take: 5
            }),
            (prisma as any).dJ.findMany({
                where: {
                    name: { contains: searchQuery, mode: 'insensitive' }
                },
                include: { city: true },
                take: 5
            })
        ]);

        const venueResults = venues.map((v: any) => ({
            type: 'venue',
            id: v.id,
            name: v.name,
            citySlug: v.city.slug,
            city: v.city.name
        }));

        const djResults = djs.map((d: any) => ({
            type: 'dj',
            id: d.id,
            name: d.name,
            citySlug: d.city?.slug || 'goa', // Fallback
            city: d.city?.name || 'Unknown'
        }));

        return [...venueResults, ...djResults];
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}
