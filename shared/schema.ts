import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Bots table
export const bots = pgTable("bots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  model: varchar("model", { length: 100 }).notNull(),
  systemPrompt: text("system_prompt"),
  temperature: decimal("temperature", { precision: 3, scale: 2 }).default("0.7"),
  maxTokens: integer("max_tokens").default(1000),
  role: varchar("role", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBotSchema = createInsertSchema(bots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateBotSchema = insertBotSchema.omit({ userId: true }).partial();

export type InsertBot = z.infer<typeof insertBotSchema>;
export type UpdateBot = z.infer<typeof updateBotSchema>;
export type Bot = typeof bots.$inferSelect;

// Teams table
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTeamSchema = insertTeamSchema.omit({ userId: true }).partial();

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type UpdateTeam = z.infer<typeof updateTeamSchema>;
export type Team = typeof teams.$inferSelect;

// Team members table (many-to-many relationship between teams and bots)
export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  botId: varchar("bot_id").notNull().references(() => bots.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTeamMemberSchema = createInsertSchema(teamMembers).omit({
  id: true,
  createdAt: true,
});

export type InsertTeamMember = z.infer<typeof insertTeamMemberSchema>;
export type TeamMember = typeof teamMembers.$inferSelect;

// Outputs table (saved conversations/results)
export const outputs = pgTable("outputs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  teamId: varchar("team_id").references(() => teams.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  brief: text("brief").notNull(),
  delegations: jsonb("delegations").notNull(), // Array of {botId, task}
  combinedOutput: text("combined_output"),
  responses: jsonb("responses").notNull(), // Array of {botId, botName, task, output, status}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertOutputSchema = createInsertSchema(outputs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertOutput = z.infer<typeof insertOutputSchema>;
export type Output = typeof outputs.$inferSelect;

// Conversations table (chat sessions with individual bots or teams)
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  botId: varchar("bot_id").references(() => bots.id, { onDelete: "cascade" }),
  teamId: varchar("team_id").references(() => teams.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;

// Messages table (individual messages within conversations)
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(), // 'user', 'assistant', 'system'
  content: text("content").notNull(),
  botId: varchar("bot_id").references(() => bots.id, { onDelete: "set null" }), // For team conversations, which bot responded
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// Team collaborative sessions table (multi-phase workflow: planning → execution → review)
export const teamSessions = pgTable("team_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  brief: text("brief").notNull(),
  phase: varchar("phase", { length: 20 }).notNull().default("planning"), // planning | execution | review | completed
  planningMessages: jsonb("planning_messages").default([]), // Array of {speaker: 'bot'|'user', botId?, botName?, content, timestamp}
  taskAssignments: jsonb("task_assignments").default([]), // Array of {botId, botName, task} determined during planning
  executionOutputs: jsonb("execution_outputs").default([]), // Array of {botId, botName, task, output, status}
  reviewMessages: jsonb("review_messages").default([]), // Array of {speaker: 'bot'|'user', botId?, botName?, content, timestamp}
  suggestions: jsonb("suggestions").default([]), // Array of {id, botId, botName, type: 'iteration'|'critique', target?, content, status: 'pending'|'approved'|'rejected'}
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTeamSessionSchema = createInsertSchema(teamSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateTeamSessionSchema = insertTeamSessionSchema.partial();

export type InsertTeamSession = z.infer<typeof insertTeamSessionSchema>;
export type UpdateTeamSession = z.infer<typeof updateTeamSessionSchema>;
export type TeamSession = typeof teamSessions.$inferSelect;
