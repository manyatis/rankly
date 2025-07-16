import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/nextauth';
import { createSession } from '../../../../lib/auth';
import { serialize } from 'cookie';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.email) {
      // Create a session in your custom session system
      const { token } = await createSession(session.user.email);
      
      // Set the session cookie
      const cookie = serialize('sessionToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        path: '/'
      });

      // Redirect to home with session cookie
      const response = NextResponse.redirect(new URL('/', request.url));
      response.headers.set('Set-Cookie', cookie);
      return response;
    }
    
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/?error=oauth-error', request.url));
  }
}