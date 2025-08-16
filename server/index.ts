import express from "express";
import path from "path";
import { registerRoutes } from "./routes.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the root directory (where our HTML, CSS, JS files are)
app.use(express.static(path.join(__dirname, '..')));

// Register API routes and authentication
registerRoutes(app).then((server: any) => {
  const port = process.env.PORT || 5000;
  
  server.listen(Number(port), '0.0.0.0', () => {
    console.log(`🚀 Madifa Streaming Server running on port ${port}`);
    console.log(`🔐 Authentication system ready`);
    console.log(`🎬 Visit http://0.0.0.0:${port} to access your streaming app`);
  });
}).catch((error: any) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});