import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  subscriptionActive: boolean("subscription_active").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const movies = pgTable("movies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url").notNull(),
  duration: integer("duration"), // in seconds
  year: integer("year"),
  genre: text("genre"),
  rating: decimal("rating", { precision: 3, scale: 1 }),
  isOriginal: boolean("is_original").default(false),
  contentType: text("content_type").notNull().default('movie'), // movie, series, documentary, music, theatre
  qualityUrls: jsonb("quality_urls"), // {720p: 'url', 1080p: 'url', etc}
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const watchHistory = pgTable("watch_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  movieId: varchar("movie_id").references(() => movies.id),
  watchedAt: timestamp("watched_at").default(sql`now()`),
  position: integer("position").default(0), // in seconds
  completed: boolean("completed").default(false),
});

export const performanceMetrics = pgTable("performance_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  movieId: varchar("movie_id").references(() => movies.id),
  streamQuality: decimal("stream_quality", { precision: 5, scale: 2 }),
  bufferTime: decimal("buffer_time", { precision: 5, scale: 2 }),
  errorRate: decimal("error_rate", { precision: 5, scale: 4 }),
  connectionSpeed: decimal("connection_speed", { precision: 8, scale: 2 }),
  cdnLatency: integer("cdn_latency"),
  qualityChanges: integer("quality_changes").default(0),
  timestamp: timestamp("timestamp").default(sql`now()`),
});

export const userFeedback = pgTable("user_feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  movieId: varchar("movie_id").references(() => movies.id),
  issueType: text("issue_type").notNull(),
  description: text("description"),
  severity: text("severity").default('medium'),
  resolved: boolean("resolved").default(false),
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  watchHistory: many(watchHistory),
  performanceMetrics: many(performanceMetrics),
  feedback: many(userFeedback),
}));

export const moviesRelations = relations(movies, ({ many }) => ({
  watchHistory: many(watchHistory),
  performanceMetrics: many(performanceMetrics),
  feedback: many(userFeedback),
}));

export const watchHistoryRelations = relations(watchHistory, ({ one }) => ({
  user: one(users, { fields: [watchHistory.userId], references: [users.id] }),
  movie: one(movies, { fields: [watchHistory.movieId], references: [movies.id] }),
}));

export const performanceMetricsRelations = relations(performanceMetrics, ({ one }) => ({
  user: one(users, { fields: [performanceMetrics.userId], references: [users.id] }),
  movie: one(movies, { fields: [performanceMetrics.movieId], references: [movies.id] }),
}));

export const userFeedbackRelations = relations(userFeedback, ({ one }) => ({
  user: one(users, { fields: [userFeedback.userId], references: [users.id] }),
  movie: one(movies, { fields: [userFeedback.movieId], references: [movies.id] }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertMovieSchema = createInsertSchema(movies).omit({
  id: true,
  createdAt: true,
});

export const insertWatchHistorySchema = createInsertSchema(watchHistory).omit({
  id: true,
  watchedAt: true,
});

export const insertPerformanceMetricsSchema = createInsertSchema(performanceMetrics).omit({
  id: true,
  timestamp: true,
});

export const insertUserFeedbackSchema = createInsertSchema(userFeedback).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMovie = z.infer<typeof insertMovieSchema>;
export type Movie = typeof movies.$inferSelect;

export type InsertWatchHistory = z.infer<typeof insertWatchHistorySchema>;
export type WatchHistory = typeof watchHistory.$inferSelect;

export type InsertPerformanceMetrics = z.infer<typeof insertPerformanceMetricsSchema>;
export type PerformanceMetrics = typeof performanceMetrics.$inferSelect;

export type InsertUserFeedback = z.infer<typeof insertUserFeedbackSchema>;
export type UserFeedback = typeof userFeedback.$inferSelect;
