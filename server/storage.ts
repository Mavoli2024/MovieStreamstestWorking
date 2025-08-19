import { 
  users, movies, watchHistory, performanceMetrics, userFeedback,
  type User, type InsertUser, type Movie, type InsertMovie, 
  type WatchHistory, type InsertWatchHistory,
  type PerformanceMetrics, type InsertPerformanceMetrics,
  type UserFeedback, type InsertUserFeedback
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, avg, count, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Movies
  getMovie(id: string): Promise<Movie | undefined>;
  getAllMovies(): Promise<Movie[]>;
  getMoviesByType(contentType: string): Promise<Movie[]>;
  getTrendingMovies(): Promise<Movie[]>;
  getOriginalMovies(): Promise<Movie[]>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  
  // Watch History
  getUserWatchHistory(userId: string): Promise<WatchHistory[]>;
  updateWatchProgress(data: InsertWatchHistory): Promise<WatchHistory>;
  
  // Performance Metrics
  recordPerformanceMetrics(metrics: InsertPerformanceMetrics): Promise<PerformanceMetrics>;
  getAveragePerformanceMetrics(): Promise<any>;
  getUserPerformanceMetrics(userId: string): Promise<PerformanceMetrics[]>;
  
  // User Feedback
  submitFeedback(feedback: InsertUserFeedback): Promise<UserFeedback>;
  getFeedback(): Promise<UserFeedback[]>;
  resolveFeedback(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
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

  // Movies
  async getMovie(id: string): Promise<Movie | undefined> {
    const [movie] = await db.select().from(movies).where(eq(movies.id, id));
    return movie || undefined;
  }

  async getAllMovies(): Promise<Movie[]> {
    return await db.select().from(movies).orderBy(desc(movies.createdAt));
  }

  async getMoviesByType(contentType: string): Promise<Movie[]> {
    return await db.select().from(movies)
      .where(eq(movies.contentType, contentType))
      .orderBy(desc(movies.createdAt));
  }

  async getTrendingMovies(): Promise<Movie[]> {
    // Get movies with highest watch count in last 30 days
    const result = await db.select({
      movie: movies,
      watchCount: count(watchHistory.id)
    })
    .from(movies)
    .leftJoin(watchHistory, eq(movies.id, watchHistory.movieId))
    .where(sql`${watchHistory.watchedAt} > NOW() - INTERVAL '30 days'`)
    .groupBy(movies.id)
    .orderBy(desc(count(watchHistory.id)))
    .limit(20);

    return result.map(r => r.movie);
  }

  async getOriginalMovies(): Promise<Movie[]> {
    return await db.select().from(movies)
      .where(eq(movies.isOriginal, true))
      .orderBy(desc(movies.createdAt));
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const [movie] = await db
      .insert(movies)
      .values(insertMovie)
      .returning();
    return movie;
  }

  // Watch History
  async getUserWatchHistory(userId: string): Promise<WatchHistory[]> {
    return await db.select().from(watchHistory)
      .where(eq(watchHistory.userId, userId))
      .orderBy(desc(watchHistory.watchedAt));
  }

  async updateWatchProgress(data: InsertWatchHistory): Promise<WatchHistory> {
    // First try to update existing record
    const existing = await db.select().from(watchHistory)
      .where(and(
        eq(watchHistory.userId, data.userId!),
        eq(watchHistory.movieId, data.movieId!)
      ));

    if (existing.length > 0) {
      const [updated] = await db.update(watchHistory)
        .set({ 
          position: data.position, 
          completed: data.completed,
          watchedAt: sql`now()`
        })
        .where(eq(watchHistory.id, existing[0].id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(watchHistory)
        .values(data)
        .returning();
      return created;
    }
  }

  // Performance Metrics
  async recordPerformanceMetrics(metrics: InsertPerformanceMetrics): Promise<PerformanceMetrics> {
    const [recorded] = await db
      .insert(performanceMetrics)
      .values(metrics)
      .returning();
    return recorded;
  }

  async getAveragePerformanceMetrics(): Promise<any> {
    const [result] = await db.select({
      avgStreamQuality: avg(performanceMetrics.streamQuality),
      avgBufferTime: avg(performanceMetrics.bufferTime),
      avgErrorRate: avg(performanceMetrics.errorRate),
      avgConnectionSpeed: avg(performanceMetrics.connectionSpeed),
      avgCdnLatency: avg(performanceMetrics.cdnLatency),
    }).from(performanceMetrics)
    .where(sql`${performanceMetrics.timestamp} > NOW() - INTERVAL '24 hours'`);

    return result;
  }

  async getUserPerformanceMetrics(userId: string): Promise<PerformanceMetrics[]> {
    return await db.select().from(performanceMetrics)
      .where(eq(performanceMetrics.userId, userId))
      .orderBy(desc(performanceMetrics.timestamp))
      .limit(100);
  }

  // User Feedback
  async submitFeedback(feedback: InsertUserFeedback): Promise<UserFeedback> {
    const [submitted] = await db
      .insert(userFeedback)
      .values(feedback)
      .returning();
    return submitted;
  }

  async getFeedback(): Promise<UserFeedback[]> {
    return await db.select().from(userFeedback)
      .orderBy(desc(userFeedback.createdAt));
  }

  async resolveFeedback(id: string): Promise<void> {
    await db.update(userFeedback)
      .set({ resolved: true })
      .where(eq(userFeedback.id, id));
  }
}

export const storage = new DatabaseStorage();
