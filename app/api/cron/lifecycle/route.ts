import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// GET /api/cron/lifecycle - Event lifecycle state transitions
// This should be called by a cron job every 5-10 minutes
export async function GET(request: NextRequest) {
    try {
        // Verify this is a cron request (in production, check authorization header)
        const authHeader = request.headers.get('authorization');
        if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();
        const results = {
            transitionedToLive: 0,
            transitionedToCooling: 0,
            transitionedToArchived: 0,
            deleted: 0,
        };

        // 1. Transition CREATED → LIVE (events that have started)
        const eventsToStart = await prisma.event.updateMany({
            where: {
                status: 'created',
                startTime: { lte: now },
            },
            data: { status: 'live' },
        });
        results.transitionedToLive = eventsToStart.count;

        // 2. Transition LIVE → COOLING (events that have ended)
        const eventsToEnd = await prisma.event.updateMany({
            where: {
                status: 'live',
                endTime: { lte: now },
            },
            data: { status: 'cooling' },
        });
        results.transitionedToCooling = eventsToEnd.count;

        // Also transition events without endTime after 12 hours from start
        const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
        const eventsToEndNoEndTime = await prisma.event.updateMany({
            where: {
                status: 'live',
                endTime: null,
                startTime: { lte: twelveHoursAgo },
            },
            data: { status: 'cooling' },
        });
        results.transitionedToCooling += eventsToEndNoEndTime.count;

        // 3. Transition COOLING → ARCHIVED (6 hours after end)
        const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

        // For events with endTime
        const eventsToArchive = await prisma.event.updateMany({
            where: {
                status: 'cooling',
                endTime: { lte: sixHoursAgo },
            },
            data: { status: 'archived' },
        });
        results.transitionedToArchived = eventsToArchive.count;

        // For events without endTime (use updatedAt as proxy for when they transitioned to cooling)
        const eventsToArchiveNoEndTime = await prisma.event.updateMany({
            where: {
                status: 'cooling',
                endTime: null,
                updatedAt: { lte: sixHoursAgo },
            },
            data: { status: 'archived' },
        });
        results.transitionedToArchived += eventsToArchiveNoEndTime.count;

        // 4. Delete ARCHIVED events (48 hours after archiving)
        const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

        // Find events to delete
        const eventsToDelete = await prisma.event.findMany({
            where: {
                status: 'archived',
                updatedAt: { lte: fortyEightHoursAgo },
            },
            select: { id: true },
        });

        // Delete related data first (cascade should handle this, but being explicit)
        for (const event of eventsToDelete) {
            await prisma.postVote.deleteMany({
                where: { post: { eventId: event.id } },
            });
            await prisma.post.deleteMany({
                where: { eventId: event.id },
            });
            await prisma.vote.deleteMany({
                where: { eventId: event.id },
            });
            await prisma.presence.deleteMany({
                where: { eventId: event.id },
            });
            await prisma.eventDJ.deleteMany({
                where: { eventId: event.id },
            });
        }

        // Delete the events
        const deletedEvents = await prisma.event.deleteMany({
            where: {
                status: 'archived',
                updatedAt: { lte: fortyEightHoursAgo },
            },
        });
        results.deleted = deletedEvents.count;

        return NextResponse.json({
            success: true,
            timestamp: now.toISOString(),
            results,
        });
    } catch (error) {
        console.error('Lifecycle cron error:', error);
        return NextResponse.json(
            { error: 'Lifecycle job failed', details: String(error) },
            { status: 500 }
        );
    }
}
