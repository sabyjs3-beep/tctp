import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// POST /api/events/[id]/post - Create a new post
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: eventId } = await params;
        const body = await request.json();
        const { deviceId, content, quickTag } = body;

        // Validate required fields
        if (!deviceId) {
            return NextResponse.json({ error: 'deviceId required' }, { status: 400 });
        }

        if (!content && !quickTag) {
            return NextResponse.json({ error: 'content or quickTag required' }, { status: 400 });
        }

        // Check event exists and is postable
        const event = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        if (!['live', 'cooling'].includes(event.status)) {
            return NextResponse.json({ error: 'Posting is closed for this event' }, { status: 403 });
        }

        // Rate limiting: Check recent posts from this device
        const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
        const recentPosts = await prisma.post.count({
            where: {
                eventId,
                deviceId,
                createdAt: { gte: threeMinutesAgo },
            },
        });

        if (recentPosts > 0) {
            return NextResponse.json(
                { error: 'Please wait before posting again' },
                { status: 429 }
            );
        }

        // Create the post
        const post = await prisma.post.create({
            data: {
                eventId,
                deviceId,
                content: content?.slice(0, 200) || null,
                quickTag: quickTag || null,
            },
        });

        return NextResponse.json({
            success: true,
            post: {
                id: post.id,
                content: post.content,
                quickTag: post.quickTag,
                score: post.score,
                createdAt: post.createdAt.toISOString(),
                deviceId: post.deviceId,
                votes: [],
            },
        });
    } catch (error) {
        console.error('Post error:', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
