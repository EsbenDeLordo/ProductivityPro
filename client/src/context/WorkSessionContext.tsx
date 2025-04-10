
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { WorkSession } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface TimeDisplay {
  hours: number;
  minutes: number;
  seconds: number;
}

interface WorkSessionContextType {
  elapsedTime: TimeDisplay;
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
  const [elapsedTime, setElapsedTime] = useState<TimeDisplay>({ hours: 0, minutes: 0, seconds: 0 });
  const [isSessionActive, setIsSessionActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  // Get current session
  const { data: currentSession, isLoading, error } = useQuery<WorkSession | null>({
    queryKey: ['/api/work-session/current', userId],
    queryFn: ({ queryKey }) => fetch(`${queryKey[0]}/${queryKey[1]}`).then(res => {
      if (!res.ok && res.status === 404) {
        return null;
      }
      return res.json();
    }),
  });

  // Reset timer when session ends or changes
  useEffect(() => {
    if (!currentSession || currentSession.endTime) {
      setElapsedTime({ hours: 0, minutes: 0, seconds: 0 });
      setIsSessionActive(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    } else {
      setIsSessionActive(true);
    }
  }, [currentSession]);

  // Update elapsed time every second when session is active
  useEffect(() => {
    if (currentSession && !currentSession.endTime) {
      const startTime = new Date(currentSession.startTime).getTime();

      const updateElapsedTime = () => {
        const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        setElapsedTime({ hours, minutes, seconds });
      };

      // Set initial elapsed time
      updateElapsedTime();

      // Start timer
      timerRef.current = setInterval(updateElapsedTime, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [currentSession]);

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
    const now = new Date();
    return startSessionMutation.mutateAsync({
      userId,
      projectId,
      startTime: now,
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
      elapsedTime,
      isLoading, 
      error: error as Error, 
      startSession, 
      endSession,
      isSessionActive
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
