import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DailyAnalytics } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import WeeklyChart from "@/components/analytics/WeeklyChart";
import ProductivityMetrics from "@/components/analytics/ProductivityMetrics";

export default function Analytics() {
  const userId = 1; // For demo purposes
  const [activeTab, setActiveTab] = useState("overview");
  const [range, setRange] = useState(7); // Default to 7 days
  
  // Get analytics data
  const { data: analyticsData = [], isLoading } = useQuery<DailyAnalytics[]>({
    queryKey: ['/api/analytics', userId, range],
    queryFn: () => fetch(`/api/analytics/${userId}?range=${range}`).then(res => res.json()),
  });
  
  // Handle range change
  const handleRangeChange = (newRange: number) => {
    setRange(newRange);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track your productivity patterns and optimize your work habits</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button
            variant={range === 7 ? "default" : "outline"}
            onClick={() => handleRangeChange(7)}
          >
            Week
          </Button>
          <Button
            variant={range === 30 ? "default" : "outline"}
            onClick={() => handleRangeChange(30)}
          >
            Month
          </Button>
          <Button
            variant={range === 90 ? "default" : "outline"}
            onClick={() => handleRangeChange(90)}
          >
            Quarter
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-12">
          <span className="material-icons text-4xl text-gray-400 animate-pulse">hourglass_top</span>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading analytics data...</p>
        </div>
      ) : analyticsData.length > 0 ? (
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="focus">Focus Time</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Productivity Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-md p-3">
                        <span className="material-icons text-primary dark:text-blue-300">speed</span>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Average Productivity</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900 dark:text-white">
                              {Math.round(analyticsData.reduce((sum, day) => sum + day.productivity, 0) / analyticsData.length)}%
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-md p-3">
                        <span className="material-icons text-secondary dark:text-green-300">timer</span>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Focus Time</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900 dark:text-white">
                              {(() => {
                                const minutes = analyticsData.reduce((sum, day) => sum + day.focusTime, 0);
                                const hours = Math.floor(minutes / 60);
                                const mins = minutes % 60;
                                return `${hours}h ${mins}m`;
                              })()}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900 rounded-md p-3">
                        <span className="material-icons text-accent dark:text-purple-300">psychology</span>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Flow States</dt>
                          <dd>
                            <div className="text-lg font-medium text-gray-900 dark:text-white">
                              {analyticsData.reduce((sum, day) => sum + day.flowStates, 0)} sessions
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Weekly Chart */}
              <WeeklyChart analyticsData={analyticsData} />
              
              {/* Productivity Metrics */}
              <ProductivityMetrics analyticsData={analyticsData} />
            </TabsContent>
            
            {/* Focus Time Tab */}
            <TabsContent value="focus" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Focus Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <span className="material-icons text-4xl text-gray-400">insights</span>
                      <p className="mt-2 text-gray-500 dark:text-gray-400">Detailed focus time analytics coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Focus Session Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Flow State</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {/* Sample rows - would be replaced with actual data */}
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Today</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">2h 15m</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Deep Work</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Yes</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Yesterday</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">1h 45m</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">Focus</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">No</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Projects Tab */}
            <TabsContent value="projects" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center">
                    <div className="text-center">
                      <span className="material-icons text-4xl text-gray-400">folder_special</span>
                      <p className="mt-2 text-gray-500 dark:text-gray-400">Project analytics will be available soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <Card>
            <CardHeader>
              <CardTitle>Productivity Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                  <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                    <span className="material-icons text-primary mr-2">lightbulb</span>
                    Peak Performance Time
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Your data indicates that you're most productive in the morning. Consider scheduling important tasks during this period.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                  <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                    <span className="material-icons text-accent mr-2">psychology</span>
                    Flow State Pattern
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    You reach flow states most consistently after taking a short break. Try implementing a structured break every 90 minutes.
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <h3 className="font-medium text-gray-900 dark:text-white flex items-center">
                    <span className="material-icons text-secondary mr-2">trending_up</span>
                    Productivity Improvement
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    Your productivity has increased by 12% compared to last week. Keep up the momentum!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <span className="material-icons text-4xl text-gray-400">analytics</span>
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No analytics data available</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">Start working on projects to collect productivity metrics</p>
        </div>
      )}
    </div>
  );
}
