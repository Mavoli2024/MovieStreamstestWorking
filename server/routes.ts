import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth } from "./auth";

// Bunny CDN Storage API configuration
const BUNNY_CDN_STORAGE_API = "https://storage.bunnycdn.com";
const BUNNY_CDN_STORAGE_ZONE = "madifa";
const BUNNY_CDN_BASE_URL = "https://vz-685277f9-aa1.b-cdn.net";

async function fetchMoviesFromBunnyCDN(): Promise<any[]> {
  try {
    // For now, use the existing CDN URL structure to discover movies
    // This can be enhanced with actual storage API when API key is available
    
    // Known movie files from your storage
    const knownMovies = [
      "ubuntu-short.mp4",
      "township-tales.mp4", 
      "mzansi-dreams.mp4",
      "heritage-journey.mp4",
      "love-in-johannesburg.mp4",
      "amandla-power.mp4"
    ];

    const movies = knownMovies.map((filename, index) => {
      const cleanName = filename.replace('.mp4', '').replace('-', ' ');
      const titleCase = cleanName.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');

      return {
        id: filename.replace('.mp4', ''),
        title: titleCase,
        description: `Authentic South African storytelling - ${titleCase}`,
        url: `${BUNNY_CDN_BASE_URL}/movies/${filename}`,
        thumbnail: `${BUNNY_CDN_BASE_URL}/thumbnails/${filename.replace('.mp4', '.jpg')}`,
        category: "Madifa Original",
        duration: "Feature Length",
        year: 2024,
        filename: filename
      };
    });

    console.log("Fetched movies from Bunny CDN:", movies.length);
    return movies;
    
  } catch (error) {
    console.error("Error fetching movies from Bunny CDN:", error);
    throw error;
  }
}

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

  // Movies API route (public for browsing)
  app.get("/api/movies", async (req, res) => {
    try {
      const movies = await fetchMoviesFromBunnyCDN();
      res.json(movies);
    } catch (error) {
      console.error("Error fetching movies from Bunny CDN:", error);
      res.status(500).json({ 
        message: "Failed to fetch movies from storage", 
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
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