import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  Timestamp,
  onSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from './firebase';
import { adminDb } from './firebase-admin';
import { User, Project, Conversation, Message, WhatsAppConfig } from './types';
import { encrypt, decrypt } from './encryption';

// Client-side functions
export async function getUserProjects(userId: string): Promise<Project[]> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) return [];
    
    const userData = userDoc.data() as User;
    const projects: Project[] = [];
    
    for (const projectId of userData.projectIds) {
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (projectDoc.exists()) {
        const projectData = projectDoc.data();
        projects.push({
          ...projectData,
          createdAt: projectData.createdAt.toDate(),
          updatedAt: projectData.updatedAt.toDate(),
        } as Project);
      }
    }
    
    return projects;
  } catch (error) {
    console.error('Error fetching user projects:', error);
    return [];
  }
}

export async function getConversations(projectId: string): Promise<Conversation[]> {
  try {
    const conversationsRef = collection(db, 'projects', projectId, 'conversations');
    const q = query(conversationsRef, orderBy('lastMessageTimestamp', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
      lastMessageTimestamp: doc.data().lastMessageTimestamp.toDate(),
    })) as Conversation[];
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
}

export async function getMessages(projectId: string, conversationId: string): Promise<Message[]> {
  try {
    const messagesRef = collection(db, 'projects', projectId, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    })) as Message[];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

// Real-time listeners
export function subscribeToConversations(
  projectId: string, 
  callback: (conversations: Conversation[]) => void
) {
  const conversationsRef = collection(db, 'projects', projectId, 'conversations');
  const q = query(conversationsRef, orderBy('lastMessageTimestamp', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
      lastMessageTimestamp: doc.data().lastMessageTimestamp.toDate(),
    })) as Conversation[];
    
    callback(conversations);
  });
}

export function subscribeToMessages(
  projectId: string,
  conversationId: string,
  callback: (messages: Message[]) => void
) {
  const messagesRef = collection(db, 'projects', projectId, 'conversations', conversationId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    })) as Message[];
    
    callback(messages);
  });
}

// Server-side functions (using admin SDK)
export async function createProject(userId: string, name: string, description?: string): Promise<string> {
  try {
    const projectRef = adminDb.collection('projects').doc();
    const projectId = projectRef.id;
    
    const project: Omit<Project, 'id'> = {
      name,
      description,
      ownerId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await projectRef.set(project);
    
    // Add project to user's projectIds
    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update({
      projectIds: require('firebase-admin/firestore').FieldValue.arrayUnion(projectId),
    });
    
    return projectId;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
}

export async function saveWhatsAppConfig(
  projectId: string, 
  config: Omit<WhatsAppConfig, 'isConfigured'>
): Promise<void> {
  try {
    const encryptedConfig: WhatsAppConfig = {
      ...config,
      accessToken: encrypt(config.accessToken),
      isConfigured: true,
    };
    
    const projectRef = adminDb.collection('projects').doc(projectId);
    await projectRef.update({
      whatsappConfig: encryptedConfig,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error saving WhatsApp config:', error);
    throw error;
  }
}

export async function getWhatsAppConfig(projectId: string): Promise<WhatsAppConfig | null> {
  try {
    const projectDoc = await adminDb.collection('projects').doc(projectId).get();
    if (!projectDoc.exists) return null;
    
    const projectData = projectDoc.data();
    if (!projectData?.whatsappConfig) return null;
    
    const config = projectData.whatsappConfig as WhatsAppConfig;
    
    return {
      ...config,
      accessToken: decrypt(config.accessToken),
    };
  } catch (error) {
    console.error('Error getting WhatsApp config:', error);
    return null;
  }
}

export async function createOrUpdateConversation(
  projectId: string,
  customerPhone: string,
  lastMessage: string,
  messageTimestamp: Date
): Promise<string> {
  try {
    const conversationsRef = adminDb.collection('projects').doc(projectId).collection('conversations');
    const existingQuery = await conversationsRef.where('customerPhone', '==', customerPhone).limit(1).get();
    
    let conversationId: string;
    
    if (!existingQuery.empty) {
      // Update existing conversation
      const conversationDoc = existingQuery.docs[0];
      conversationId = conversationDoc.id;
      
      await conversationDoc.ref.update({
        lastMessage,
        lastMessageTimestamp: messageTimestamp,
        unreadCount: require('firebase-admin/firestore').FieldValue.increment(1),
        updatedAt: new Date(),
      });
    } else {
      // Create new conversation
      const conversationRef = conversationsRef.doc();
      conversationId = conversationRef.id;
      
      const conversation: Omit<Conversation, 'id'> = {
        projectId,
        customerPhone,
        lastMessage,
        lastMessageTimestamp: messageTimestamp,
        unreadCount: 1,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await conversationRef.set(conversation);
    }
    
    return conversationId;
  } catch (error) {
    console.error('Error creating/updating conversation:', error);
    throw error;
  }
}

export async function saveMessage(
  projectId: string,
  conversationId: string,
  message: Omit<Message, 'id'>
): Promise<void> {
  try {
    const messageRef = adminDb
      .collection('projects')
      .doc(projectId)
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .doc();
    
    await messageRef.set({
      ...message,
      id: messageRef.id,
    });
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
}