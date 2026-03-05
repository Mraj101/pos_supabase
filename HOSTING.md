# 🏪 Boutique POS — Setup & Hosting Guide

## Stack Overview
| Layer    | Technology             | Cost     |
|----------|------------------------|----------|
| Database | Supabase (PostgreSQL)  | Free     |
| Auth     | Supabase Auth          | Free     |
| Frontend | React + Vite           | —        |
| Hosting  | Vercel                 | Free     |

---

## Step 1 — Set Up Supabase

1. Go to https://supabase.com and create an account
2. Click **New Project**, choose a name like `boutique-pos`
3. Set a strong database password (save it!)
4. Choose the **Singapore** or nearest region
5. Wait ~2 minutes for the project to spin up

### Run the SQL files (in this exact order):
Go to **SQL Editor** in your Supabase dashboard and run each file:

1. `supabase/schema.sql` — Creates all tables + views + indexes
2. `supabase/functions.sql` — Creates RPC functions (create_sale, record_payment, search_variants)
3. `supabase/rls.sql` — Sets up Row Level Security

### Get your credentials:
Go to **Project Settings → API**:
- Copy **Project URL** → this is your `VITE_SUPABASE_URL`
- Copy **anon public key** → this is your `VITE_SUPABASE_ANON_KEY`

---

## Step 2 — Create Admin User

1. In Supabase Dashboard, go to **Authentication → Users**
2. Click **Add User → Create New User**
3. Enter your email + password
4. Click the user → edit **User Metadata** → add:
   ```json
   { "role": "admin", "name": "Shop Owner" }
   ```

---

## Step 3 — Local Development

```bash
# 1. Extract the project zip
cd boutique-pos

# 2. Copy the environment file
cp .env.example .env

# 3. Open .env and fill in your Supabase credentials
#    VITE_SUPABASE_URL=https://xxxxx.supabase.co
#    VITE_SUPABASE_ANON_KEY=eyJxxxxxx

# 4. Install dependencies
npm install

# 5. Start the development server
npm run dev

# 6. Open http://localhost:5173 in your browser
```

---

## Step 4 — Deploy to Vercel (Free Hosting)

### Option A: Deploy via Vercel CLI (quickest)

```bash
# Install Vercel CLI
npm install -g vercel

# From inside the project folder
vercel

# Follow the prompts:
# - Link to existing project? No
# - Project name: boutique-pos
# - Root directory: ./
# - Framework: Vite

# Set environment variables when prompted, or do it in dashboard
```

### Option B: Deploy via GitHub (recommended for ongoing updates)

1. Push your project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/boutique-pos.git
   git push -u origin main
   ```

2. Go to https://vercel.com and sign in with GitHub
3. Click **Add New Project → Import Git Repository**
4. Select your `boutique-pos` repo
5. Set **Framework Preset** to `Vite`
6. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
7. Click **Deploy**

Your app will be live at `https://boutique-pos-xxxxx.vercel.app` 🎉

Every time you push to GitHub, Vercel auto-deploys.

---

## Step 5 — Custom Domain (Optional, Free on Vercel)

1. In Vercel dashboard → your project → **Settings → Domains**
2. Add your domain (e.g., `pos.yourboutique.com`)
3. Follow DNS instructions to point your domain to Vercel

---

## Free Tier Limits (what you get for free)

### Supabase Free Tier:
| Feature           | Limit                    |
|-------------------|--------------------------|
| Database size     | 500 MB                   |
| Auth users        | Unlimited                |
| API requests      | 2M / month               |
| Bandwidth         | 5 GB / month             |
| Backups           | Daily (7-day retention)  |

> For a single boutique, 500 MB is easily 5+ years of data.

### Vercel Free Tier:
| Feature           | Limit                    |
|-------------------|--------------------------|
| Deployments       | Unlimited                |
| Bandwidth         | 100 GB / month           |
| Custom domains    | Yes                      |
| HTTPS             | Auto (Let's Encrypt)     |

---

## Upgrading When You Grow

| When to upgrade       | Recommended plan          | Cost        |
|-----------------------|---------------------------|-------------|
| > 500 MB database     | Supabase Pro              | $25/month   |
| Multiple branches     | Supabase Pro              | $25/month   |
| Need 99.9% SLA        | Vercel Pro                | $20/month   |

For a single boutique, you likely **never need to upgrade**.

---

## Backup Strategy

### Automatic:
- Supabase free tier includes daily backups (7-day history)
- Go to **Database → Backups** to restore

### Manual export:
```bash
# Export all data as CSV from Supabase Dashboard
# Table Editor → Select table → Export → CSV

# Or use pg_dump:
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres" \
  --no-acl --no-owner -f backup.sql
```

---

## Adding Staff Users

1. Supabase Dashboard → **Authentication → Users → Add User**
2. Give them email + password
3. Set metadata: `{ "role": "staff", "name": "Staff Name" }`
4. Share the URL and credentials

---

## Troubleshooting

**"Missing environment variables" error**
→ Make sure `.env` exists (not just `.env.example`) with real values

**"Invalid API key" error**
→ Double-check you copied the `anon public` key, not the `service_role` key

**"RPC function not found"**
→ Make sure you ran `functions.sql` in the Supabase SQL Editor

**RLS errors / "new row violates row-level security"**
→ Make sure you ran `rls.sql`, and you're logged in when making requests

---

## Project Structure

```
boutique-pos/
├── src/
│   ├── pages/
│   │   ├── Login.jsx          ← Authentication
│   │   ├── Dashboard.jsx      ← Overview + stats
│   │   ├── NewSale.jsx        ← POS screen (main feature)
│   │   ├── Payments.jsx       ← Record installments
│   │   ├── Customers.jsx      ← Customer management
│   │   ├── CustomerLedger.jsx ← Full DEBIT/CREDIT history
│   │   ├── Products.jsx       ← Products + variants
│   │   ├── Categories.jsx     ← Category tree
│   │   └── Reports.jsx        ← Sales, dues, inventory
│   ├── components/
│   │   ├── Layout.jsx         ← App shell with sidebar
│   │   ├── Sidebar.jsx        ← Navigation
│   │   └── ProtectedRoute.jsx ← Auth guard
│   ├── context/
│   │   └── AuthContext.jsx    ← Global auth state
│   └── supabaseClient.js      ← DB connection
└── supabase/
    ├── schema.sql             ← Tables, views, indexes
    ├── functions.sql          ← RPC functions (ATOMIC transactions)
    └── rls.sql                ← Row Level Security policies
```
