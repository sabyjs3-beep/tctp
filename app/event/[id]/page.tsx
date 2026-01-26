import prisma from '@/lib/db';
import { notFound } from 'next/navigation';
import EventDetailClient from './EventDetailClient';

interface EventPageProps {
    params: Promise<{ id: string }>;
}

async function getEvent(id: string) {
    const event = await prisma.event.findUnique({
        where: { id },
        include: {
            venue: true,
            djs: {
                include: { dj: true },
                orderBy: { order: 'asc' },
            },
            votes: true,
            posts: {
                where: { hidden: false },
                orderBy: { createdAt: 'desc' },
                take: 50,
                include: {
                    votes: true,
                },
            },
        },
    });

    return event;
}

export default async function EventPage({ params }: EventPageProps) {
    const { id } = await params;
    const event = await getEvent(id);

    if (!event) {
        notFound();
    }

    // Transform dates to ISO strings for client component
    const serializedEvent = {
        ...event,
        startTime: event.startTime.toISOString(),
        endTime: event.endTime?.toISOString() || null,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
        venue: {
            ...event.venue,
            createdAt: event.venue.createdAt.toISOString(),
            updatedAt: event.venue.updatedAt.toISOString(),
        },
        djs: event.djs.map(ed => ({
            id: ed.dj.id,
            name: ed.dj.name,
            genres: ed.dj.genres,
            vibeTags: ed.dj.vibeTags,
            soundcloud: ed.dj.soundcloud,
            instagram: ed.dj.instagram,
        })),
        votes: event.votes.map(v => ({
            module: v.module,
            value: v.value,
            deviceId: v.deviceId,
        })),
        posts: event.posts.map(p => ({
            id: p.id,
            content: p.content,
            quickTag: p.quickTag,
            score: p.score,
            createdAt: p.createdAt.toISOString(),
            deviceId: p.deviceId,
            votes: p.votes.map(pv => ({
                deviceId: pv.deviceId,
                value: pv.value,
            })),
        })),
    };

    return <EventDetailClient event={serializedEvent} />;
}
