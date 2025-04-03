import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AssistantMessage } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Trash2, 
  MessageSquare, 
  MoreVertical, 
  History, 
  Plus,
  KeyRound
} from "lucide-react";
import { useProjects } from "@/context/ProjectContext";

interface Conversation {
  id: string;
  name: string;
  projectId: string | null;
  lastUpdated: Date;
}

export default function ChatInterface() {
  const { toast } = useToast();
  const userId = 1; // For demo purposes
  const { projects } = useProjects();
  const [message, setMessage] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>("general");
  const [selectedProvider, setSelectedProvider] = useState<string>("auto");
  const [contentToAnalyze, setContentToAnalyze] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  
  // Load conversation history from localStorage
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('conversations');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((conv: any) => ({
          ...conv,
          lastUpdated: new Date(conv.lastUpdated)
        }));
      }
    } catch (error) {
      console.error('Error loading conversations from localStorage:', error);
    }
    
    return [{
      id: 'general',
      name: 'General Conversation',
      projectId: 'general',
      lastUpdated: new Date()
    }];
  });
  
  // Get messages for selected project or general conversation
  const { data: messages = [] } = useQuery<AssistantMessage[]>({
    queryKey: ['/api/assistant-messages', userId, selectedProjectId],
    queryFn: () => {
      const url = selectedProjectId && selectedProjectId !== "general"
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
        projectId: selectedProjectId && selectedProjectId !== "general" ? parseInt(selectedProjectId) : null,
        content,
        sender: "user",
        provider: selectedProvider
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
  
  // Save conversation history when messages change
  useEffect(() => {
    if (messages.length > 0 && selectedProjectId) {
      // Update or add conversation to history
      const existingIndex = conversations.findIndex(c => c.projectId === selectedProjectId);
      const project = projects.find(p => p.id.toString() === selectedProjectId);
      const convName = selectedProjectId === 'general' 
        ? 'General Conversation' 
        : project ? `${project.name} Chat` : 'Unnamed Conversation';
      
      let updatedConversations = [...conversations];
      
      if (existingIndex >= 0) {
        // Update existing conversation
        updatedConversations[existingIndex] = {
          ...updatedConversations[existingIndex],
          lastUpdated: new Date()
        };
      } else {
        // Add new conversation
        updatedConversations.push({
          id: `conv-${Date.now()}`,
          name: convName,
          projectId: selectedProjectId,
          lastUpdated: new Date()
        });
      }
      
      // Sort by last updated time
      updatedConversations.sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
      
      // Save to state and localStorage
      setConversations(updatedConversations);
      localStorage.setItem('conversations', JSON.stringify(updatedConversations));
    }
  }, [messages, selectedProjectId, projects]);
  
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
  
  // Create a new conversation
  const handleNewChat = () => {
    setSelectedProjectId('general');
    setShowConversationHistory(false);
    toast({
      title: "New conversation started",
      description: "You're now in a fresh conversation with your AI assistant."
    });
  };
  
  // Switch to a different conversation
  const handleSwitchConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setSelectedProjectId(conversation.projectId);
      setShowConversationHistory(false);
    }
  };
  
  // Delete conversation history
  const deleteMessages = useMutation({
    mutationFn: async () => {
      if (!selectedProjectId) return;
      
      // In a real app, you'd create an API endpoint for this
      // For now, we'll just remove it from localStorage
      const updatedConversations = conversations.filter(c => c.projectId !== selectedProjectId);
      setConversations(updatedConversations);
      localStorage.setItem('conversations', JSON.stringify(updatedConversations));
      
      // Clear messages from the UI immediately
      queryClient.setQueryData(['/api/assistant-messages', userId, selectedProjectId], []);
      
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Conversation deleted",
        description: "All messages in this conversation have been removed."
      });
      setIsDeleteDialogOpen(false);
      // Go to general conversation after deletion if needed
      if (selectedProjectId !== 'general' && !conversations.some(c => c.projectId === 'general')) {
        setSelectedProjectId('general');
      }
    }
  });
  
  // Format date for display
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Add API key
  const handleAddApiKey = () => {
    setIsApiKeyDialogOpen(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between py-3">
            <div className="flex items-center">
              <CardTitle>AI Assistant</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2" 
                onClick={() => setShowConversationHistory(!showConversationHistory)}
              >
                <History className="h-4 w-4 mr-1" />
                <span className="text-xs">History</span>
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Options</DropdownMenuLabel>
                  <DropdownMenuItem onClick={handleNewChat}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Chat
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleAddApiKey}>
                    <KeyRound className="mr-2 h-4 w-4" />
                    AI Settings
                    <span className="ml-2 text-xs text-gray-500">
                      ({selectedProvider === "auto" ? "Auto" : 
                        selectedProvider === "deepseek" ? "DeepSeek" : 
                        selectedProvider === "gemini" ? "Gemini" : 
                        "Claude"})
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Clear Conversation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Select 
                value={selectedProjectId || ""}
                onValueChange={(value) => setSelectedProjectId(value || null)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Conversation</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          {/* Delete Conversation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Clear Conversation</DialogTitle>
                <DialogDescription>
                  Are you sure you want to clear this conversation? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => deleteMessages.mutate()}
                  disabled={deleteMessages.isPending}
                >
                  {deleteMessages.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* API Key Dialog */}
          <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>AI Settings</DialogTitle>
                <DialogDescription>
                  Configure AI providers and API settings.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">AI Provider</label>
                    <Select 
                      value={selectedProvider}
                      onValueChange={setSelectedProvider}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select AI provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto (Use best available)</SelectItem>
                        <SelectItem value="deepseek">DeepSeek</SelectItem>
                        <SelectItem value="gemini">Gemini</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      The "Auto" option will use the best available provider. 
                      You need API keys configured on the server for each provider.
                    </p>
                  </div>
                  
                  <div className="space-y-2 mt-4 pt-4 border-t">
                    <label className="text-sm font-medium">API Keys</label>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Note: In a production app, this would securely save your API key.
                      This demo only simulates the dialog but requires keys to be added to the server environment.
                    </p>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">DeepSeek API Key</label>
                      <Input 
                        type="password" 
                        placeholder="sk-..." 
                      />
                    </div>
                    <div className="space-y-2 mt-2">
                      <label className="text-xs font-medium">Gemini API Key</label>
                      <Input 
                        type="password" 
                        placeholder="..." 
                      />
                    </div>

                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsApiKeyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    toast({
                      title: "AI Provider Settings",
                      description: `Using ${
                        selectedProvider === 'auto' ? 'Auto' : 
                        selectedProvider === 'deepseek' ? 'DeepSeek' : 
                        'Gemini'
                      } as your AI provider. API keys must be configured on the server.`,
                    });
                    setIsApiKeyDialogOpen(false);
                  }}
                >
                  Save Settings
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <CardContent className="flex-1 overflow-hidden flex flex-col pb-4 relative">
            {showConversationHistory && (
              <div className="absolute inset-0 bg-white dark:bg-gray-800 z-10 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">Conversation History</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowConversationHistory(false)}>
                    <span className="material-icons">close</span>
                  </Button>
                </div>
                
                <ScrollArea className="flex-1">
                  {conversations.length > 0 ? (
                    <div className="space-y-2">
                      {conversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            selectedProjectId === conversation.projectId ? 'bg-gray-100 dark:bg-gray-700' : ''
                          }`}
                          onClick={() => handleSwitchConversation(conversation.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                              <span className="font-medium text-sm">{conversation.name}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(conversation.lastUpdated)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No conversation history yet</p>
                    </div>
                  )}
                </ScrollArea>
                
                <div className="mt-4">
                  <Button onClick={handleNewChat} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    New Conversation
                  </Button>
                </div>
              </div>
            )}
            
            <ScrollArea className="h-[400px] mb-4">
              <div className="space-y-4 pr-2">
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
                        {msg.sender === 'assistant' && msg.provider && (
                          <div className="flex items-center mb-1">
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              msg.provider === 'deepseek' 
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                                : msg.provider === 'gemini'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                              {msg.provider === 'deepseek' 
                                ? 'DeepSeek' 
                                : msg.provider === 'gemini' 
                                ? 'Gemini'
                                : 'AI'}
                            </span>
                          </div>
                        )}
                        <p className={`text-sm ${
                          msg.sender === 'user' 
                            ? 'text-white' 
                            : 'text-gray-800 dark:text-gray-200'
                        }`}>
                          {msg.content === "I'm currently using a fallback response mode. For the best experience, please ensure your DeepSeek API key is valid and your internet connection is stable." ? (
                            <span>
                              I'm currently in demo mode and can't provide detailed responses.
                              <Button 
                                variant="link" 
                                className="p-0 h-auto text-xs text-blue-400 dark:text-blue-300" 
                                onClick={handleAddApiKey}
                              >
                                Add an API key to enhance capabilities.
                              </Button>
                            </span>
                          ) : (
                            msg.content
                          )}
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
                      <div className="flex flex-col">
                        <div className="flex items-center mb-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded ${
                            selectedProvider === 'deepseek' 
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                              : selectedProvider === 'gemini'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                          }`}>
                            {selectedProvider === 'deepseek' 
                              ? 'DeepSeek' 
                              : selectedProvider === 'gemini' 
                              ? 'Gemini' 
                              : 'Auto'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-150"></div>
                          <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-300"></div>
                          <span className="text-sm text-gray-500 dark:text-gray-400">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
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