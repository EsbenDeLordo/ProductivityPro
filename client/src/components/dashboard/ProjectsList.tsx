import { Link } from "wouter";
import { useProjects } from "@/context/ProjectContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Project } from "@shared/schema";
import { ProgressBar } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export function ProjectCard({ project }: { project: Project }) {
  // Format time logged (minutes to hours and minutes)
  const formatTimeLogged = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Calculate days until deadline
  const getDaysUntilDeadline = () => {
    if (!project.deadline) return null;
    
    const deadline = new Date(project.deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? `Due in ${diffDays} days` : "Overdue";
  };

  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="material-icons" style={{ color: project.colorCode }}>{project.icon}</span>
          <div className="ml-3">
            <h3 className="text-md font-medium text-gray-900 dark:text-white">{project.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="mr-4">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              project.progress >= 60 
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
            }`}>
              {project.progress >= 60 ? "On track" : "Needs attention"}
            </span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">{project.progress}%</span>
          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full ml-2">
            <div 
              className="h-2 rounded-full" 
              style={{ 
                width: `${project.progress}%`,
                backgroundColor: project.colorCode
              }}
            ></div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center text-sm">
        <span className="material-icons text-gray-400 text-xs mr-1">calendar_today</span>
        <span className="text-gray-500 dark:text-gray-400">{getDaysUntilDeadline() || "No deadline"}</span>
        <span className="mx-2 text-gray-500 dark:text-gray-400">•</span>
        <span className="material-icons text-gray-400 text-xs mr-1">folder_open</span>
        <span className="text-gray-500 dark:text-gray-400">{project.files} files</span>
        <span className="mx-2 text-gray-500 dark:text-gray-400">•</span>
        <span className="material-icons text-gray-400 text-xs mr-1">schedule</span>
        <span className="text-gray-500 dark:text-gray-400">{formatTimeLogged(project.timeLogged)} logged</span>
      </div>
    </div>
  );
}

export default function ProjectsList() {
  const { projects, isLoading } = useProjects();
  
  // Take only the first 3 projects for the dashboard view
  const displayProjects = projects.slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-lg font-medium">Current Projects</CardTitle>
        <Link href="/projects">
          <Button variant="link" className="text-sm font-medium text-primary">
            View all
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="px-6 py-5 divide-y divide-gray-200 dark:divide-gray-700">
        {isLoading ? (
          <p className="py-4 text-center text-gray-500 dark:text-gray-400">Loading projects...</p>
        ) : displayProjects.length > 0 ? (
          displayProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <p className="py-4 text-center text-gray-500 dark:text-gray-400">No projects found</p>
        )}
      </CardContent>
    </Card>
  );
}
