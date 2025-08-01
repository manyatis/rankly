import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// GET /api/blog - Get all published blog posts (public)
// GET /api/blog?admin=true - Get all blog posts including drafts (admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    if (isAdmin) {
      // Admin route - require authentication and admin role
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

    const posts = await prisma.blogPost.findMany({
      where: isAdmin ? {} : { status: 'published' },
      include: {
        author: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      }
    });

    // Transform the data to match our interface
    const transformedPosts = posts.map(post => ({
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
      readTime: Math.max(1, Math.ceil(post.content.split(' ').length / 200)), // Estimate 200 words per minute
      citations: post.citations || []
    }));

    return NextResponse.json(transformedPosts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

// POST /api/blog - Create a new blog post (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the user and check if they're admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { title, content, excerpt, category, status, citations, author } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || '',
        status: status || 'draft',
        authorId: user.id,
        authorName: author && author !== user.name ? author : null, // Only store if different from user.name
        tags: category ? [category] : ['Strategy'],
        citations: citations || [],
        publishedAt: status === 'published' ? new Date() : null
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

    return NextResponse.json(transformedPost, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}