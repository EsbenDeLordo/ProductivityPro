import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContentSummarizer() {
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [maxLength, setMaxLength] = useState(500);
  const { toast } = useToast();

  const summarizeMutation = useMutation({
    mutationFn: async (data: { content: string; maxLength: number }) => {
      const res = await apiRequest("POST", "/api/summarize", data);
      return res.json();
    },
    onSuccess: (data) => {
      setSummary(data.summary);
      toast({
        title: "Summary Generated",
        description: "Content has been successfully summarized",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to summarize content: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSummarize = () => {
    if (!content.trim()) {
      toast({
        title: "Empty Content",
        description: "Please enter some content to summarize",
        variant: "destructive",
      });
      return;
    }

    summarizeMutation.mutate({ content, maxLength });
  };

  const handleClearAll = () => {
    setContent("");
    setSummary("");
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summary);
    toast({
      title: "Copied",
      description: "Summary copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Summarizer</CardTitle>
          <CardDescription>
            Paste your text below and get a concise, AI-powered summary of the key points.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Paste your content here..."
              className="min-h-[200px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm">Max Length:</span>
                <select
                  value={maxLength}
                  onChange={(e) => setMaxLength(Number(e.target.value))}
                  className="rounded-md border border-input bg-background px-3 py-1 text-sm"
                >
                  <option value={250}>Short (250 chars)</option>
                  <option value={500}>Medium (500 chars)</option>
                  <option value={1000}>Long (1000 chars)</option>
                  <option value={2000}>Very Long (2000 chars)</option>
                </select>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  disabled={summarizeMutation.isPending || (!content && !summary)}
                >
                  Clear All
                </Button>
                <Button
                  onClick={handleSummarize}
                  disabled={summarizeMutation.isPending || !content.trim()}
                >
                  {summarizeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Summarizing...
                    </>
                  ) : (
                    <>
                      <span className="material-icons mr-2 text-sm">psychology</span>
                      Summarize
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>
              AI-generated summary of your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-md bg-muted p-4">
                <p className="whitespace-pre-wrap">{summary}</p>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={handleCopySummary}>
                  <span className="material-icons mr-2 text-sm">content_copy</span>
                  Copy to Clipboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}