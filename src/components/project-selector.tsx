"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, ChevronDown } from 'lucide-react';
import { Project } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface ProjectSelectorProps {
  onProjectChange: (projectId: string) => void;
  onAddProject: () => void;
}

export function ProjectSelector({ onProjectChange, onAddProject }: ProjectSelectorProps) {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProjects();
    }
  }, [session?.user?.id]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
        
        // Auto-select first project if available and none selected
        if (data.projects?.length > 0 && !selectedProject) {
          const firstProject = data.projects[0];
          setSelectedProject(firstProject.id);
          onProjectChange(firstProject.id);
        }
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProject(projectId);
    onProjectChange(projectId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-9 w-48 bg-muted animate-pulse rounded-md" />
        <div className="h-9 w-9 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Select value={selectedProject} onValueChange={handleProjectChange}>
        <SelectTrigger className="w-48 transition-apple">
          <SelectValue placeholder="Select a project" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              <div className="flex flex-col">
                <span className="font-medium">{project.name}</span>
                {project.description && (
                  <span className="text-xs text-muted-foreground">
                    {project.description}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
          {projects.length === 0 && (
            <SelectItem value="" disabled>
              No projects found
            </SelectItem>
          )}
        </SelectContent>
      </Select>
      
      <Button
        variant="outline"
        size="icon"
        onClick={onAddProject}
        className="transition-apple"
        title="Add new project"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}