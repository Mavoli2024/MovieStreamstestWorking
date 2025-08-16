import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { setupAuth, requireAuth } from "./auth.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated || !req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Movies API route (protected)
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

  // Auth page route - handle both /auth and /auth.html
  app.get('/auth', (req, res) => {
    res.sendFile('auth.html', { root: process.cwd() });
  });

  // Public routes
  app.get('/api/status', (req, res) => {
    res.json({ 
      status: 'ok', 
      authenticated: !!(req as any).isAuthenticated && (req as any).isAuthenticated(),
      timestamp: new Date().toISOString()
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}