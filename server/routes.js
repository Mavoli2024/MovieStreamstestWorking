import { createServer } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
export async function registerRoutes(app) {
    // Auth middleware
    await setupAuth(app);
    // Auth routes
    app.get('/api/auth/user', isAuthenticated, async (req, res) => {
        try {
            const userId = req.user.claims.sub;
            const user = await storage.getUser(userId);
            res.json(user);
        }
        catch (error) {
            console.error("Error fetching user:", error);
            res.status(500).json({ message: "Failed to fetch user" });
        }
    });
    // Protected API routes
    app.get("/api/movies", isAuthenticated, async (req, res) => {
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
            authenticated: req.isAuthenticated(),
            timestamp: new Date().toISOString()
        });
    });
    const httpServer = createServer(app);
    return httpServer;
}
//# sourceMappingURL=routes.js.map