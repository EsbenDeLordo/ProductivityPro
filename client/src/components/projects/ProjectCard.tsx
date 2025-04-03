import { Project } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
}

export default function ProjectCard({ project, onSelect }: ProjectCardProps) {
  // Format time logged (minutes to hours and minutes)
  const formatTimeLogged = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Calculate days until deadline
  const getDaysUntilDeadline = () => {
    if (!project.deadline) return "No deadline";
    
    const deadline = new Date(project.deadline);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? `Due in ${diffDays} days` : "Overdue";
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelect(project)}>
      <CardContent className="p-5">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 p-2 rounded-md" style={{ backgroundColor: `${project.colorCode}20` }}>
            <span className="material-icons" style={{ color: project.colorCode }}>{project.icon}</span>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{project.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">Progress</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" indicatorColor={project.colorCode} />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Status</p>
            <p className="font-medium text-gray-900 dark:text-white">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                project.progress >= 60 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
              }`}>
                {project.progress >= 60 ? "On track" : "Needs attention"}
              </span>
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Deadline</p>
            <p className="font-medium text-gray-900 dark:text-white">{getDaysUntilDeadline()}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Time Logged</p>
            <p className="font-medium text-gray-900 dark:text-white">{formatTimeLogged(project.timeLogged)}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Files</p>
            <p className="font-medium text-gray-900 dark:text-white">{project.files}</p>
          </div>
        </div>
        
        <div className="mt-4 flex justify-between">
          <Button variant="outline" size="sm">
            <span className="material-icons text-sm mr-1">visibility</span>
            View
          </Button>
          <Button size="sm" style={{ backgroundColor: project.colorCode }}>
            <span className="material-icons text-sm mr-1">schedule</span>
            Start Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
