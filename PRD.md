# Product Requirements Document (PRD)
## WhatsApp Business Admin Panel with Message Management

### 1. Overview
Build a comprehensive admin dashboard that receives WhatsApp Business webhook events, stores messages in Firebase, and provides a conversation management interface for customer support.

### 2. Core Features

#### 2.1 WhatsApp Webhook Integration
- **Endpoint**: `/api/webhooks/whatsapp/[projectId]`
  - Accept POST requests from WhatsApp Business API
  - Project ID in URL identifies which project the message belongs to
  - Verify webhook signature for security
  - Handle webhook verification (GET request with challenge)
  - Process incoming message events and associate with correct project
  - Support message types: text, media, location, contacts
  - Handle message status updates (sent, delivered, read)

#### 2.2 Data Storage (Firebase)
- **Collections Structure**:
  ```
  projects/
    {projectId}/
      - id: string
      - name: string (e.g., "Las Lobas Tours")
      - description?: string
      - ownerId: string (admin user ID)
      - whatsappConfig: {
          accessToken: string (encrypted)
          webhookVerifyToken: string
          businessAccountId: string
          phoneNumberId: string
          isConfigured: boolean
        }
      - createdAt: timestamp
      - updatedAt: timestamp
      
      conversations/
        {conversationId}/
          - id: string
          - projectId: string
          - customerPhone: string
          - customerName?: string
          - lastMessage: string
          - lastMessageTimestamp: timestamp
          - unreadCount: number
          - status: 'active' | 'archived'
          - createdAt: timestamp
          - updatedAt: timestamp
          
          messages/
            {messageId}/
              - id: string
              - conversationId: string
              - projectId: string
              - fromPhone: string
              - toPhone: string
              - type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location'
              - content: string
              - mediaUrl?: string
              - timestamp: timestamp
              - direction: 'incoming' | 'outgoing'
              - status: 'sent' | 'delivered' | 'read' | 'failed'
              - messageId: string (WhatsApp message ID)
  
  users/
    {userId}/
      - id: string (Firebase Auth UID)
      - email: string
      - displayName: string
      - photoURL?: string
      - projectIds: string[] (projects user has access to)
      - defaultProjectId?: string
      - createdAt: timestamp
      - lastLoginAt: timestamp
  ```

#### 2.3 Admin Dashboard
- **Login Page** (`/admin/login`)
  - Firebase Auth Google sign-in
  - "Sign in with Google" button
  - Clean, professional login interface
  - Automatic user profile creation on first login

- **Project Management**
  - Project selector dropdown in top-left header
  - Switch between different projects (e.g., "Las Lobas Tours", "Other Business")
  - Only show projects user has access to
  - Remember last selected project
  - Admin can only see data for selected project
  - "Add New Project" button next to project selector

- **Add New Project Modal** (`/admin/projects/new`)
  - Modal dialog triggered by "Add New Project" button
  - Form fields:
    - Project name (required)
    - Project description (optional)
  - "Create Project" button to save to database
  - Automatic project ID generation
  - Close modal and switch to new project after creation

- **Project Settings/Webhook Setup** (`/admin/projects/[id]/settings`)
  - WhatsApp Business configuration form:
    - Access Token (secure input field)
    - Webhook Verify Token (generated or manual)
    - Business Account ID
    - Phone Number ID
    - "Save Configuration" button
  - Webhook setup section:
    - Display webhook URL: `{domain}/api/webhooks/whatsapp/{projectId}`
    - "Copy to Clipboard" button for webhook URL
    - Instructions for setting up webhook in WhatsApp Business API
    - Test webhook functionality
  - Configuration status indicator (configured/not configured)

- **Conversations List Page** (`/admin/conversations`)
  - Display conversations only for currently selected project
  - Show: customer phone, last message preview, timestamp, unread count
  - Sort by: last message time (newest first)
  - Filter options: unread, archived, date range
  - Search by customer phone number
  - Pagination for large datasets
  - Real-time updates when new messages arrive
  - Project context maintained throughout navigation

- **Conversation Detail Page** (`/admin/conversations/[id]`)
  - Chat interface showing all messages in chronological order
  - Display message content, timestamp, direction (in/out)
  - Support for different message types (text, images, documents)
  - Auto-scroll to latest message
  - Mark messages as read when viewed
  - Real-time message updates
  - Ensure conversation belongs to current project

#### 2.4 Authentication & Security
- **Firebase Authentication**
  - Google OAuth sign-in
  - Admin user management through Firebase Console
  - Protected routes with authentication middleware
  - Automatic session management
  - Logout functionality
