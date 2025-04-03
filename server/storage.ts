import {
  users, type User, type InsertUser,
  projects, type Project, type InsertProject,
  projectTemplates, type ProjectTemplate, type InsertProjectTemplate,
  workSessions, type WorkSession, type InsertWorkSession,
  recommendations, type Recommendation, type InsertRecommendation,
  assistantMessages, type AssistantMessage, type InsertAssistantMessage,
  dailyAnalytics, type DailyAnalytics, type InsertDailyAnalytics
} from "@shared/schema";
import { db } from "./db";
import { eq, and, isNull, gte, lt, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Project methods
  getProjects(userId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project>;
  deleteProject(id: number): Promise<boolean>;

  // Project template methods
  getProjectTemplates(): Promise<ProjectTemplate[]>;
  getProjectTemplate(id: number): Promise<ProjectTemplate | undefined>;
  getProjectTemplateByType(type: string): Promise<ProjectTemplate | undefined>;
  createProjectTemplate(template: InsertProjectTemplate): Promise<ProjectTemplate>;

  // Work session methods
  getWorkSessions(userId: number): Promise<WorkSession[]>;
  getWorkSessionsByProject(projectId: number): Promise<WorkSession[]>;
  getCurrentWorkSession(userId: number): Promise<WorkSession | undefined>;
  createWorkSession(session: InsertWorkSession): Promise<WorkSession>;
  updateWorkSession(id: number, session: Partial<WorkSession>): Promise<WorkSession>;
  endWorkSession(id: number): Promise<WorkSession>;

  // Recommendation methods
  getRecommendations(userId: number): Promise<Recommendation[]>;
  createRecommendation(recommendation: InsertRecommendation): Promise<Recommendation>;
  updateRecommendation(id: number, recommendation: Partial<Recommendation>): Promise<Recommendation>;

  // Assistant message methods
  getAssistantMessages(userId: number, projectId?: number): Promise<AssistantMessage[]>;
  createAssistantMessage(message: InsertAssistantMessage): Promise<AssistantMessage>;

  // Analytics methods
  getDailyAnalytics(userId: number, range?: number): Promise<DailyAnalytics[]>;
  createOrUpdateDailyAnalytics(analytics: InsertDailyAnalytics): Promise<DailyAnalytics>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private projects: Map<number, Project>;
  private projectTemplates: Map<number, ProjectTemplate>;
  private workSessions: Map<number, WorkSession>;
  private recommendations: Map<number, Recommendation>;
  private assistantMessages: Map<number, AssistantMessage>;
  private dailyAnalytics: Map<number, DailyAnalytics>;

  private currentIds: {
    users: number;
    projects: number;
    projectTemplates: number;
    workSessions: number;
    recommendations: number;
    assistantMessages: number;
    dailyAnalytics: number;
  };

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.projectTemplates = new Map();
    this.workSessions = new Map();
    this.recommendations = new Map();
    this.assistantMessages = new Map();
    this.dailyAnalytics = new Map();

    this.currentIds = {
      users: 1,
      projects: 1,
      projectTemplates: 1,
      workSessions: 1,
      recommendations: 1,
      assistantMessages: 1,
      dailyAnalytics: 1
    };

    // Add default project templates
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize default project templates
    const videoTemplate: InsertProjectTemplate = {
      name: "Video Production",
      type: "video",
      sections: [
        { name: "Research", description: "Collect background information and source material" },
        { name: "Script Drafts", description: "Write and refine script versions" },
        { name: "Media Clips", description: "Organize visual and audio elements" },
        { name: "Storyboard", description: "Plan visual sequences and transitions" },
        { name: "Notes", description: "General notes and ideas" }
      ]
    };

    const researchTemplate: InsertProjectTemplate = {
      name: "Research Paper",
      type: "research",
      sections: [
        { name: "Literature Review", description: "Analysis of existing research" },
        { name: "Methodology", description: "Research approach and methods" },
        { name: "Data Collection", description: "Raw data and observations" },
        { name: "Analysis", description: "Data processing and findings" },
        { name: "Conclusions", description: "Insights and implications" }
      ]
    };

    const guideTemplate: InsertProjectTemplate = {
      name: "Practical Guide",
      type: "guide",
      sections: [
        { name: "Background", description: "Context and foundational information" },
        { name: "Protocol", description: "Step-by-step instructions" },
        { name: "Resources", description: "Supporting materials and references" },
        { name: "FAQ", description: "Common questions and answers" },
        { name: "Case Studies", description: "Real-world applications and examples" }
      ]
    };

    const podcastTemplate: InsertProjectTemplate = {
      name: "Podcast Episode",
      type: "podcast",
      sections: [
        { name: "Topic Research", description: "Background information on the subject" },
        { name: "Guest Info", description: "Notes on interview subjects" },
        { name: "Questions", description: "Prepared interview questions" },
        { name: "Show Notes", description: "Summary and reference points" },
        { name: "Follow-up", description: "Post-recording action items" }
      ]
    };

    this.createProjectTemplate(videoTemplate);
    this.createProjectTemplate(researchTemplate);
    this.createProjectTemplate(guideTemplate);
    this.createProjectTemplate(podcastTemplate);

    // Create demo user
    const demoUser: InsertUser = {
      username: "demo",
      password: "password",
      email: "",
      name: "Tadeáš Novák",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces"
    };

    const user = this.createUser(demoUser);

    // Create sample projects
    const colorCodes = ["#10B981", "#8B5CF6", "#3B82F6"];
    const icons = ["videocam", "menu_book", "psychology"];

    const projectData = [
      {
        name: "McMillions Video",
        description: "Documentary style video explainer",
        type: "video",
        progress: 72,
        deadline: "2023-06-30",
        aiAssistanceEnabled: true,
        colorCode: colorCodes[0],
        icon: icons[0],
        files: 12,
        timeLogged: 495 // 8h 15m
      },
      {
        name: "Sleep Protocol Guide",
        description: "Research-based sleep improvement plan",
        type: "guide",
        progress: 45,
        deadline: "2023-07-03",
        aiAssistanceEnabled: true,
        colorCode: colorCodes[1],
        icon: icons[1],
        files: 8,
        timeLogged: 330 // 5h 30m
      },
      {
        name: "Focus Enhancement",
        description: "Cognitive techniques research",
        type: "research",
        progress: 60,
        deadline: "2023-07-06",
        aiAssistanceEnabled: true,
        colorCode: colorCodes[2],
        icon: icons[2],
        files: 15,
        timeLogged: 465 // 7h 45m
      }
    ];

    projectData.forEach((data) => {
      this.createProject({
        name: data.name,
        description: data.description,
        type: data.type,
        userId: user.id,
        deadline: data.deadline,
        aiAssistanceEnabled: data.aiAssistanceEnabled,
        colorCode: data.colorCode,
        icon: data.icon
      });
    });

    // Create sample recommendations
    const recommendationsData = [
      {
        type: "nsdr",
        title: "NSDR Break Recommended",
        description: "You've been working intensely for 2h 35m. A 10-minute Non-Sleep Deep Rest session now can help consolidate learning and restore focus.",
        icon: "tips_and_updates",
        actionText: "Start NSDR Session",
        secondaryActionText: "Remind Later"
      },
      {
        type: "hydration",
        title: "Hydration Check",
        description: "You haven't logged hydration in 2 hours. Maintaining hydration is critical for cognitive performance and focus.",
        icon: "local_drink",
        actionText: "Log Hydration",
        secondaryActionText: ""
      },
      {
        type: "exercise",
        title: "Movement Break Due",
        description: "Based on your preferences, it's time for a 5-minute exercise break. Brief movement can increase BDNF and boost creativity.",
        icon: "fitness_center",
        actionText: "Start Exercise Timer",
        secondaryActionText: "Skip"
      }
    ];

    recommendationsData.forEach((data) => {
      this.createRecommendation({
        userId: user.id,
        type: data.type,
        title: data.title,
        description: data.description,
        icon: data.icon,
        actionText: data.actionText,
        secondaryActionText: data.secondaryActionText
      });
    });

    // Create sample assistant messages
    const assistantMessagesData = [
      {
        content: "I've analyzed your McMillions video project. Would you like me to help organize research materials or suggest a script outline?",
        sender: "assistant",
        projectId: 1
      },
      {
        content: "I need help organizing the research materials. Can you categorize them by topic?",
        sender: "user",
        projectId: 1
      },
      {
        content: "I've analyzed your 15 research files and categorized them into: Historical Context (4), Key Characters (5), Legal Proceedings (3), and Impact Analysis (3). Would you like me to create labeled folders?",
        sender: "assistant",
        projectId: 1
      }
    ];

    assistantMessagesData.forEach((data) => {
      this.createAssistantMessage({
        userId: user.id,
        projectId: data.projectId,
        content: data.content,
        sender: data.sender
      });
    });

    // Create sample daily analytics
    const today = new Date();
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    const getDaysAgo = (days: number) => {
      const date = new Date(today);
      date.setDate(date.getDate() - days);
      return date;
    };

    const analyticsData = [
      {
        date: formatDate(getDaysAgo(6)), // Monday
        focusTime: 375, // 6h 15m
        flowStates: 3,
        productivity: 85
      },
      {
        date: formatDate(getDaysAgo(5)), // Tuesday
        focusTime: 480, // 8h
        flowStates: 4,
        productivity: 95
      },
      {
        date: formatDate(getDaysAgo(4)), // Wednesday
        focusTime: 330, // 5h 30m
        flowStates: 2,
        productivity: 70
      },
      {
        date: formatDate(getDaysAgo(3)), // Thursday
        focusTime: 420, // 7h
        flowStates: 3,
        productivity: 88
      },
      {
        date: formatDate(getDaysAgo(2)), // Friday
        focusTime: 390, // 6h 30m
        flowStates: 3,
        productivity: 82
      },
      {
        date: formatDate(getDaysAgo(1)), // Saturday
        focusTime: 180, // 3h
        flowStates: 1,
        productivity: 65
      },
      {
        date: formatDate(today), // Sunday
        focusTime: 384, // 6h 24m
        flowStates: 0,
        productivity: 92
      }
    ];

    analyticsData.forEach((data) => {
      this.createOrUpdateDailyAnalytics({
        userId: user.id,
        date: data.date,
        focusTime: data.focusTime,
        flowStates: data.flowStates,
        productivity: data.productivity
      });
    });

    // Create current work session
    this.createWorkSession({
      userId: user.id,
      projectId: 1,
      startTime: new Date(),
      type: "focus"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Project methods
  async getProjects(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.userId === userId
    );
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentIds.projects++;
    const project: Project = {
      ...insertProject,
      id,
      status: "active",
      progress: 0,
      createdAt: new Date(),
      files: 0,
      timeLogged: 0
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: number, projectUpdate: Partial<Project>): Promise<Project> {
    const project = this.projects.get(id);
    if (!project) {
      throw new Error(`Project with id ${id} not found`);
    }

    const updatedProject = { ...project, ...projectUpdate };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Project template methods
  async getProjectTemplates(): Promise<ProjectTemplate[]> {
    return Array.from(this.projectTemplates.values());
  }

  async getProjectTemplate(id: number): Promise<ProjectTemplate | undefined> {
    return this.projectTemplates.get(id);
  }

  async getProjectTemplateByType(type: string): Promise<ProjectTemplate | undefined> {
    return Array.from(this.projectTemplates.values()).find(
      (template) => template.type === type
    );
  }

  async createProjectTemplate(insertTemplate: InsertProjectTemplate): Promise<ProjectTemplate> {
    const id = this.currentIds.projectTemplates++;
    const template: ProjectTemplate = { ...insertTemplate, id };
    this.projectTemplates.set(id, template);
    return template;
  }

  // Work session methods
  async getWorkSessions(userId: number): Promise<WorkSession[]> {
    return Array.from(this.workSessions.values()).filter(
      (session) => session.userId === userId
    );
  }

  async getWorkSessionsByProject(projectId: number): Promise<WorkSession[]> {
    return Array.from(this.workSessions.values()).filter(
      (session) => session.projectId === projectId
    );
  }

  async getCurrentWorkSession(userId: number): Promise<WorkSession | undefined> {
    return Array.from(this.workSessions.values()).find(
      (session) => session.userId === userId && !session.endTime
    );
  }

  async createWorkSession(insertSession: InsertWorkSession): Promise<WorkSession> {
    const id = this.currentIds.workSessions++;
    const session: WorkSession = {
      ...insertSession,
      id,
      endTime: null,
      duration: null,
      notes: null,
      isFlowState: false
    };
    this.workSessions.set(id, session);
    return session;
  }

  async updateWorkSession(id: number, sessionUpdate: Partial<WorkSession>): Promise<WorkSession> {
    const session = this.workSessions.get(id);
    if (!session) {
      throw new Error(`Work session with id ${id} not found`);
    }

    const updatedSession = { ...session, ...sessionUpdate };
    this.workSessions.set(id, updatedSession);
    return updatedSession;
  }

  async endWorkSession(id: number): Promise<WorkSession> {
    const session = this.workSessions.get(id);
    if (!session) {
      throw new Error(`Work session with id ${id} not found`);
    }

    const endTime = new Date();
    const startTime = new Date(session.startTime);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));

    const updatedSession = {
      ...session,
      endTime,
      duration: durationMinutes
    };

    this.workSessions.set(id, updatedSession);

    // Update project timeLogged if projectId is set
    if (session.projectId) {
      const project = this.projects.get(session.projectId);
      if (project) {
        const updatedProject = {
          ...project,
          timeLogged: project.timeLogged + durationMinutes
        };
        this.projects.set(project.id, updatedProject);
      }
    }

    return updatedSession;
  }

  // Recommendation methods
  async getRecommendations(userId: number): Promise<Recommendation[]> {
    return Array.from(this.recommendations.values()).filter(
      (recommendation) => recommendation.userId === userId
    );
  }

  async createRecommendation(insertRecommendation: InsertRecommendation): Promise<Recommendation> {
    const id = this.currentIds.recommendations++;
    const recommendation: Recommendation = {
      ...insertRecommendation,
      id,
      isCompleted: false,
      createdAt: new Date()
    };
    this.recommendations.set(id, recommendation);
    return recommendation;
  }

  async updateRecommendation(id: number, recommendationUpdate: Partial<Recommendation>): Promise<Recommendation> {
    const recommendation = this.recommendations.get(id);
    if (!recommendation) {
      throw new Error(`Recommendation with id ${id} not found`);
    }

    const updatedRecommendation = { ...recommendation, ...recommendationUpdate };
    this.recommendations.set(id, updatedRecommendation);
    return updatedRecommendation;
  }

  // Assistant message methods
  async getAssistantMessages(userId: number, projectId?: number): Promise<AssistantMessage[]> {
    return Array.from(this.assistantMessages.values())
      .filter((message) => {
        if (projectId) {
          return message.userId === userId && message.projectId === projectId;
        }
        return message.userId === userId;
      })
      .sort((a, b) => {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      });
  }

  async createAssistantMessage(insertMessage: InsertAssistantMessage): Promise<AssistantMessage> {
    const id = this.currentIds.assistantMessages++;
    const message: AssistantMessage = {
      ...insertMessage,
      id,
      timestamp: new Date()
    };
    this.assistantMessages.set(id, message);
    return message;
  }

  // Analytics methods
  async getDailyAnalytics(userId: number, range: number = 7): Promise<DailyAnalytics[]> {
    const userAnalytics = Array.from(this.dailyAnalytics.values()).filter(
      (analytics) => analytics.userId === userId
    );

    // Sort by date descending and limit to range
    return userAnalytics
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, range);
  }

  async createOrUpdateDailyAnalytics(insertAnalytics: InsertDailyAnalytics): Promise<DailyAnalytics> {
    // Check if analytics for this date already exists
    const existingAnalytics = Array.from(this.dailyAnalytics.values()).find(
      (analytics) => analytics.userId === insertAnalytics.userId && analytics.date === insertAnalytics.date
    );

    if (existingAnalytics) {
      // Update existing analytics
      const updatedAnalytics = {
        ...existingAnalytics,
        ...insertAnalytics
      };
      this.dailyAnalytics.set(existingAnalytics.id, updatedAnalytics);
      return updatedAnalytics;
    } else {
      // Create new analytics
      const id = this.currentIds.dailyAnalytics++;
      const analytics: DailyAnalytics = {
        ...insertAnalytics,
        id
      };
      this.dailyAnalytics.set(id, analytics);
      return analytics;
    }
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getProjects(userId: number): Promise<Project[]> {
    return db.select().from(projects).where(eq(projects.userId, userId));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(insertProject)
      .returning();
    return project;
  }

  async updateProject(id: number, projectUpdate: Partial<Project>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set(projectUpdate)
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: number): Promise<boolean> {
    const result = await db
      .delete(projects)
      .where(eq(projects.id, id))
      .returning({ id: projects.id });
    return result.length > 0;
  }

  async getProjectTemplates(): Promise<ProjectTemplate[]> {
    return db.select().from(projectTemplates);
  }

  async getProjectTemplate(id: number): Promise<ProjectTemplate | undefined> {
    const [template] = await db.select().from(projectTemplates).where(eq(projectTemplates.id, id));
    return template || undefined;
  }

  async getProjectTemplateByType(type: string): Promise<ProjectTemplate | undefined> {
    const [template] = await db.select().from(projectTemplates).where(eq(projectTemplates.type, type));
    return template || undefined;
  }

  async createProjectTemplate(insertTemplate: InsertProjectTemplate): Promise<ProjectTemplate> {
    const [template] = await db
      .insert(projectTemplates)
      .values(insertTemplate)
      .returning();
    return template;
  }

  async getWorkSessions(userId: number): Promise<WorkSession[]> {
    return db.select().from(workSessions).where(eq(workSessions.userId, userId));
  }

  async getWorkSessionsByProject(projectId: number): Promise<WorkSession[]> {
    return db.select().from(workSessions).where(eq(workSessions.projectId, projectId));
  }

  async getCurrentWorkSession(userId: number): Promise<WorkSession | undefined> {
    const [session] = await db
      .select()
      .from(workSessions)
      .where(and(
        eq(workSessions.userId, userId),
        isNull(workSessions.endTime)
      ))
      .orderBy(desc(workSessions.startTime))
      .limit(1);
    return session || undefined;
  }

  async createWorkSession(insertSession: InsertWorkSession): Promise<WorkSession> {
    const [session] = await db
      .insert(workSessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async updateWorkSession(id: number, sessionUpdate: Partial<WorkSession>): Promise<WorkSession> {
    const [session] = await db
      .update(workSessions)
      .set(sessionUpdate)
      .where(eq(workSessions.id, id))
      .returning();
    return session;
  }

  async endWorkSession(id: number): Promise<WorkSession> {
    const [session] = await db
      .select()
      .from(workSessions)
      .where(eq(workSessions.id, id))
      .limit(1);

    if (!session) {
      throw new Error(`Work session with id ${id} not found`);
    }

    const endTime = new Date();
    const startTime = new Date(session.startTime);
    const durationInMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    // Update the session
    const [updatedSession] = await db
      .update(workSessions)
      .set({ 
        endTime,
        duration: durationInMinutes
      })
      .where(eq(workSessions.id, id))
      .returning();

    // Update the project's total time logged (store as seconds)
    if (session.projectId) {
      const [project] = await db.select().from(projects).where(eq(projects.id, session.projectId)).limit(1);
      if (project) {
        const newTimeLogged = (project.timeLogged || 0) + durationInSeconds;
        await this.updateProject(session.projectId, { 
          timeLogged: Math.floor(newTimeLogged)
        });
      }
    }

    return updatedSession;
  }

  async getRecommendations(userId: number): Promise<Recommendation[]> {
    return db.select().from(recommendations).where(eq(recommendations.userId, userId));
  }

  async createRecommendation(insertRecommendation: InsertRecommendation): Promise<Recommendation> {
    const [recommendation] = await db
      .insert(recommendations)
      .values(insertRecommendation)
      .returning();
    return recommendation;
  }

  async updateRecommendation(id: number, recommendationUpdate: Partial<Recommendation>): Promise<Recommendation> {
    const [recommendation] = await db
      .update(recommendations)
      .set(recommendationUpdate)
      .where(eq(recommendations.id, id))
      .returning();
    return recommendation;
  }

  async getAssistantMessages(userId: number, projectId?: number): Promise<AssistantMessage[]> {
    const baseQuery = db.select().from(assistantMessages).where(eq(assistantMessages.userId, userId));

    if (projectId !== undefined) {
      return baseQuery
        .where(eq(assistantMessages.projectId, projectId))
        .orderBy(asc(assistantMessages.timestamp));
    }

    return baseQuery.orderBy(asc(assistantMessages.timestamp));
  }

  async createAssistantMessage(insertMessage: InsertAssistantMessage): Promise<AssistantMessage> {
    const [message] = await db
      .insert(assistantMessages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getDailyAnalytics(userId: number, range: number = 7): Promise<DailyAnalytics[]> {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - range);

    // Convert to SQL date strings for comparison
    const startDateStr = startDate.toISOString().split('T')[0];

    return db
      .select()
      .from(dailyAnalytics)
      .where(
        eq(dailyAnalytics.userId, userId)
      )
      .orderBy(asc(dailyAnalytics.date));
  }

  async createOrUpdateDailyAnalytics(insertAnalytics: InsertDailyAnalytics): Promise<DailyAnalytics> {
    // First try to find if analytics for the date already exists
    const dateStr: string = typeof insertAnalytics.date === 'string' 
      ? insertAnalytics.date 
      : new Date().toISOString().split('T')[0]; // Fallback

    const [existingAnalytics] = await db
      .select()
      .from(dailyAnalytics)
      .where(
        eq(dailyAnalytics.userId, insertAnalytics.userId)
      );

    if (existingAnalytics) {
      // Update existing record
      const [updated] = await db
        .update(dailyAnalytics)
        .set(insertAnalytics)
        .where(eq(dailyAnalytics.id, existingAnalytics.id))
        .returning();
      return updated;
    } else {
      // Insert new record
      const [analytics] = await db
        .insert(dailyAnalytics)
        .values(insertAnalytics)
        .returning();
      return analytics;
    }
  }

  // Initialize with default project templates
  async initializeDefaultData() {
    // Check if we already have project templates
    const templates = await this.getProjectTemplates();
    if (templates.length === 0) {
      // Create default project templates
      const videoTemplate: InsertProjectTemplate = {
        name: "Video Script",
        type: "video",
        sections: {
          description: "Template for creating high-quality video scripts",
          tasks: [
            "Research topic",
            "Create outline",
            "Write script",
            "Review and edit",
            "Finalize"
          ],
          estimatedHours: 8
        }
      };

      const researchTemplate: InsertProjectTemplate = {
        name: "Research Document",
        type: "research",
        sections: {
          description: "Template for creating research documents",
          tasks: [
            "Define research question",
            "Gather sources",
            "Analyze information",
            "Draft document",
            "Review and finalize"
          ],
          estimatedHours: 12
        }
      };

      const guideTemplate: InsertProjectTemplate = {
        name: "How-to Guide",
        type: "guide",
        sections: {
          description: "Template for creating educational guides",
          tasks: [
            "Select topic",
            "Outline key points",
            "Draft instructions",
            "Add examples",
            "Proofread and publish"
          ],
          estimatedHours: 6
        }
      };

      const podcastTemplate: InsertProjectTemplate = {
        name: "Podcast Episode",
        type: "podcast",
        sections: {
          description: "Template for planning podcast episodes",
          tasks: [
            "Research topic",
            "Outline talking points",
            "Prepare questions",
            "Record episode",
            "Edit and publish"
          ],
          estimatedHours: 5
        }
      };

      await this.createProjectTemplate(videoTemplate);
      await this.createProjectTemplate(researchTemplate);
      await this.createProjectTemplate(guideTemplate);
      await this.createProjectTemplate(podcastTemplate);

      // Create a demo user if none exists
      const demoUser: InsertUser = {
        username: "demo",
        email: "",
        password: "password123", // In a real app, this would be hashed
        name: "Tadeáš Novák",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces"
      };

      try {
        await this.createUser(demoUser);
      } catch (error) {
        // User might already exist, ignore
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log("Demo user creation error (might already exist):", errorMessage);
      }
    }
  }
}

// Initialize the storage and run data initialization
export const storage = new DatabaseStorage();

// Call the initialization method immediately to set up default data
(async () => {
  try {
    await storage.initializeDefaultData();
    console.log("Database initialized with default data");
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Failed to initialize database with default data:", errorMessage);
  }
})();