import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import RecommendationList from "@/components/recommendations/RecommendationList";

export default function Recommendations() {
  const userId = 1; // For demo purposes

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pocket WinDryft Mode</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Personalized productivity recommendations based on neuroscience</p>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecommendationList userId={userId} />
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>About WinDryft Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pocket WinDryft Mode provides science-based recommendations to optimize your productivity, 
                focus, and well-being throughout your workday, inspired by cutting-edge research on neuroscience and performance.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recommendation Types</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex">
                  <span className="material-icons text-accent mr-3">tips_and_updates</span>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">NSDR</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Non-Sleep Deep Rest sessions to restore focus and consolidate learning.
                    </p>
                  </div>
                </li>
                
                <li className="flex">
                  <span className="material-icons text-blue-500 mr-3">local_drink</span>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Hydration</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Reminders to maintain optimal hydration for cognitive performance.
                    </p>
                  </div>
                </li>
                
                <li className="flex">
                  <span className="material-icons text-secondary mr-3">fitness_center</span>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Movement</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Brief physical activities to boost BDNF and enhance creativity.
                    </p>
                  </div>
                </li>
                
                <li className="flex">
                  <span className="material-icons text-primary mr-3">schedule</span>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Focus Windows</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Optimal timing suggestions for deep work based on your patterns.
                    </p>
                  </div>
                </li>
                
                <li className="flex">
                  <span className="material-icons text-yellow-500 mr-3">brightness_5</span>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Light Exposure</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Recommendations for optimizing alertness through light exposure.
                    </p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Productivity Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  "Taking a deliberate break every 90 minutes aligns with your body's natural ultradian rhythm and can dramatically improve overall productivity."
                </p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-right">— Based on neuroscience research</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
