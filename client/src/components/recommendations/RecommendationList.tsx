import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Recommendation } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface RecommendationListProps {
  userId: number;
}

export default function RecommendationList({ userId }: RecommendationListProps) {
  const { toast } = useToast();
  const [filter, setFilter] = useState("active");
  
  // Get recommendations
  const { data: recommendations = [], isLoading } = useQuery<Recommendation[]>({
    queryKey: ['/api/recommendations', userId],
    queryFn: () => fetch(`/api/recommendations/${userId}`).then(res => res.json()),
  });
  
  // Filter recommendations based on status
  const filteredRecommendations = recommendations.filter(rec => {
    if (filter === "active") return !rec.isCompleted;
    if (filter === "completed") return rec.isCompleted;
    return true; // "all" filter
  });
  
  // Mutation to update recommendation
  const updateRecommendationMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: number, isCompleted: boolean }) => 
      apiRequest('PUT', `/api/recommendation/${id}`, { isCompleted }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations', userId] });
    }
  });
  
  // Mutation to generate new recommendations
  const generateRecommendationsMutation = useMutation({
    mutationFn: () => 
      apiRequest('POST', `/api/recommendations/generate/${userId}`, {
        workData: {
          currentTime: new Date().toISOString(),
          focusTime: 120, // 2 hours
          lastBreak: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          hydrationStatus: "low",
          productivity: 75
        }
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations', userId] });
      toast({
        title: "Recommendations generated",
        description: "New productivity recommendations have been created."
      });
    }
  });
  
  // Handle recommendation action
  const handleRecommendationAction = (recommendationId: number, isCompleted: boolean) => {
    updateRecommendationMutation.mutate({ id: recommendationId, isCompleted });
    
    toast({
      title: isCompleted ? "Recommendation completed" : "Recommendation skipped",
      description: isCompleted 
        ? "Great job! The recommendation has been marked as completed." 
        : "The recommendation has been noted for later."
    });
  };
  
  // Get the icon color based on recommendation type
  const getIconColor = (type: string) => {
    switch (type) {
      case "nsdr": return "text-accent";
      case "hydration": return "text-blue-500";
      case "exercise": return "text-secondary";
      case "focus": return "text-primary";
      case "light": return "text-yellow-500";
      default: return "text-gray-500";
    }
  };
  
  // Get the badge color based on recommendation type
  const getBadgeVariant = (type: string): "default" | "secondary" | "accent" | "outline" => {
    switch (type) {
      case "nsdr": return "accent";
      case "hydration": return "default";
      case "exercise": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          onClick={() => generateRecommendationsMutation.mutate()}
          disabled={generateRecommendationsMutation.isPending}
        >
          <span className="material-icons mr-2 text-sm">refresh</span>
          Generate New Recommendations
        </Button>
      </div>
      
      {isLoading ? (
        <div className="text-center py-12">
          <span className="material-icons text-4xl text-gray-400 animate-pulse">hourglass_top</span>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading recommendations...</p>
        </div>
      ) : filteredRecommendations.length > 0 ? (
        <div className="space-y-4">
          {filteredRecommendations.map((rec) => (
            <Card key={rec.id} className={rec.isCompleted ? "opacity-60" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-1">
                    <span className={`material-icons ${getIconColor(rec.type)}`}>{rec.icon}</span>
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{rec.title}</h3>
                      <Badge variant={getBadgeVariant(rec.type)} className="capitalize">
                        {rec.type}
                      </Badge>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">{rec.description}</p>
                    
                    {!rec.isCompleted && (
                      <div className="mt-4 flex">
                        <Button 
                          className="rounded-full"
                          style={{ 
                            backgroundColor: rec.type === 'nsdr' ? '#8B5CF6' : 
                                          rec.type === 'hydration' ? '#3B82F6' : 
                                          rec.type === 'exercise' ? '#10B981' :
                                          'hsl(var(--primary))'
                          }}
                          onClick={() => handleRecommendationAction(rec.id, true)}
                        >
                          {rec.actionText}
                        </Button>
                        
                        {rec.secondaryActionText && (
                          <Button 
                            variant="outline" 
                            className="ml-3 rounded-full"
                            onClick={() => handleRecommendationAction(rec.id, false)}
                          >
                            {rec.secondaryActionText}
                          </Button>
                        )}
                      </div>
                    )}
                    
                    {rec.isCompleted && (
                      <div className="mt-4 flex items-center text-green-600 dark:text-green-400">
                        <span className="material-icons mr-1 text-sm">check_circle</span>
                        <span className="text-sm">Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
          <span className="material-icons text-4xl text-gray-400">tips_and_updates</span>
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No recommendations found</h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {filter !== "all" 
              ? `No ${filter} recommendations available` 
              : "Generate new recommendations to get started"}
          </p>
          <Button 
            onClick={() => generateRecommendationsMutation.mutate()} 
            className="mt-4"
            disabled={generateRecommendationsMutation.isPending}
          >
            <span className="material-icons mr-2 text-sm">refresh</span>
            Generate Recommendations
          </Button>
        </div>
      )}
    </div>
  );
}
