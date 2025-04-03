import { useQuery, useMutation } from "@tanstack/react-query";
import { Recommendation } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAction: (recommendationId: number, isCompleted: boolean) => void;
}

function RecommendationCard({ recommendation, onAction }: RecommendationCardProps) {
  const handlePrimaryAction = () => {
    onAction(recommendation.id, true);
  };
  
  const handleSecondaryAction = () => {
    // For "remind later" or "skip", just mark as seen without completion
    onAction(recommendation.id, false);
  };

  return (
    <div className="py-4 first:pt-0">
      <div className="flex items-start">
        <div className="flex-shrink-0 pt-1">
          <span className="material-icons text-accent">{recommendation.icon}</span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-md font-medium text-gray-900 dark:text-white">{recommendation.title}</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{recommendation.description}</p>
          <div className="mt-3 flex">
            <Button 
              size="sm" 
              className="rounded-full"
              style={{ 
                backgroundColor: recommendation.type === 'nsdr' ? '#8B5CF6' : 
                                recommendation.type === 'hydration' ? '#10B981' : 
                                '#3B82F6'
              }}
              onClick={handlePrimaryAction}
            >
              {recommendation.actionText}
            </Button>
            
            {recommendation.secondaryActionText && (
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-3 rounded-full"
                onClick={handleSecondaryAction}
              >
                {recommendation.secondaryActionText}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WinDryftRecommendations() {
  const userId = 1; // For demo purposes
  
  // Get recommendations
  const { data: recommendations = [] } = useQuery<Recommendation[]>({
    queryKey: ['/api/recommendations', userId],
    queryFn: () => fetch(`/api/recommendations/${userId}`).then(res => res.json()),
  });
  
  // Filter out completed recommendations
  const activeRecommendations = recommendations.filter(rec => !rec.isCompleted);
  
  // Mutation to update recommendation
  const updateRecommendationMutation = useMutation({
    mutationFn: ({ id, isCompleted }: { id: number, isCompleted: boolean }) => 
      apiRequest('PUT', `/api/recommendation/${id}`, { isCompleted }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations', userId] });
    }
  });
  
  const handleRecommendationAction = (recommendationId: number, isCompleted: boolean) => {
    updateRecommendationMutation.mutate({ id: recommendationId, isCompleted });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between w-full">
          <CardTitle className="text-lg font-medium">Pocket WinDryft Mode</CardTitle>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
            <span className="material-icons text-xs mr-1">auto_awesome</span>
            Personalized
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-5 divide-y divide-gray-200 dark:divide-gray-700">
        {activeRecommendations.length > 0 ? (
          activeRecommendations.map(recommendation => (
            <RecommendationCard 
              key={recommendation.id} 
              recommendation={recommendation}
              onAction={handleRecommendationAction}
            />
          ))
        ) : (
          <div className="py-6 text-center">
            <span className="material-icons text-3xl text-gray-400 mb-2">check_circle</span>
            <p className="text-gray-500 dark:text-gray-400">All caught up! No active recommendations.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
