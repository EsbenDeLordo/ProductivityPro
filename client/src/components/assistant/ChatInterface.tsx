import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AssistantMessage } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useProjects } from "@/context/ProjectContext";

export default function ChatInterface() {
  const { toast } = useToast();
  const userId = 1; // For demo purposes
  const { projects } = useProjects();
  const [message, setMessage] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [contentToAnalyze, setContentToAnalyze] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get messages for selected project or general conversation
  const { data: messages = [] } = useQuery<AssistantMessage[]>({
    queryKey: ['/api/assistant-messages', userId, selectedProjectId],
    queryFn: () => {
      const url = selectedProjectId
        ? `/api/assistant-messages/${userId}?projectId=${selectedProjectId}`
        : `/api/assistant-messages/${userId}`;
      return fetch(url).then(res => res.json());
    },
  });
  
  // Mutation to send a new message
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => 
      apiRequest('POST', '/api/assistant-messages', {
        userId,
        projectId: selectedProjectId ? parseInt(selectedProjectId) : null,
        content,
        sender: "user"
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/assistant-messages', userId, selectedProjectId] 
      });
      setMessage("");
    }
  });
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  // Handle message sending
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    sendMessageMutation.mutate(message);
  };
  
  // Handle content analysis
  const handleAnalyzeContent = () => {
    if (!contentToAnalyze.trim()) {
      toast({
        title: "Empty content",
        description: "Please enter some content to analyze.",
        variant: "destructive"
      });
      return;
    }
    
    sendMessageMutation.mutate(`Please analyze the following content: ${contentToAnalyze}`);
    setContentToAnalyze("");
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>AI Assistant</CardTitle>
            <Select 
              value={selectedProjectId || ""}
              onValueChange={(value) => setSelectedProjectId(value || null)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">General Conversation</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden flex flex-col pb-4">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
              {messages.length > 0 ? (
                messages.map((msg, index) => (
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
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <span className="material-icons text-5xl text-gray-400 mb-4">smart_toy</span>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Your AI Assistant</h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm mt-2">
                    Ask for help with your projects, get recommendations, or analyze content.
                  </p>
                </div>
              )}
              
              {sendMessageMutation.isPending && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full p-2">
                    <span className="material-icons text-sm text-gray-500 dark:text-gray-400">smart_toy</span>
                  </div>
                  <div className="ml-3 max-w-xs md:max-w-md bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-300"></div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
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
                disabled={sendMessageMutation.isPending || !message.trim()}
              >
                <span className="material-icons text-sm">send</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Paste content below to get AI analysis and suggestions
                </p>
                <Textarea 
                  placeholder="Paste your content here..." 
                  className="min-h-[200px]"
                  value={contentToAnalyze}
                  onChange={(e) => setContentToAnalyze(e.target.value)}
                />
                <Button 
                  onClick={handleAnalyzeContent}
                  disabled={sendMessageMutation.isPending || !contentToAnalyze.trim()}
                  className="w-full"
                >
                  <span className="material-icons mr-2 text-sm">psychology</span>
                  Analyze Content
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => sendMessageMutation.mutate("Help me organize my project structure")}
                  disabled={sendMessageMutation.isPending}
                >
                  <span className="material-icons mr-2 text-sm">folder</span>
                  Help with project organization
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => sendMessageMutation.mutate("I need ideas for my current project")}
                  disabled={sendMessageMutation.isPending}
                >
                  <span className="material-icons mr-2 text-sm">lightbulb</span>
                  Generate ideas
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => sendMessageMutation.mutate("Summarize research on cognitive enhancement techniques")}
                  disabled={sendMessageMutation.isPending}
                >
                  <span className="material-icons mr-2 text-sm">summarize</span>
                  Research summary
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => sendMessageMutation.mutate("Write an outline for my project")}
                  disabled={sendMessageMutation.isPending}
                >
                  <span className="material-icons mr-2 text-sm">format_list_bulleted</span>
                  Create outline
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
