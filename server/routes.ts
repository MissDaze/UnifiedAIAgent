import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { 
  insertBotSchema, 
  updateBotSchema,
  insertTeamSchema, 
  updateTeamSchema,
  insertOutputSchema,
  insertConversationSchema,
  insertMessageSchema,
  insertTeamSessionSchema,
  updateTeamSessionSchema
} from "@shared/schema";
import { z } from "zod";
import { getFreeModels, executeTeamTasks, executeCollaborativeTeamTasks, isValidModel, createChatCompletion, type ChatMessage } from "./openrouter";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Bot routes
  app.get("/api/bots", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const bots = await storage.getUserBots(userId);
      
      // Validate each bot's model if API key is available
      if (process.env.OPENROUTER_API_KEY) {
        const botsWithValidation = await Promise.all(
          bots.map(async (bot) => {
            const validationResult = await isValidModel(process.env.OPENROUTER_API_KEY!, bot.model);
            return {
              ...bot,
              // Only set modelValid to false if we confirmed it's invalid
              // If validationResult is null (unable to verify), don't include the field
              ...(validationResult !== null && { modelValid: validationResult }),
            };
          })
        );
        return res.json(botsWithValidation);
      }
      
      res.json(bots);
    } catch (error) {
      console.error("Error fetching bots:", error);
      res.status(500).json({ message: "Failed to fetch bots" });
    }
  });

  app.get("/api/bots/:id", isAuthenticated, async (req: Request, res) => {
    try {
      const bot = await storage.getBot(req.params.id);
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      // Verify ownership
      if (bot.userId !== req.user!.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(bot);
    } catch (error) {
      console.error("Error fetching bot:", error);
      res.status(500).json({ message: "Failed to fetch bot" });
    }
  });

  app.post("/api/bots", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const botData = insertBotSchema.parse({ ...req.body, userId });
      
      // Validate model if OpenRouter API key is available
      if (process.env.OPENROUTER_API_KEY && botData.model) {
        const { isValidModel } = await import("./openrouter.js");
        const modelValid = await isValidModel(process.env.OPENROUTER_API_KEY, botData.model);
        if (modelValid === false) {
          return res.status(400).json({ 
            message: "The selected AI model is not available. Please choose a different model from the free models list." 
          });
        }
      }
      
      const bot = await storage.createBot(botData);
      res.status(201).json(bot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bot data", errors: error.errors });
      }
      console.error("Error creating bot:", error);
      res.status(500).json({ message: "Failed to create bot" });
    }
  });

  app.patch("/api/bots/:id", isAuthenticated, async (req: Request, res) => {
    try {
      const bot = await storage.getBot(req.params.id);
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      // Verify ownership
      if (bot.userId !== req.user!.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Validate and sanitize update data
      const updateData = updateBotSchema.parse(req.body);
      
      // Validate model if being updated
      if (process.env.OPENROUTER_API_KEY && updateData.model) {
        const { isValidModel } = await import("./openrouter.js");
        const modelValid = await isValidModel(process.env.OPENROUTER_API_KEY, updateData.model);
        if (modelValid === false) {
          return res.status(400).json({ 
            message: "The selected AI model is not available. Please choose a different model from the free models list." 
          });
        }
      }
      
      const updatedBot = await storage.updateBot(req.params.id, updateData);
      res.json(updatedBot);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid bot data", errors: error.errors });
      }
      console.error("Error updating bot:", error);
      res.status(500).json({ message: "Failed to update bot" });
    }
  });

  app.delete("/api/bots/:id", isAuthenticated, async (req: Request, res) => {
    try {
      const bot = await storage.getBot(req.params.id);
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      // Verify ownership
      if (bot.userId !== req.user!.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteBot(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting bot:", error);
      res.status(500).json({ message: "Failed to delete bot" });
    }
  });

  // Team routes
  app.get("/api/teams", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const teams = await storage.getUserTeams(userId);
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ message: "Failed to fetch teams" });
    }
  });

  app.get("/api/teams/:id", isAuthenticated, async (req: Request, res) => {
    try {
      const team = await storage.getTeam(req.params.id);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Verify ownership
      if (team.userId !== req.user!.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const teamBots = await storage.getTeamBots(team.id);
      res.json({ ...team, bots: teamBots });
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  app.post("/api/teams", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { botIds, ...teamData } = req.body;
      
      const team = await storage.createTeam(
        insertTeamSchema.parse({ ...teamData, userId })
      );
      
      // Add team members
      if (Array.isArray(botIds)) {
        for (const botId of botIds) {
          await storage.addTeamMember({ teamId: team.id, botId });
        }
      }
      
      res.status(201).json(team);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid team data", errors: error.errors });
      }
      console.error("Error creating team:", error);
      res.status(500).json({ message: "Failed to create team" });
    }
  });

  app.patch("/api/teams/:id", isAuthenticated, async (req: Request, res) => {
    try {
      const team = await storage.getTeam(req.params.id);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Verify ownership
      if (team.userId !== req.user!.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Validate and sanitize update data
      const updateData = updateTeamSchema.parse(req.body);
      const updatedTeam = await storage.updateTeam(req.params.id, updateData);
      res.json(updatedTeam);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid team data", errors: error.errors });
      }
      console.error("Error updating team:", error);
      res.status(500).json({ message: "Failed to update team" });
    }
  });

  app.delete("/api/teams/:id", isAuthenticated, async (req: Request, res) => {
    try {
      const team = await storage.getTeam(req.params.id);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Verify ownership
      if (team.userId !== req.user!.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteTeam(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting team:", error);
      res.status(500).json({ message: "Failed to delete team" });
    }
  });

  app.get("/api/teams/:id/bots", isAuthenticated, async (req: Request, res) => {
    try {
      const team = await storage.getTeam(req.params.id);
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      // Verify ownership
      if (team.userId !== req.user!.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const teamBots = await storage.getTeamBots(req.params.id);
      res.json(teamBots);
    } catch (error) {
      console.error("Error fetching team bots:", error);
      res.status(500).json({ message: "Failed to fetch team bots" });
    }
  });

  // Output routes
  app.get("/api/outputs", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const outputs = await storage.getUserOutputs(userId);
      res.json(outputs);
    } catch (error) {
      console.error("Error fetching outputs:", error);
      res.status(500).json({ message: "Failed to fetch outputs" });
    }
  });

  app.post("/api/outputs", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const output = await storage.createOutput(
        insertOutputSchema.parse({ ...req.body, userId })
      );
      res.status(201).json(output);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid output data", errors: error.errors });
      }
      console.error("Error creating output:", error);
      res.status(500).json({ message: "Failed to create output" });
    }
  });

  app.delete("/api/outputs/:id", isAuthenticated, async (req: Request, res) => {
    try {
      const output = await storage.getOutput(req.params.id);
      if (!output) {
        return res.status(404).json({ message: "Output not found" });
      }
      
      // Verify ownership
      if (output.userId !== req.user!.claims.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteOutput(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting output:", error);
      res.status(500).json({ message: "Failed to delete output" });
    }
  });

  // OpenRouter routes
  app.get("/api/openrouter/models", isAuthenticated, async (_req: Request, res) => {
    try {
      if (!process.env.OPENROUTER_API_KEY) {
        return res.status(500).json({ message: "OpenRouter API key not configured" });
      }
      
      const freeModels = await getFreeModels(process.env.OPENROUTER_API_KEY);
      res.json(freeModels);
    } catch (error) {
      console.error("Error fetching models:", error);
      res.status(500).json({ message: "Failed to fetch models" });
    }
  });

  app.post("/api/openrouter/execute", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { teamId, brief, delegations } = req.body;

      if (!process.env.OPENROUTER_API_KEY) {
        return res.status(500).json({ message: "OpenRouter API key not configured" });
      }

      // Get team and verify ownership
      const team = await storage.getTeam(teamId);
      if (!team || team.userId !== userId) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Get all bots in the team
      const teamBots = await storage.getTeamBots(teamId);
      
      // Prepare delegation data with bot details
      const delegationsWithBotData = delegations.map((delegation: any) => {
        const bot = teamBots.find(b => b.id === delegation.botId);
        if (!bot) throw new Error(`Bot ${delegation.botId} not found in team`);
        
        return {
          botId: bot.id,
          botName: bot.name,
          model: bot.model,
          systemPrompt: bot.systemPrompt || "",
          task: delegation.task,
          temperature: parseFloat(bot.temperature || "0.7"),
          maxTokens: bot.maxTokens || 1000,
        };
      });

      // Execute all tasks collaboratively (sequential, each bot sees previous outputs)
      const responses = await executeCollaborativeTeamTasks(
        process.env.OPENROUTER_API_KEY,
        brief,
        delegationsWithBotData
      );

      res.json({ responses });
    } catch (error) {
      console.error("Error executing team tasks:", error);
      res.status(500).json({ message: "Failed to execute team tasks", error: String(error) });
    }
  });

  // Chat with individual bot
  app.post("/api/bots/:botId/chat", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { botId } = req.params;
      const { message, conversationId } = req.body;

      if (!process.env.OPENROUTER_API_KEY) {
        return res.status(500).json({ message: "OpenRouter API key not configured" });
      }

      // Get bot and verify ownership
      const bot = await storage.getBot(botId);
      if (!bot || bot.userId !== userId) {
        return res.status(404).json({ message: "Bot not found" });
      }

      // Get or create conversation
      let conversation;
      if (conversationId) {
        conversation = await storage.getConversation(conversationId);
        if (!conversation || conversation.userId !== userId) {
          return res.status(404).json({ message: "Conversation not found" });
        }
      } else {
        conversation = await storage.createConversation({
          userId,
          botId,
          teamId: null,
          title: `Chat with ${bot.name}`,
        });
      }

      // Save user message
      await storage.createMessage({
        conversationId: conversation.id,
        role: "user",
        content: message,
        botId: null,
      });

      // Get conversation history
      const history = await storage.getConversationMessages(conversation.id);

      // Build messages for API call
      const messages: ChatMessage[] = [];
      
      if (bot.systemPrompt) {
        messages.push({
          role: "system",
          content: bot.systemPrompt,
        });
      }

      messages.push(...history.map(msg => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      })));

      // Call OpenRouter API
      let response;
      try {
        response = await createChatCompletion(process.env.OPENROUTER_API_KEY, {
          model: bot.model,
          messages,
          temperature: parseFloat(bot.temperature || "0.7"),
          max_tokens: bot.maxTokens || 1000,
        });
      } catch (apiError: any) {
        // Handle model-specific errors
        const errorMsg = String(apiError);
        if (errorMsg.includes("model not found") || errorMsg.includes("404")) {
          return res.status(400).json({ 
            message: `The AI model "${bot.model}" is currently unavailable. Please try selecting a different model for this bot.`,
            modelError: true 
          });
        }
        throw apiError; // Re-throw other errors
      }

      const assistantMessage = response.choices[0]?.message?.content || "No response";

      // Save assistant message
      await storage.createMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: assistantMessage,
        botId: bot.id,
      });

      // Get updated conversation messages
      const updatedMessages = await storage.getConversationMessages(conversation.id);

      res.json({
        conversationId: conversation.id,
        messages: updatedMessages,
      });
    } catch (error) {
      console.error("Error in bot chat:", error);
      res.status(500).json({ message: "Failed to process chat", error: String(error) });
    }
  });

  // Chat with team (all bots respond)
  app.post("/api/teams/:teamId/chat", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { teamId } = req.params;
      const { message, conversationId } = req.body;

      if (!process.env.OPENROUTER_API_KEY) {
        return res.status(500).json({ message: "OpenRouter API key not configured" });
      }

      // Get team and verify ownership
      const team = await storage.getTeam(teamId);
      if (!team || team.userId !== userId) {
        return res.status(404).json({ message: "Team not found" });
      }

      // Get team bots
      const teamBots = await storage.getTeamBots(teamId);
      if (teamBots.length === 0) {
        return res.status(400).json({ message: "Team has no bots" });
      }

      // Get or create conversation
      let conversation;
      if (conversationId) {
        conversation = await storage.getConversation(conversationId);
        if (!conversation || conversation.userId !== userId) {
          return res.status(404).json({ message: "Conversation not found" });
        }
      } else {
        conversation = await storage.createConversation({
          userId,
          botId: null,
          teamId,
          title: `Team Chat: ${team.name}`,
        });
      }

      // Save user message
      await storage.createMessage({
        conversationId: conversation.id,
        role: "user",
        content: message,
        botId: null,
      });

      // Get conversation history (user messages only for context)
      const history = await storage.getConversationMessages(conversation.id);

      // Process each bot in parallel
      const botResponses = await Promise.allSettled(
        teamBots.map(async (bot) => {
          const messages: ChatMessage[] = [];
          
          if (bot.systemPrompt) {
            messages.push({
              role: "system",
              content: bot.systemPrompt,
            });
          }

          // Add recent history for context
          messages.push(...history.map(msg => ({
            role: msg.role as "user" | "assistant" | "system",
            content: msg.content,
          })));

          try {
            const response = await createChatCompletion(process.env.OPENROUTER_API_KEY!, {
              model: bot.model,
              messages,
              temperature: parseFloat(bot.temperature || "0.7"),
              max_tokens: bot.maxTokens || 1000,
            });

            const assistantMessage = response.choices[0]?.message?.content || "No response";

            // Save this bot's response
            await storage.createMessage({
              conversationId: conversation.id,
              role: "assistant",
              content: `[${bot.name}]: ${assistantMessage}`,
              botId: bot.id,
            });

            return {
              botId: bot.id,
              botName: bot.name,
              message: assistantMessage,
            };
          } catch (apiError: any) {
            // Handle model errors gracefully in team context
            const errorMsg = String(apiError);
            let errorMessage = "Failed to get response";
            
            if (errorMsg.includes("model not found") || errorMsg.includes("404")) {
              errorMessage = `Model "${bot.model}" is currently unavailable. Please update this bot with a working model.`;
            }

            // Save error message so user can see which bot failed
            await storage.createMessage({
              conversationId: conversation.id,
              role: "assistant",
              content: `[${bot.name}]: ⚠️ ${errorMessage}`,
              botId: bot.id,
            });

            return {
              botId: bot.id,
              botName: bot.name,
              message: `⚠️ ${errorMessage}`,
              error: true,
            };
          }
        })
      );

      // Get updated conversation messages
      const updatedMessages = await storage.getConversationMessages(conversation.id);

      res.json({
        conversationId: conversation.id,
        messages: updatedMessages,
        botResponses: botResponses.map((result, index) => {
          if (result.status === "fulfilled") {
            return result.value;
          } else {
            return {
              botId: teamBots[index].id,
              botName: teamBots[index].name,
              error: result.reason?.message || "Unknown error",
            };
          }
        }),
      });
    } catch (error) {
      console.error("Error in team chat:", error);
      res.status(500).json({ message: "Failed to process team chat", error: String(error) });
    }
  });

  // Get conversation messages
  app.get("/api/conversations/:conversationId/messages", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { conversationId } = req.params;

      const conversation = await storage.getConversation(conversationId);
      if (!conversation || conversation.userId !== userId) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      const messages = await storage.getConversationMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Get user's conversations
  app.get("/api/conversations", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { botId, teamId } = req.query;

      let conversations;
      if (botId) {
        conversations = await storage.getBotConversations(botId as string);
        // Filter by userId to ensure security
        conversations = conversations.filter(c => c.userId === userId);
      } else if (teamId) {
        conversations = await storage.getTeamConversations(teamId as string);
        // Filter by userId to ensure security
        conversations = conversations.filter(c => c.userId === userId);
      } else {
        conversations = await storage.getUserConversations(userId);
      }

      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  // Team Sessions routes (collaborative workflow)
  
  // Create a new collaborative session
  app.post("/api/team-sessions", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const data = insertTeamSessionSchema.parse({ ...req.body, userId });
      
      const session = await storage.createTeamSession(data);
      
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating team session:", error);
      res.status(500).json({ message: "Failed to create team session" });
    }
  });

  // Get all sessions for a team
  app.get("/api/teams/:teamId/sessions", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { teamId } = req.params;
      
      const sessions = await storage.getTeamSessions(teamId);
      // Filter by userId for security
      const userSessions = sessions.filter(s => s.userId === userId);
      
      res.json(userSessions);
    } catch (error) {
      console.error("Error fetching team sessions:", error);
      res.status(500).json({ message: "Failed to fetch team sessions" });
    }
  });

  // Get a specific session
  app.get("/api/team-sessions/:id", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { id } = req.params;
      
      const session = await storage.getTeamSession(id);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      if (session.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error fetching team session:", error);
      res.status(500).json({ message: "Failed to fetch team session" });
    }
  });

  // Update session (add planning message, update phase, etc.)
  app.patch("/api/team-sessions/:id", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { id } = req.params;
      
      const session = await storage.getTeamSession(id);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      if (session.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const data = updateTeamSessionSchema.parse(req.body);
      const updated = await storage.updateTeamSession(id, data);
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating team session:", error);
      res.status(500).json({ message: "Failed to update team session" });
    }
  });

  // Delete a session
  app.delete("/api/team-sessions/:id", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { id } = req.params;
      
      const session = await storage.getTeamSession(id);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      if (session.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteTeamSession(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting team session:", error);
      res.status(500).json({ message: "Failed to delete team session" });
    }
  });

  // Add a planning message (bot or user speaks during planning phase)
  app.post("/api/team-sessions/:id/planning-message", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { id } = req.params;
      const { content, speaker, botId, botName } = req.body;
      
      const session = await storage.getTeamSession(id);
      
      if (!session || session.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (session.phase !== "planning") {
        return res.status(400).json({ message: "Session not in planning phase" });
      }
      
      const message = {
        speaker,
        botId,
        botName,
        content,
        timestamp: new Date().toISOString(),
      };
      
      const planningMessages = [...(session.planningMessages as any[] || []), message];
      
      const updated = await storage.updateTeamSession(id, { planningMessages });
      res.json(updated);
    } catch (error) {
      console.error("Error adding planning message:", error);
      res.status(500).json({ message: "Failed to add planning message" });
    }
  });

  // Add a review message (bot or user speaks during review phase)
  app.post("/api/team-sessions/:id/review-message", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { id } = req.params;
      const { content, speaker, botId, botName } = req.body;
      
      const session = await storage.getTeamSession(id);
      
      if (!session || session.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (session.phase !== "review") {
        return res.status(400).json({ message: "Session not in review phase" });
      }
      
      const message = {
        speaker,
        botId,
        botName,
        content,
        timestamp: new Date().toISOString(),
      };
      
      const reviewMessages = [...(session.reviewMessages as any[] || []), message];
      
      const updated = await storage.updateTeamSession(id, { reviewMessages });
      res.json(updated);
    } catch (error) {
      console.error("Error adding review message:", error);
      res.status(500).json({ message: "Failed to add review message" });
    }
  });

  // Bot asks a question during planning
  app.post("/api/team-sessions/:id/planning/bot-question", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { id } = req.params;
      const { botId, question } = req.body;
      
      const session = await storage.getTeamSession(id);
      
      if (!session || session.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Get bot info
      const teamBots = await storage.getTeamBots(session.teamId);
      const bot = teamBots.find(b => b.id === botId);
      
      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }
      
      // Generate bot's question using OpenRouter
      const messages: ChatMessage[] = [
        {
          role: "system",
          content: bot.systemPrompt || `You are ${bot.name}, a helpful AI assistant working on a team project.`,
        },
        {
          role: "user",
          content: `PROJECT BRIEF:\n${session.brief}\n\nYou are part of a team working on this project. Based on the brief, what clarifying questions do you have? Ask 1-2 specific questions that will help you understand your role and what's expected. Keep it concise.`,
        },
      ];
      
      let botQuestion: string;
      
      try {
        const response = await createChatCompletion(process.env.OPENROUTER_API_KEY!, {
          model: bot.model,
          messages,
          temperature: Number(bot.temperature) || 0.7,
          max_tokens: 200,
        });
        
        console.log("OpenRouter response for bot question:", JSON.stringify(response, null, 2));
        
        botQuestion = response?.choices?.[0]?.message?.content?.trim() || "";
        
        if (!botQuestion) {
          console.warn("No content in OpenRouter response, using fallback");
          botQuestion = `As ${bot.name}, I'd like to know more about the specific requirements and expectations for my role in this project.`;
        }
      } catch (apiError) {
        console.error("OpenRouter API error for bot question:", apiError);
        botQuestion = `As ${bot.name}, I'd like to know more about the specific requirements and expectations for my role in this project.`;
      }
      
      console.log("Final bot question:", botQuestion);
      
      // Add to planning messages
      const message = {
        speaker: "bot",
        botId: bot.id,
        botName: bot.name,
        content: botQuestion,
        timestamp: new Date().toISOString(),
      };
      
      console.log("Message to save:", JSON.stringify(message, null, 2));
      
      const planningMessages = [...(session.planningMessages as any[] || []), message];
      const updated = await storage.updateTeamSession(id, { planningMessages });
      
      res.json({ session: updated, question: botQuestion });
    } catch (error) {
      console.error("Error generating bot question:", error);
      res.status(500).json({ message: "Failed to generate bot question" });
    }
  });

  // Finalize planning and move to execution
  app.post("/api/team-sessions/:id/finalize-planning", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { id } = req.params;
      const { taskAssignments } = req.body; // Array of {botId, botName, task}
      
      const session = await storage.getTeamSession(id);
      
      if (!session || session.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (session.phase !== "planning") {
        return res.status(400).json({ message: "Session not in planning phase" });
      }
      
      const updated = await storage.updateTeamSession(id, {
        taskAssignments,
        phase: "execution",
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error finalizing planning:", error);
      res.status(500).json({ message: "Failed to finalize planning" });
    }
  });

  // Execute tasks (execution phase)
  app.post("/api/team-sessions/:id/execute", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { id } = req.params;
      
      const session = await storage.getTeamSession(id);
      
      if (!session || session.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (session.phase !== "execution") {
        return res.status(400).json({ message: "Session not in execution phase" });
      }
      
      const taskAssignments = session.taskAssignments as any[] || [];
      
      if (taskAssignments.length === 0) {
        return res.status(400).json({ message: "No task assignments found" });
      }
      
      // Get bot details for execution
      const teamBots = await storage.getTeamBots(session.teamId);
      const delegationsWithBotData = taskAssignments.map(assignment => {
        const bot = teamBots.find(b => b.id === assignment.botId);
        if (!bot) throw new Error(`Bot ${assignment.botId} not found`);
        
        return {
          botId: bot.id,
          botName: bot.name,
          model: bot.model,
          systemPrompt: bot.systemPrompt || "",
          task: assignment.task,
          temperature: Number(bot.temperature) || 0.7,
          maxTokens: bot.maxTokens || 1000,
        };
      });
      
      // Execute collaboratively
      const responses = await executeCollaborativeTeamTasks(
        process.env.OPENROUTER_API_KEY!,
        session.brief,
        delegationsWithBotData
      );
      
      // Update session with outputs and move to review phase
      const updated = await storage.updateTeamSession(id, {
        executionOutputs: responses,
        phase: "review",
      });
      
      res.json({ session: updated, responses });
    } catch (error) {
      console.error("Error executing tasks:", error);
      res.status(500).json({ message: "Failed to execute tasks" });
    }
  });

  // Add a suggestion during review phase
  app.post("/api/team-sessions/:id/suggestion", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { id } = req.params;
      const { botId, botName, type, target, content } = req.body;
      
      const session = await storage.getTeamSession(id);
      
      if (!session || session.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      if (session.phase !== "review") {
        return res.status(400).json({ message: "Session not in review phase" });
      }
      
      const suggestion = {
        id: `sugg_${Date.now()}`,
        botId,
        botName,
        type, // 'iteration' or 'critique'
        target, // Which bot's work is being critiqued
        content,
        status: "pending",
        timestamp: new Date().toISOString(),
      };
      
      const suggestions = [...(session.suggestions as any[] || []), suggestion];
      const updated = await storage.updateTeamSession(id, { suggestions });
      
      res.json(updated);
    } catch (error) {
      console.error("Error adding suggestion:", error);
      res.status(500).json({ message: "Failed to add suggestion" });
    }
  });

  // Approve/reject a suggestion
  app.patch("/api/team-sessions/:id/suggestion/:suggestionId", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { id, suggestionId } = req.params;
      const { status } = req.body; // 'approved' or 'rejected'
      
      const session = await storage.getTeamSession(id);
      
      if (!session || session.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const suggestions = (session.suggestions as any[] || []).map(s =>
        s.id === suggestionId ? { ...s, status } : s
      );
      
      const updated = await storage.updateTeamSession(id, { suggestions });
      res.json(updated);
    } catch (error) {
      console.error("Error updating suggestion:", error);
      res.status(500).json({ message: "Failed to update suggestion" });
    }
  });

  // Complete the session
  app.post("/api/team-sessions/:id/complete", isAuthenticated, async (req: Request, res) => {
    try {
      const userId = req.user!.claims.sub;
      const { id } = req.params;
      
      const session = await storage.getTeamSession(id);
      
      if (!session || session.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const updated = await storage.updateTeamSession(id, { phase: "completed" });
      res.json(updated);
    } catch (error) {
      console.error("Error completing session:", error);
      res.status(500).json({ message: "Failed to complete session" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