- **Project-Level Security**
  - Users can only access projects they own or are invited to
  - Project isolation - no cross-project data access
  - Webhook endpoints tied to specific projects
  - WhatsApp tokens isolated per project
- **Additional Security**
  - Webhook signature verification using project-specific verify tokens
  - WhatsApp access tokens encrypted in database
  - Firestore security rules with project-level access control
  - Secure token input fields with masking
  - Token validation before saving

### 3. Technical Architecture

#### 3.1 API Routes
- `POST /api/webhooks/whatsapp/[projectId]` - Receive WhatsApp events for specific project
- `GET /api/webhooks/whatsapp/[projectId]` - Webhook verification for specific project
- `GET /api/projects` - List user's projects (protected)
- `POST /api/projects` - Create new project (protected)
- `GET /api/projects/[projectId]` - Get project details and settings (protected)
- `PUT /api/projects/[projectId]` - Update project settings (protected)
- `POST /api/projects/[projectId]/whatsapp-config` - Save WhatsApp configuration (protected)
- `GET /api/projects/[projectId]/whatsapp-config` - Get WhatsApp configuration (protected, tokens masked)
- `POST /api/projects/[projectId]/test-webhook` - Test webhook configuration (protected)
- `GET /api/projects/[projectId]/conversations` - List conversations for project (protected)
- `GET /api/projects/[projectId]/conversations/[id]` - Get conversation details (protected)
- `PUT /api/projects/[projectId]/conversations/[id]/read` - Mark conversation as read (protected)
- `GET /api/user/profile` - Get user profile and default project (protected)

#### 3.2 Technologies
- **Frontend**: Next.js 15 with App Router, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Real-time**: Firebase real-time listeners

#### 3.3 Environment Variables Needed
```
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (for server-side)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Encryption key for storing WhatsApp tokens securely
ENCRYPTION_KEY=

# Application domain for webhook URLs
NEXT_PUBLIC_APP_DOMAIN=
```

#### 3.4 Firebase Configuration
- **Authentication Setup**
  - Enable Google OAuth provider
  - Configure authorized domains
  - Automatic user profile creation on first login

