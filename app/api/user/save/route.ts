import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const { eventId, deviceId } = await request.json();

        if (!eventId || !deviceId) {
            return NextResponse.json({ error: 'Missing eventId or deviceId' }, { status: 400 });
        }

        // Check if already saved
        const existing = await prisma.savedEvent.findUnique({
            where: {
                deviceId_eventId: {
                    deviceId,
                    eventId
                }
            }
        });

        if (existing) {
            // Unsave
            await prisma.savedEvent.delete({
                where: { id: existing.id }
            });
            return NextResponse.json({ saved: false });
        } else {
            // Save
            await prisma.savedEvent.create({
                data: {
                    deviceId,
                    eventId
                }
            });
            return NextResponse.json({ saved: true });
        }

    } catch (error) {
        console.error('Error toggling save:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
