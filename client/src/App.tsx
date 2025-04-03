import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import Analytics from "@/pages/Analytics";
import Assistant from "@/pages/Assistant";
import Recommendations from "@/pages/Recommendations";
import ContentTools from "@/pages/ContentTools";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import { useState, useEffect } from "react";

function App() {
  const [user, setUser] = useState({
    id: 1,
    username: "demo",
    name: "Andrew Huberman",
    email: "andrew@hubermanlab.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces",
    password: "password123" // Adding password to satisfy TypeScript type requirements
  });

  useEffect(() => {
    document.title = "Pocket Huberman Pro";
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar user={user} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <MobileHeader user={user} />
          
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 pt-16 md:pt-0">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/projects" component={Projects} />
              <Route path="/analytics" component={Analytics} />
              <Route path="/assistant" component={Assistant} />
              <Route path="/recommendations" component={Recommendations} />
              <Route path="/content-tools" component={ContentTools} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
