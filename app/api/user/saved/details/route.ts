import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
        return NextResponse.json({ events: [] });
    }

    try {
        const savedEvents = await (prisma as any).savedEvent.findMany({
            where: { deviceId },
            include: {
                event: {
                    include: {
                        venue: { include: { city: true } },
                        djs: { include: { dj: true }, orderBy: { order: 'asc' } },
                        votes: true
                    }
                }
            },
            orderBy: { event: { startTime: 'asc' } }
        });

        const events = savedEvents.map((s: any) => s.event);

        return NextResponse.json({ events });
    } catch (error) {
        console.error('Error fetching saved event details:', error);
        return NextResponse.json({ events: [] });
    }
}
