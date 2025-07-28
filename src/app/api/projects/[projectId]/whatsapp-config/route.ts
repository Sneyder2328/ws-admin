import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { saveWhatsAppConfig, getWhatsAppConfig } from '@/lib/firebase-utils';
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

// GET /api/projects/[projectId]/whatsapp-config
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

    const config = await getWhatsAppConfig(projectId);
    
    if (!config) {
      return NextResponse.json({ 
        isConfigured: false,
        config: null 
      });
    }

    // Return config with masked access token for security
    return NextResponse.json({
      isConfigured: config.isConfigured,
      config: {
        webhookVerifyToken: config.webhookVerifyToken,
        businessAccountId: config.businessAccountId,
        phoneNumberId: config.phoneNumberId,
        accessToken: '****' + config.accessToken.slice(-4), // Masked for security
      }
    });
  } catch (error) {
    console.error('Error fetching WhatsApp config:', error);
    return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
  }
}

// POST /api/projects/[projectId]/whatsapp-config
export async function POST(
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

    const { accessToken, webhookVerifyToken, businessAccountId, phoneNumberId } = await request.json();

    // Validate required fields
    if (!accessToken || !webhookVerifyToken || !businessAccountId || !phoneNumberId) {
      return NextResponse.json({ 
        error: 'All fields are required: accessToken, webhookVerifyToken, businessAccountId, phoneNumberId' 
      }, { status: 400 });
    }

    await saveWhatsAppConfig(projectId, {
      accessToken: accessToken.trim(),
      webhookVerifyToken: webhookVerifyToken.trim(),
      businessAccountId: businessAccountId.trim(),
      phoneNumberId: phoneNumberId.trim(),
    });

    return NextResponse.json({ 
      success: true,
      message: 'WhatsApp configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving WhatsApp config:', error);
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}