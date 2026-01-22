# Deploying CREJ Portal to Cloudflare Pages

## Prerequisites

1. **Cloudflare Account** - Sign up at https://dash.cloudflare.com
2. **Wrangler CLI** - Cloudflare's command-line tool
3. **GitHub Repository** - Your code pushed to GitHub

## Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
# Or use npx: npx wrangler
```

## Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open your browser to authenticate with Cloudflare.

## Step 3: Set Up Database

**Option A: Cloudflare D1 (SQLite) - Recommended for this app**

```bash
# Create a D1 database
wrangler d1 create crej-portal-db

# This will output a database_id - save this!
```

**Option B: External Postgres (Supabase/Neon)**

Use an external Postgres database and set the connection string as an environment variable.

## Step 4: Update Prisma Schema for Cloudflare D1

If using Cloudflare D1 (SQLite), your schema is already correct. If using Postgres, update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Step 5: Configure Wrangler

Update `wrangler.toml` with your database binding:

```toml
name = "crej-portal"
compatibility_date = "2024-01-01"
pages_build_output_dir = ".next"

[[d1_databases]]
binding = "DB"
database_name = "crej-portal-db"
database_id = "YOUR_DATABASE_ID_HERE"

[env.production]
name = "crej-portal"
```

## Step 6: Update Build Script

The build process needs to be compatible with Cloudflare Pages. Update `package.json`:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "pages:build": "npm run build && npx @cloudflare/next-on-pages",
    "pages:deploy": "npm run pages:build && wrangler pages deploy .vercel/output/static"
  }
}
```

## Step 7: Deploy via Cloudflare Dashboard

1. **Go to Cloudflare Dashboard** → **Workers & Pages** → **Create Application** → **Pages** → **Connect to Git**

2. **Select your GitHub repository** (crej-portal)

3. **Configure Build Settings:**
   - **Framework preset**: Next.js
   - **Build command**: `npm run pages:build`
   - **Build output directory**: `.vercel/output/static`
   - **Root directory**: `/` (or leave empty)

4. **Set Environment Variables:**
   - `DATABASE_URL`: Your database connection string
     - For D1: `file:./dev.db` (local) or use D1 binding
     - For Postgres: `postgresql://user:pass@host:port/db?sslmode=require`
   - `ALLOWED_EMAIL_DOMAIN`: `@crejllc.net`
   - `NODE_ENV`: `production`

5. **Add D1 Database Binding** (if using D1):
   - Go to **Settings** → **Functions** → **D1 Database Bindings**
   - Add binding: `DB` → Select your `crej-portal-db`

6. **Click "Save and Deploy"**

## Step 8: Run Migrations

After first deployment, run migrations:

```bash
# For D1
wrangler d1 execute crej-portal-db --file=./prisma/migrations/migration_name.sql

# Or use Prisma with D1
DATABASE_URL="file:./dev.db" npx prisma migrate deploy
```

## Step 9: Seed Database

```bash
# Pull environment variables
wrangler pages secret get DATABASE_URL

# Run seed
npm run prisma:seed
```

## Alternative: Deploy via Wrangler CLI

```bash
# Build
npm run pages:build

# Deploy
wrangler pages deploy .vercel/output/static --project-name=crej-portal
```

## Important Notes

⚠️ **Next.js on Cloudflare Pages:**
- Cloudflare Pages uses `@cloudflare/next-on-pages` to adapt Next.js
- Some Next.js features may have limitations
- API routes work via Cloudflare Workers

⚠️ **Database:**
- **D1 (SQLite)**: Best for Cloudflare, but has limitations
- **Postgres**: Use external service (Supabase, Neon, Railway)
- Connection strings must be set as environment variables

⚠️ **Prisma:**
- Prisma works with D1, but migrations need to be run manually
- For Postgres, standard Prisma setup works

⚠️ **Magic Links:**
- Email sending needs to be configured
- Consider using Cloudflare Email Workers or external service (Resend)

## Troubleshooting

**Build fails:**
- Check that `@cloudflare/next-on-pages` is installed
- Verify build command is correct
- Check Cloudflare Pages build logs

**Database connection errors:**
- Verify DATABASE_URL is set correctly
- For D1, check database binding is configured
- For Postgres, verify connection string includes SSL

**API routes not working:**
- Ensure `@cloudflare/next-on-pages` is properly configured
- Check Cloudflare Pages Functions settings

## Next Steps

1. Set up custom domain in Cloudflare Pages
2. Configure email service for magic links
3. Set up monitoring and analytics
4. Configure database backups

## Resources

- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
- Next.js on Cloudflare: https://developers.cloudflare.com/pages/framework-guides/nextjs/
- Cloudflare D1: https://developers.cloudflare.com/d1/
- Wrangler CLI: https://developers.cloudflare.com/workers/wrangler/
