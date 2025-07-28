import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

let adminApp: App | undefined;

// Function to validate and format private key
function formatPrivateKey(privateKey: string | undefined): string {
  if (!privateKey) {
    throw new Error('FIREBASE_PRIVATE_KEY environment variable is required');
  }



  // Replace escaped newlines with actual newlines
  let formattedKey = privateKey.replace(/\\n/g, '\n');
  
  // Handle different possible formats
  if (!formattedKey.includes('-----BEGIN PRIVATE KEY-----')) {
    if (!formattedKey.includes('-----BEGIN')) {
      // If it's just the key content without headers, add them
      formattedKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----`;
    } else if (formattedKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
      // Convert RSA format to PKCS#8 format
      formattedKey = formattedKey.replace('-----BEGIN RSA PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----');
      formattedKey = formattedKey.replace('-----END RSA PRIVATE KEY-----', '-----END PRIVATE KEY-----');
    }
  }

  // Validate the key format
  if (!formattedKey.includes('-----BEGIN PRIVATE KEY-----') || !formattedKey.includes('-----END PRIVATE KEY-----')) {
    throw new Error(`Invalid private key format. Expected PEM format with BEGIN/END markers. Got key starting with: ${privateKey.substring(0, 100)}...`);
  }

  return formattedKey;
}

// Check if we're in a build environment or have placeholder values
const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

const hasPlaceholderValues = !projectId || !clientEmail || !privateKey || 
  privateKey.includes('your_private_key_here') || 
  privateKey.length < 100 ||
  clientEmail.includes('your_client_email_here') ||
  projectId.includes('your_project_id_here');

const isBuildTime = process.env.NODE_ENV === 'production' && hasPlaceholderValues;

if (getApps().length === 0 && !isBuildTime && !hasPlaceholderValues) {
  try {
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: formatPrivateKey(privateKey),
      }),
      projectId,
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
  }
} else if (!isBuildTime && !hasPlaceholderValues) {
  adminApp = getApps()[0];
}

if (hasPlaceholderValues) {
  console.warn('Firebase Admin not initialized: Using placeholder environment variables. Please configure proper Firebase credentials for production.');
}

// Create safe getters that handle missing initialization
function getAdminDb() {
  if (isBuildTime || hasPlaceholderValues) {
    // Return empty object for build time to prevent type errors
    return {} as ReturnType<typeof getFirestore>;
  }
  if (!adminApp) {
    throw new Error('Firebase Admin not initialized. Check your environment variables.');
  }
  return getFirestore(adminApp);
}

function getAdminAuth() {
  if (isBuildTime || hasPlaceholderValues) {
    // Return empty object for build time to prevent type errors
    return {} as ReturnType<typeof getAuth>;
  }
  if (!adminApp) {
    throw new Error('Firebase Admin not initialized. Check your environment variables.');
  }
  return getAuth(adminApp);
}

export const adminDb = getAdminDb();
export const adminAuth = getAdminAuth();
export default adminApp;