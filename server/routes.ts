import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // No auth middleware needed

  // Auth routes (mock for now)
  app.get('/api/auth/user', (req, res) => {
    // Always return not authenticated for now
    res.status(401).json({ message: "Not authenticated" });
  });

  // Movies API route (public for now)
  app.get("/api/movies", async (req, res) => {
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
      authenticated: false,
      timestamp: new Date().toISOString()
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}