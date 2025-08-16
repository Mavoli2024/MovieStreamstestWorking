import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupClerkAuth, requireAuth } from "./clerkAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupClerkAuth(app);

  // Auth routes
  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      // Clerk provides user data in req.auth
      const clerkUser = req.auth.userId;
      if (!clerkUser) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      // Return Clerk user info
      res.json({ 
        id: req.auth.userId,
        authenticated: true 
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Protected API routes
  app.get("/api/movies", requireAuth, async (req, res) => {
    // Return available movies for authenticated users
    const movies = [
      {
        id: "big-buck-bunny",
        title: "Big Buck Bunny",
        description: "Open source animated short",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnail: "/api/placeholder/300/200"
      },
      {
        id: "elephants-dream", 
        title: "Elephants Dream",
        description: "Creative Commons movie",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        thumbnail: "/api/placeholder/300/200"
      },
      {
        id: "sintel",
        title: "Sintel",
        description: "Blender Open Movie",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        thumbnail: "/api/placeholder/300/200"
      },
      {
        id: "tears-of-steel",
        title: "Tears of Steel", 
        description: "Science fiction short film",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        thumbnail: "/api/placeholder/300/200"
      }
    ];
    
    res.json(movies);
  });

  // Public routes
  app.get('/api/status', (req, res) => {
    res.json({ 
      status: 'ok', 
      authenticated: !!(req as any).auth?.userId,
      timestamp: new Date().toISOString()
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}