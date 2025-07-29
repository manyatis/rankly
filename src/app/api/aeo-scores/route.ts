import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getUser();
    if (!sessionUser?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get full user from database to check plan
    const user = await prisma.user.findUnique({
      where: { email: sessionUser.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has professional+ plan
    if (user.plan !== 'professional' && user.plan !== 'enterprise') {
      return NextResponse.json({ error: 'Professional or Enterprise plan required' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      score, 
      businessName, 
      keywords, 
      visibility, 
      ranking, 
      relevance, 
      accuracy,
      date 
    } = body;

    // Validate required fields
    if (!score || !businessName || !Array.isArray(keywords)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use provided date or today's date
    const scoreDate = date ? new Date(date) : new Date();
    scoreDate.setHours(0, 0, 0, 0); // Normalize to start of day

    // Check if score already exists for this user, date, and business
    const existingScore = await prisma.aeoScore.findUnique({
      where: {
        userId_date_businessName: {
          userId: user.id,
          date: scoreDate,
          businessName: businessName
        }
      }
    });

    let aeoScore;
    if (existingScore) {
      // Update existing score
      aeoScore = await prisma.aeoScore.update({
        where: { id: existingScore.id },
        data: {
          score,
          keywords,
          visibility,
          ranking,
          relevance,
          accuracy,
          updatedAt: new Date()
        }
      });
    } else {
      // Create new score
      aeoScore = await prisma.aeoScore.create({
        data: {
          userId: user.id,
          date: scoreDate,
          score,
          businessName,
          keywords,
          visibility,
          ranking,
          relevance,
          accuracy
        }
      });
    }

    return NextResponse.json(aeoScore);
  } catch (error) {
    console.error('Error saving AEO score:', error);
    return NextResponse.json({ error: 'Failed to save AEO score' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getUser();
    if (!sessionUser?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get full user from database to check plan
    const user = await prisma.user.findUnique({
      where: { email: sessionUser.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has professional+ plan
    if (user.plan !== 'professional' && user.plan !== 'enterprise') {
      return NextResponse.json({ error: 'Professional or Enterprise plan required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const businessName = searchParams.get('businessName');
    const days = parseInt(searchParams.get('days') || '30');

    if (!businessName) {
      return NextResponse.json({ error: 'Business name is required' }, { status: 400 });
    }

    // Calculate date range (last N days)
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const scores = await prisma.aeoScore.findMany({
      where: {
        userId: user.id,
        businessName: businessName,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    return NextResponse.json(scores);
  } catch (error) {
    console.error('Error fetching AEO scores:', error);
    return NextResponse.json({ error: 'Failed to fetch AEO scores' }, { status: 500 });
  }
}