import { createSession } from '../../../lib/auth';
import { serialize } from 'cookie';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    if (!email || !isValidEmail(email)) {
      return Response.json({ error: 'Valid email required' }, { status: 400 });
    }

    const { token, user } = await createSession(email);

    const cookie = serialize('sessionToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });

    return Response.json(
      { 
        id: user.id,
        email: user.email,
        message: 'Login successful' 
      },
      { 
        status: 200,
        headers: {
          'Set-Cookie': cookie
        }
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return Response.json({ error: 'Login failed' }, { status: 500 });
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}