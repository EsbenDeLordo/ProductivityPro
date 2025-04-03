import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  avatar: text("avatar"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  avatar: true,
});

// Project model
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("active"),
  progress: integer("progress").notNull().default(0),
  deadline: text("deadline"),
  aiAssistanceEnabled: boolean("ai_assistance_enabled").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  colorCode: text("color_code").notNull(),
  icon: text("icon"),
  files: integer("files").notNull().default(0),
  timeLogged: integer("time_logged").notNull().default(0), // in minutes
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  type: true,
  userId: true,
  deadline: true,
  aiAssistanceEnabled: true,
  colorCode: true,
  icon: true,
});

// Project templates model
export const projectTemplates = pgTable("project_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  sections: jsonb("sections").notNull(),
});

export const insertProjectTemplateSchema = createInsertSchema(projectTemplates);

// Work session model
export const workSessions = pgTable("work_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  projectId: integer("project_id"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in minutes
  type: text("type").notNull(), // 'focus', 'break', 'meeting'
  notes: text("notes"),
  isFlowState: boolean("is_flow_state").default(false),
});

export const insertWorkSessionSchema = createInsertSchema(workSessions).pick({
  userId: true,
  projectId: true,
  startTime: true,
  type: true,
});

// Recommendations model
export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'break', 'hydration', 'exercise', 'nsdr', etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  actionText: text("action_text").notNull(),
  secondaryActionText: text("secondary_action_text"),
  isCompleted: boolean("is_completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRecommendationSchema = createInsertSchema(recommendations).pick({
  userId: true,
  type: true,
  title: true,
  description: true,
  icon: true,
  actionText: true,
  secondaryActionText: true,
});

// Assistant messages model
export const assistantMessages = pgTable("assistant_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  projectId: integer("project_id"),
  content: text("content").notNull(),
  sender: text("sender").notNull(), // 'user' or 'assistant'
  provider: text("provider"), // 'deepseek', 'gemini', or null for user messages
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertAssistantMessageSchema = createInsertSchema(assistantMessages).pick({
  userId: true,
  projectId: true,
  content: true,
  sender: true,
  provider: true,
});

// Daily analytics model
export const dailyAnalytics = pgTable("daily_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  date: text("date").notNull(),
  focusTime: integer("focus_time").notNull().default(0), // in minutes
  flowStates: integer("flow_states").notNull().default(0),
  productivity: integer("productivity").notNull().default(0), // 0-100
});

export const insertDailyAnalyticsSchema = createInsertSchema(dailyAnalytics).pick({
  userId: true,
  date: true,
  focusTime: true,
  flowStates: true,
  productivity: true,
});

// Types exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

export type InsertProjectTemplate = z.infer<typeof insertProjectTemplateSchema>;
export type ProjectTemplate = typeof projectTemplates.$inferSelect;

export type InsertWorkSession = z.infer<typeof insertWorkSessionSchema>;
export type WorkSession = typeof workSessions.$inferSelect;

export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;

export type InsertAssistantMessage = z.infer<typeof insertAssistantMessageSchema>;
export type AssistantMessage = typeof assistantMessages.$inferSelect;

export type InsertDailyAnalytics = z.infer<typeof insertDailyAnalyticsSchema>;
export type DailyAnalytics = typeof dailyAnalytics.$inferSelect;
