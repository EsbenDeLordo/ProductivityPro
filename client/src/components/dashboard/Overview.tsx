import { useQuery } from "@tanstack/react-query";
import { WorkSession, DailyAnalytics } from "@shared/schema";
import { useProjects } from "@/context/ProjectContext";
import { useWorkSession } from "@/context/WorkSessionContext";
import { Timer } from "@/components/ui/timer";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function Overview() {
  const userId = 1; // For demo purposes
  const { projects } = useProjects();
  const { currentSession, endSession } = useWorkSession();
  
  // Get the current day's analytics
  const { data: analytics } = useQuery<DailyAnalytics[]>({
    queryKey: ['/api/analytics', userId],
    queryFn: () => fetch(`/api/analytics/${userId}`).then(res => res.json()),
  });

  // Current day productivity info
  const todayAnalytics = analytics?.[0] || {
    focusTime: 0,
    flowStates: 0,
    productivity: 0
  };
  
  // Calculate total focus time in hours and minutes
  const formatFocusTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Calculate projects status
  const totalProjects = projects.length;
  const onTrackProjects = projects.filter(p => p.progress >= 60).length;
  
  // Calculate session elapsed time
  const getSessionElapsed = () => {
    if (!currentSession) return 0;
    
    const startTime = new Date(currentSession.startTime).getTime();
    const now = new Date().getTime();
    const elapsedMs = now - startTime;
    return Math.floor(elapsedMs / 1000); // Convert to seconds
  };
  
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4 mb-8">
      {/* Productivity Score */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-md p-3">
              <span className="material-icons text-primary dark:text-blue-300">speed</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Productivity Score</dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">{todayAnalytics.productivity}%</div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
          <div className="text-sm">
            <a href="/analytics" className="font-medium text-primary hover:text-blue-600">View details</a>
          </div>
        </CardFooter>
      </Card>
      
      {/* Focus Time */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-md p-3">
              <span className="material-icons text-secondary dark:text-green-300">timer</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Focus Time Today</dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">{formatFocusTime(todayAnalytics.focusTime)}</div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
          <div className="text-sm">
            <a href="/analytics" className="font-medium text-primary hover:text-blue-600">View details</a>
          </div>
        </CardFooter>
      </Card>
      
      {/* Projects Status */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900 rounded-md p-3">
              <span className="material-icons text-accent dark:text-purple-300">folder</span>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Active Projects</dt>
                <dd>
                  <div className="text-lg font-medium text-gray-900 dark:text-white">{onTrackProjects} / {totalProjects} on track</div>
                </dd>
              </dl>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-700 px-5 py-3">
          <div className="text-sm">
            <a href="/projects" className="font-medium text-primary hover:text-blue-600">View all</a>
          </div>
        </CardFooter>
      </Card>
      
      {/* Work Session */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex-shrink-0 bg-red-100 dark:bg-red-900 rounded-md p-3">
              <span className="material-icons text-red-500 dark:text-red-300">schedule</span>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Current Session</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {currentSession ? (currentSession.type === 'focus' ? 'Deep Work' : currentSession.type) : 'No active session'}
              </p>
            </div>
            <div className="relative h-16 w-16">
              {currentSession ? (
                <Timer 
                  duration={60 * 60} // 1 hour in seconds
                  elapsed={getSessionElapsed()} 
                  isRunning={true}
                  size="md"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="material-icons text-gray-400">timer_off</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 dark:bg-gray-700 px-5 py-3 flex justify-between">
          {currentSession ? (
            <>
              <button 
                className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                disabled
              >
                <span className="material-icons text-sm mr-1 align-text-bottom">pause</span>
                Pause
              </button>
              <button 
                className="text-sm font-medium text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                onClick={() => endSession()}
              >
                <span className="material-icons text-sm mr-1 align-text-bottom">stop</span>
                End
              </button>
            </>
          ) : (
            <button 
              className="text-sm font-medium text-primary hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              onClick={() => alert("Start a new work session from the Projects page")}
            >
              <span className="material-icons text-sm mr-1 align-text-bottom">play_arrow</span>
              Start New Session
            </button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
