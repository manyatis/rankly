import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/nextauth';
import { prisma } from '@/lib/prisma';
import { RecurringScansService } from '@/services/RecurringScansService';

// GET - Get recurring scan settings for a specific business
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = parseInt((await params).businessId);
    if (isNaN(businessId)) {
      return NextResponse.json({ error: 'Invalid business ID' }, { status: 400 });
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const result = await RecurringScansService.getRecurringScans(businessId, user.id);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data);

  } catch (error) {
    console.error('❌ Error fetching recurring scan settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recurring scan settings' },
      { status: 500 }
    );
  }
}

// POST - Trigger immediate scan for a business
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ businessId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = parseInt((await params).businessId);
    if (isNaN(businessId)) {
      return NextResponse.json({ error: 'Invalid business ID' }, { status: 400 });
    }

    const body = await request.json();
    const { action } = body;

    if (action !== 'trigger') {
      return NextResponse.json(
        { error: 'Only "trigger" action is supported' },
        { status: 400 }
      );
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const result = await RecurringScansService.triggerImmediateScan(businessId, user.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: result.message 
    });

  } catch (error) {
    console.error('❌ Error triggering immediate scan:', error);
    return NextResponse.json(
      { error: 'Failed to trigger immediate scan' },
      { status: 500 }
    );
  }
}