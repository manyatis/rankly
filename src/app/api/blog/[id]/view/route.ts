import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    
    // Get client IP and User Agent for basic deduplication
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : 
      request.headers.get('x-real-ip') ?? 
      request.ip ?? 
      'unknown';
    const userAgent = request.headers.get('user-agent') ?? '';

    // Find the blog post by slug or id
    const post = await prisma.blogPost.findFirst({
      where: {
        OR: [
          { slug: id },
          { id: parseInt(id) || -1 }
        ],
        status: 'published'
      }
    });

    if (!post) {
      return NextResponse.json(
        { error: 'Blog post not found' },
        { status: 404 }
      );
    }

    // Check if this IP has viewed this post recently (within last hour)
    const recentView = await prisma.blogPostView.findFirst({
      where: {
        postId: post.id,
        ipAddress: ipAddress,
        viewedAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
        }
      }
    });

    // Only increment view count if no recent view from same IP
    if (!recentView) {
      // Record the view
      await prisma.blogPostView.create({
        data: {
          postId: post.id,
          ipAddress: ipAddress,
          userAgent: userAgent
        }
      });

      // Increment the view counter
      await prisma.blogPost.update({
        where: { id: post.id },
        data: {
          viewCount: {
            increment: 1
          }
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking blog post view:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}