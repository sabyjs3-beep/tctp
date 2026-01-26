import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// POST /api/events/[id]/presence - Mark presence at event
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const body = await request.json();
        const { deviceId, status } = body;

        // Validate required fields
        if (!deviceId || !status) {
            return NextResponse.json(
                { error: 'Missing required fields: deviceId, status' },
                { status: 400 }
            );
        }

        // Validate status
        const validStatuses = ['here', 'going', 'skipped'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
                { status: 400 }
            );
        }

        // Check if event exists
        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        // Check if user already has a presence record
        const existingPresence = await prisma.presence.findUnique({
            where: {
                eventId_deviceId: { eventId, deviceId },
            },
        });

        const wasHere = existingPresence?.status === 'here';
        const willBeHere = status === 'here';

        // Upsert presence
        await prisma.presence.upsert({
            where: {
                eventId_deviceId: { eventId, deviceId },
            },
            update: { status, updatedAt: new Date() },
            create: { eventId, deviceId, status },
        });

        // Update presence count on event
        let countChange = 0;
        if (!wasHere && willBeHere) countChange = 1;
        else if (wasHere && !willBeHere) countChange = -1;

        if (countChange !== 0) {
            await prisma.event.update({
                where: { id: eventId },
                data: {
                    presenceCount: {
                        increment: countChange,
                    },
                },
            });
        }

        // Get updated count
        const updatedEvent = await prisma.event.findUnique({
            where: { id: eventId },
            select: { presenceCount: true },
        });

        return NextResponse.json({
            success: true,
            presenceCount: updatedEvent?.presenceCount || 0,
        });
    } catch (error) {
        console.error('Presence error:', error);
        return NextResponse.json(
            { error: 'Failed to update presence' },
            { status: 500 }
        );
    }
}
