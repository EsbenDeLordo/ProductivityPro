import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AssistantMessage } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AssistantChat() {
  const userId = 1; // For demo purposes
  const [message, setMessage] = useState("");
  
  // Get latest assistant messages
  const { data: messages = [] } = useQuery<AssistantMessage[]>({
    queryKey: ['/api/assistant-messages', userId],
    queryFn: () => fetch(`/api/assistant-messages/${userId}`).then(res => res.json()),
  });
  
  // Show only the most recent 3 messages in the dashboard view
  const recentMessages = messages.slice(-3);
  
  // Mutation to send a new message
  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => 
      apiRequest('POST', '/api/assistant-messages', {
        userId,
        content,
        sender: "user",
        projectId: null // No specific project in the dashboard view
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assistant-messages', userId] });
    }
  });
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) return;
    
    sendMessageMutation.mutate(message);
    setMessage("");
  };

  return (
    <Card className="mt-6">
      <CardHeader className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="text-lg font-medium">AI Assistant</CardTitle>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get help with your current projects</p>
      </CardHeader>
      <CardContent className="px-6 py-5">
        <div className="flex-1 overflow-hidden">
          <div className="space-y-4 px-1 py-2">
            {recentMessages.map((msg, index) => (
              <div key={index} className={`flex items-start ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'assistant' && (
                  <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full p-2">
                    <span className="material-icons text-sm text-gray-500 dark:text-gray-400">smart_toy</span>
                  </div>
                )}
                
                <div className={`ml-3 max-w-xs rounded-lg p-3 ${
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
                  <div className="ml-3 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full p-2">
                    <span className="material-icons text-sm text-gray-500 dark:text-gray-400">person</span>
                  </div>
                )}
              </div>
            ))}
            
            {sendMessageMutation.isPending && (
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-full p-2">
                  <span className="material-icons text-sm text-gray-500 dark:text-gray-400">smart_toy</span>
                </div>
                <div className="ml-3 max-w-xs bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-800 dark:text-gray-200">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <form className="mt-4 flex" onSubmit={handleSendMessage}>
          <Input 
            type="text" 
            placeholder="Ask your AI assistant..." 
            className="flex-1"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sendMessageMutation.isPending}
          />
          <Button type="submit" className="ml-3" disabled={sendMessageMutation.isPending}>
            <span className="material-icons text-sm">send</span>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
