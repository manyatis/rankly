import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/nextauth';
import { prisma } from '@/lib/prisma';
import { RecurringScansService } from '@/services/RecurringScansService';

// GET - Get all recurring scans for the authenticated user
export async function GET(_request: NextRequest) { // eslint-disable-line @typescript-eslint/no-unused-vars
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const result = await RecurringScansService.getUserRecurringScans(user.id);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.data);

  } catch (error) {
    console.error('❌ Error fetching recurring scans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recurring scans' },
      { status: 500 }
    );
  }
}

// POST - Update recurring scan settings for a business
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { businessId, enabled, frequency } = body;

    if (!businessId || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'businessId and enabled are required' },
        { status: 400 }
      );
    }

    if (enabled && !frequency) {
      return NextResponse.json(
        { error: 'frequency is required when enabling recurring scans' },
        { status: 400 }
      );
    }

    if (enabled && !['daily', 'weekly', 'monthly'].includes(frequency)) {
      return NextResponse.json(
        { error: 'frequency must be daily, weekly, or monthly' },
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

    const result = await RecurringScansService.updateRecurringScans(
      businessId,
      user.id,
      { enabled, frequency }
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Recurring scans ${enabled ? 'enabled' : 'disabled'} successfully` 
    });

  } catch (error) {
    console.error('❌ Error updating recurring scans:', error);
    return NextResponse.json(
      { error: 'Failed to update recurring scans' },
      { status: 500 }
    );
  }
}