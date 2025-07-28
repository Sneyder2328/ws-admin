import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { 
  getWhatsAppConfig, 
  createOrUpdateConversation, 
  saveMessage 
} from '@/lib/firebase-utils';

// Webhook verification (GET request)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe') {
    try {
      // Get the project's webhook verify token
      const config = await getWhatsAppConfig(projectId);
      
      if (!config || !config.isConfigured) {
        console.error(`Project ${projectId} WhatsApp config not found or not configured`);
        return NextResponse.json({ error: 'Project not configured' }, { status: 400 });
      }

      if (token === config.webhookVerifyToken) {
        console.log(`Webhook verified for project ${projectId}`);
        return new NextResponse(challenge);
      } else {
        console.error(`Invalid verify token for project ${projectId}`);
        return NextResponse.json({ error: 'Invalid verify token' }, { status: 403 });
      }
    } catch (error) {
      console.error(`Error verifying webhook for project ${projectId}:`, error);
      return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
}

// Webhook events (POST request)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  try {
    // Get the project's WhatsApp config for signature verification
    const config = await getWhatsAppConfig(projectId);
    
    if (!config || !config.isConfigured) {
      console.error(`Project ${projectId} WhatsApp config not found or not configured`);
      return NextResponse.json({ error: 'Project not configured' }, { status: 400 });
    }

    const body = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    // Verify webhook signature
    if (!verifySignature(body, signature, config.accessToken)) {
      console.error(`Invalid signature for project ${projectId}`);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const data = JSON.parse(body);

    // Process webhook data
    if (data.object === 'whatsapp_business_account') {
      for (const entry of data.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages') {
            await processMessages(projectId, change.value);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error processing webhook for project ${projectId}:`, error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}

function verifySignature(payload: string, signature: string | null, appSecret: string): boolean {
  if (!signature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest('hex');

  const receivedSignature = signature.replace('sha256=', '');
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(receivedSignature, 'hex')
  );
}

interface WhatsAppMessage {
  id: string;
  from: string;
  timestamp: string;
  text?: { body: string };
  image?: { id: string; caption?: string };
  audio?: { id: string };
  video?: { id: string; caption?: string };
  document?: { id: string; filename?: string };
  location?: { latitude: number; longitude: number };
}

interface WhatsAppValue {
  messages?: WhatsAppMessage[];
  statuses?: Array<{
    id: string;
    status: string;
    timestamp: string;
    recipient_id: string;
  }>;
  metadata: {
    phone_number_id: string;
  };
}

async function processMessages(projectId: string, value: WhatsAppValue) {
  try {
    if (value.messages) {
      for (const message of value.messages) {
        const timestamp = new Date(parseInt(message.timestamp) * 1000);
        
        // Create or update conversation
        const conversationId = await createOrUpdateConversation(
          projectId,
          message.from,
          getMessageContent(message),
          timestamp
        );

        // Save the message
        await saveMessage(projectId, conversationId, {
          conversationId,
          projectId,
          fromPhone: message.from,
          toPhone: value.metadata.phone_number_id,
          type: getMessageType(message),
          content: getMessageContent(message),
          mediaUrl: getMediaUrl(message),
          timestamp,
          direction: 'incoming',
          status: 'delivered',
          messageId: message.id,
        });

        console.log(`Message saved for project ${projectId}, conversation ${conversationId}`);
      }
    }

    // Process status updates
    if (value.statuses) {
      for (const status of value.statuses) {
        // TODO: Update message status in database
        console.log(`Status update for project ${projectId}:`, status);
      }
    }
  } catch (error) {
    console.error(`Error processing messages for project ${projectId}:`, error);
    throw error;
  }
}

function getMessageType(message: WhatsAppMessage): 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' {
  if (message.text) return 'text';
  if (message.image) return 'image';
  if (message.audio) return 'audio';
  if (message.video) return 'video';
  if (message.document) return 'document';
  if (message.location) return 'location';
  return 'text';
}

function getMessageContent(message: WhatsAppMessage): string {
  if (message.text) return message.text.body;
  if (message.image) return message.image.caption || 'Image';
  if (message.audio) return 'Audio message';
  if (message.video) return message.video.caption || 'Video';
  if (message.document) return message.document.filename || 'Document';
  if (message.location) return `Location: ${message.location.latitude}, ${message.location.longitude}`;
  return 'Unknown message type';
}

function getMediaUrl(message: WhatsAppMessage): string | undefined {
  if (message.image) return message.image.id;
  if (message.audio) return message.audio.id;
  if (message.video) return message.video.id;
  if (message.document) return message.document.id;
  return undefined;
}