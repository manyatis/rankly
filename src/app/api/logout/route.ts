import { deleteSession, getSessionToken } from '../../../lib/auth';
import { serialize } from 'cookie';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const token = await getSessionToken(req.headers.get('cookie'));
    
    if (token) {
      await deleteSession(token);
    }

    const cookie = serialize('sessionToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    return Response.json(
      { message: 'Logged out successfully' },
      { 
        status: 200,
        headers: {
          'Set-Cookie': cookie
        }
      }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return Response.json({ error: 'Logout failed' }, { status: 500 });
  }
}