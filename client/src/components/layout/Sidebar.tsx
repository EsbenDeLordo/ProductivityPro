import { useState } from "react";
import { Link, useLocation } from "wouter";
import { User } from "@shared/schema";
import { Separator } from "@/components/ui/separator";
import { useProjects } from "@/context/ProjectContext";

interface SidebarProps {
  user: User;
}

export default function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();
  const { projects, isLoading } = useProjects();
  
  const navigationItems = [
    { path: "/", label: "Dashboard", icon: "dashboard" },
    { path: "/projects", label: "Projects", icon: "folder" },
    { path: "/analytics", label: "Analytics", icon: "analytics" },
    { path: "/assistant", label: "AI Assistant", icon: "smart_toy" },
    { path: "/recommendations", label: "Recommendations", icon: "lightbulb" },
    { path: "/content-tools", label: "Content Tools", icon: "description" }
  ];
  
  // Get the most recent 3 projects
  const recentProjects = projects.slice(0, 3);

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-lg font-semibold flex items-center">
          <span className="text-primary">Pocket</span>&nbsp;WinDryft Pro
        </h1>
        <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <span className="material-icons text-gray-500 dark:text-gray-400">menu</span>
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <Link 
                href={item.path}
                className={`flex items-center px-4 py-2 text-sm rounded-lg ${
                  location === item.path 
                    ? "bg-primary text-white" 
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span className="material-icons mr-3">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        
        {!isLoading && recentProjects.length > 0 && (
          <div className="mt-8 px-4">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Recent Projects
            </h3>
            <ul className="mt-2 space-y-1">
              {recentProjects.map((project) => (
                <li key={project.id}>
                  <Link 
                    href={`/projects?id=${project.id}`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <span 
                      className="w-2 h-2 mr-3 rounded-full" 
                      style={{ backgroundColor: project.colorCode }}
                    ></span>
                    <span>{project.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <img 
            src={user.avatar || "https://via.placeholder.com/32"} 
            alt="User profile" 
            className="w-8 h-8 rounded-full mr-3"
          />
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
