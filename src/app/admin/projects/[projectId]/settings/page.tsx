"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Copy, Eye, EyeOff, Check, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface WhatsAppConfig {
  accessToken: string;
  webhookVerifyToken: string;
  businessAccountId: string;
  phoneNumberId: string;
  isConfigured: boolean;
}

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const projectId = params.projectId as string;
  
  const [config, setConfig] = useState<WhatsAppConfig>({
    accessToken: '',
    webhookVerifyToken: '',
    businessAccountId: '',
    phoneNumberId: '',
    isConfigured: false,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [copied, setCopied] = useState(false);

  const webhookUrl = `${process.env.NEXT_PUBLIC_APP_DOMAIN}/api/webhooks/whatsapp/${projectId}`;

  useEffect(() => {
    if (status === 'authenticated' && projectId) {
      fetchConfig();
    }
  }, [status, projectId]);

  const fetchConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/projects/${projectId}/whatsapp-config`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.isConfigured && data.config) {
          setConfig({
            ...data.config,
            isConfigured: data.isConfigured,
          });
        }
      } else if (response.status !== 404) {
        setError('Failed to load configuration');
      }
    } catch (error) {
      console.error('Error fetching config:', error);
      setError('Failed to load configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config.accessToken.trim() || !config.webhookVerifyToken.trim() || 
        !config.businessAccountId.trim() || !config.phoneNumberId.trim()) {
      setError('All fields are required');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      const response = await fetch(`/api/projects/${projectId}/whatsapp-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: config.accessToken.trim(),
          webhookVerifyToken: config.webhookVerifyToken.trim(),
          businessAccountId: config.businessAccountId.trim(),
          phoneNumberId: config.phoneNumberId.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save configuration');
      }

      setSuccess('WhatsApp configuration saved successfully!');
      setConfig(prev => ({ ...prev, isConfigured: true }));
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Error saving config:', error);
      setError(error instanceof Error ? error.message : 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const generateVerifyToken = () => {
    const token = Math.random().toString(36).substring(2, 15) + 
                  Math.random().toString(36).substring(2, 15);
    setConfig(prev => ({ ...prev, webhookVerifyToken: token }));
  };

  const copyWebhookUrl = async () => {
    try {
      await navigator.clipboard.writeText(webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="transition-apple"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Project Settings</h1>
          <p className="text-muted-foreground">Configure your WhatsApp Business integration</p>
        </div>
      </div>

      {/* WhatsApp Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>WhatsApp Business Configuration</CardTitle>
          <CardDescription>
            Configure your WhatsApp Business API credentials to start receiving messages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token*</Label>
                <div className="relative">
                  <Input
                    id="accessToken"
                    type={showAccessToken ? "text" : "password"}
                    value={config.accessToken}
                    onChange={(e) => setConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                    placeholder="Enter your WhatsApp Business access token"
                    disabled={isSaving}
                    className="pr-10 transition-apple"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-9 w-9"
                    onClick={() => setShowAccessToken(!showAccessToken)}
                  >
                    {showAccessToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhookVerifyToken">Webhook Verify Token*</Label>
                <div className="flex space-x-2">
                  <Input
                    id="webhookVerifyToken"
                    value={config.webhookVerifyToken}
                    onChange={(e) => setConfig(prev => ({ ...prev, webhookVerifyToken: e.target.value }))}
                    placeholder="Webhook verification token"
                    disabled={isSaving}
                    className="transition-apple"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateVerifyToken}
                    disabled={isSaving}
                  >
                    Generate
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessAccountId">Business Account ID*</Label>
                <Input
                  id="businessAccountId"
                  value={config.businessAccountId}
                  onChange={(e) => setConfig(prev => ({ ...prev, businessAccountId: e.target.value }))}
                  placeholder="Your WhatsApp Business Account ID"
                  disabled={isSaving}
                  className="transition-apple"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumberId">Phone Number ID*</Label>
                <Input
                  id="phoneNumberId"
                  value={config.phoneNumberId}
                  onChange={(e) => setConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                  placeholder="Your WhatsApp phone number ID"
                  disabled={isSaving}
                  className="transition-apple"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                {success}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSaving}
                className="transition-apple"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Configuration'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Webhook Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Setup</CardTitle>
          <CardDescription>
            Configure this webhook URL in your WhatsApp Business API settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <div className="flex space-x-2">
              <Input
                value={webhookUrl}
                readOnly
                className="font-mono text-sm bg-muted"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyWebhookUrl}
                className="transition-apple"
              >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Verify Token</Label>
            <Input
              value={config.webhookVerifyToken || 'Configure token above first'}
              readOnly
              className="font-mono text-sm bg-muted"
            />
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Setup Instructions:</h4>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
              <li>Copy the webhook URL above</li>
              <li>Go to your WhatsApp Business API dashboard</li>
              <li>Navigate to Webhooks configuration</li>
              <li>Set the webhook URL and verify token</li>
              <li>Subscribe to message events</li>
            </ol>
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600 dark:text-blue-400 mt-2"
              onClick={() => window.open('https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks', '_blank')}
            >
              <ExternalLink className="mr-1 h-3 w-3" />
              View WhatsApp Webhook Documentation
            </Button>
          </div>

          {config.isConfigured && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
              <h4 className="font-medium text-green-900 dark:text-green-100">✅ Configuration Complete</h4>
              <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                Your WhatsApp integration is configured and ready to receive messages.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}