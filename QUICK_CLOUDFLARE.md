# Quick Deploy to Cloudflare Pages

## Step 1: Push to GitHub

```bash
git push origin main
```

## Step 2: Deploy via Cloudflare Dashboard

1. **Go to https://dash.cloudflare.com** and sign in

2. **Navigate to:** Workers & Pages → **Create Application** → **Pages** → **Connect to Git**

3. **Select your GitHub repository** (crej-portal)

4. **Configure Build Settings:**
   - **Framework preset**: Next.js (or Custom)
   - **Build command**: `npm run pages:build`
   - **Build output directory**: `.vercel/output/static`
   - **Root directory**: `/` (leave empty)

5. **Set Environment Variables:**
   - Go to **Settings** → **Environment Variables**
   - Add:
     - `DATABASE_URL` = Your Postgres connection string (or D1 database)
     - `ALLOWED_EMAIL_DOMAIN` = `@crejllc.net`
     - `NODE_ENV` = `production`

6. **Click "Save and Deploy"**

## Step 3: Set Up Database

**Option A: Cloudflare D1 (SQLite) - Recommended**

1. In Cloudflare Dashboard → **Workers & Pages** → **D1**
2. Click **Create Database**
3. Name it: `crej-portal-db`
4. Copy the database ID

5. **Add D1 Binding:**
   - Go to your Pages project → **Settings** → **Functions** → **D1 Database Bindings**
   - Add binding: `DB` → Select `crej-portal-db`

6. **Update wrangler.toml** with your database_id:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "crej-portal-db"
   database_id = "YOUR_DATABASE_ID_HERE"
   ```

**Option B: External Postgres (Supabase/Neon)**

1. Create Postgres database on Supabase or Neon
2. Copy connection string
3. Add as `DATABASE_URL` environment variable

## Step 4: Run Migrations

After deployment, run migrations:

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login
wrangler login

# For D1: Run migrations
wrangler d1 execute crej-portal-db --file=./prisma/migrations/XXXXX_migration.sql

# For Postgres: Use standard Prisma
DATABASE_URL="your-connection-string" npx prisma migrate deploy
```

## Step 5: Seed Database

```bash
# Pull environment variables
wrangler pages secret get DATABASE_URL

# Or set locally
export DATABASE_URL="your-connection-string"

# Run seed
npm run prisma:seed
```

## Your App is Live!

Visit: `https://your-project.pages.dev`

## Important Notes

⚠️ **Next.js on Cloudflare:**
- Uses `@cloudflare/next-on-pages` adapter
- Some Next.js features may need adjustment
- API routes work via Cloudflare Workers

⚠️ **Database:**
- **D1 (SQLite)**: Best for Cloudflare, free tier available
- **Postgres**: Use external service (Supabase, Neon, Railway)

⚠️ **Magic Links:**
- Email sending needs to be configured
- Consider Cloudflare Email Workers or Resend

## Troubleshooting

**Build fails:**
- Check build logs in Cloudflare Dashboard
- Verify `@cloudflare/next-on-pages` is in package.json
- Ensure build command is correct

**Database errors:**
- Verify DATABASE_URL is set
- For D1, check database binding is configured
- For Postgres, verify connection string includes SSL

See `CLOUDFLARE_DEPLOY.md` for detailed instructions.
