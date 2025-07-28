import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';

async function verifyProjectAccess(userId: string, projectId: string): Promise<boolean> {
  try {
    const projectDoc = await adminDb.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) return false;
    
    const projectData = projectDoc.data();
    return projectData?.ownerId === userId;
  } catch (error) {
    console.error('Error verifying project access:', error);
    return false;
  }
}

// GET /api/projects/[projectId]/conversations
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;
    const hasAccess = await verifyProjectAccess(session.user.id, projectId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Project not found or access denied' }, { status: 403 });
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const conversationsRef = adminDb
      .collection('projects')
      .doc(projectId)
      .collection('conversations');

    let query = conversationsRef
      .orderBy('lastMessageTimestamp', 'desc')
      .limit(limit);

    if (offset > 0) {
      // For pagination, we'd need to implement cursor-based pagination
      // For now, we'll use offset (note: this is not efficient for large datasets)
      query = query.offset(offset);
    }

    const snapshot = await query.get();
    
    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
      lastMessageTimestamp: doc.data().lastMessageTimestamp?.toDate?.()?.toISOString() || null,
    }));

    return NextResponse.json({ 
      conversations,
      total: snapshot.size,
      hasMore: snapshot.size === limit 
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
  }
}