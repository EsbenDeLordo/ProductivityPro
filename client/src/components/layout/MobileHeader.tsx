import { useState } from "react";
import { Link, useLocation } from "wouter";
import { User } from "@shared/schema";
import { useTheme } from "@/hooks/use-theme";
import Sidebar from "./Sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MobileHeaderProps {
  user: User;
}

export default function MobileHeader({ user }: MobileHeaderProps) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  
  // Based on the current location, get the title
  const getTitle = () => {
    switch (location) {
      case "/":
        return "Dashboard";
      case "/projects":
        return "Projects";
      case "/analytics":
        return "Analytics";
      case "/assistant":
        return "AI Assistant";
      case "/recommendations":
        return "Recommendations";
      case "/content-tools":
        return "Content Tools";
      default:
        return "Pocket WinDryft Pro";
    }
  };

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
      <div className="flex items-center justify-between px-4 h-16">
        <Sheet>
          <SheetTrigger asChild>
            <button className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
              <span className="material-icons text-gray-500 dark:text-gray-400">menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar user={user} />
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-semibold">
          <span className="text-primary">Pocket</span>&nbsp;WinDryft Pro
        </h1>
        <div className="flex items-center">
          <button 
            onClick={toggleTheme}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 mr-2"
          >
            <span className="material-icons text-gray-500 dark:text-gray-400">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <img 
            src={user.avatar || "https://via.placeholder.com/32"} 
            alt="User profile" 
            className="w-8 h-8 rounded-full"
          />
        </div>
      </div>
    </div>
  );
}
