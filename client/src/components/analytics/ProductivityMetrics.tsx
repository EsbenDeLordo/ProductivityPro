import { DailyAnalytics } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProductivityMetricsProps {
  analyticsData: DailyAnalytics[];
}

export default function ProductivityMetrics({ analyticsData }: ProductivityMetricsProps) {
  // Get the current day's analytics (latest date)
  const todayAnalytics = analyticsData.length > 0 ? analyticsData[0] : null;
  
  // Calculate average productivity for the period
  const averageProductivity = 
    analyticsData.length > 0
      ? Math.round(analyticsData.reduce((sum, day) => sum + day.productivity, 0) / analyticsData.length)
      : 0;
  
  // Calculate total focus time across all days
  const totalFocusMinutes = analyticsData.reduce((sum, day) => sum + day.focusTime, 0);
  
  // Format time (minutes to hours and minutes)
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins.toString().padStart(2, '0')}m`;
  };
  
  // Calculate daily average focus time
  const avgDailyFocusMinutes = 
    analyticsData.length > 0
      ? Math.round(totalFocusMinutes / analyticsData.length)
      : 0;
  
  // Calculate flow state metrics
  const totalFlowStates = analyticsData.reduce((sum, day) => sum + day.flowStates, 0);
  const avgFlowStatesPerDay = 
    analyticsData.length > 0
      ? Math.round((totalFlowStates / analyticsData.length) * 10) / 10
      : 0;
  
  // Calculate productive hours (minutes where productivity is above average)
  const productiveMinutes = analyticsData.reduce((sum, day) => {
    return day.productivity >= 70 ? sum + day.focusTime : sum;
  }, 0);
  
  const productivePercentage = 
    totalFocusMinutes > 0
      ? Math.round((productiveMinutes / totalFocusMinutes) * 100)
      : 0;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Productivity Score Card */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Productivity Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center">
            <div className="relative w-40 h-40 md:mr-8 mb-4 md:mb-0">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="currentColor" 
                  className="text-gray-200 dark:text-gray-700" 
                  strokeWidth="10" 
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  fill="none" 
                  stroke="currentColor" 
                  className="text-primary" 
                  strokeWidth="10" 
                  strokeDasharray="283" 
                  strokeDashoffset={283 - (283 * (todayAnalytics?.productivity || 0)) / 100}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
                <text 
                  x="50" 
                  y="50" 
                  dominantBaseline="middle" 
                  textAnchor="middle" 
                  className="text-2xl font-bold text-gray-900 dark:text-white"
                >
                  {todayAnalytics?.productivity || 0}%
                </text>
              </svg>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Today</span>
                  <span className="text-sm font-medium">{todayAnalytics?.productivity || 0}%</span>
                </div>
                <Progress value={todayAnalytics?.productivity || 0} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Weekly Average</span>
                  <span className="text-sm font-medium">{averageProductivity}%</span>
                </div>
                <Progress value={averageProductivity} className="h-2" />
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Productive Time Ratio</span>
                  <span className="text-sm font-medium">{productivePercentage}%</span>
                </div>
                <Progress value={productivePercentage} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Focus Time Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Focus Time Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <span className="material-icons text-primary dark:text-blue-300">timer</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Focus Time</p>
                <p className="text-xl font-semibold">{formatTime(totalFocusMinutes)}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <span className="material-icons text-secondary dark:text-green-300">schedule</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Average Daily Focus</p>
                <p className="text-xl font-semibold">{formatTime(avgDailyFocusMinutes)}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <span className="material-icons text-accent dark:text-purple-300">trending_up</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Productive Time</p>
                <p className="text-xl font-semibold">{formatTime(productiveMinutes)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Flow State Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Flow State Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <span className="material-icons text-accent dark:text-purple-300">psychology</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Flow States</p>
                <p className="text-xl font-semibold">{totalFlowStates} sessions</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <span className="material-icons text-yellow-600 dark:text-yellow-300">auto_graph</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Average Per Day</p>
                <p className="text-xl font-semibold">{avgFlowStatesPerDay} sessions</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-red-100 dark:bg-red-900 rounded-full">
                <span className="material-icons text-red-600 dark:text-red-300">bolt</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">Peak Flow Day</p>
                <p className="text-xl font-semibold">
                  {analyticsData.reduce((max, day) => day.flowStates > max.flowStates ? day : max, { flowStates: 0, date: "" }).date
                    ? new Date(analyticsData.reduce((max, day) => day.flowStates > max.flowStates ? day : max, { flowStates: 0, date: "" }).date).toLocaleDateString('en-US', { weekday: 'long' })
                    : "N/A"
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
