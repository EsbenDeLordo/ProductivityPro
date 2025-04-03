import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertProjectSchema,
  insertWorkSessionSchema,
  insertAssistantMessageSchema
} from "@shared/schema";
import { 
  generateAssistantResponse, 
  generateProjectSuggestions,
  generateProductivityRecommendations,
  summarizeContent,
  extractKeyPoints,
  type AIProvider
} from "./ai";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes - prefix all routes with /api
  
  // User routes
  app.post("/api/auth/login", async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    const user = await storage.getUserByUsername(username);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Don't send password back to client
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/user/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = user;
    
    res.json(userWithoutPassword);
  });

  // Project routes
  app.get("/api/projects", async (req, res) => {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : null;
    
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "Valid user ID query parameter is required" });
    }
    
    const projects = await storage.getProjects(userId);
    res.json(projects);
  });

  app.get("/api/project/:id", async (req, res) => {
    const projectId = parseInt(req.params.id);
    
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    const project = await storage.getProject(projectId);
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.json(project);
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put("/api/project/:id", async (req, res) => {
    const projectId = parseInt(req.params.id);
    
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    try {
      const existingProject = await storage.getProject(projectId);
      
      if (!existingProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Remove undefined values to prevent overwriting with null
      const updateData = Object.fromEntries(
        Object.entries(req.body).filter(([_, v]) => v !== undefined)
      );

      const updatedProject = await storage.updateProject(projectId, {
        ...existingProject,
        ...updateData,
        timeLogged: updateData.timeLogged ?? existingProject.timeLogged ?? 0
      });
      
      res.json(updatedProject);
    } catch (error) {
      console.error('Project update error:', error);
      res.status(500).json({ 
        message: "Failed to update project",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  app.delete("/api/project/:id", async (req, res) => {
    const projectId = parseInt(req.params.id);
    
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    const deleted = await storage.deleteProject(projectId);
    
    if (!deleted) {
      return res.status(404).json({ message: "Project not found" });
    }
    
    res.status(204).end();
  });

  // Project templates routes
  app.get("/api/project-templates", async (req, res) => {
    const templates = await storage.getProjectTemplates();
    res.json(templates);
  });

  app.get("/api/project-template/:id", async (req, res) => {
    const templateId = parseInt(req.params.id);
    
    if (isNaN(templateId)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }
    
    const template = await storage.getProjectTemplate(templateId);
    
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    res.json(template);
  });

  app.get("/api/project-template/type/:type", async (req, res) => {
    const type = req.params.type;
    const template = await storage.getProjectTemplateByType(type);
    
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    
    res.json(template);
  });

  // Work session routes
  app.get("/api/work-sessions/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const sessions = await storage.getWorkSessions(userId);
    res.json(sessions);
  });

  app.get("/api/work-sessions/project/:projectId", async (req, res) => {
    const projectId = parseInt(req.params.projectId);
    
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    
    const sessions = await storage.getWorkSessionsByProject(projectId);
    res.json(sessions);
  });

  app.get("/api/work-session/current/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const session = await storage.getCurrentWorkSession(userId);
    
    if (!session) {
      return res.status(404).json({ message: "No active work session found" });
    }
    
    res.json(session);
  });

  app.post("/api/work-sessions", async (req, res) => {
    try {
      const { projectId, type } = req.body;
      const userId = 1; // For demo purposes
      
      // Check if there's already an active session for this user
      const currentSession = await storage.getCurrentWorkSession(userId);
      if (currentSession) {
        // End the current session first
        await storage.endWorkSession(currentSession.id);
      }
      
      const session = await storage.createWorkSession({
        userId,
        projectId,
        startTime: new Date(),
        type
      });
      
      res.status(201).json(session);
    } catch (error) {
      console.error('Session creation error:', error);
      res.status(500).json({ message: "Failed to create work session" });
    }
  });

  app.put("/api/work-session/:id", async (req, res) => {
    const sessionId = parseInt(req.params.id);
    
    if (isNaN(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }
    
    try {
      const updatedSession = await storage.updateWorkSession(sessionId, req.body);
      res.json(updatedSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to update work session" });
    }
  });

  app.post("/api/work-session/:id/end", async (req, res) => {
    const sessionId = parseInt(req.params.id);
    
    if (isNaN(sessionId)) {
      return res.status(400).json({ message: "Invalid session ID" });
    }
    
    try {
      const endedSession = await storage.endWorkSession(sessionId);
      res.json(endedSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to end work session" });
    }
  });

  // Recommendations routes
  app.get("/api/recommendations/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const recommendations = await storage.getRecommendations(userId);
    res.json(recommendations);
  });

  app.put("/api/recommendation/:id", async (req, res) => {
    const recommendationId = parseInt(req.params.id);
    
    if (isNaN(recommendationId)) {
      return res.status(400).json({ message: "Invalid recommendation ID" });
    }
    
    try {
      const updatedRecommendation = await storage.updateRecommendation(recommendationId, req.body);
      res.json(updatedRecommendation);
    } catch (error) {
      res.status(500).json({ message: "Failed to update recommendation" });
    }
  });

  app.post("/api/recommendations/generate/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      // Generate new recommendations using AI
      const { workData, provider } = req.body;
      const aiProvider = (provider as AIProvider) || 'auto';
      
      const recommendationsData = await generateProductivityRecommendations(
        userId, 
        workData || {}, 
        aiProvider
      );
      
      // Save the recommendations to the database
      const savedRecommendations = [];
      
      for (const recData of recommendationsData) {
        const recommendation = await storage.createRecommendation({
          userId,
          type: recData.type,
          title: recData.title,
          description: recData.description,
          icon: recData.icon,
          actionText: recData.actionText,
          secondaryActionText: recData.secondaryActionText
        });
        
        savedRecommendations.push(recommendation);
      }
      
      res.json(savedRecommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // Assistant message routes
  app.get("/api/assistant-messages/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
    
    const messages = await storage.getAssistantMessages(userId, projectId);
    res.json(messages);
  });

  app.post("/api/assistant-messages", async (req, res) => {
    try {
      const messageData = insertAssistantMessageSchema.parse(req.body);
      const message = await storage.createAssistantMessage(messageData);
      
      // If the message is from the user, generate a response from the AI
      if (messageData.sender === "user") {
        // Get project context if projectId is provided
        let projectContext = "";
        if (messageData.projectId) {
          const project = await storage.getProject(messageData.projectId);
          if (project) {
            projectContext = `Project: ${project.name}, Type: ${project.type}, Description: ${project.description || ""}`;
          }
        }
        
        // Extract provider from request or use auto
        const provider = (req.body.provider as AIProvider) || 'auto';
        
        // Generate AI response
        const aiResponse = await generateAssistantResponse(
          messageData.userId,
          messageData.projectId || null,
          messageData.content,
          projectContext,
          provider
        );
        
        // Save the AI response
        const assistantMessage = await storage.createAssistantMessage({
          userId: messageData.userId,
          projectId: messageData.projectId,
          content: aiResponse ?? "",
          sender: "assistant",
          provider: provider // Save which provider was used
        });
        
        res.status(201).json({
          userMessage: message,
          assistantMessage
        });
      } else {
        res.status(201).json(message);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create message" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const range = req.query.range ? parseInt(req.query.range as string) : 7;
    
    const analytics = await storage.getDailyAnalytics(userId, range);
    res.json(analytics);
  });

  // Project suggestions route
  app.post("/api/project-suggestions", async (req, res) => {
    const { projectType, projectName, projectDescription, provider } = req.body;
    
    if (!projectType || !projectName) {
      return res.status(400).json({ message: "Project type and name are required" });
    }
    
    try {
      const suggestions = await generateProjectSuggestions(
        projectType,
        projectName,
        projectDescription || "",
        (provider as AIProvider) || 'auto'
      );
      
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate project suggestions" });
    }
  });
  
  // Content summarization route
  app.post("/api/summarize", async (req, res) => {
    const { content, maxLength, format, maxPoints, provider } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }
    
    try {
      let summary;
      const aiProvider = (provider as AIProvider) || 'auto';
      
      if (format === 'key_points') {
        // Use dedicated key points extraction function
        summary = await extractKeyPoints(content, maxPoints || 5, aiProvider);
      } else {
        summary = await summarizeContent(content, maxLength || 500, aiProvider);
      }
      
      res.json({ summary });
    } catch (error) {
      console.error("API error:", error);
      res.status(500).json({ message: "Failed to process content" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
