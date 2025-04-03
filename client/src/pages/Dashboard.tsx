import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import ProjectModal from "@/components/projects/ProjectModal";
import Overview from "@/components/dashboard/Overview";
import ProjectsList from "@/components/dashboard/ProjectsList";
import WorkAnalytics from "@/components/dashboard/WorkAnalytics";
import HubermanRecommendations from "@/components/dashboard/HubermanRecommendations";
import AssistantChat from "@/components/dashboard/AssistantChat";
import PomodoroTimer from "@/components/dashboard/PomodoroTimer";
import DailyChecklist from "@/components/dashboard/DailyChecklist";

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header with Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Welcome back, Andrew. Here's your productivity overview.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button 
            onClick={() => setIsProjectModalOpen(true)}
            className="inline-flex items-center"
          >
            <span className="material-icons mr-2 text-sm">add</span>
            New Project
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={toggleTheme}
            className="w-10 h-10 p-0"
          >
            <span className="material-icons">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </Button>
        </div>
      </div>
      
      {/* Overview Cards */}
      <Overview />
      
      {/* First row: Pomodoro and Checklist */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
        <PomodoroTimer />
        <DailyChecklist />
      </div>
      
      {/* Second row: Projects and Recommendations */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ProjectsList />
          <WorkAnalytics />
        </div>
        
        <div className="space-y-6">
          <HubermanRecommendations />
          <AssistantChat />
        </div>
      </div>
      
      {/* Project Creation Modal */}
      <ProjectModal 
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </div>
  );
}
