import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { FileText, CheckCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContentTools() {
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [summaryMaxLength, setSummaryMaxLength] = useState(500);
  const { toast } = useToast();

  const summarizeMutation = useMutation({
    mutationFn: async ({ content, maxLength }: { content: string, maxLength: number }) => {
      const response = await apiRequest(
        'POST',
        '/api/summarize',
        { content, maxLength }
      );
      const data = await response.json();
      return data as { summary: string };
    },
    onSuccess: (data) => {
      setSummary(data.summary);
      toast({
        title: 'Content summarized',
        description: 'Your content has been processed successfully.',
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Summarization failed',
        description: 'There was an error processing your content. Please try again.',
        variant: 'destructive',
      });
      console.error('Summarization error:', error);
    },
  });

  const handleSummarize = () => {
    if (!content.trim()) {
      toast({
        title: 'Content required',
        description: 'Please enter some content to summarize.',
        variant: 'destructive',
      });
      return;
    }

    summarizeMutation.mutate({ content, maxLength: summaryMaxLength });
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setContent(clipboardText);
      toast({
        title: 'Content pasted',
        description: 'Clipboard content has been pasted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Paste failed',
        description: 'Could not access clipboard content. Please paste manually.',
        variant: 'destructive',
      });
      console.error('Paste error:', error);
    }
  };

  const handleCopy = async () => {
    if (!summary) {
      toast({
        title: 'Nothing to copy',
        description: 'Please summarize content first before copying.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(summary);
      toast({
        title: 'Copied to clipboard',
        description: 'Summary has been copied to your clipboard.',
      });
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Could not copy to clipboard. Please copy manually.',
        variant: 'destructive',
      });
      console.error('Copy error:', error);
    }
  };

  const handleClear = () => {
    setContent('');
    setSummary('');
    toast({
      title: 'Content cleared',
      description: 'All content has been cleared.',
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold">Content Tools</h1>
        <p className="text-muted-foreground">Process and transform your productivity protocols and content</p>
      </div>

      <Tabs defaultValue="summarize" className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-4">
          <TabsTrigger value="summarize">Summarize Content</TabsTrigger>
          <TabsTrigger value="format" disabled>Format (Coming Soon)</TabsTrigger>
          <TabsTrigger value="extract" disabled>Extract Tasks (Coming Soon)</TabsTrigger>
        </TabsList>

        <TabsContent value="summarize" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Input Content</CardTitle>
                <CardDescription>
                  Paste your Huberman protocols or other content to summarize
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full pr-4">
                  <Textarea
                    placeholder="Enter content to summarize..."
                    className="min-h-[350px] resize-none"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={handlePaste}>
                    <FileText className="mr-2 h-4 w-4" />
                    Paste
                  </Button>
                  <Button variant="outline" onClick={handleClear}>
                    Clear
                  </Button>
                </div>
                <Button 
                  onClick={handleSummarize} 
                  disabled={!content.trim() || summarizeMutation.isPending}
                >
                  {summarizeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Summarize'
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
                <CardDescription>
                  AI-generated summary of your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full pr-4">
                  {summary ? (
                    <div className="whitespace-pre-wrap">{summary}</div>
                  ) : (
                    <div className="text-muted-foreground italic text-center mt-16">
                      {summarizeMutation.isPending ? (
                        <div className="flex flex-col items-center space-y-2">
                          <Loader2 className="h-12 w-12 animate-spin" />
                          <p>Generating your summary...</p>
                        </div>
                      ) : (
                        <p>Your summary will appear here</p>
                      )}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Max length:</span>
                  <select
                    value={summaryMaxLength}
                    onChange={(e) => setSummaryMaxLength(Number(e.target.value))}
                    className="border rounded p-1 text-sm"
                    disabled={summarizeMutation.isPending}
                  >
                    <option value={300}>300 chars</option>
                    <option value={500}>500 chars</option>
                    <option value={1000}>1000 chars</option>
                    <option value={2000}>2000 chars</option>
                  </select>
                </div>
                <Button 
                  variant="outline" 
                  onClick={handleCopy}
                  disabled={!summary}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Usage Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                <li>Paste Huberman protocols or any productivity content to get a concise summary</li>
                <li>Adjust the maximum length to control the detail level of your summary</li>
                <li>Use the summarized content for quick reference or to share with your team</li>
                <li>For best results, provide structured content with clear sections</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}