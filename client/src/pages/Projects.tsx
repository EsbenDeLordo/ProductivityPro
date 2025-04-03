import { useState } from "react";
import { useLocation } from "wouter";
import { useProjects } from "@/context/ProjectContext";
import { Project } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import ProjectModal from "@/components/projects/ProjectModal";
import ProjectCard from "@/components/projects/ProjectCard";
import ProjectDetail from "@/components/projects/ProjectDetail";

export default function Projects() {
  const { projects, isLoading } = useProjects();
  const [location, setLocation] = useLocation();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Check if there's a project ID in the URL
  const projectIdFromUrl = new URLSearchParams(location.split("?")[1]).get("id");
  
  // Find the selected project from the URL param, if available
  useState(() => {
    if (projectIdFromUrl && projects.length > 0) {
      const project = projects.find(p => p.id.toString() === projectIdFromUrl);
      if (project) {
        setSelectedProject(project);
      }
    }
  });
  
  // Filter projects based on search and filter criteria
  const filteredProjects = projects.filter(project => {
    // Apply search filter
    const matchesSearch = 
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      (project.description?.toLowerCase().includes(search.toLowerCase()));
    
    // Apply type filter
    const matchesFilter = filter === "all" || project.type === filter;
    
    return matchesSearch && matchesFilter;
  });
  
  // Handle project selection
  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setLocation(`/projects?id=${project.id}`);
  };
  
  // Handle project update
  const handleProjectUpdate = (updatedProject: Project) => {
    setSelectedProject(updatedProject);
  };
  
  // Handle back to projects list
  const handleBackToProjects = () => {
    setSelectedProject(null);
    setLocation("/projects");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {selectedProject ? (
        <ProjectDetail 
          project={selectedProject}
          onUpdate={handleProjectUpdate}
          onClose={handleBackToProjects}
        />
      ) : (
        <>
          {/* Header with Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage and organize all your projects</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button onClick={() => setIsProjectModalOpen(true)}>
                <span className="material-icons mr-2 text-sm">add</span>
                New Project
              </Button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search projects..."
              className="md:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="md:w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="research">Research</SelectItem>
                <SelectItem value="guide">Guide</SelectItem>
                <SelectItem value="podcast">Podcast</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Projects Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <span className="material-icons text-4xl text-gray-400 animate-pulse">hourglass_top</span>
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading projects...</p>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard 
                  key={project.id} 
                  project={project}
                  onSelect={handleSelectProject}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
              <span className="material-icons text-4xl text-gray-400">folder_off</span>
              <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No projects found</h3>
              <p className="mt-1 text-gray-500 dark:text-gray-400">
                {search || filter !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "Create your first project to get started"}
              </p>
              <Button onClick={() => setIsProjectModalOpen(true)} className="mt-4">
                <span className="material-icons mr-2 text-sm">add</span>
                Create Project
              </Button>
            </div>
          )}
          
          {/* Project Creation Modal */}
          <ProjectModal
            isOpen={isProjectModalOpen}
            onClose={() => setIsProjectModalOpen(false)}
          />
        </>
      )}
    </div>
  );
}
