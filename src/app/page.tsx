'use client'

import { useAuth } from "@/contexts/AuthContext";
import { LoginButton } from "@/components/auth/LoginButton";
import { UserProfile } from "@/components/auth/UserProfile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MessageCircle, Shield, Users } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white/70">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <header className="flex justify-between items-center mb-12">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white">WhatsApp Admin Panel</h1>
            </div>
            <UserProfile />
          </header>
          
          <main className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Welcome to your admin panel!
              </h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                You are successfully logged in and ready to manage your WhatsApp conversations, 
                analyze user interactions, and maintain your communication platform.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader className="text-center">
                  <MessageCircle className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <CardTitle>Conversations</CardTitle>
                  <CardDescription className="text-white/70">
                    Manage and monitor all WhatsApp conversations
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader className="text-center">
                  <Users className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <CardTitle>Users</CardTitle>
                  <CardDescription className="text-white/70">
                    Track user engagement and manage accounts
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
                <CardHeader className="text-center">
                  <Shield className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <CardTitle>Security</CardTitle>
                  <CardDescription className="text-white/70">
                    Monitor security and manage permissions
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl"></div>
        </div>

        <div className="relative">
          {/* Logo and branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-6">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              WhatsApp Admin Panel
            </h1>
            <p className="text-white/70 text-lg">
              Professional communication management
            </p>
          </div>

          {/* Sign in card */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl">
            <CardHeader className="space-y-6 text-center pb-8">
              <div className="space-y-3">
                <CardTitle className="text-2xl font-semibold text-white">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-white/70 text-base">
                  Sign in to access your admin dashboard and manage your WhatsApp conversations with powerful tools and insights.
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <LoginButton />
              
              <div className="text-center">
                <p className="text-sm text-white/50">
                  By signing in, you agree to our{' '}
                  <a href="#" className="text-white/70 hover:text-white underline">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-white/70 hover:text-white underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features preview */}
          <div className="mt-12 grid grid-cols-3 gap-4 text-center">
            <div className="text-white/60">
              <MessageCircle className="h-6 w-6 mx-auto mb-2" />
              <p className="text-xs">Real-time Chat</p>
            </div>
            <div className="text-white/60">
              <Users className="h-6 w-6 mx-auto mb-2" />
              <p className="text-xs">User Management</p>
            </div>
            <div className="text-white/60">
              <Shield className="h-6 w-6 mx-auto mb-2" />
              <p className="text-xs">Secure Access</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
