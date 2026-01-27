import { MetadataRoute } from 'next';
import prisma from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://toocooltoparty.com';

    // 1. Static Routes
    const staticRoutes = [
        '',
        '/about',
        '/create',
        '/djs',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 1,
    }));

    // 2. Cities
    const cities = await (prisma as any).city.findMany({ where: { active: true } });
    const cityRoutes = cities.map((city: any) => ({
        url: `${baseUrl}/${city.slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.9,
    }));

    // 3. Venues
    const venues = await (prisma as any).venue.findMany({
        select: {
            id: true,
            updatedAt: true,
            city: { select: { slug: true } }
        }
    });
    const venueRoutes = venues.map((venue: any) => ({
        url: `${baseUrl}/${venue.city.slug}/venue/${venue.id}`,
        lastModified: venue.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // 4. DJs
    const djs = await (prisma as any).dJ.findMany({
        select: {
            id: true,
            updatedAt: true
        }
    });
    const djRoutes = djs.map((dj: any) => ({
        url: `${baseUrl}/dj/${dj.id}`,
        lastModified: dj.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // 5. Events (Upcoming only)
    const events = await (prisma as any).event.findMany({
        where: {
            startTime: { gte: new Date() }, // Only future events
            status: 'live'
        },
        select: {
            id: true,
            startTime: true,
            venue: { select: { city: { select: { slug: true } } } }
        }
    });

    const eventRoutes = events.map((event: any) => ({
        url: `${baseUrl}/${event.venue.city.slug}/event/${event.id}`,
        lastModified: event.startTime, // Use event start time as proxy for freshness
        changeFrequency: 'daily' as const,
        priority: 1.0,
    }));

    return [...staticRoutes, ...cityRoutes, ...venueRoutes, ...djRoutes, ...eventRoutes];
}
