import { useState } from "react";
import { Project, ProjectTemplate } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useWorkSession } from "@/context/WorkSessionContext";
import { useToast } from "@/hooks/use-toast";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Timer } from "@/components/ui/timer";

interface ProjectDetailProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onClose: () => void;
}

export default function ProjectDetail({ project, onUpdate, onClose }: ProjectDetailProps) {
  const { toast } = useToast();
  const { currentSession, startSession, endSession, isSessionActive } = useWorkSession();
  const [activeTab, setActiveTab] = useState("overview");
  const [progress, setProgress] = useState(project.progress);

  // Get template for this project type
  const { data: template } = useQuery<ProjectTemplate>({
    queryKey: ['/api/project-template/type', project.type],
    queryFn: () => fetch(`/api/project-template/type/${project.type}`).then(res => res.json())
  });

  // Get messages for this project
  const { data: messages = [] } = useQuery({
    queryKey: ['/api/assistant-messages', project.userId, project.id],
    queryFn: () => fetch(`/api/assistant-messages/${project.userId}?projectId=${project.id}`).then(res => res.json())
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: (data: Partial<Project>) => 
      apiRequest('PUT', `/api/project/${project.id}`, data).then(res => res.json()),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', project.userId] });
      queryClient.invalidateQueries({ queryKey: ['/api/project', project.id] });
      onUpdate(data);
      toast({
        title: "Project updated",
        description: "Project changes have been saved."
      });
    }
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => 
      apiRequest('POST', '/api/assistant-messages', {
        userId: project.userId,
        projectId: project.id,
        content,
        sender: "user"
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assistant-messages', project.userId, project.id] });
    }
  });

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

  // Handle session toggling
  const handleSessionToggle = async () => {
    if (isSessionActive) {
      // If there's an active session, end it
      await endSession();
      toast({
        title: "Session ended",
        description: "Your work session has been saved."
      });
    } else {
      // Start a new session for this project
      await startSession(project.id, "focus");
      toast({
        title: "Session started",
        description: "Your work session has begun."
      });
    }
  };

  // Handle progress update
  const handleProgressUpdate = () => {
    updateProjectMutation.mutate({ progress });
  };

  // Handle message sending
  const [message, setMessage] = useState("");
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessageMutation.mutate(message);
    setMessage("");
  };

  // Get session elapsed time
  const getSessionElapsed = () => {
    if (!currentSession) return 0;

    const startTime = new Date(currentSession.startTime).getTime();
    const now = new Date().getTime();
    const elapsedMs = now - startTime;
    return Math.floor(elapsedMs / 1000); // Convert to seconds
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center">
            <span 
              className="material-icons mr-2 text-2xl"
              style={{ color: project.colorCode }}
            >
              {project.icon}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
          </div>
          <p className="mt-1 text-gray-500 dark:text-gray-400">{project.description}</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          <span className="material-icons mr-1">arrow_back</span>
          Back to Projects
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="assistant">AI Assistant</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-4">
                    <div className="flex-1 mr-4">
                      <Progress value={progress} className="h-4" indicatorColor={project.colorCode} />
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={progress}
                        onChange={(e) => setProgress(parseInt(e.target.value))}
                      />
                    </div>
                    <Button 
                      className="ml-2" 
                      onClick={handleProgressUpdate}
                      disabled={updateProjectMutation.isPending}
                    >
                      Update
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          progress >= 60 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        }`}>
                          {progress >= 60 ? "On track" : "Needs attention"}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{project.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Deadline</p>
                      <p className="font-medium text-gray-900 dark:text-white">{getDaysUntilDeadline()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Time Logged</p>
                      <p className="font-medium text-gray-900 dark:text-white">{formatTimeLogged(project.timeLogged)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {template && template.sections && (
                <Card>
                  <CardHeader>
                    <CardTitle>Project Sections</CardTitle>
                    <CardContent className="pt-4">
                      {Array.isArray(template.sections) ? (
                        template.sections.map((section, index) => (
                          <div key={index} className="mb-4">
                            <h3 className="font-medium">{section.name}</h3>
                            <p className="text-sm text-gray-500">{section.description}</p>
                          </div>
                        ))
                      ) : (
                        <div>
                          <h3 className="font-medium">Tasks</h3>
                          <ul className="list-disc pl-4 mt-2">
                            {template.sections.tasks.map((task: string, index: number) => (
                              <li key={index} className="text-sm text-gray-600">{task}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {template.sections.map((section: any, index: number) => (
                        <Card key={index} className="border">
                          <CardContent className="p-4">
                            <h3 className="font-medium text-gray-900 dark:text-white mb-1">{section.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{section.description}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter your project notes here..."
                    className="min-h-[200px]"
                  />
                  <Button>Save Notes</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Files & Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6">
                    <span className="material-icons text-3xl text-gray-400 mb-2">cloud_upload</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Drag and drop files here or click to browse</p>
                    <Button variant="outline" className="mt-4">Upload Files</Button>
                  </div>

                  {project.files > 0 ? (
                    <div className="mt-6 space-y-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">Uploaded Files ({project.files})</h3>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        File management is coming soon.
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      No files uploaded yet
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI Assistant Tab */}
            <TabsContent value="assistant" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>AI Assistant</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col h-[400px]">
                    <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                      {messages.length > 0 ? (
                        messages.map((msg: any, index: number) => (
                          <div key={index} className={`flex items-start ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'assistant' && (
                              <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full p-2">
                                <span className="material-icons text-sm text-gray-500 dark:text-gray-400">smart_toy</span>
                              </div>
                            )}

                            <div className={`mx-3 max-w-xs md:max-w-md rounded-lg p-3 ${
                              msg.sender === 'user' 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              <p className={`text-sm ${
                                msg.sender === 'user' 
                                  ? 'text-white' 
                                  : 'text-gray-800 dark:text-gray-200'
                              }`}>
                                {msg.content}
                              </p>
                            </div>

                            {msg.sender === 'user' && (
                              <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full p-2">
                                <span className="material-icons text-sm text-gray-500 dark:text-gray-400">person</span>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <span className="material-icons text-3xl text-gray-400 mb-2">smart_toy</span>
                          <p className="text-gray-500 dark:text-gray-400">Ask the AI assistant for help with your project</p>
                        </div>
                      )}

                      {sendMessageMutation.isPending && (
                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full p-2">
                            <span className="material-icons text-sm text-gray-500 dark:text-gray-400">smart_toy</span>
                          </div>
                          <div className="ml-3 max-w-xs md:max-w-md bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                            <p className="text-sm text-gray-800 dark:text-gray-200">Thinking...</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <form className="flex" onSubmit={handleSendMessage}>
                      <Input 
                        type="text" 
                        placeholder="Ask your AI assistant..." 
                        className="flex-1"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={sendMessageMutation.isPending}
                      />
                      <Button 
                        type="submit" 
                        className="ml-3" 
                        disabled={sendMessageMutation.isPending}
                      >
                        <span className="material-icons text-sm">send</span>
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>

              {project.aiAssistanceEnabled && (
                <Card>
                  <CardHeader>
                    <CardTitle>AI Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                        <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                          <span className="material-icons text-primary mr-2">lightbulb</span>
                          Organization Suggestion
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          Based on your project type, consider organizing your content into sections for easier management.
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                        <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                          <span className="material-icons text-accent mr-2">psychology</span>
                          Content Enhancement
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                          AI can help you refine content and suggest improvements based on your project goals.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Session</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="mb-6">
                {isSessionActive && currentSession?.projectId === project.id ? (
                  <Timer 
                    duration={60 * 60} // 1 hour in seconds
                    elapsed={getSessionElapsed()} 
                    isRunning={true}
                    size="lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <span className="material-icons text-gray-400">timer_off</span>
                  </div>
                )}
              </div>

              <div className="text-center mb-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isSessionActive && currentSession?.projectId === project.id
                    ? "Session in progress"
                    : "No active session"}
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {isSessionActive && currentSession?.projectId === project.id
                    ? "Deep Work"
                    : "Start a new session"}
                </p>
              </div>

              <Button 
                onClick={handleSessionToggle}
                variant={isSessionActive && currentSession?.projectId === project.id ? "destructive" : "default"}
                className="w-full"
              >
                <span className="material-icons mr-2">
                  {isSessionActive && currentSession?.projectId === project.id ? "stop" : "play_arrow"}
                </span>
                {isSessionActive && currentSession?.projectId === project.id ? "End Session" : "Start Session"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <span className="material-icons mr-2">edit</span>
                Edit Project
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <span className="material-icons mr-2">content_copy</span>
                Duplicate
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <span className="material-icons mr-2">share</span>
                Share
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive">
                <span className="material-icons mr-2">delete</span>
                Delete
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}