- **Firestore Security Rules**
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      // Users can only access their own profile
      match /users/{userId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Project-level access control
      match /projects/{projectId} {
        allow read, write: if request.auth != null && 
          request.auth.uid in resource.data.get('adminIds', []);
        
        match /conversations/{conversationId} {
          allow read, write: if request.auth != null && 
            request.auth.uid in get(/databases/$(database)/documents/projects/$(projectId)).data.get('adminIds', []);
          
          match /messages/{messageId} {
            allow read, write: if request.auth != null && 
              request.auth.uid in get(/databases/$(database)/documents/projects/$(projectId)).data.get('adminIds', []);
          }
        }
      }
    }
  }
  ```

### 4. Design System & UI Guidelines

#### 4.1 Component Library
- **Primary**: shadcn/ui components for all UI elements
- **Icons**: Lucide React (already configured)
- **Typography**: Geist Sans and Geist Mono fonts
- **Layout**: Responsive grid system using Tailwind CSS

#### 4.2 Color Palette & Theme (Apple-Inspired)
- **Apple Design Inspiration**
  - Clean, minimalist interface
  - Subtle shadows and depth
  - Consistent spacing and typography
  - Elegant color transitions

- **Color System**:
  ```css
  /* Light Mode */
  --background: 255 255 255;           /* Pure white */
  --foreground: 28 28 30;              /* Apple gray-900 */
  --primary: 0 122 255;                /* Apple blue */
  --primary-foreground: 255 255 255;
  --secondary: 242 242 247;            /* Apple gray-100 */
  --secondary-foreground: 28 28 30;
  --muted: 248 248 248;                /* Apple gray-50 */
  --muted-foreground: 99 99 102;       /* Apple gray-500 */
  --accent: 242 242 247;               /* Apple gray-100 */
  --accent-foreground: 28 28 30;
  --destructive: 255 59 48;            /* Apple red */
  --destructive-foreground: 255 255 255;
  --border: 209 213 219;               /* Apple gray-300 */
  --input: 242 242 247;                /* Apple gray-100 */
  --ring: 0 122 255;                   /* Apple blue */

  /* Dark Mode */
  --background: 0 0 0;                 /* Pure black */
  --foreground: 255 255 255;
  --primary: 10 132 255;               /* Apple blue (dark) */
  --primary-foreground: 255 255 255;
  --secondary: 28 28 30;               /* Apple gray-900 */
  --secondary-foreground: 255 255 255;
  --muted: 17 17 17;                   /* Apple gray-950 */
  --muted-foreground: 142 142 147;     /* Apple gray-400 */
  --accent: 28 28 30;                  /* Apple gray-900 */
  --accent-foreground: 255 255 255;
  --destructive: 255 69 58;            /* Apple red (dark) */
  --destructive-foreground: 255 255 255;
  --border: 56 56 58;                  /* Apple gray-800 */
  --input: 28 28 30;                   /* Apple gray-900 */
  --ring: 10 132 255;                  /* Apple blue (dark) */
  ```

#### 4.3 Theme Implementation
- **Dark/Light Mode Toggle**
  - System preference detection
  - Manual toggle in header
  - Persistent user preference storage
  - Smooth transitions between modes

- **Apple Design Patterns**
  - Rounded corners (border-radius: 8px, 12px, 16px)
  - Subtle shadows and blur effects
  - Clean typography hierarchy
  - Consistent spacing scale (4px, 8px, 12px, 16px, 24px, 32px)

### 5. User Interface Design

#### 5.1 Login Page
- Centered form with Firebase Auth Google integration
- "Sign in with Google" button using shadcn/ui Button component
- Apple-inspired styling with clean, professional design
- Automatic redirect after successful authentication
- Subtle animations and loading states

#### 5.2 Protected Layout
- Authentication wrapper for admin pages
- Automatic redirect to login if not authenticated
- Header with:
  - Project selector dropdown in top-left corner
  - User info display (name, avatar from Google)
  - Theme toggle button
  - Logout button
- Sidebar navigation with smooth transitions
- Project context persistence across navigation

#### 5.3 Conversations List
- Table component using shadcn/ui DataTable
- Card components for mobile responsive view
- Badge components for unread counts
- Avatar components with customer initials
- Search input with real-time filtering
- Pagination using shadcn/ui Pagination component
- Project-filtered data display
- Real-time updates within project context

#### 5.4 Chat Interface
- ScrollArea component for message container
- Custom message bubble components
- Tooltip components for timestamps
- Loading states with Skeleton components
- Empty states with proper messaging

#### 5.5 Navigation
- Sheet component for mobile sidebar
- Breadcrumb component for navigation context
- DropdownMenu for user actions
- Project selector dropdown with Select component
- Command palette for quick actions (future enhancement)

#### 5.6 Project Management UI
- **Add Project Modal**
  - Dialog component using shadcn/ui
  - Form with Input components for project name and description
  - Button components for "Create" and "Cancel"
  - Loading states during project creation
  - Form validation with error messages

- **Project Settings Page**
  - Card component for webhook configuration section
  - Code block component for webhook URL display
  - Button component with clipboard icon for copying URL
  - Alert component for setup instructions
  - Collapsible component for advanced webhook settings

### 6. Implementation Phases

#### Phase 1: Core Infrastructure
1. Firebase setup (Auth + Firestore)
2. Google OAuth authentication implementation
3. Multi-project data structure and security rules
4. Theme system implementation with light/dark modes
5. Protected routes with project context
6. WhatsApp webhook endpoint with project ID routing
7. Basic message storage with project association

#### Phase 2: Dashboard UI
1. Login page with Google OAuth and Apple-inspired design
2. Protected layout with project selector and theme toggle
3. Add New Project modal with form validation
4. Project settings page with webhook configuration
5. Conversations list page using shadcn/ui components (project-filtered)
6. Conversation detail page with chat interface
7. Responsive design implementation

#### Phase 3: Enhancements
1. Message type support (media, documents)
2. Advanced search and filtering
3. Message status tracking
4. Performance optimizations
5. Accessibility improvements

### 7. Success Criteria
- Admin can securely log in using Google OAuth
- Multi-project support with proper data isolation
- Project selector works seamlessly in header
- "Add New Project" functionality works with modal form
- Project settings page displays webhook URL with copy functionality
- Webhook endpoints correctly route messages to projects
- Admins only see conversations for selected project
- Seamless light/dark mode switching
- Apple-inspired design that feels native and professional
- Successfully receive and store WhatsApp messages with project context
- Real-time updates work correctly within project scope
- Responsive UI works perfectly on mobile and desktop
- Consistent use of shadcn/ui components throughout

### 8. Technical Specifications

#### 8.1 Component Requirements
- All interactive elements must use shadcn/ui components
- Custom components should follow shadcn/ui patterns
- Consistent prop interfaces across similar components
- Proper TypeScript definitions for all components

#### 8.2 Performance Requirements
- Initial page load under 2 seconds
- Real-time message updates under 100ms
- Smooth animations at 60fps
- Optimized bundle size with code splitting

#### 8.3 Accessibility Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Focus management for modal dialogs