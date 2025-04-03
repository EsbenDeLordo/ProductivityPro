import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProjects } from "@/context/ProjectContext";
import { useToast } from "@/hooks/use-toast";
import { insertProjectSchema } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Extend the insert schema with client-side validation
const formSchema = insertProjectSchema.extend({
  name: z.string().min(2, { message: "Project name must be at least 2 characters" }),
  description: z.string().optional(),
  deadline: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectModal({ isOpen, onClose }: ProjectModalProps) {
  const { createProject } = useProjects();
  const { toast } = useToast();
  const userId = 1; // For demo purposes
  
  // Get project templates
  const { data: templates = [] } = useQuery({
    queryKey: ['/api/project-templates'],
    queryFn: () => fetch('/api/project-templates').then(res => res.json()),
    enabled: isOpen,
  });

  // Form setup
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "video",
      userId,
      deadline: "",
      aiAssistanceEnabled: true,
      colorCode: "#3B82F6",
      icon: "videocam"
    }
  });
  
  const { isSubmitting } = form.formState;
  
  // Map project type to icon and color
  const typeIconMap: Record<string, { icon: string, color: string }> = {
    video: { icon: "videocam", color: "#10B981" },
    research: { icon: "psychology", color: "#3B82F6" },
    guide: { icon: "menu_book", color: "#8B5CF6" },
    podcast: { icon: "mic", color: "#F59E0B" },
    custom: { icon: "folder", color: "#EC4899" }
  };
  
  // Update icon and color when type changes
  useEffect(() => {
    const type = form.watch("type");
    if (type && typeIconMap[type]) {
      form.setValue("icon", typeIconMap[type].icon);
      form.setValue("colorCode", typeIconMap[type].color);
    }
  }, [form.watch("type")]);
  
  const onSubmit = async (data: FormData) => {
    try {
      const newProject = await createProject(data);
      toast({
        title: "Project created",
        description: "Your new project has been created successfully."
      });
      form.reset();
      // Force a refresh of the projects list
      await queryClient.invalidateQueries({ queryKey: [`/api/projects/${data.userId}`] });
      await queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center">
            <div className="mr-4 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900">
              <span className="material-icons text-primary dark:text-blue-300">add_task</span>
            </div>
            <div>
              <DialogTitle className="text-lg">Create New Project</DialogTitle>
              <DialogDescription>Set up a new project with templates and AI assistance</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="New project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Type</FormLabel>
                  <Select 
                    value={field.value} 
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="video">Video Production</SelectItem>
                      <SelectItem value="research">Research Paper</SelectItem>
                      <SelectItem value="guide">Practical Guide</SelectItem>
                      <SelectItem value="podcast">Podcast Episode</SelectItem>
                      <SelectItem value="custom">Custom Template</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brief Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="What's this project about?" 
                      {...field} 
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="aiAssistanceEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Enable AI assistance</FormLabel>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Let AI help you with research, drafting, and organization
                    </p>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
