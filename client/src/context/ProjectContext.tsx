import { createContext, useContext, useState, useEffect } from "react";
import { Project } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface ProjectContextType {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
  createProject: (project: Omit<Project, "id" | "createdAt" | "status" | "progress" | "files" | "timeLogged">) => Promise<Project>;
  updateProject: (id: number, project: Partial<Project>) => Promise<Project>;
  deleteProject: (id: number) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const userId = 1; // For demo purposes

  const { data: projects = [], isLoading, error } = useQuery<Project[]>({
    queryKey: ['/api/projects', userId],
    queryFn: async () => {
      const response = await fetch(`/api/projects?userId=${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      const data = await response.json();
      console.log('Fetched projects:', data);
      return Array.isArray(data) ? data : [];
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0
  });

  const createProjectMutation = useMutation({
    mutationFn: (newProject: Omit<Project, "id" | "createdAt" | "status" | "progress" | "files" | "timeLogged">) => 
      apiRequest('POST', '/api/projects', newProject).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', userId] });
    }
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, project }: { id: number, project: Partial<Project> }) => 
      apiRequest('PUT', `/api/project/${id}`, project).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', userId] });
    }
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/project/${id}`).then(() => {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', userId] });
    }
  });

  const createProject = async (project: Omit<Project, "id" | "createdAt" | "status" | "progress" | "files" | "timeLogged">) => {
    try {
      const result = await createProjectMutation.mutateAsync(project);
      await queryClient.invalidateQueries({ queryKey: ['/api/projects', userId] });
      await queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      return result;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const updateProject = async (id: number, project: Partial<Project>) => {
    return updateProjectMutation.mutateAsync({ id, project });
  };

  const deleteProject = async (id: number) => {
    return deleteProjectMutation.mutateAsync(id);
  };

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      isLoading, 
      error: error as Error, 
      createProject, 
      updateProject, 
      deleteProject 
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectProvider");
  }
  return context;
}