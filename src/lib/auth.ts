import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'your@email.com'
        },
        password: { 
          label: 'Password', 
          type: 'password',
          placeholder: 'Your password'
        }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          // Find user by email
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          });

          if (!user) {
            throw new Error('No user found with this email');
          }

          if (!user.isActive) {
            throw new Error('Account is deactivated');
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }

          // Update last login
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
          });

          // Log login activity
          await prisma.activityLog.create({
            data: {
              userId: user.id,
              action: 'login',
              resourceType: 'user',
              resourceId: user.id,
              details: {
                email: user.email,
                timestamp: new Date()
              }
            }
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
            position: user.position,
            avatarUrl: user.avatarUrl,
          };
        } catch (error) {
          console.error('Authentication error:', error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.department = user.department;
        token.position = user.position;
        token.avatarUrl = user.avatarUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as UserRole;
        session.user.department = token.department as string;
        session.user.position = token.position as string;
        session.user.avatarUrl = token.avatarUrl as string;
      }
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      if (token.sub) {
        // Log logout activity
        await prisma.activityLog.create({
          data: {
            userId: token.sub,
            action: 'logout',
            resourceType: 'user',
            resourceId: token.sub,
            details: {
              timestamp: new Date()
            }
          }
        });
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
};
