import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, createOrUpdateUserProfile } from '@/lib/auth-utils';

// POST /api/user/profile - Create or update user profile
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { uid, email, name, picture } = body;

    // Validate that the user can only update their own profile
    if (uid !== user.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await createOrUpdateUserProfile({
      uid,
      email,
      name,
      picture,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating/updating user profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
} 