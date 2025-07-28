import { adminAuth, adminDb } from './firebase-admin';
import { NextRequest } from 'next/server';

export interface AuthUser {
  uid: string;
  email: string | null;
  name: string | null;
  picture?: string | null;
}

/**
 * Verify Firebase ID token from Authorization header
 */
export async function getCurrentUser(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      name: decodedToken.name || null,
      picture: decodedToken.picture || null,
    };
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}

/**
 * Create or update user profile in Firestore
 */
export async function createOrUpdateUserProfile(user: AuthUser): Promise<void> {
  try {
    const userRef = adminDb.collection('users').doc(user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      // Create new user profile
      await userRef.set({
        id: user.uid,
        email: user.email,
        displayName: user.name,
        photoURL: user.picture,
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
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    throw error;
  }
}

/**
 * Helper to get user from cookies (for middleware)
 */
export async function getUserFromCookies(request: NextRequest): Promise<AuthUser | null> {
  try {
    // Firebase Auth stores the token in cookies when using Firebase Auth
    const sessionCookie = request.cookies.get('__session')?.value;
    
    if (!sessionCookie) {
      return null;
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      name: decodedToken.name || null,
      picture: decodedToken.picture || null,
    };
  } catch (error) {
    // Session cookie might not be available, that's okay
    return null;
  }
} 