import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth } from "./auth";

// Bunny CDN Storage API configuration
const BUNNY_CDN_STORAGE_API = "https://storage.bunnycdn.com";
const BUNNY_CDN_STORAGE_ZONE = "madifa";
const BUNNY_CDN_BASE_URL = "https://vz-685277f9-aa1.b-cdn.net";
const BUNNY_CDN_API_KEY = "0f122642-06cc-4dac-b4b0720962c8-49bd-4f49";

async function fetchMoviesFromBunnyCDN(): Promise<any[]> {
  try {
    // Since we don't have the correct Storage API access, let's use the Pull Zone API instead
    // This approach uses the CDN API to get zone information and discover content
    const pullZoneApiUrl = `https://api.bunny.net/pullzone/vz-685277f9-aa1`;
    
    console.log("Attempting to fetch from Bunny CDN Pull Zone API...");
    
    // Try Pull Zone API first
    const response = await fetch(pullZoneApiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'AccessKey': BUNNY_CDN_API_KEY
      }
    });

    if (response.ok) {
      const zoneData = await response.json();
      console.log("Pull Zone data received");
      
      // Since we can't directly list files without storage API, 
      // let's try to discover content by testing known video paths
      const testPaths = [
        '/movies/',
        '/content/',
        '/videos/',
        '/'
      ];
      
      // For now, return an empty array and let you tell us what files exist
      console.log("Please provide the actual movie files in your storage");
      return [];
      
    } else {
      console.error("Failed to fetch from Pull Zone API:", response.status, response.statusText);
      
      // If API access fails, ask user for actual file list
      console.log("Unable to access Bunny CDN APIs. Need actual file list from user.");
      return [];
    }
    
  } catch (error) {
    console.error("Error fetching movies from Bunny CDN:", error);
    
    // Return empty array so user can provide actual files
    console.log("Please provide your actual movie files list");
    return [];
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