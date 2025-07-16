
import { getSessionToken, validateSession } from '../../../lib/auth';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  const token = await getSessionToken(req.headers.get('cookie'));

  if (!token) {
    return Response.json({ error: 'No session' }, { status: 401 });
  }

  const user = await validateSession(token);

  if (!user) {
    return Response.json({ error: 'Invalid session' }, { status: 401 });
  }

  return Response.json({
    id: user.id,
    email: user.email
  });
}