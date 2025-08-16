import { ClerkExpressWithAuth, ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import { Express, RequestHandler } from "express";

export function setupClerkAuth(app: Express) {
  // Add Clerk middleware to all routes
  app.use(ClerkExpressWithAuth({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY || 'pk_test_placeholder',
    secretKey: process.env.CLERK_SECRET_KEY || 'sk_placeholder'
  }));
  
  console.log('🔐 Clerk authentication setup complete');
}

// Middleware to require authentication
export const requireAuth: RequestHandler = ClerkExpressRequireAuth({
  onError: (error) => {
    console.error('Clerk authentication error:', error);
    return { status: 401, message: 'Unauthorized - Please sign in' };
  }
});