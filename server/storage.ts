import {
  users,
  classes,
  availability,
  groups,
  groupMembers,
  sessions_study,
  messages,
  checklistItems,
  type User,
  type UpsertUser,
  type UpdateUserPreferences,
  type Class,
  type InsertClass,
  type Availability,
  type InsertAvailability,
  type Group,
  type InsertGroup,
  type GroupMember,
  type Session,
  type InsertSession,
  type Message,
  type InsertMessage,
  type ChecklistItem,
  type InsertChecklistItem,
  type GroupWithMembers,
  type SessionWithDetails,
  type MessageWithUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserPreferences(id: string, preferences: UpdateUserPreferences): Promise<User>;
  getAllUsersForMatching(): Promise<User[]>;

  // Class operations
  createClass(userId: string, classData: InsertClass): Promise<Class>;
  getClassesByUser(userId: string): Promise<Class[]>;
  deleteClass(id: string): Promise<void>;

  // Availability operations
  createAvailability(userId: string, availabilityData: InsertAvailability): Promise<Availability>;
  getAvailabilityByUser(userId: string): Promise<Availability[]>;
  deleteAvailability(id: string): Promise<void>;

  // Group operations
  createGroup(groupData: InsertGroup): Promise<Group>;
  getGroupById(id: string): Promise<GroupWithMembers | undefined>;
  getGroupsByUser(userId: string): Promise<GroupWithMembers[]>;
  addUserToGroup(groupId: string, userId: string): Promise<GroupMember>;

  // Session operations
  createSession(sessionData: InsertSession): Promise<Session>;
  getSessionById(id: string): Promise<SessionWithDetails | undefined>;
  getUpcomingSessionsByUser(userId: string): Promise<SessionWithDetails[]>;
  getSessionsByGroup(groupId: string): Promise<SessionWithDetails[]>;
  updateSession(id: string, data: Partial<InsertSession>): Promise<Session>;

  // Message operations
  createMessage(messageData: InsertMessage): Promise<Message>;
  getMessagesByGroup(groupId: string): Promise<MessageWithUser[]>;

  // Checklist operations
  createChecklistItem(itemData: InsertChecklistItem): Promise<ChecklistItem>;
  updateChecklistItem(id: string, data: Partial<InsertChecklistItem>): Promise<ChecklistItem>;
  getChecklistItemsBySession(sessionId: string): Promise<ChecklistItem[]>;
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

  async updateUserPreferences(id: string, preferences: UpdateUserPreferences): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...preferences,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsersForMatching(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Class operations
  async createClass(userId: string, classData: InsertClass): Promise<Class> {
    const [cls] = await db
      .insert(classes)
      .values({ ...classData, userId })
      .returning();
    return cls;
  }

  async getClassesByUser(userId: string): Promise<Class[]> {
    return await db
      .select()
      .from(classes)
      .where(eq(classes.userId, userId));
  }

  async deleteClass(id: string): Promise<void> {
    await db.delete(classes).where(eq(classes.id, id));
  }

  // Availability operations
  async createAvailability(userId: string, availabilityData: InsertAvailability): Promise<Availability> {
    const [avail] = await db
      .insert(availability)
      .values({ ...availabilityData, userId })
      .returning();
    return avail;
  }

  async getAvailabilityByUser(userId: string): Promise<Availability[]> {
    return await db
      .select()
      .from(availability)
      .where(eq(availability.userId, userId));
  }

  async deleteAvailability(id: string): Promise<void> {
    await db.delete(availability).where(eq(availability.id, id));
  }

  // Group operations
  async createGroup(groupData: InsertGroup): Promise<Group> {
    const [group] = await db.insert(groups).values(groupData).returning();
    return group;
  }

  async getGroupById(id: string): Promise<GroupWithMembers | undefined> {
    const [group] = await db
      .select()
      .from(groups)
      .where(eq(groups.id, id));

    if (!group) return undefined;

    const members = await db
      .select()
      .from(groupMembers)
      .leftJoin(users, eq(groupMembers.userId, users.id))
      .where(eq(groupMembers.groupId, id));

    return {
      ...group,
      members: members.map(m => ({
        id: m.group_members.id,
        groupId: m.group_members.groupId,
        userId: m.group_members.userId,
        joinedAt: m.group_members.joinedAt,
        user: m.users!,
      })),
    };
  }

  async getGroupsByUser(userId: string): Promise<GroupWithMembers[]> {
    const userGroups = await db
      .select()
      .from(groupMembers)
      .where(eq(groupMembers.userId, userId));

    const groupsWithMembers: GroupWithMembers[] = [];

    for (const userGroup of userGroups) {
      const group = await this.getGroupById(userGroup.groupId);
      if (group) {
        groupsWithMembers.push(group);
      }
    }

    return groupsWithMembers;
  }

  async addUserToGroup(groupId: string, userId: string): Promise<GroupMember> {
    const [member] = await db
      .insert(groupMembers)
      .values({ groupId, userId })
      .returning();
    return member;
  }

  // Session operations
  async createSession(sessionData: InsertSession): Promise<Session> {
    const [session] = await db
      .insert(sessions_study)
      .values(sessionData)
      .returning();
    return session;
  }

  async getSessionById(id: string): Promise<SessionWithDetails | undefined> {
    const [session] = await db
      .select()
      .from(sessions_study)
      .where(eq(sessions_study.id, id));

    if (!session) return undefined;

    const group = await this.getGroupById(session.groupId);
    const checklistItemsData = await this.getChecklistItemsBySession(id);

    if (!group) return undefined;

    return {
      ...session,
      group,
      checklistItems: checklistItemsData,
    };
  }

  async getUpcomingSessionsByUser(userId: string): Promise<SessionWithDetails[]> {
    const userGroups = await this.getGroupsByUser(userId);
    const sessions: SessionWithDetails[] = [];

    for (const group of userGroups) {
      const groupSessions = await db
        .select()
        .from(sessions_study)
        .where(eq(sessions_study.groupId, group.id))
        .orderBy(desc(sessions_study.scheduledAt));

      for (const session of groupSessions) {
        const checklistItemsData = await this.getChecklistItemsBySession(session.id);
        sessions.push({
          ...session,
          group,
          checklistItems: checklistItemsData,
        });
      }
    }

    return sessions.sort((a, b) => {
      if (!a.scheduledAt) return 1;
      if (!b.scheduledAt) return -1;
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    });
  }

  async getSessionsByGroup(groupId: string): Promise<SessionWithDetails[]> {
    const groupSessions = await db
      .select()
      .from(sessions_study)
      .where(eq(sessions_study.groupId, groupId))
      .orderBy(desc(sessions_study.scheduledAt));

    const group = await this.getGroupById(groupId);
    if (!group) return [];

    const sessions: SessionWithDetails[] = [];

    for (const session of groupSessions) {
      const checklistItemsData = await this.getChecklistItemsBySession(session.id);
      sessions.push({
        ...session,
        group,
        checklistItems: checklistItemsData,
      });
    }

    return sessions;
  }

  async updateSession(id: string, data: Partial<InsertSession>): Promise<Session> {
    const [session] = await db
      .update(sessions_study)
      .set(data)
      .where(eq(sessions_study.id, id))
      .returning();
    return session;
  }

  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(messageData)
      .returning();
    return message;
  }

  async getMessagesByGroup(groupId: string): Promise<MessageWithUser[]> {
    const groupMessages = await db
      .select()
      .from(messages)
      .leftJoin(users, eq(messages.userId, users.id))
      .where(eq(messages.groupId, groupId))
      .orderBy(messages.createdAt);

    return groupMessages.map(m => ({
      ...m.messages,
      user: m.users!,
    }));
  }

  // Checklist operations
  async createChecklistItem(itemData: InsertChecklistItem): Promise<ChecklistItem> {
    const [item] = await db
      .insert(checklistItems)
      .values(itemData)
      .returning();
    return item;
  }

  async updateChecklistItem(id: string, data: Partial<InsertChecklistItem>): Promise<ChecklistItem> {
    const [item] = await db
      .update(checklistItems)
      .set(data)
      .where(eq(checklistItems.id, id))
      .returning();
    return item;
  }

  async getChecklistItemsBySession(sessionId: string): Promise<ChecklistItem[]> {
    return await db
      .select()
      .from(checklistItems)
      .where(eq(checklistItems.sessionId, sessionId));
  }

  // Analytics operations
  async getAnalyticsForUser(userId: string): Promise<{
    totalSessions: number;
    completedSessions: number;
    averageCompletionRate: number;
    averageSuccessRating: number;
    totalStudyTime: number;
    sessionsPerDay: Array<{ date: string; count: number; hours: number }>;
    topicPerformance: Array<{ topic: string; sessionsCompleted: number; avgRating: number }>;
    weeklyTrend: Array<{ week: string; completedSessions: number; avgRating: number }>;
  }> {
    // Get all sessions for user's groups
    const userGroups = await this.getGroupsByUser(userId);
    const allSessions: SessionWithDetails[] = [];
    
    for (const group of userGroups) {
      const groupSessions = await this.getSessionsByGroup(group.id);
      allSessions.push(...groupSessions);
    }

    const completedSessions = allSessions.filter(s => s.completedAt);
    const totalStudyTime = allSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    
    const avgCompletionRate = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.checklistCompletionPercent || 0), 0) / completedSessions.length
      : 0;

    const avgSuccessRating = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.successRating || 0), 0) / completedSessions.length
      : 0;

    // Group by date for daily activity
    const sessionsPerDayMap = new Map<string, { count: number; hours: number }>();
    allSessions.forEach(s => {
      const date = s.scheduledAt.toISOString().split('T')[0];
      const existing = sessionsPerDayMap.get(date) || { count: 0, hours: 0 };
      sessionsPerDayMap.set(date, {
        count: existing.count + 1,
        hours: existing.hours + (s.duration || 0) / 60,
      });
    });

    const sessionsPerDay = Array.from(sessionsPerDayMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Last 30 days

    // Topic performance
    const topicMap = new Map<string, { sessionsCompleted: number; totalRating: number; count: number }>();
    completedSessions.forEach(s => {
      const topics = s.group.topics || [];
      topics.forEach(topic => {
        const existing = topicMap.get(topic) || { sessionsCompleted: 0, totalRating: 0, count: 0 };
        topicMap.set(topic, {
          sessionsCompleted: existing.sessionsCompleted + 1,
          totalRating: existing.totalRating + (s.successRating || 0),
          count: existing.count + 1,
        });
      });
    });

    const topicPerformance = Array.from(topicMap.entries())
      .map(([topic, data]) => ({
        topic,
        sessionsCompleted: data.sessionsCompleted,
        avgRating: data.count > 0 ? data.totalRating / data.count : 0,
      }))
      .sort((a, b) => b.sessionsCompleted - a.sessionsCompleted)
      .slice(0, 10);

    // Weekly trend
    const weeklyMap = new Map<string, { completedSessions: number; totalRating: number; count: number }>();
    completedSessions.forEach(s => {
      const date = s.scheduledAt;
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      const existing = weeklyMap.get(weekKey) || { completedSessions: 0, totalRating: 0, count: 0 };
      weeklyMap.set(weekKey, {
        completedSessions: existing.completedSessions + 1,
        totalRating: existing.totalRating + (s.successRating || 0),
        count: existing.count + 1,
      });
    });

    const weeklyTrend = Array.from(weeklyMap.entries())
      .map(([week, data]) => ({
        week,
        completedSessions: data.completedSessions,
        avgRating: data.count > 0 ? data.totalRating / data.count : 0,
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-12); // Last 12 weeks

    return {
      totalSessions: allSessions.length,
      completedSessions: completedSessions.length,
      averageCompletionRate: avgCompletionRate,
      averageSuccessRating: avgSuccessRating,
      totalStudyTime,
      sessionsPerDay,
      topicPerformance,
      weeklyTrend,
    };
  }

  async completeSession(sessionId: string, successRating: number, feedback: string): Promise<Session> {
    const completionPercent = 75; // Default 75% if not specified
    
    const [session] = await db
      .update(sessions_study)
      .set({
        completedAt: new Date(),
        checklistCompletionPercent: completionPercent,
        successRating,
        feedback,
      })
      .where(eq(sessions_study.id, sessionId))
      .returning();
    return session;
  }
}

export const storage = new DatabaseStorage();
