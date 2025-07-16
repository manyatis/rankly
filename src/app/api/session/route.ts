
import { getUser } from '../../../lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const user = await getUser();

  if (!user) {
    return Response.json({ error: 'No session' }, { status: 401 });
  }

  return Response.json({
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image
  });
}