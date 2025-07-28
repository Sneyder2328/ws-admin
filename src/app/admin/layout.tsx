"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, MessageSquare, Settings, User, Loader2 } from 'lucide-react';
import { ProjectSelector } from '@/components/project-selector';
import { ThemeToggle } from '@/components/theme-toggle';
import { AddProjectModal } from '@/components/add-project-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    // Navigate to conversations for the selected project
    router.push('/admin/conversations');
  };

  const handleAddProject = () => {
    setShowAddProjectModal(true);
  };

  const handleSignOut = async () => {
    await logout();
    router.push('/admin/login');
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center space-x-6">
            {/* Logo/Title */}
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">WhatsApp Admin</span>
            </div>
            
            {/* Project Selector */}
            <ProjectSelector
              onProjectChange={handleProjectChange}
              onAddProject={handleAddProject}
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full transition-apple"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={user.photoURL || ''}
                      alt={user.displayName || ''}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getUserInitials(user.displayName || 'U')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.displayName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push('/admin/profile')}
                  className="transition-apple"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                {selectedProjectId && (
                  <DropdownMenuItem
                    onClick={() => router.push(`/admin/projects/${selectedProjectId}/settings`)}
                    className="transition-apple"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Project Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="transition-apple text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {selectedProjectId ? (
          children
        ) : (
          <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <div className="text-center space-y-4 animate-fade-in">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">No Project Selected</h2>
                <p className="text-muted-foreground max-w-md">
                  Select a project from the dropdown above or create a new project to get started.
                </p>
              </div>
              <Button onClick={handleAddProject} className="transition-apple">
                Create Your First Project
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Add Project Modal */}
      <AddProjectModal
        open={showAddProjectModal}
        onOpenChange={setShowAddProjectModal}
        onProjectCreated={(projectId) => {
          setSelectedProjectId(projectId);
          // The modal will navigate to settings, but we also update state
        }}
      />
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}