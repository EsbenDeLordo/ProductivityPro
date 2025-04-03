import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentSummarizer from "@/components/assistant/ContentSummarizer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContentTools() {
  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Content Tools</h1>
      
      <Tabs defaultValue="summarize" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="summarize">Summarize</TabsTrigger>
          <TabsTrigger value="analyze" disabled>Analyze</TabsTrigger>
          <TabsTrigger value="extract" disabled>Extract Key Points</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summarize">
          <ContentSummarizer />
        </TabsContent>
        
        <TabsContent value="analyze">
          <Card>
            <CardHeader>
              <CardTitle>Content Analysis</CardTitle>
              <CardDescription>
                Get detailed analysis of your content including themes, tone, and readability metrics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">This feature is coming soon!</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="extract">
          <Card>
            <CardHeader>
              <CardTitle>Key Points Extraction</CardTitle>
              <CardDescription>
                Extract actionable key points and insights from your content.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">This feature is coming soon!</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}