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

console.log('🔍 Firebase Admin Debug:');
console.log('- PROJECT_ID:', projectId);
console.log('- CLIENT_EMAIL:', clientEmail);
console.log('- PRIVATE_KEY length:', privateKey?.length);

// Check for invalid service account email (common issue)
const isValidServiceAccountEmail = clientEmail?.includes('@') && 
  (clientEmail.includes('.iam.gserviceaccount.com') || clientEmail.includes('firebase-adminsdk'));

if (clientEmail && !isValidServiceAccountEmail) {
  console.error('❌ INVALID SERVICE ACCOUNT EMAIL:', clientEmail);
  console.error('   Expected format: firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com');
  console.error('   You have a personal Gmail address instead of a service account email');
}

const hasPlaceholderValues = !projectId || !clientEmail || !privateKey || 
  privateKey.includes('your_private_key_here') || 
  privateKey.length < 100 ||
  clientEmail.includes('your_client_email_here') ||
  projectId.includes('your_project_id_here') ||
  !isValidServiceAccountEmail;

const isBuildTime = process.env.NODE_ENV === 'production' && hasPlaceholderValues;

if (getApps().length === 0 && !isBuildTime && !hasPlaceholderValues) {
  try {
    console.log('✅ Initializing Firebase Admin SDK...');
    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey: formatPrivateKey(privateKey),
      }),
      projectId,
    });
    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error);
    console.error('   This will cause 5 NOT_FOUND errors when trying to access Firestore');
  }
} else if (!isBuildTime && !hasPlaceholderValues) {
  adminApp = getApps()[0];
  console.log('✅ Using existing Firebase Admin app');
}

if (hasPlaceholderValues) {
  console.warn('❌ Firebase Admin not initialized: Invalid or missing credentials');
  if (!isValidServiceAccountEmail) {
    console.warn('   🔧 SOLUTION: Generate a proper service account key:');
    console.warn('   1. Go to https://console.firebase.google.com');
    console.warn('   2. Select your project');
    console.warn('   3. Settings → Service accounts → Generate new private key');
    console.warn('   4. Use the client_email from the downloaded JSON file');
  }
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