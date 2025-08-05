import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // For NextAuth, we need to redirect to the signout endpoint
    // But since this is called from client-side, we'll just return success
    // The actual logout will be handled by NextAuth signOut() function
    
    return NextResponse.json({ message: 'Logout successful' }, { status: 200 });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}