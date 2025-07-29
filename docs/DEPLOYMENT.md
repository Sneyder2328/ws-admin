# Deployment Guide

This guide covers deploying the WhatsApp Business Admin Panel to production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Firebase Configuration](#firebase-configuration)
- [Deployment Options](#deployment-options)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- Node.js 18+ installed locally
- Firebase project with Auth and Firestore enabled
- WhatsApp Business API access
- Domain name with SSL certificate
- Deployment platform account (Vercel, Netlify, etc.)

## Environment Setup

### 1. Environment Variables

Create production environment variables on your deployment platform:

```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Security
ENCRYPTION_KEY=your_32_character_encryption_key_here
NEXT_PUBLIC_APP_DOMAIN=https://your-production-domain.com
```

### 2. Generate Encryption Key

Generate a secure 32-character encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## Firebase Configuration

### 1. Authentication Setup

1. Go to Firebase Console → Authentication → Sign-in method
2. Enable Google provider
3. Add your production domain to authorized domains
4. Configure OAuth consent screen in Google Cloud Console

### 2. Firestore Setup

1. Create Firestore database in production mode
2. Set up security rules:

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
      // Users can access projects they own
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.ownerId;
      
      // Conversations within projects
      match /conversations/{conversationId} {
        allow read, write: if request.auth != null && 
          request.auth.uid == get(/databases/$(database)/documents/projects/$(projectId)).data.ownerId;
        
        // Messages within conversations
        match /messages/{messageId} {
          allow read, write: if request.auth != null && 
            request.auth.uid == get(/databases/$(database)/documents/projects/$(projectId)).data.ownerId;
        }
      }
    }
  }
}
```

### 3. Service Account Setup

1. Go to Firebase Console → Project Settings → Service accounts
2. Generate new private key
3. Download the JSON file
4. Extract the required values for environment variables

## Deployment Options

### Option 1: Vercel (Recommended)

Vercel provides excellent Next.js integration and automatic deployments.

#### Deploy with Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login and deploy:
```bash
vercel login
vercel --prod
```

3. Set environment variables:
```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add FIREBASE_PRIVATE_KEY
# Add all other environment variables
```

#### Deploy with Git Integration

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on git push

### Option 2: Netlify

1. Connect repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables in Netlify dashboard
5. Enable Edge Functions for API routes

### Option 3: Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

Build and deploy:
```bash
docker build -t ws-admin .
docker run -p 3000:3000 --env-file .env.production ws-admin
```

### Option 4: Traditional VPS

1. Set up Node.js on your server
2. Clone the repository
3. Install dependencies: `npm install`
4. Build the application: `npm run build`
5. Start with PM2:

```bash
npm install -g pm2
pm2 start npm --name "ws-admin" -- start
pm2 startup
pm2 save
```

## Post-Deployment

### 1. Verify Deployment

1. Check that the application loads correctly
2. Test Google OAuth login
3. Verify API endpoints are responding
4. Test webhook endpoint with WhatsApp

### 2. Configure WhatsApp Webhooks

For each project, update the webhook URL in WhatsApp Business API:

1. Go to WhatsApp Business API configuration
2. Set webhook URL: `https://your-domain.com/api/webhooks/whatsapp/[projectId]`
3. Set verify token (from project settings)
4. Subscribe to message events

### 3. SSL Certificate

Ensure your domain has a valid SSL certificate. Most deployment platforms handle this automatically.

### 4. Domain Configuration

1. Point your domain to the deployment
2. Update `NEXT_PUBLIC_APP_DOMAIN` environment variable
3. Add domain to Firebase authorized domains

## Monitoring

### 1. Application Monitoring

Set up monitoring for:
- Application uptime
- Response times
- Error rates
- Firebase usage

### 2. Firebase Monitoring

Monitor in Firebase Console:
- Authentication usage
- Firestore read/write operations
- Security rule violations
- Performance metrics

### 3. Webhook Monitoring

Monitor webhook delivery:
- Response times from WhatsApp
- Failed webhook deliveries
- Message processing errors

### 4. Log Monitoring

Set up log aggregation:
```javascript
// Add to your API routes for production logging
if (process.env.NODE_ENV === 'production') {
  console.log('Production log:', { 
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Message processed',
    projectId,
    messageId 
  });
}
```

## Security Considerations

### 1. Environment Variables

- Never commit environment variables to version control
- Use deployment platform's secure environment variable storage
- Rotate encryption keys periodically
- Use different Firebase projects for staging and production

### 2. API Security

- Enable CORS restrictions in production
- Implement rate limiting
- Monitor for suspicious activity
- Keep dependencies updated

### 3. Firebase Security

- Review Firestore security rules regularly
- Monitor authentication logs
- Set up billing alerts
- Enable audit logs

## Performance Optimization

### 1. Build Optimization

```javascript
// next.config.ts
const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};
```

### 2. Caching Strategy

- Enable CDN caching for static assets
- Implement API response caching
- Use Firebase connection pooling
- Optimize Firestore queries

### 3. Bundle Analysis

```bash
npm install --save-dev @next/bundle-analyzer
```

Add to `next.config.ts`:
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

Run analysis:
```bash
ANALYZE=true npm run build
```

## Troubleshooting

### Common Issues

#### 1. Firebase Connection Issues
```
Error: Could not load the default credentials
```
**Solution:** Verify Firebase environment variables are correctly set.

#### 2. Webhook Verification Fails
```
403 Forbidden - Invalid verification token
```
**Solution:** Check webhook verify token matches project configuration.

#### 3. Build Failures
```
Module not found: Can't resolve '@/components/...'
```
**Solution:** Ensure path aliases are configured in `tsconfig.json`.

#### 4. Authentication Redirects
```
Redirect URI mismatch
```
**Solution:** Add production domain to Firebase authorized domains.

### Debug Mode

Enable debug logging in production:
```env
DEBUG=1
NEXT_PUBLIC_DEBUG=1
```

### Health Check Endpoint

Create a health check endpoint:
```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version 
  });
}
```

## Rollback Strategy

### 1. Vercel Rollback
```bash
vercel rollback [deployment-url]
```

### 2. Docker Rollback
```bash
docker tag ws-admin:latest ws-admin:backup
docker pull ws-admin:previous-version
```

### 3. Database Rollback
- Keep Firestore backups
- Test rollback procedures
- Document schema changes

## Maintenance

### 1. Regular Updates

- Update dependencies monthly
- Monitor security advisories
- Test updates in staging first
- Keep Firebase SDK updated

### 2. Backup Strategy

- Export Firestore data regularly
- Backup environment configurations
- Document deployment procedures
- Test restore procedures

### 3. Monitoring Alerts

Set up alerts for:
- Application downtime
- High error rates
- Firebase quota limits
- SSL certificate expiration