
import { getUser } from '../../../lib/auth';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export const runtime = 'nodejs';

export async function GET() {
  try {
    const sessionUser = await getUser();

    if (!sessionUser?.email) {
      return Response.json({ error: 'No session' }, { status: 401 });
    }

    // Get full user data from database including plan
    const user = await prisma.user.findUnique({
      where: { email: sessionUser.email },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        plan: true
      }
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      plan: user.plan
    });
  } catch (error) {
    console.error('Session API error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}