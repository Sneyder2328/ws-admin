import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { FirestoreAdapter } from '@next-auth/firebase-adapter';
import { adminDb } from './firebase-admin';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  adapter: FirestoreAdapter(adminDb),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.uid as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          // Create or update user profile in Firestore
          const userRef = adminDb.collection('users').doc(user.id);
          const userDoc = await userRef.get();
          
          if (!userDoc.exists) {
            // Create new user profile
            await userRef.set({
              id: user.id,
              email: user.email,
              displayName: user.name,
              photoURL: user.image,
              projectIds: [],
              createdAt: new Date(),
              lastLoginAt: new Date(),
            });
          } else {
            // Update last login
            await userRef.update({
              lastLoginAt: new Date(),
            });
          }
          return true;
        } catch (error) {
          console.error('Error creating/updating user:', error);
          return false;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
};