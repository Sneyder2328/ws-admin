# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack (runs on http://localhost:3000)
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint with Next.js configuration and TypeScript checks

## Project Overview

This is a WhatsApp Business Admin Panel built with Next.js 15, designed for multi-project message management with Firebase backend. The application handles WhatsApp webhook events, stores conversations in Firestore, and provides an admin dashboard for customer support teams.

## Architecture Overview

### Core Technologies
- **Frontend**: Next.js 15 with App Router, React 19, TypeScript 5
- **Backend**: Next.js API routes with Firebase Admin SDK
- **Database**: Firebase Firestore with real-time listeners
- **Authentication**: Firebase Auth with Google OAuth
- **UI Framework**: shadcn/ui components with Tailwind CSS v4
- **Styling**: Custom Apple-inspired design system with dark/light themes

### Key Features
- **Multi-project support**: Each admin can manage multiple WhatsApp Business accounts
- **Real-time messaging**: Live conversation updates using Firebase listeners
- **Webhook integration**: Receives WhatsApp Business API webhooks per project
- **Secure authentication**: Google OAuth with project-level access control
- **Responsive design**: Mobile-first approach with shadcn/ui components

### Application Structure

```
src/
├── app/
│   ├── admin/                    # Protected admin dashboard
│   │   ├── layout.tsx           # Admin layout with project selector
│   │   ├── login/page.tsx       # Google OAuth login page
│   │   ├── page.tsx             # Admin dashboard home
│   │   ├── conversations/       # Message management
│   │   └── projects/            # Project settings and configuration
│   ├── api/                     # API routes
│   │   ├── webhooks/whatsapp/   # WhatsApp webhook endpoints
│   │   ├── projects/            # Project CRUD operations
│   │   ├── user/profile/        # User profile management
│   │   └── privacy/             # Privacy policy generation
│   ├── privacy/                 # Public privacy policy pages
│   └── globals.css             # Global styles and theme variables
├── components/
│   ├── auth/                    # Authentication components
│   ├── ui/                      # shadcn/ui base components
│   ├── add-project-modal.tsx    # Project creation modal
│   ├── project-selector.tsx     # Multi-project dropdown
│   ├── theme-provider.tsx       # Theme context provider
│   └── theme-toggle.tsx         # Dark/light mode toggle
├── contexts/
│   └── AuthContext.tsx          # Firebase auth state management
├── lib/
│   ├── firebase.ts              # Client-side Firebase config
│   ├── firebase-admin.ts        # Server-side Firebase admin
│   ├── firebase-utils.ts        # Firestore helper functions
│   ├── encryption.ts            # Token encryption utilities
│   ├── auth-utils.ts            # Authentication helpers
│   ├── types.ts                 # TypeScript type definitions
│   └── utils.ts                 # General utility functions
└── middleware.ts                # Route protection middleware
```

### Data Architecture

**Firestore Collections:**
- `projects/{projectId}` - Project configuration and WhatsApp settings
- `projects/{projectId}/conversations/{conversationId}` - Customer conversations
- `projects/{projectId}/conversations/{conversationId}/messages/{messageId}` - Individual messages
- `users/{userId}` - User profiles and project access

**Key Types** (from `src/lib/types.ts`):
- `User` - Admin user with project access list
- `Project` - WhatsApp Business account configuration
- `WhatsAppConfig` - Encrypted token storage for WhatsApp API
- `Conversation` - Customer conversation metadata
- `Message` - Individual message with media support

### API Architecture

**Webhook Endpoints:**
- `POST /api/webhooks/whatsapp/[projectId]` - Receive WhatsApp events for specific project
- `GET /api/webhooks/whatsapp/[projectId]` - Webhook verification

**Project Management:**
- `GET/POST /api/projects` - List/create projects
- `GET/PUT /api/projects/[projectId]` - Project details and settings
- `POST /api/projects/[projectId]/whatsapp-config` - WhatsApp configuration

**Conversation Management:**
- `GET /api/projects/[projectId]/conversations` - List conversations
- `GET /api/projects/[projectId]/conversations/[id]` - Conversation details

### Authentication & Security

- Firebase Auth with Google OAuth provider
- Project-level access control via Firestore security rules
- WhatsApp access tokens encrypted using `crypto-js`
- Route protection via `src/middleware.ts`
- Webhook signature verification for security

### Component System

**shadcn/ui Configuration:**
- Style: "new-york" with neutral base color
- CSS variables enabled for theme customization
- Lucide React icons throughout
- Custom Apple-inspired color palette in both light and dark modes

**Key Components:**
- `AuthGuard` - Route protection wrapper
- `ProjectSelector` - Multi-project dropdown in header
- `AddProjectModal` - Project creation dialog
- `ThemeProvider` - Dark/light mode context
- Custom UI components built on shadcn/ui foundation

### Environment Variables Required

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Security
ENCRYPTION_KEY=                # For encrypting WhatsApp tokens
NEXT_PUBLIC_APP_DOMAIN=       # For webhook URL generation
```

### Development Workflow

1. **Firebase Setup**: Ensure Firebase project is configured with Auth and Firestore
2. **Environment**: Copy required environment variables
3. **Dependencies**: Run `npm install` to install all packages
4. **Development**: Use `npm run dev` with Turbopack for fast builds
5. **Linting**: Always run `npm run lint` before committing changes
6. **Project Context**: All features operate within selected project scope

### Important Patterns

- **Project Isolation**: All data access is scoped to the currently selected project
- **Real-time Updates**: Use Firebase listeners for live conversation updates
- **Error Handling**: Consistent error boundaries and user feedback
- **Theme System**: Apple-inspired design with seamless dark/light mode
- **Security First**: Never expose encrypted tokens or sensitive data
- **Component Reuse**: Leverage shadcn/ui components consistently