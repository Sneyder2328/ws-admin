import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;
    
    // Fetch project data from Firebase
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    
    if (!projectSnap.exists()) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    const projectData = projectSnap.data();
    const projectName = projectData.name || 'Business';
    const projectDescription = projectData.description || '';
    const updatedAt = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const privacyPolicyContent = generatePrivacyPolicy({
      projectName,
      projectDescription,
      updatedAt,
      projectId
    });
    
    return new NextResponse(privacyPolicyContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
    
  } catch (error) {
    console.error('Error generating privacy policy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

interface PrivacyPolicyParams {
  projectName: string;
  projectDescription: string;
  updatedAt: string;
  projectId: string;
}

function generatePrivacyPolicy({
  projectName,
  projectDescription,
  updatedAt,
  projectId
}: PrivacyPolicyParams): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy - ${projectName}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
            background-color: #fff;
        }
        h1 {
            color: #1a1a1a;
            border-bottom: 2px solid #007AFF;
            padding-bottom: 10px;
        }
        h2 {
            color: #007AFF;
            margin-top: 30px;
        }
        h3 {
            color: #555;
            margin-top: 25px;
        }
        .highlight {
            background-color: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #007AFF;
            margin: 20px 0;
        }
        .contact-info {
            background-color: #f1f3f4;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .last-updated {
            font-style: italic;
            color: #666;
            margin-bottom: 30px;
        }
        ul, ol {
            margin: 10px 0 10px 20px;
        }
        li {
            margin: 5px 0;
        }
        @media (max-width: 600px) {
            body {
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <h1>Privacy Policy - ${projectName}</h1>
    
    <p class="last-updated"><strong>Last Updated:</strong> ${updatedAt}</p>
    
    <h2>Introduction</h2>
    <p>${projectName} ("we," "our," or "us") is committed to protecting your privacy. ${projectDescription ? `As a ${projectDescription.toLowerCase()}, we` : 'We'} provide WhatsApp Business services and maintain this Privacy Policy to explain how we collect, use, and protect your information when you interact with our messaging services.</p>
    
    <h2>Information We Collect</h2>
    
    <h3>WhatsApp Communications</h3>
    <ul>
        <li><strong>Message Content:</strong> Text messages, images, documents, audio, video, and other media you send via WhatsApp</li>
        <li><strong>Contact Information:</strong> Your phone number and display name from WhatsApp</li>
        <li><strong>Message Metadata:</strong> Timestamps, delivery status, read receipts, and conversation history</li>
        <li><strong>Location Data:</strong> Location information if you choose to share it with us</li>
    </ul>
    
    <h3>Administrative Data</h3>
    <ul>
        <li><strong>Google Account Information:</strong> When admin users sign in, we collect basic profile information (name, email, profile photo) via Google OAuth</li>
        <li><strong>User Session Data:</strong> Login timestamps and session management information</li>
        <li><strong>System Logs:</strong> API requests, webhook events, and system performance data</li>
    </ul>
    
    <h2>How We Use Your Information</h2>
    
    <h3>Customer Service</h3>
    <ul>
        <li><strong>Service Delivery:</strong> Process your inquiries, bookings, and customer support requests</li>
        <li><strong>Response Management:</strong> Enable our team to respond to your messages and provide assistance</li>
        <li><strong>Service Improvement:</strong> Analyze communication patterns to improve our customer service</li>
        <li><strong>Business Operations:</strong> Manage bookings, schedules, and customer relationships</li>
    </ul>
    
    <h3>Administrative Functions</h3>
    <ul>
        <li><strong>User Authentication:</strong> Verify admin user identities and manage system access</li>
        <li><strong>Data Organization:</strong> Organize messages by project and conversation for efficient management</li>
        <li><strong>Security Monitoring:</strong> Monitor system access and detect unauthorized activities</li>
    </ul>
    
    <h2>Data Storage and Security</h2>
    
    <div class="highlight">
        <h3>Firebase Cloud Services</h3>
        <ul>
            <li>All message data is stored securely in Google Firebase Firestore</li>
            <li>Data is encrypted in transit and at rest using industry-standard encryption</li>
            <li>Access is restricted through Firebase Authentication and security rules</li>
            <li>Regular security audits and monitoring are performed</li>
        </ul>
    </div>
    
    <h3>Access Controls</h3>
    <ul>
        <li><strong>Project Isolation:</strong> Data is segregated by project with no cross-project access</li>
        <li><strong>Admin Authentication:</strong> Only authorized administrators can access conversation data</li>
        <li><strong>Token Security:</strong> WhatsApp access tokens are encrypted before storage</li>
        <li><strong>Role-Based Access:</strong> Different permission levels for different administrative functions</li>
    </ul>
    
    <h3>Data Retention</h3>
    <ul>
        <li><strong>Message History:</strong> Conversations are retained to provide continuous customer service</li>
        <li><strong>User Profiles:</strong> Admin user data is retained while accounts remain active</li>
        <li><strong>System Logs:</strong> Technical logs are retained for security and performance monitoring</li>
        <li><strong>Archival Policy:</strong> Inactive conversations may be archived but remain accessible</li>
    </ul>
    
    <h2>Third-Party Services</h2>
    
    <h3>WhatsApp Business API (Meta)</h3>
    <ul>
        <li>We use Meta's WhatsApp Business API to send and receive messages</li>
        <li>Your communications are subject to WhatsApp's Terms of Service and Privacy Policy</li>
        <li>Message delivery and processing follow WhatsApp's technical specifications</li>
        <li>Meta may process message metadata for delivery and security purposes</li>
    </ul>
    
    <h3>Google Services</h3>
    <ul>
        <li><strong>Firebase:</strong> For data storage, authentication, and real-time updates</li>
        <li><strong>Google OAuth:</strong> For admin user authentication</li>
        <li><strong>Google Cloud:</strong> Underlying infrastructure for Firebase services</li>
    </ul>
    
    <h2>Your Rights and Choices</h2>
    
    <h3>Message Communications</h3>
    <ul>
        <li><strong>Opt-out:</strong> You can stop receiving messages by blocking our WhatsApp number</li>
        <li><strong>Data Access:</strong> Contact us to request information about your stored messages</li>
        <li><strong>Data Correction:</strong> Request correction of inaccurate personal information</li>
        <li><strong>Data Deletion:</strong> Request deletion of your conversation history</li>
        <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
    </ul>
    
    <h3>Admin Users</h3>
    <ul>
        <li><strong>Account Management:</strong> Control your admin account settings and access</li>
        <li><strong>Data Portability:</strong> Request export of your administrative data</li>
        <li><strong>Account Deletion:</strong> Request deletion of your admin account and associated data</li>
    </ul>
    
    <h2>Data Sharing</h2>
    <p>We do not sell, rent, or share your personal information with third parties except:</p>
    <ul>
        <li><strong>Service Providers:</strong> Firebase/Google Cloud for data storage and system operations</li>
        <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
        <li><strong>Business Operations:</strong> Internal use for customer service and system administration</li>
        <li><strong>With Your Consent:</strong> When you explicitly consent to sharing your information</li>
    </ul>
    
    <h2>International Data Transfers</h2>
    <p>Your data may be processed and stored in countries where Firebase and Google Cloud operate, including the United States and European Union. We ensure appropriate safeguards are in place for international data transfers in compliance with applicable data protection laws, including Standard Contractual Clauses and adequacy decisions.</p>
    
    <h2>Children's Privacy</h2>
    <p>Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately, and we will take steps to remove that information.</p>
    
    <h2>Changes to This Policy</h2>
    <p>We may update this Privacy Policy periodically to reflect changes in our practices or applicable laws. We will notify you of significant changes by:</p>
    <ul>
        <li>Posting the updated policy at this URL</li>
        <li>Sending notifications through our WhatsApp Business account</li>
        <li>Including update notices in our admin panel</li>
        <li>Providing at least 30 days notice for material changes</li>
    </ul>
    
    <div class="contact-info">
        <h2>Contact Information</h2>
        <p>For questions about this Privacy Policy, to exercise your data rights, or for any privacy-related concerns:</p>
        
        <p><strong>${projectName}</strong><br>
        <strong>WhatsApp:</strong> [Configure in project settings]<br>
        <strong>Email:</strong> [Configure in project settings]<br>
        <strong>Address:</strong> [Configure in project settings]</p>
        
        <p><strong>Data Protection Officer:</strong> [Configure in project settings]</p>
        
        <p><em>Note: Contact information can be configured in the project settings of your admin panel.</em></p>
    </div>
    
    <h2>Legal Compliance</h2>
    <p>This Privacy Policy is designed to comply with:</p>
    <ul>
        <li>General Data Protection Regulation (GDPR) - EU</li>
        <li>California Consumer Privacy Act (CCPA) - California, USA</li>
        <li>WhatsApp Business API Terms of Service</li>
        <li>Meta's Platform Policies and Terms</li>
        <li>Other applicable local and international data protection laws</li>
    </ul>
    
    <div class="highlight">
        <p><strong>Generated for:</strong> ${projectName}</p>
        <p><strong>Project ID:</strong> ${projectId}</p>
        <p><strong>Generated on:</strong> ${updatedAt}</p>
    </div>
    
    <hr style="margin: 40px 0; border: none; border-top: 1px solid #ddd;">
    
    <p style="text-align: center; color: #666; font-size: 14px;">
        <em>This privacy policy is specifically designed for WhatsApp Business API integration and admin panel operations.</em>
    </p>
</body>
</html>`;
}