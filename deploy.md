# Deployment Guide for Madifa Streaming Platform

## Quick Deploy Steps

### 1. Create New GitHub Repository

1. Go to [GitHub.com](https://github.com) and click "New Repository"
2. Name it: `madifa-streaming-platform`
3. Description: `Secure streaming platform for South African content`
4. Make it **Public** or **Private** (your choice)
5. Don't initialize with README (we already have one)
6. Click "Create Repository"

### 2. Push Code to New Repository

```bash
# Remove old git history
rm -rf .git

# Initialize new repository
git init
git branch -M main

# Add all files
git add .
git commit -m "Initial commit: Madifa Streaming Platform"

# Connect to your new GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/madifa-streaming-platform.git
git push -u origin main
```

### 3. Deploy on Replit

#### Option A: Import from GitHub
1. Go to Replit.com
2. Click "Import from GitHub"
3. Enter your repository URL
4. Select "Node.js" as the language

#### Option B: Connect Current Replit
1. Go to Version Control tab in current Replit
2. Click "Connect to GitHub"
3. Select your new repository

### 4. Configure Deployment

1. Go to **Deployments** tab
2. Click **"Create Deployment"**
3. Select **"Autoscale Deployment"**
4. Configure:
   - Build Command: `npm install`
   - Run Command: `npx tsx server/index.ts`
   - Environment Variables:
     - `DATABASE_URL`: Your PostgreSQL URL
     - `SESSION_SECRET`: Random secure string
     - `NODE_ENV`: `production`

### 5. Deploy!

Click **"Deploy"** and your streaming platform will be live!

## Environment Variables Needed

```bash
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-super-secret-random-string-here
NODE_ENV=production
```

## Post-Deployment

1. Test user registration at: `your-app-url/auth?tab=register`
2. Test login at: `your-app-url/auth?tab=login`
3. Verify video streaming works for authenticated users

Your streaming platform will be live with:
✅ Working user authentication
✅ Protected video streaming
✅ Secure session management
✅ Responsive design
✅ HTTPS encryption