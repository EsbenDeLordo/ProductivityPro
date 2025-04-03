import { createContext, useContext, useState, useEffect } from "react";
import { WorkSession } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface WorkSessionContextType {
  currentSession: WorkSession | null;
  isLoading: boolean;
  error: Error | null;
  startSession: (projectId: number | null, type: string) => Promise<WorkSession>;
  endSession: () => Promise<WorkSession | null>;
  isSessionActive: boolean;
}

const WorkSessionContext = createContext<WorkSessionContextType | undefined>(undefined);

export function WorkSessionProvider({ children }: { children: React.ReactNode }) {
  const userId = 1; // For demo purposes
  
  const { data: currentSession, isLoading, error } = useQuery<WorkSession | null>({
    queryKey: ['/api/work-session/current', userId],
    queryFn: ({ queryKey }) => fetch(`${queryKey[0]}/${queryKey[1]}`).then(res => {
      if (!res.ok && res.status === 404) {
        return null;
      }
      return res.json();
    }),
  });

  const startSessionMutation = useMutation({
    mutationFn: (sessionData: { userId: number, projectId: number | null, startTime: Date, type: string }) => 
      apiRequest('POST', '/api/work-sessions', sessionData).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/work-session/current', userId] });
    }
  });

  const endSessionMutation = useMutation({
    mutationFn: (sessionId: number) => 
      apiRequest('POST', `/api/work-session/${sessionId}/end`, {}).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/work-session/current', userId] });
    }
  });

  const startSession = async (projectId: number | null, type: string) => {
    return startSessionMutation.mutateAsync({
      userId,
      projectId,
      startTime: new Date().toISOString(),
      type
    });
  };

  const endSession = async () => {
    if (!currentSession) {
      return null;
    }
    return endSessionMutation.mutateAsync(currentSession.id);
  };

  return (
    <WorkSessionContext.Provider value={{ 
      currentSession: currentSession || null, 
      isLoading, 
      error: error as Error, 
      startSession, 
      endSession,
      isSessionActive: !!currentSession
    }}>
      {children}
    </WorkSessionContext.Provider>
  );
}

export function useWorkSession() {
  const context = useContext(WorkSessionContext);
  if (context === undefined) {
    throw new Error("useWorkSession must be used within a WorkSessionProvider");
  }
  return context;
}
