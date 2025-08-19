import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, requireAuth } from "./auth";

// Bunny CDN Stream API configuration
const BUNNY_CDN_STREAM_API = "https://video.bunnycdn.com/library";
const BUNNY_CDN_VIDEO_LIBRARY_ID = "425043";
const BUNNY_CDN_BASE_URL = "https://vz-685277f9-aa1.b-cdn.net";
const BUNNY_CDN_API_KEY = "0f122642-06cc-4dac-b4b0720962c8-49bd-4f49";

async function fetchMoviesFromBunnyCDN(): Promise<any[]> {
  try {
    // Use Bunny CDN Stream API to get videos from the library
    const streamApiUrl = `${BUNNY_CDN_STREAM_API}/${BUNNY_CDN_VIDEO_LIBRARY_ID}/videos`;
    
    console.log("Attempting to fetch from Bunny CDN Stream API...");
    
    // Fetch videos from Stream API
    const response = await fetch(streamApiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'AccessKey': BUNNY_CDN_API_KEY
      }
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Stream API data received:", data);
      
      // Extract videos from the response
      const videos = data.items || data || [];
      
      const movies = videos.map((video: any) => {
        // Create clean title from video title or guid
        const title = video.title || video.guid || 'Untitled Video';
        
        // Use the video GUID for streaming URL
        const streamUrl = `${BUNNY_CDN_BASE_URL}/${video.guid}/playlist.m3u8`;
        const mp4Url = `${BUNNY_CDN_BASE_URL}/${video.guid}/play_720p.mp4`;
        
        return {
          id: video.guid,
          title: title,
          description: `Authentic South African content - ${title}`,
          url: mp4Url, // Use MP4 for direct playback
          streamUrl: streamUrl, // HLS stream URL
          thumbnail: video.thumbnailFileName ? 
            `${BUNNY_CDN_BASE_URL}/${video.guid}/${video.thumbnailFileName}` : 
            `${BUNNY_CDN_BASE_URL}/${video.guid}/thumbnail.jpg`,
          category: video.category || "Madifa Original",
          duration: video.length ? `${Math.round(video.length / 60)} minutes` : "Feature Length",
          year: new Date(video.dateUploaded || Date.now()).getFullYear(),
          guid: video.guid,
          status: video.status,
          views: video.views || 0,
          size: video.storageSize || 0
        };
      });

      console.log(`Fetched ${movies.length} videos from Bunny CDN Stream library`);
      return movies;
      
    } else {
      console.error("Failed to fetch from Stream API:", response.status, response.statusText);
      throw new Error(`Stream API error: ${response.status} ${response.statusText}`);
    }
    
  } catch (error) {
    console.error("Error fetching videos from Bunny CDN Stream:", error);
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