# CREJ Staff Portal

Premium internal staff portal for CREJ, LLC. This app provides training, SOPs, compliance checklists, and content management for staff members.

## Features

- **Authentication**: Magic link login restricted to @crejllc.net emails
- **Role-Based Access Control**: Admin, DSPD Support Coordinator, DSPD Manager, HRSS Staff, EPAS Staff, DSP, Trainer
- **Content Library**: Browse and search markdown-based content organized by program and category
- **Training System**: Complete trainings and track completion
- **Checklists**: Workflow checklists with instance tracking (NO PHI storage)
- **Admin Console**: Manage users, content, trainings, and checklists

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** + shadcn/ui components
- **Prisma** + SQLite (dev) / PostgreSQL (prod)
- **Magic Link Authentication** (email-based)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL="file:./dev.db"

# Auth
AUTH_SECRET="change-this-to-a-random-secret-in-production"
MAGIC_LINK_SECRET="change-this-to-a-random-secret-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Email (for magic links - configure in production)
SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASSWORD=""
SMTP_FROM="noreply@crejllc.net"

# App
NODE_ENV="development"
ALLOWED_EMAIL_DOMAIN="@crejllc.net"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (imports markdown files from /content)
npm run prisma:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Content Management

### Adding Content from Markdown Files

1. Place markdown files in `/content/DSPD/`, `/content/HRSS/`, or `/content/EPAS/`
2. Run sync script:
   ```bash
   npm run content:sync
   ```
3. Files are automatically categorized based on filename patterns:
   - `*_Onboarding*` → Onboarding
   - `*_SOP*` or `*_Procedures*` → SOPs
   - `*_Training*` → Trainings
   - `*_Checklist*` or `*_Action_Items*` → Compliance Checklists
   - `*_Index*` or `*_Master*` → Reference

### Creating Content in Admin Console

1. Log in as Admin or Trainer
2. Go to Admin → Content Management
3. Create new content items (stored in database)

## Database

### Development (SQLite)

Uses SQLite by default. Database file: `prisma/dev.db`

### Production (PostgreSQL)

Update `.env.local`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/crej_portal?schema=public"
```

Then run migrations:

```bash
npm run prisma:migrate
```

## Security & PHI Protection

- **NO CLIENT INFORMATION**: System explicitly blocks and warns against PHI entry
- **Email Domain Restriction**: Only @crejllc.net emails can create accounts
- **Role-Based Access**: Users only see content for their assigned programs
- **Audit Logging**: All actions are logged
- **Session Management**: Secure session handling

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:seed` - Seed database with content
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run content:sync` - Sync markdown files to database

## Project Structure

```
crej-portal/
├── app/                    # Next.js app router pages
│   ├── admin/             # Admin console pages
│   ├── api/               # API routes
│   ├── checklists/        # Checklist pages
│   ├── library/           # Content library pages
│   ├── trainings/         # Training pages
│   └── ...
├── components/            # React components
│   ├── layouts/          # Layout components
│   └── ui/               # UI components (shadcn)
├── content/              # Markdown content files
│   ├── DSPD/
│   ├── HRSS/
│   └── EPAS/
├── lib/                  # Utility functions
│   ├── auth.ts           # Authentication
│   ├── content-ingestion.ts # Markdown parsing
│   ├── db.ts             # Prisma client
│   └── ...
├── prisma/               # Prisma schema and migrations
└── scripts/              # Utility scripts
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Environment Variables for Production

- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - Random secret for auth
- `MAGIC_LINK_SECRET` - Random secret for magic links
- `NEXTAUTH_URL` - Your production URL
- `SMTP_*` - Email configuration for magic links
- `ALLOWED_EMAIL_DOMAIN` - `@crejllc.net`

## Support

For questions or issues, contact the development team.

---

**Important**: This system does NOT store client PHI. All checklist instances use generic labels only (e.g., "Case #1"). Never enter client names, IDs, or protected health information.
