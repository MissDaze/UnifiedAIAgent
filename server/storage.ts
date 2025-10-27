import {
  users,
  bots,
  teams,
  teamMembers,
  outputs,
  conversations,
  messages,
  teamSessions,
  type User,
  type UpsertUser,
  type Bot,
  type InsertBot,
  type Team,
  type InsertTeam,
  type InsertTeamMember,
  type Output,
  type InsertOutput,
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type TeamSession,
  type InsertTeamSession,
  type UpdateTeamSession,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Bot operations
  createBot(bot: InsertBot): Promise<Bot>;
  getBot(id: string): Promise<Bot | undefined>;
  getUserBots(userId: string): Promise<Bot[]>;
  updateBot(id: string, bot: Partial<InsertBot>): Promise<Bot | undefined>;
  deleteBot(id: string): Promise<void>;

  // Team operations
  createTeam(team: InsertTeam): Promise<Team>;
  getTeam(id: string): Promise<Team | undefined>;
  getUserTeams(userId: string): Promise<Team[]>;
  updateTeam(id: string, team: Partial<InsertTeam>): Promise<Team | undefined>;
  deleteTeam(id: string): Promise<void>;

  // Team member operations
  addTeamMember(teamMember: InsertTeamMember): Promise<void>;
  getTeamBots(teamId: string): Promise<Bot[]>;
  removeTeamMember(teamId: string, botId: string): Promise<void>;

  // Output operations
  createOutput(output: InsertOutput): Promise<Output>;
  getOutput(id: string): Promise<Output | undefined>;
  getUserOutputs(userId: string): Promise<Output[]>;
  deleteOutput(id: string): Promise<void>;

  // Conversation operations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversation(id: string): Promise<Conversation | undefined>;
  getUserConversations(userId: string): Promise<Conversation[]>;
  getBotConversations(botId: string): Promise<Conversation[]>;
  getTeamConversations(teamId: string): Promise<Conversation[]>;
  deleteConversation(id: string): Promise<void>;

  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getConversationMessages(conversationId: string): Promise<Message[]>;

  // Team Session operations
  createTeamSession(session: InsertTeamSession): Promise<TeamSession>;
  getTeamSession(id: string): Promise<TeamSession | undefined>;
  getTeamSessions(teamId: string): Promise<TeamSession[]>;
  updateTeamSession(id: string, updates: UpdateTeamSession): Promise<TeamSession | undefined>;
  deleteTeamSession(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Bot operations
  async createBot(botData: InsertBot): Promise<Bot> {
    const [bot] = await db.insert(bots).values(botData).returning();
    return bot;
  }

  async getBot(id: string): Promise<Bot | undefined> {
    const [bot] = await db.select().from(bots).where(eq(bots.id, id));
    return bot;
  }

  async getUserBots(userId: string): Promise<Bot[]> {
    return await db
      .select()
      .from(bots)
      .where(eq(bots.userId, userId))
      .orderBy(desc(bots.createdAt));
  }

  async updateBot(id: string, botData: Partial<InsertBot>): Promise<Bot | undefined> {
    const [bot] = await db
      .update(bots)
      .set({ ...botData, updatedAt: new Date() })
      .where(eq(bots.id, id))
      .returning();
    return bot;
  }

  async deleteBot(id: string): Promise<void> {
    await db.delete(bots).where(eq(bots.id, id));
  }

  // Team operations
  async createTeam(teamData: InsertTeam): Promise<Team> {
    const [team] = await db.insert(teams).values(teamData).returning();
    return team;
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }

  async getUserTeams(userId: string): Promise<Team[]> {
    return await db
      .select()
      .from(teams)
      .where(eq(teams.userId, userId))
      .orderBy(desc(teams.createdAt));
  }

  async updateTeam(id: string, teamData: Partial<InsertTeam>): Promise<Team | undefined> {
    const [team] = await db
      .update(teams)
      .set({ ...teamData, updatedAt: new Date() })
      .where(eq(teams.id, id))
      .returning();
    return team;
  }

  async deleteTeam(id: string): Promise<void> {
    await db.delete(teams).where(eq(teams.id, id));
  }

  // Team member operations
  async addTeamMember(teamMemberData: InsertTeamMember): Promise<void> {
    await db.insert(teamMembers).values(teamMemberData);
  }

  async getTeamBots(teamId: string): Promise<Bot[]> {
    const result = await db
      .select({
        bot: bots,
      })
      .from(teamMembers)
      .innerJoin(bots, eq(teamMembers.botId, bots.id))
      .where(eq(teamMembers.teamId, teamId));
    
    return result.map(r => r.bot);
  }

  async removeTeamMember(teamId: string, botId: string): Promise<void> {
    await db
      .delete(teamMembers)
      .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.botId, botId)));
  }

  // Output operations
  async createOutput(outputData: InsertOutput): Promise<Output> {
    const [output] = await db.insert(outputs).values(outputData).returning();
    return output;
  }

  async getOutput(id: string): Promise<Output | undefined> {
    const [output] = await db.select().from(outputs).where(eq(outputs.id, id));
    return output;
  }

  async getUserOutputs(userId: string): Promise<Output[]> {
    return await db
      .select()
      .from(outputs)
      .where(eq(outputs.userId, userId))
      .orderBy(desc(outputs.createdAt));
  }

  async deleteOutput(id: string): Promise<void> {
    await db.delete(outputs).where(eq(outputs.id, id));
  }

  // Conversation operations
  async createConversation(conversationData: InsertConversation): Promise<Conversation> {
    const [conversation] = await db.insert(conversations).values(conversationData).returning();
    return conversation;
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations).where(eq(conversations.id, id));
    return conversation;
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, userId))
      .orderBy(desc(conversations.createdAt));
  }

  async getBotConversations(botId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.botId, botId))
      .orderBy(desc(conversations.createdAt));
  }

  async getTeamConversations(teamId: string): Promise<Conversation[]> {
    return await db
      .select()
      .from(conversations)
      .where(eq(conversations.teamId, teamId))
      .orderBy(desc(conversations.createdAt));
  }

  async deleteConversation(id: string): Promise<void> {
    await db.delete(conversations).where(eq(conversations.id, id));
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(messageData).returning();
    return message;
  }

  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(messages.createdAt);
  }

  // Team Session operations
  async createTeamSession(sessionData: InsertTeamSession): Promise<TeamSession> {
    const [session] = await db.insert(teamSessions).values(sessionData).returning();
    return session;
  }

  async getTeamSession(id: string): Promise<TeamSession | undefined> {
    const [session] = await db.select().from(teamSessions).where(eq(teamSessions.id, id));
    return session;
  }

  async getTeamSessions(teamId: string): Promise<TeamSession[]> {
    return await db
      .select()
      .from(teamSessions)
      .where(eq(teamSessions.teamId, teamId))
      .orderBy(desc(teamSessions.createdAt));
  }

  async updateTeamSession(id: string, updates: UpdateTeamSession): Promise<TeamSession | undefined> {
    const [session] = await db
      .update(teamSessions)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(teamSessions.id, id))
      .returning();
    return session;
  }

  async deleteTeamSession(id: string): Promise<void> {
    await db.delete(teamSessions).where(eq(teamSessions.id, id));
  }
}

export const storage = new DatabaseStorage();
