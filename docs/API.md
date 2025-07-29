# API Documentation

This document provides detailed information about the WhatsApp Business Admin Panel API endpoints.

## Base URL

All API endpoints are relative to your application's base URL:
```
https://your-domain.com/api
```

## Authentication

Most API endpoints require authentication using Firebase Auth. Include the Firebase ID token in the Authorization header:

```http
Authorization: Bearer <firebase-id-token>
```

## Webhook Endpoints

### WhatsApp Webhook Handler

Receives and processes WhatsApp Business API webhook events for a specific project.

**Endpoint:** `POST /api/webhooks/whatsapp/[projectId]`

**Parameters:**
- `projectId` (path): The project ID to associate messages with

**Headers:**
- `Content-Type: application/json`
- WhatsApp signature headers for verification

**Request Body:**
WhatsApp webhook payload (varies by event type)

**Response:**
- `200 OK`: Webhook processed successfully
- `400 Bad Request`: Invalid webhook payload
- `401 Unauthorized`: Webhook verification failed
- `404 Not Found`: Project not found

### WhatsApp Webhook Verification

Handles WhatsApp webhook verification challenge.

**Endpoint:** `GET /api/webhooks/whatsapp/[projectId]`

**Parameters:**
- `projectId` (path): The project ID
- `hub.mode` (query): Should be "subscribe"
- `hub.challenge` (query): Challenge string from WhatsApp
- `hub.verify_token` (query): Verification token

**Response:**
- `200 OK`: Returns the challenge string
- `403 Forbidden`: Invalid verification token

## Project Management

### List Projects

Get all projects accessible to the authenticated user.

**Endpoint:** `GET /api/projects`

**Authentication:** Required

**Response:**
```json
{
  "projects": [
    {
      "id": "project-id",
      "name": "Project Name",
      "description": "Project description",
      "ownerId": "user-id",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Create Project

Create a new project.

**Endpoint:** `POST /api/projects`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Project Name",
  "description": "Optional project description"
}
```

