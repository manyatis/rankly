import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET /api/blog/[id] - Get a single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Check if post is published or user is admin (for drafts)
    if (post.status !== 'published') {
      const session = await getServerSession(authOptions);
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      // Check if user is admin
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
      });

      if (!user || user.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
      }
    }

    const transformedPost = {
      id: post.id.toString(),
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      status: post.status,
      category: post.tags.length > 0 ? post.tags[0] : 'Strategy',
      author: post.authorName || post.author.name || 'Rankly Team',
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString(),
      readTime: Math.max(1, Math.ceil(post.content.split(' ').length / 200)),
      citations: post.citations || []
    };

    return NextResponse.json(transformedPost);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json({ error: 'Failed to fetch blog post' }, { status: 500 });
  }
}

// PUT /api/blog/[id] - Update a blog post (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, content, excerpt, category, status, citations, author } = body;
    
    // Debug: Log what we're receiving
    console.log('Update request body:', body);

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Determine if we should set publishedAt
    let publishedAt = existingPost.publishedAt;
    if (status === 'published' && existingPost.status === 'draft') {
      publishedAt = new Date();
    } else if (status === 'draft') {
      publishedAt = null;
    }

    const post = await prisma.blogPost.update({
      where: { id: parseInt(id) },
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || '',
        status: status || 'draft',
        authorName: author || null, // Store the custom author name
        tags: category ? [category] : existingPost.tags,
        citations: citations || existingPost.citations || [],
        publishedAt
      },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    const transformedPost = {
      id: post.id.toString(),
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || '',
      status: post.status,
      category: post.tags.length > 0 ? post.tags[0] : 'Strategy',
      author: post.authorName || post.author.name || 'Rankly Team',
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      publishedAt: post.publishedAt?.toISOString(),
      readTime: Math.max(1, Math.ceil(post.content.split(' ').length / 200)),
      citations: post.citations || []
    };

    return NextResponse.json(transformedPost);
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json({ error: 'Failed to update blog post' }, { status: 500 });
  }
}

// DELETE /api/blog/[id] - Delete a blog post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    // Check if post exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }

    await prisma.blogPost.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ error: 'Failed to delete blog post' }, { status: 500 });
  }
}