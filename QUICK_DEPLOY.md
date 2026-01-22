# Quick Deploy to Vercel

## Step 1: Push to GitHub

```bash
# If you haven't already, create a GitHub repo and push:
git remote add origin https://github.com/YOUR_USERNAME/crej-portal.git
git push -u origin main
```

## Step 2: Deploy to Vercel

1. **Go to https://vercel.com and sign in** (or create account)

2. **Click "Add New Project"**

3. **Import your GitHub repository** (crej-portal)

4. **Configure Project:**
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

5. **Set Environment Variables:**
   Click "Environment Variables" and add:
   
   ```
   DATABASE_URL = (you'll get this in step 3)
   ALLOWED_EMAIL_DOMAIN = @crejllc.net
   NODE_ENV = production
   ```

6. **Click "Deploy"** (don't worry about DATABASE_URL yet - we'll add it after)

## Step 3: Set Up Database

**Option A: Vercel Postgres (Easiest)**
1. In your Vercel project dashboard, go to **Storage** tab
2. Click **Create Database** → **Postgres**
3. Choose a name (e.g., `crej-portal-db`)
4. Select a region (choose closest to you)
5. Click **Create**
6. Copy the **Connection String** (looks like: `postgresql://...`)

**Option B: Supabase (Free tier available)**
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy the connection string (add `?sslmode=require` at the end)

**Option C: Neon (Free tier available)**
1. Go to https://neon.tech
2. Create new project
3. Copy the connection string

## Step 4: Update Environment Variables

1. Go back to Vercel project → **Settings** → **Environment Variables**
2. Update `DATABASE_URL` with your Postgres connection string
3. Make sure it includes `?sslmode=require` at the end
4. Click **Save**

## Step 5: Update Prisma Schema for Postgres

The schema needs to be updated to use Postgres in production. Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

Then commit and push:
```bash
git add prisma/schema.prisma
git commit -m "Update schema for Postgres production"
git push
```

## Step 6: Run Migrations & Seed

After Vercel redeploys, you need to run migrations. You can do this via Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
cd /Users/stephenrichardson/crej-portal
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Seed database
npm run prisma:seed
```

Or use Vercel's built-in database tools:
1. Go to your project → Storage → Your database
2. Use the SQL editor to run migrations manually

## Step 7: Test Your Deployment

1. Visit your Vercel URL: `https://your-project.vercel.app`
2. Try logging in with a @crejllc.net email
3. Check that magic link works (in dev mode, it shows the link)
4. Test role selection
5. Verify trainings and content display

## Important Notes

⚠️ **Magic Links in Production:**
- Currently, magic links work in dev mode (shows link on screen)
- For production, you need to set up email sending
- Consider using Resend (https://resend.com) - free tier available
- Update `app/api/auth/magic-link/route.ts` to send emails

⚠️ **Database:**
- SQLite won't work on Vercel (file system is read-only)
- Must use Postgres (Vercel Postgres, Supabase, or Neon)
- Make sure connection string includes SSL: `?sslmode=require`

⚠️ **First Deployment:**
- Build might fail if DATABASE_URL isn't set
- That's okay - set it after first deploy, then redeploy
- Or set it before first deploy if you have the connection string ready

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Prisma + Vercel: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel
- Vercel Postgres: https://vercel.com/docs/storage/vercel-postgres
