import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ChatInterface from "@/components/assistant/ChatInterface";

export default function Assistant() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get intelligent help with your projects and tasks</p>
      </div>
      
      {/* Main content */}
      <div className="space-y-6">
        <ChatInterface />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="material-icons mr-2 text-primary">edit</span>
                Content Creation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                The AI assistant can help draft content, refine your writing, and generate creative ideas based on your input.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="material-icons mr-2 text-secondary">auto_awesome</span>
                Project Assistance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Get help organizing your project, breaking down complex tasks, and creating structured templates.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <span className="material-icons mr-2 text-accent">psychology</span>
                Research Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Ask the AI to analyze content, summarize information, and provide insights based on your research materials.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
