# Deployment Guide - CREJ Portal

## Deploying to Vercel

### Prerequisites
1. A Vercel account (sign up at https://vercel.com)
2. A Postgres database (Vercel Postgres, Supabase, or Neon recommended)
3. Git repository (GitHub, GitLab, or Bitbucket)

### Step 1: Set Up Database

**Option A: Vercel Postgres (Recommended)**
1. In your Vercel project dashboard, go to Storage
2. Create a new Postgres database
3. Copy the connection string

**Option B: External Postgres (Supabase/Neon)**
1. Create a Postgres database on Supabase or Neon
2. Copy the connection string (format: `postgresql://user:password@host:port/database?sslmode=require`)

### Step 2: Update Prisma Schema for Production

The schema is already configured to use SQLite for dev and Postgres for production. Make sure your `DATABASE_URL` environment variable points to Postgres in production.

### Step 3: Deploy to Vercel

1. **Push your code to GitHub/GitLab/Bitbucket:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to https://vercel.com/new
   - Import your Git repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables:**
   In Vercel project settings, add these environment variables:
   - `DATABASE_URL`: Your Postgres connection string
   - `ALLOWED_EMAIL_DOMAIN`: `@crejllc.net` (optional, defaults to this)
   - `NODE_ENV`: `production`

4. **Deploy:**
   - Click "Deploy"
   - Vercel will run the build process
   - The app will be live at `your-project.vercel.app`

### Step 4: Run Database Migrations

After first deployment, you need to run migrations:

**Option A: Via Vercel CLI**
```bash
npx vercel env pull .env.local
npx prisma migrate deploy
```

**Option B: Via Vercel Dashboard**
- Go to your project → Settings → Environment Variables
- Add `DATABASE_URL` if not already set
- Redeploy to trigger migrations

### Step 5: Seed the Database

After migrations, seed the database:

```bash
# Set DATABASE_URL in your local .env.local
DATABASE_URL="your-postgres-connection-string"

# Run seed
npm run prisma:seed
```

Or use Vercel CLI:
```bash
npx vercel env pull .env.local
npm run prisma:seed
```

### Step 6: Set Up Custom Domain (Optional)

1. In Vercel project settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Environment Variables

Required:
- `DATABASE_URL`: Postgres connection string

Optional:
- `ALLOWED_EMAIL_DOMAIN`: Email domain for login (default: `@crejllc.net`)
- `NODE_ENV`: `production` (set automatically by Vercel)

## Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] Database seeded with initial data
- [ ] Test login with @crejllc.net email
- [ ] Test role selection
- [ ] Verify trainings display correctly
- [ ] Check that videos embed properly
- [ ] Test admin functions

## Troubleshooting

**Build fails with Prisma errors:**
- Make sure `DATABASE_URL` is set in Vercel environment variables
- Check that Postgres database is accessible
- Verify Prisma schema is correct

**Database connection errors:**
- Verify `DATABASE_URL` format is correct
- Check database firewall settings
- Ensure SSL is enabled (add `?sslmode=require` to connection string)

**Magic links not working:**
- In production, you need to implement email sending
- For now, magic links work in dev mode only
- Consider using Resend, SendGrid, or similar service

## Next Steps

1. Set up email service for magic links (Resend recommended)
2. Configure custom domain
3. Set up monitoring and error tracking
4. Configure backups for Postgres database
