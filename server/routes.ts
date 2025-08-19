import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMovieSchema, insertPerformanceMetricsSchema, insertUserFeedbackSchema, insertWatchHistorySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Movies endpoints
  app.get("/api/movies", async (req, res) => {
    try {
      const movies = await storage.getAllMovies();
      res.json(movies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch movies" });
    }
  });

  app.get("/api/movies/trending", async (req, res) => {
    try {
      const movies = await storage.getTrendingMovies();
      res.json(movies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trending movies" });
    }
  });

  app.get("/api/movies/originals", async (req, res) => {
    try {
      const movies = await storage.getOriginalMovies();
      res.json(movies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch original movies" });
    }
  });

  app.get("/api/movies/type/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const movies = await storage.getMoviesByType(type);
      res.json(movies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch movies by type" });
    }
  });

  app.get("/api/movies/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const movie = await storage.getMovie(id);
      if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
      }
      res.json(movie);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch movie" });
    }
  });

  app.post("/api/movies", async (req, res) => {
    try {
      const movieData = insertMovieSchema.parse(req.body);
      const movie = await storage.createMovie(movieData);
      res.status(201).json(movie);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid movie data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create movie" });
    }
  });

  // Watch history endpoints
  app.get("/api/watch-history/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const history = await storage.getUserWatchHistory(userId);
      res.json(history);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch watch history" });
    }
  });

  app.post("/api/watch-history", async (req, res) => {
    try {
      const watchData = insertWatchHistorySchema.parse(req.body);
      const history = await storage.updateWatchProgress(watchData);
      res.json(history);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid watch history data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update watch history" });
    }
  });

  // Performance metrics endpoints
  app.post("/api/performance-metrics", async (req, res) => {
    try {
      const metricsData = insertPerformanceMetricsSchema.parse(req.body);
      const metrics = await storage.recordPerformanceMetrics(metricsData);
      res.json(metrics);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid metrics data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to record metrics" });
    }
  });

  app.get("/api/performance-metrics/average", async (req, res) => {
    try {
      const metrics = await storage.getAveragePerformanceMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch performance metrics" });
    }
  });

  app.get("/api/performance-metrics/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const metrics = await storage.getUserPerformanceMetrics(userId);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user metrics" });
    }
  });

  // User feedback endpoints
  app.post("/api/feedback", async (req, res) => {
    try {
      const feedbackData = insertUserFeedbackSchema.parse(req.body);
      const feedback = await storage.submitFeedback(feedbackData);
      res.json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid feedback data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to submit feedback" });
    }
  });

  app.get("/api/feedback", async (req, res) => {
    try {
      const feedback = await storage.getFeedback();
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  app.patch("/api/feedback/:id/resolve", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.resolveFeedback(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to resolve feedback" });
    }
  });

  // Connection speed test endpoint
  app.get("/api/speed-test", (req, res) => {
    // Return a small test payload with timestamp for connection speed calculation
    const testData = {
      timestamp: Date.now(),
      size: 1024, // 1KB test data
      data: "a".repeat(1024)
    };
    res.json(testData);
  });

  const httpServer = createServer(app);
  return httpServer;
}
