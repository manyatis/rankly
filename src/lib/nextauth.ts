import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';


export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google' && user.email) {
        try {
          // Find or create user
          let existingUser = await prisma.user.findFirst({
            where: { email: user.email }
          });

          if (!existingUser) {
            // Create user with their own organization in a single transaction
            existingUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || profile?.name,
                organization: {
                  create: {
                    name: 'My Org'
                  }
                }
              }
            });
          } else {
            // Update user info if changed
            await prisma.user.update({
              where: { id: existingUser.id },
              data: {
                name: user.name || profile?.name || existingUser.name
              }
            });

            // If existing user doesn't have an organization, create one
            if (!existingUser.organizationId) {
              const defaultOrg = await prisma.organization.create({
                data: {
                  name: 'My Org',
                  domain: null
                }
              });

              await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                  organizationId: defaultOrg.id
                }
              });
            }
          }

          // Check if account already exists
          const existingAccount = await prisma.account.findFirst({
            where: {
              provider: account.provider,
              providerAccountId: account.providerAccountId
            }
          });

          if (!existingAccount) {
            // Create account record
            await prisma.account.create({
              data: {
                userId: existingUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state
              }
            });
          }

          return true;
        } catch (error) {
          console.error('Error during sign in:', error);
          return false;
        }
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // If url is relative, make it absolute using baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // If url is same domain, allow it
      else if (new URL(url).origin === baseUrl) return url;
      // Otherwise redirect to base URL
      return baseUrl;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
};