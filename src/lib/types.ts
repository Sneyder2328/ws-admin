export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  projectIds: string[];
  defaultProjectId?: string;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface WhatsAppConfig {
  accessToken: string; // encrypted
  webhookVerifyToken: string;
  businessAccountId: string;
  phoneNumberId: string;
  isConfigured: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  whatsappConfig?: WhatsAppConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  projectId: string;
  fromPhone: string;
  toPhone: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location';
  content: string;
  mediaUrl?: string;
  timestamp: Date;
  direction: 'incoming' | 'outgoing';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  messageId: string; // WhatsApp message ID
}

export interface Conversation {
  id: string;
  projectId: string;
  customerPhone: string;
  customerName?: string;
  lastMessage: string;
  lastMessageTimestamp: Date;
  unreadCount: number;
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}