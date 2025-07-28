"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Users, Settings, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AddProjectModal } from '@/components/add-project-modal';

export default function AdminDashboard() {
  const router = useRouter();
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  const handleCreateProject = () => {
    setShowAddProjectModal(true);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your WhatsApp admin panel. Select a project above or create a new one to get started.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/conversations')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Select a project to view conversations
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Select a project to view users
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Today</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Select a project to view analytics
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Create your first project
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>
              Get started with your WhatsApp admin panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-semibold">Create Your First Project</h4>
                <p className="text-sm text-muted-foreground">
                  Set up a new WhatsApp integration project
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleCreateProject}>
                Get Started
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
              <div>
                <h4 className="font-semibold">Configure WhatsApp</h4>
                <p className="text-sm text-muted-foreground">
                  Connect your WhatsApp Business account
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Coming Next
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg opacity-50">
              <div>
                <h4 className="font-semibold">Start Conversations</h4>
                <p className="text-sm text-muted-foreground">
                  Begin managing your WhatsApp conversations
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Final Step
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest admin panel activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">Create a project to see activity here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Project Modal */}
      <AddProjectModal
        open={showAddProjectModal}
        onOpenChange={setShowAddProjectModal}
        onProjectCreated={(projectId) => {
          // Refresh the page or navigate to the project
          router.push(`/admin/projects/${projectId}/settings`);
        }}
      />
    </div>
  );
} 