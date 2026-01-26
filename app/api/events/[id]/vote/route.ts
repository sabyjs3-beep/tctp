import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// POST /api/events/[id]/vote - Submit a vote
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const body = await request.json();
        const { deviceId, module, value } = body;

        // Validate required fields
        if (!deviceId || !module || !value) {
            return NextResponse.json(
                { error: 'Missing required fields: deviceId, module, value' },
                { status: 400 }
            );
        }

        // Validate module type
        const validModules = ['legit', 'packed', 'queue', 'lineup', 'price', 'safety', 'sound'];
        if (!validModules.includes(module)) {
            return NextResponse.json(
                { error: `Invalid module. Must be one of: ${validModules.join(', ')}` },
                { status: 400 }
            );
        }

        // Check if event exists and is votable
        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        if (!['created', 'live', 'cooling'].includes(event.status)) {
            return NextResponse.json(
                { error: 'Voting is closed for this event' },
                { status: 403 }
            );
        }

        // Upsert the vote (allows changing vote while event is live)
        const vote = await prisma.vote.upsert({
            where: {
                eventId_deviceId_module: {
                    eventId,
                    deviceId,
                    module,
                },
            },
            update: { value, updatedAt: new Date() },
            create: {
                eventId,
                deviceId,
                module,
                value,
            },
        });

        return NextResponse.json({ success: true, vote });
    } catch (error) {
        console.error('Vote error:', error);
        return NextResponse.json(
            { error: 'Failed to submit vote' },
            { status: 500 }
        );
    }
}

// GET /api/events/[id]/vote?deviceId=xxx - Get user's votes for an event
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const { searchParams } = new URL(request.url);
        const deviceId = searchParams.get('deviceId');

        if (!deviceId) {
            return NextResponse.json(
                { error: 'deviceId query parameter required' },
                { status: 400 }
            );
        }

        const votes = await prisma.vote.findMany({
            where: { eventId, deviceId },
        });

        // Convert to a map of module -> value for easy client use
        const voteMap: Record<string, string> = {};
        votes.forEach((v) => {
            voteMap[v.module] = v.value;
        });

        return NextResponse.json({ votes: voteMap });
    } catch (error) {
        console.error('Get votes error:', error);
        return NextResponse.json(
            { error: 'Failed to get votes' },
            { status: 500 }
        );
    }
}
