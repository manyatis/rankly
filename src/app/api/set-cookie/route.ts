import { serialize } from 'cookie';

export async function POST(req: Request) {
  const body = await req.json();
  const response = Response.json({
    message: 'Cookie set successfully'
  });

  const cookie = serialize('session', body.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 1 * 24 * 60 * 60
  });

  response.headers.set('Set-Cookie', cookie);
  return response;
}