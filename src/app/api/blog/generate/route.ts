import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { ModelFactory } from '@/lib/ai-models/ModelFactory';
import { PrismaClient } from '@/generated/prisma';
import { BLOG_WRITER_SYSTEM_PROMPT, createBlogPrompt } from '@/prompts/blog-writer-system';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized - Please log in' }, { status: 401 });
    }

    // Fetch user from database to check admin role
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { prompt, category = 'Strategy', tone = 'professional' } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Create a comprehensive prompt using our specialized blog writer system
    const fullPrompt = createBlogPrompt(prompt, category, tone);

    // Use Perplexity model with web search capabilities and higher token limit for blog posts
    const perplexityModel = ModelFactory.createModel('perplexity');
    if (!perplexityModel) {
      return NextResponse.json({ error: 'AI model not available' }, { status: 500 });
    }

    // Create a custom query method with higher token limit
    const apiKey = process.env.PERPLEXITY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI configuration missing' }, { status: 500 });
    }

    const requestData = {
      model: 'sonar',
      messages: [
        {
          role: 'system',
          content: BLOG_WRITER_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: fullPrompt
        }
      ],
      max_tokens: 4000, // Much higher limit for blog posts
      temperature: 0.7,
      top_p: 0.9,
      return_citations: true,
      search_recency_filter: 'month',
    };

    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    if (!perplexityResponse.ok) {
      const errorText = await perplexityResponse.text();
      console.error('Perplexity API error:', errorText);
      return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
    }

    const data = await perplexityResponse.json();
    const response = data.choices?.[0]?.message?.content;
    const citations = data.citations || [];
    
    // Debug: Log the full response to see what we're getting
    console.log('Perplexity API response:', JSON.stringify(data, null, 2));
    
    if (!response) {
      return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 });
    }

    try {
      const generatedContent = JSON.parse(response);
      
      // Validate the response structure
      if (!generatedContent.title || !generatedContent.content || !generatedContent.excerpt) {
        throw new Error('Invalid response structure');
      }

      return NextResponse.json({
        success: true,
        ...generatedContent,
        category,
        author: 'Rankly AI',
        citations: citations || [],
      });
    } catch {
      // Fallback: treat the entire response as content and extract title
      const lines = response.split('\n').filter((line: string) => line.trim());
      const title = lines[0]?.replace(/^#\s*/, '') || 'AI Generated Post';
      const content = response;
      const excerpt = lines.slice(1, 3).join(' ').substring(0, 200) + '...';

      return NextResponse.json({
        success: true,
        title,
        excerpt,
        content,
        suggestedReadTime: Math.ceil(content.split(' ').length / 200),
        category,
        author: 'Rankly AI',
        citations: citations || [],
      });
    }
  } catch (error) {
    console.error('Error generating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to generate blog post' },
      { status: 500 }
    );
  }
}