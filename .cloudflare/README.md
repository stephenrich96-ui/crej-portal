# Cloudflare Pages Configuration

This directory contains Cloudflare-specific configuration files.

## Quick Deploy Steps

1. **Install Wrangler:**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **Create D1 Database (if using SQLite):**
   ```bash
   wrangler d1 create crej-portal-db
   ```
   Save the database_id that's returned.

4. **Update wrangler.toml:**
   - Add your database_id to the D1 binding

5. **Deploy via Dashboard:**
   - Go to Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git
   - Select your repository
   - Build command: `npm run pages:build`
   - Output directory: `.vercel/output/static`
   - Add environment variables (DATABASE_URL, etc.)

6. **Or Deploy via CLI:**
   ```bash
   npm run pages:deploy
   ```

See `CLOUDFLARE_DEPLOY.md` for detailed instructions.
