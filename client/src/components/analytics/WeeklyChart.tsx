import { useState } from "react";
import { DailyAnalytics } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface WeeklyChartProps {
  analyticsData: DailyAnalytics[];
}

export default function WeeklyChart({ analyticsData }: WeeklyChartProps) {
  const [timeRange, setTimeRange] = useState("week");
  
  // Sort analytics by date (oldest first)
  const sortedAnalytics = [...analyticsData].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  // Calculate total focus time for the displayed period
  const totalFocusTime = sortedAnalytics.reduce((sum, day) => sum + day.focusTime, 0);
  const formatTotalFocusTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Find the peak performance day
  const peakPerformanceDay = sortedAnalytics.reduce(
    (peak, current) => current.productivity > peak.productivity ? current : peak,
    { productivity: 0, date: "" }
  );
  
  const formatPeakDay = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };
  
  // Calculate total flow state count
  const totalFlowStates = sortedAnalytics.reduce((sum, day) => sum + day.flowStates, 0);
  
  // Get day name (short) from date
  const getDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  
  // Get full date format
  const getFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };
  
  // Calculate the maximum focus time to normalize chart heights
  const maxFocusTime = Math.max(...sortedAnalytics.map(day => day.focusTime), 1);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Focus Time Analysis</CardTitle>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex space-x-1 h-64">
          {/* Bar chart visualization */}
          <div className="flex-1 flex items-end justify-between space-x-1">
            {sortedAnalytics.map((day, index) => {
              const heightPercentage = (day.focusTime / maxFocusTime) * 100;
              const flowHeightPercentage = (day.flowStates / 5) * 100; // Normalize to max of 5 flow states
              
              return (
                <div key={index} className="flex-1 group relative">
                  <div className="h-52 bg-blue-100 dark:bg-blue-900 rounded-t relative overflow-hidden">
                    <div 
                      className="absolute bottom-0 w-full bg-primary transition-all"
                      style={{ height: `${heightPercentage}%` }}
                    ></div>
                    
                    {/* Flow state indicator */}
                    <div 
                      className="absolute bottom-0 w-1/3 left-1/3 bg-accent opacity-60 transition-all"
                      style={{ height: `${flowHeightPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
                    {getFullDate(day.date)}
                  </p>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-24 bg-white dark:bg-gray-700 shadow-lg rounded p-2 text-xs z-10 min-w-[150px]">
                    <p className="font-medium text-gray-900 dark:text-white">{formatPeakDay(day.date)}</p>
                    <p className="text-gray-500 dark:text-gray-400">Focus: {formatTotalFocusTime(day.focusTime)}</p>
                    <p className="text-accent">Flow states: {day.flowStates}</p>
                    <p className="text-primary">Productivity: {day.productivity}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total focus time</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatTotalFocusTime(totalFocusTime)}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Peak performance day</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">{formatPeakDay(peakPerformanceDay.date)}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Flow state frequency</p>
            <p className="text-xl font-semibold text-gray-900 dark:text-white">{totalFlowStates} sessions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