**Response:**
```json
{
  "project": {
    "id": "generated-project-id",
    "name": "Project Name",
    "description": "Optional project description",
    "ownerId": "user-id",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Get Project Details

Get details for a specific project.

**Endpoint:** `GET /api/projects/[projectId]`

**Authentication:** Required

**Parameters:**
- `projectId` (path): The project ID

**Response:**
```json
{
  "project": {
    "id": "project-id",
    "name": "Project Name",
    "description": "Project description",
    "ownerId": "user-id",
    "whatsappConfig": {
      "isConfigured": true,
      "businessAccountId": "business-account-id",
      "phoneNumberId": "phone-number-id"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

### Update Project

Update project details.

**Endpoint:** `PUT /api/projects/[projectId]`

**Authentication:** Required

**Parameters:**
- `projectId` (path): The project ID

**Request Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "project": {
    "id": "project-id",
    "name": "Updated Project Name",
    "description": "Updated description",
    "ownerId": "user-id",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

## WhatsApp Configuration

### Save WhatsApp Configuration

Configure WhatsApp Business API settings for a project.

**Endpoint:** `POST /api/projects/[projectId]/whatsapp-config`

**Authentication:** Required

**Parameters:**
- `projectId` (path): The project ID

**Request Body:**
```json
{
  "accessToken": "whatsapp-access-token",
  "webhookVerifyToken": "webhook-verify-token",
  "businessAccountId": "business-account-id",
  "phoneNumberId": "phone-number-id"
}
```

**Response:**
```json
{
  "success": true,
  "webhookUrl": "https://your-domain.com/api/webhooks/whatsapp/project-id"
}
```

### Get WhatsApp Configuration

Get WhatsApp configuration for a project (tokens are masked for security).

**Endpoint:** `GET /api/projects/[projectId]/whatsapp-config`

**Authentication:** Required

**Parameters:**
- `projectId` (path): The project ID

**Response:**
```json
{
  "config": {
    "isConfigured": true,
    "businessAccountId": "business-account-id",
    "phoneNumberId": "phone-number-id",
    "webhookUrl": "https://your-domain.com/api/webhooks/whatsapp/project-id"
  }
}
```

## Conversation Management

### List Conversations

Get conversations for a specific project.

**Endpoint:** `GET /api/projects/[projectId]/conversations`

**Authentication:** Required

**Parameters:**
- `projectId` (path): The project ID
- `limit` (query, optional): Number of conversations to return (default: 20)
- `offset` (query, optional): Number of conversations to skip (default: 0)
- `search` (query, optional): Search term for customer phone or name

**Response:**
```json
{
  "conversations": [
    {
      "id": "conversation-id",
      "projectId": "project-id",
      "customerPhone": "+1234567890",
      "customerName": "Customer Name",
      "lastMessage": "Last message content",
      "lastMessageTimestamp": "2024-01-01T00:00:00Z",
      "unreadCount": 2,
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 50,
  "hasMore": true
}
```

### Get Conversation Details

Get detailed information about a specific conversation including recent messages.

**Endpoint:** `GET /api/projects/[projectId]/conversations/[conversationId]`

**Authentication:** Required

**Parameters:**
- `projectId` (path): The project ID
- `conversationId` (path): The conversation ID
- `limit` (query, optional): Number of messages to return (default: 50)
- `before` (query, optional): Message ID to paginate before

**Response:**
```json
{
  "conversation": {
    "id": "conversation-id",
    "projectId": "project-id",
    "customerPhone": "+1234567890",
    "customerName": "Customer Name",
    "lastMessage": "Last message content",
    "lastMessageTimestamp": "2024-01-01T00:00:00Z",
    "unreadCount": 0,
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "messages": [
    {
      "id": "message-id",
      "conversationId": "conversation-id",
      "projectId": "project-id",
      "fromPhone": "+1234567890",
      "toPhone": "+0987654321",
      "type": "text",
      "content": "Message content",
      "timestamp": "2024-01-01T00:00:00Z",
      "direction": "incoming",
      "status": "delivered",
      "messageId": "whatsapp-message-id"
    }
  ],
  "hasMore": false
}
```

### Mark Conversation as Read

Mark all messages in a conversation as read.

**Endpoint:** `PUT /api/projects/[projectId]/conversations/[conversationId]/read`

**Authentication:** Required

**Parameters:**
- `projectId` (path): The project ID
- `conversationId` (path): The conversation ID

**Response:**
```json
{
  "success": true,
  "unreadCount": 0
}
```

## User Management

### Get User Profile

Get the authenticated user's profile information.

**Endpoint:** `GET /api/user/profile`

**Authentication:** Required

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "displayName": "User Name",
    "photoURL": "https://example.com/photo.jpg",
    "projectIds": ["project-1", "project-2"],
    "defaultProjectId": "project-1",
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLoginAt": "2024-01-01T00:00:00Z"
  }
}
```

### Create/Update User Profile

Create or update user profile (called automatically on authentication).

**Endpoint:** `POST /api/user/profile`

**Authentication:** Required

**Request Body:**
```json
{
  "uid": "firebase-user-id",
  "email": "user@example.com",
  "name": "User Name",
  "picture": "https://example.com/photo.jpg"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "displayName": "User Name",
    "photoURL": "https://example.com/photo.jpg",
    "projectIds": [],
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLoginAt": "2024-01-01T00:00:00Z"
  }
}
```

## Privacy Policy

### Generate Privacy Policy

Generate a privacy policy for a specific project.

**Endpoint:** `GET /api/privacy/[projectId]`

**Parameters:**
- `projectId` (path): The project ID

**Response:**
HTML content of the generated privacy policy.

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Detailed error message"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

API endpoints have rate limiting applied:
- Webhook endpoints: 100 requests per minute per project
- Admin endpoints: 60 requests per minute per user
- Public endpoints: 30 requests per minute per IP

## Security Considerations

- All sensitive data (WhatsApp tokens) is encrypted at rest
- Webhook payloads are verified using WhatsApp signatures
- Project-level access control ensures data isolation
- All API routes require proper authentication except webhooks and public pages