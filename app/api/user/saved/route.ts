import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
        return NextResponse.json({ ids: [] });
    }

    try {
        const saved = await prisma.savedEvent.findMany({
            where: { deviceId },
            select: { eventId: true }
        });

        return NextResponse.json({ ids: saved.map(s => s.eventId) });
    } catch (error) {
        console.error('Error fetching saved events:', error);
        return NextResponse.json({ ids: [] });
    }
}
