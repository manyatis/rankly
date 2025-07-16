import { PrismaClient } from '../generated/prisma';
import { parse } from 'cookie';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

export async function getSessionToken(cookieHeader: string | null): Promise<string | null> {
  if (!cookieHeader) {
    return null;
  }

  const cookies = parse(cookieHeader);
  return cookies.sessionToken || null;
}

export async function validateSession(token: string) {
  if (!token) {
    return null;
  }

  try {
    const session = await prisma.session.findUnique({
      where: { 
        token,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        user: true
      }
    });

    if (!session) {
      return null;
    }

    return session.user;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

export async function createSession(email: string) {
  try {
    let user = await prisma.user.findFirst({
      where: { email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: { email }
      });
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.session.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    });

    return { token, user };
  } catch (error) {
    console.error('Session creation error:', error);
    throw error;
  }
}

export async function deleteSession(token: string) {
  try {
    await prisma.session.delete({
      where: { token }
    });
  } catch (error) {
    console.error('Session deletion error:', error);
  }
}