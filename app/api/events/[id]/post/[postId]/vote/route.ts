import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

// POST /api/events/[id]/post/[postId]/vote - Vote on a post
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; postId: string }> }
) {
    try {
        const { id: eventId, postId } = await params;
        const body = await request.json();
        const { deviceId, value } = body;

        // Validate
        if (!deviceId || (value !== 1 && value !== -1)) {
            return NextResponse.json(
                { error: 'deviceId and value (1 or -1) required' },
                { status: 400 }
            );
        }

        // Check post exists
        const post = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post || post.eventId !== eventId) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // Check existing vote
        const existingVote = await prisma.postVote.findUnique({
            where: {
                postId_deviceId: { postId, deviceId },
            },
        });

        let scoreDelta = value;

        if (existingVote) {
            if (existingVote.value === value) {
                // Same vote, no change
                return NextResponse.json({ success: true, score: post.score });
            }
            // Changing vote: subtract old, add new
            scoreDelta = value * 2; // e.g., from -1 to +1 = +2
        }

        // Upsert vote
        await prisma.postVote.upsert({
            where: {
                postId_deviceId: { postId, deviceId },
            },
            update: { value },
            create: { postId, deviceId, value },
        });

        // Update post score
        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: {
                score: { increment: existingVote ? value - existingVote.value : value },
                // Auto-hide if score drops below -3
                hidden: post.score + scoreDelta < -3,
            },
        });

        return NextResponse.json({ success: true, score: updatedPost.score });
    } catch (error) {
        console.error('Post vote error:', error);
        return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
    }
}
