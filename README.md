# WhatsApp Business Admin Panel

A modern, multi-project admin dashboard for managing WhatsApp Business conversations built with Next.js 15, Firebase, and shadcn/ui.

## Features

- 🔐 **Secure Authentication** - Google OAuth with Firebase Auth
- 🏢 **Multi-Project Support** - Manage multiple WhatsApp Business accounts
- 💬 **Real-time Messaging** - Live conversation updates with Firebase listeners
- 🔗 **Webhook Integration** - Receives WhatsApp Business API webhooks
- 🎨 **Modern UI** - Apple-inspired design with dark/light themes using shadcn/ui
- 📱 **Responsive Design** - Mobile-first approach for all devices
- 🔒 **Security First** - Encrypted token storage and project-level access control

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API routes, Firebase Admin SDK
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth with Google OAuth
- **UI**: shadcn/ui components, Tailwind CSS v4
- **Icons**: Lucide React
- **Encryption**: crypto-js for secure token storage

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Auth and Firestore enabled
- Google OAuth configured in Firebase
- WhatsApp Business API access

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ws-admin
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in the required Firebase and security configuration variables.

4. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com

# Security
ENCRYPTION_KEY=your_32_character_encryption_key
NEXT_PUBLIC_APP_DOMAIN=https://your-domain.com
```

## Project Structure

```
src/
├── app/
│   ├── admin/                    # Protected admin dashboard
│   │   ├── conversations/        # Message management interface
│   │   ├── projects/            # Project settings and configuration
│   │   └── login/               # Authentication pages
│   ├── api/                     # API routes
│   │   ├── webhooks/whatsapp/   # WhatsApp webhook handlers
│   │   ├── projects/            # Project CRUD operations
│   │   └── user/                # User profile management
│   └── privacy/                 # Public privacy policy pages
├── components/
│   ├── ui/                      # shadcn/ui base components
│   ├── auth/                    # Authentication components
│   ├── project-selector.tsx     # Multi-project dropdown
│   └── theme-toggle.tsx         # Dark/light mode toggle
├── contexts/
│   └── AuthContext.tsx          # Firebase auth state management
└── lib/
    ├── firebase.ts              # Firebase configuration
    ├── types.ts                 # TypeScript definitions
    └── utils.ts                 # Utility functions
```

## Usage

### Setting Up a New Project

1. Sign in with your Google account
2. Click "Add New Project" in the project selector
3. Enter project name and description
4. Configure WhatsApp settings in Project Settings
5. Set up the webhook URL in your WhatsApp Business API configuration

### Managing Conversations

- View all conversations for the selected project
- Real-time message updates
- Search and filter conversations
- Mark conversations as read/unread

## API Routes

### Webhook Endpoints
- `POST /api/webhooks/whatsapp/[projectId]` - Receive WhatsApp events
- `GET /api/webhooks/whatsapp/[projectId]` - Webhook verification

### Project Management
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `GET/PUT /api/projects/[projectId]` - Project details and settings

### Conversations
- `GET /api/projects/[projectId]/conversations` - List conversations
- `GET /api/projects/[projectId]/conversations/[id]` - Conversation details

## Development

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

This project uses:
- ESLint with Next.js configuration
- Prettier for code formatting
- TypeScript strict mode
- shadcn/ui component patterns

## Documentation

- [API Documentation](./docs/API.md) - Detailed API reference
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment instructions
- [Contributing Guidelines](./docs/CONTRIBUTING.md) - Development guidelines

## Security

- All WhatsApp tokens are encrypted before storage
- Project-level access control with Firestore security rules
- Webhook signature verification
- Protected API routes with authentication middleware

## License

This project is licensed under the MIT License.
