import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth } from "./auth";

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
    // Return available Madifa movies for authenticated users
    const movies = [
      {
        id: "ubuntu-stories",
        title: "Ubuntu: Stories of Connection",
        description: "A powerful exploration of Ubuntu philosophy in modern South Africa",
        url: "https://vz-685277f9-aa1.b-cdn.net/movies/ubuntu-short.mp4",
        thumbnail: "/api/placeholder/300/200",
        category: "Madifa Original",
        duration: "45 minutes",
        year: 2024
      },
      {
        id: "township-tales", 
        title: "Township Tales",
        description: "Authentic stories from the heart of South African communities",
        url: "https://vz-685277f9-aa1.b-cdn.net/movies/township-tales.mp4",
        thumbnail: "/api/placeholder/300/200",
        category: "Community Stories",
        duration: "32 minutes",
        year: 2024
      },
      {
        id: "mzansi-dreams",
        title: "Mzansi Dreams",
        description: "Youth aspirations and dreams in contemporary South Africa",
        url: "https://vz-685277f9-aa1.b-cdn.net/movies/mzansi-dreams.mp4",
        thumbnail: "/api/placeholder/300/200",
        category: "Youth Aspirations",
        duration: "28 minutes",
        year: 2024
      },
      {
        id: "heritage-journey",
        title: "Heritage Journey", 
        description: "A cultural documentary exploring South African heritage",
        url: "https://vz-685277f9-aa1.b-cdn.net/movies/heritage-journey.mp4",
        thumbnail: "/api/placeholder/300/200",
        category: "Cultural Documentary",
        duration: "52 minutes",
        year: 2024
      },
      {
        id: "love-in-johannesburg",
        title: "Love in Johannesburg",
        description: "A romantic drama set against the vibrant backdrop of Johannesburg",
        url: "https://vz-685277f9-aa1.b-cdn.net/movies/love-in-johannesburg.mp4",
        thumbnail: "/api/placeholder/300/200",
        category: "Romance Drama",
        duration: "68 minutes",
        year: 2024
      },
      {
        id: "amandla-power",
        title: "Amandla: The Power Within",
        description: "An inspirational story of inner strength and community power",
        url: "https://vz-685277f9-aa1.b-cdn.net/movies/amandla-power.mp4",
        thumbnail: "/api/placeholder/300/200",
        category: "Inspirational",
        duration: "41 minutes",
        year: 2024
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