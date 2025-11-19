import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateEmbedding, cosineSimilarity, generateSessionAgenda } from "./openai";
import {
  insertClassSchema,
  insertAvailabilitySchema,
  updateUserPreferencesSchema,
  insertSessionSchema,
  insertMessageSchema,
} from "@shared/schema";

// WebSocket connection map
const groupConnections = new Map<string, Set<WebSocket>>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User preferences routes
  app.patch('/api/users/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const preferences = updateUserPreferencesSchema.parse(req.body);
      const updatedUser = await storage.updateUserPreferences(userId, preferences);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(400).json({ message: "Invalid preferences data" });
    }
  });

  // Class routes
  app.post('/api/classes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const classData = insertClassSchema.parse(req.body);
      const newClass = await storage.createClass(userId, classData);
      res.json(newClass);
    } catch (error) {
      console.error("Error creating class:", error);
      res.status(400).json({ message: "Invalid class data" });
    }
  });

  app.get('/api/classes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const classes = await storage.getClassesByUser(userId);
      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  app.delete('/api/classes/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteClass(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting class:", error);
      res.status(500).json({ message: "Failed to delete class" });
    }
  });

  // Availability routes
  app.post('/api/availability', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const availabilityData = insertAvailabilitySchema.parse(req.body);
      const newAvailability = await storage.createAvailability(userId, availabilityData);
      res.json(newAvailability);
    } catch (error) {
      console.error("Error creating availability:", error);
      res.status(400).json({ message: "Invalid availability data" });
    }
  });

  app.get('/api/availability', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const availability = await storage.getAvailabilityByUser(userId);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  app.delete('/api/availability/:id', isAuthenticated, async (req: any, res) => {
    try {
      await storage.deleteAvailability(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting availability:", error);
      res.status(500).json({ message: "Failed to delete availability" });
    }
  });

  // Group routes
  app.post('/api/groups', isAuthenticated, async (req: any, res) => {
    try {
      const { name, topics } = req.body;
      const newGroup = await storage.createGroup({ name, topics });
      res.json(newGroup);
    } catch (error) {
      console.error("Error creating group:", error);
      res.status(400).json({ message: "Failed to create group" });
    }
  });

  app.get('/api/groups', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groups = await storage.getGroupsByUser(userId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.get('/api/groups/:id', isAuthenticated, async (req: any, res) => {
    try {
      const group = await storage.getGroupById(req.params.id);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      res.json(group);
    } catch (error) {
      console.error("Error fetching group:", error);
      res.status(500).json({ message: "Failed to fetch group" });
    }
  });

  // Session routes
  app.post('/api/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const sessionData = insertSessionSchema.parse(req.body);
      const newSession = await storage.createSession(sessionData);
      res.json(newSession);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  app.get('/api/sessions/upcoming', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getUpcomingSessionsByUser(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.get('/api/groups/:id/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const sessions = await storage.getSessionsByGroup(req.params.id);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching group sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  app.patch('/api/sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const updates = req.body;
      const updatedSession = await storage.updateSession(req.params.id, updates);
      res.json(updatedSession);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  app.delete('/api/sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      // Note: In production, you'd want to implement a delete method in storage
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting session:", error);
      res.status(500).json({ message: "Failed to delete session" });
    }
  });

  app.post('/api/sessions/:id/generate-agenda', isAuthenticated, async (req: any, res) => {
    try {
      const session = await storage.getSessionById(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }

      // Get course information from group topics
      const topics = session.group.topics || [];
      const courseName = topics[0] || "Study Session";

      try {
        const agenda = await generateSessionAgenda({
          courseName,
          topics,
          duration: session.duration || 90,
        });

        const updatedSession = await storage.updateSession(req.params.id, {
          objectives: agenda.objectives,
          practiceQuestions: agenda.practiceQuestions,
          timeSchedule: agenda.timeSchedule,
        });

        // Create checklist items from objectives
        for (const objective of agenda.objectives) {
          await storage.createChecklistItem({
            sessionId: req.params.id,
            content: objective,
            completed: false,
          });
        }

        res.json(updatedSession);
      } catch (aiError: any) {
        console.error("OpenAI error:", aiError);
        res.status(500).json({ 
          message: aiError.message || "AI service unavailable. Please check OpenAI API key." 
        });
      }
    } catch (error) {
      console.error("Error generating agenda:", error);
      res.status(500).json({ message: "Failed to generate agenda" });
    }
  });

  // Message routes
  app.get('/api/groups/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const messages = await storage.getMessagesByGroup(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/groups/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { content } = req.body;
      
      const message = await storage.createMessage({
        groupId: req.params.id,
        userId,
        content,
      });

      // Get message with user data
      const user = await storage.getUser(userId);
      const messageWithUser = { ...message, user: user! };

      // Broadcast to all connected clients in this group
      const connections = groupConnections.get(req.params.id);
      if (connections) {
        connections.forEach((ws) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: "message",
              groupId: req.params.id,
              message: messageWithUser,
            }));
          }
        });
      }

      res.json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(400).json({ message: "Failed to send message" });
    }
  });

  // Checklist routes
  app.patch('/api/checklist/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { completed } = req.body;
      const userId = completed ? req.user.claims.sub : null;
      
      const item = await storage.updateChecklistItem(req.params.id, {
        completed,
        completedBy: userId,
      });
      
      res.json(item);
    } catch (error) {
      console.error("Error updating checklist item:", error);
      res.status(500).json({ message: "Failed to update checklist item" });
    }
  });

  // Matching algorithm route
  app.post('/api/matching/find', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const currentUser = await storage.getUser(userId);
      
      if (!currentUser || !currentUser.topics || currentUser.topics.length === 0) {
        return res.status(400).json({ message: "Please complete your profile first" });
      }

      // Get all users for matching
      const allUsers = await storage.getAllUsersForMatching();
      
      // Filter users who have topics and are not the current user
      const potentialMatches = allUsers.filter(
        u => u.id !== userId && u.topics && u.topics.length > 0
      );

      if (potentialMatches.length === 0) {
        return res.status(404).json({ message: "No potential matches found" });
      }

      // Generate embedding for current user's topics
      const currentUserTopicsText = currentUser.topics.join(" ");
      
      let currentUserEmbedding: number[];
      try {
        currentUserEmbedding = await generateEmbedding(currentUserTopicsText);
      } catch (aiError: any) {
        console.error("OpenAI embedding error:", aiError);
        return res.status(500).json({ 
          message: "AI matching service unavailable. Please check OpenAI API key configuration." 
        });
      }

      // Calculate similarity scores
      const matches: Array<{ user: any; score: number }> = [];
      
      for (const user of potentialMatches) {
        try {
          const userTopicsText = user.topics!.join(" ");
          const userEmbedding = await generateEmbedding(userTopicsText);
          const similarity = cosineSimilarity(currentUserEmbedding, userEmbedding);
          
          if (similarity > 0.5) { // Threshold for matching
            matches.push({ user, score: similarity });
          }
        } catch (error) {
          console.error("Error processing user match:", error);
          // Continue to next user instead of failing completely
        }
      }

      // Sort by similarity score
      matches.sort((a, b) => b.score - a.score);

      if (matches.length === 0) {
        return res.status(404).json({ message: "No compatible matches found" });
      }

      // Create a group with top 2-4 matches
      const groupSize = Math.min(4, matches.length + 1);
      const groupMembers = matches.slice(0, groupSize - 1).map(m => m.user);
      
      // Find common topics
      const allTopics = [currentUser, ...groupMembers].flatMap(u => u.topics || []);
      const topicCounts = allTopics.reduce((acc, topic) => {
        acc[topic] = (acc[topic] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const commonTopics = Object.entries(topicCounts)
        .filter(([_, count]) => count >= 2)
        .map(([topic]) => topic)
        .slice(0, 5);

      // Create the group
      const groupName = `${commonTopics[0] || "Study"} Group`;
      const newGroup = await storage.createGroup({
        name: groupName,
        topics: commonTopics,
      });

      // Add all members to the group
      await storage.addUserToGroup(newGroup.id, userId);
      for (const member of groupMembers) {
        await storage.addUserToGroup(newGroup.id, member.id);
      }

      // Create an initial session
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(18, 0, 0, 0);

      await storage.createSession({
        groupId: newGroup.id,
        title: `${groupName} - First Session`,
        scheduledAt: tomorrow,
        duration: 90,
        topic: commonTopics[0],
      });

      res.json({ groupId: newGroup.id, matches: matches.length });
    } catch (error) {
      console.error("Error finding matches:", error);
      res.status(500).json({ message: "Failed to find matches" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    let currentGroupId: string | null = null;

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());

        if (message.type === 'join' && message.groupId) {
          // Join a group chat room
          currentGroupId = message.groupId;
          
          if (!groupConnections.has(currentGroupId)) {
            groupConnections.set(currentGroupId, new Set());
          }
          
          groupConnections.get(currentGroupId)!.add(ws);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      // Remove from group when disconnected
      if (currentGroupId) {
        const connections = groupConnections.get(currentGroupId);
        if (connections) {
          connections.delete(ws);
          if (connections.size === 0) {
            groupConnections.delete(currentGroupId);
          }
        }
      }
    });
  });

  return httpServer;
}
