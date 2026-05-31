# 🚀 Deployment Guide — SMS Transactional Platform

This guide deploys the full stack (backend API + React dashboard + PostgreSQL + Redis)
to **Railway** — free tier, takes ~5 minutes, gives you a live public URL.

---

## Option A — Deploy via Railway Dashboard (Recommended)

### Step 1: Create a Railway account
Go to https://railway.app → Sign up with GitHub (free).

### Step 2: Create a new project
1. Click **New Project** → **Deploy from GitHub repo**
2. Authorize Railway to access your GitHub
3. Select: `danielgift865-droid/twilio-sms-transactional`
4. Railway auto-detects the Dockerfile ✅

### Step 3: Add PostgreSQL
1. In your Railway project → **+ New** → **Database** → **Add PostgreSQL**
2. Railway auto-generates `DATABASE_URL` — it will appear as a variable you can reference

### Step 4: Add Redis
1. **+ New** → **Database** → **Add Redis**
2. Railway auto-generates `REDIS_URL`

### Step 5: Set environment variables
In your app service → **Variables** tab, add:

```
NODE_ENV=production
API_KEY=<generate a strong random string, e.g. openssl rand -hex 32>
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
TWILIO_ACCOUNT_SID=<from Twilio Console>
TWILIO_AUTH_TOKEN=<from Twilio Console>
TWILIO_PHONE_NUMBER=<your Twilio number in E.164>
```

Leave `TWILIO_WEBHOOK_URL` and `TWILIO_STATUS_CALLBACK` blank for now.

### Step 6: Deploy
Railway will build and deploy automatically. Watch the logs.
First deploy takes ~3–5 minutes (Docker build).

### Step 7: Get your public URL
Settings → **Domains** → **Generate Domain**
You'll get something like: `https://twilio-sms-transactional-production.up.railway.app`

### Step 8: Update Twilio webhook URLs
Add these two final env vars (replace with your actual Railway URL):
```
TWILIO_WEBHOOK_URL=https://your-app.up.railway.app/webhooks/twilio/inbound
TWILIO_STATUS_CALLBACK=https://your-app.up.railway.app/webhooks/twilio/status
```

Then in **Twilio Console**:
1. Messaging → Phone Numbers → Your Number → Messaging Configuration
2. "A Message Comes In": `https://your-app.up.railway.app/webhooks/twilio/inbound`
3. "Status Callback": `https://your-app.up.railway.app/webhooks/twilio/status`

### Step 9: Open the dashboard
Visit your Railway URL in a browser — you'll see the SMS dashboard.
Enter your `API_KEY` in **Settings** → it's saved in your browser.

---

## Option B — Deploy via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Create project and link
railway init

# Add Postgres and Redis
railway add --plugin postgresql
railway add --plugin redis

# Set env vars
railway variables set NODE_ENV=production
railway variables set API_KEY=$(openssl rand -hex 32)
railway variables set TWILIO_ACCOUNT_SID=ACxxx
railway variables set TWILIO_AUTH_TOKEN=xxx
railway variables set TWILIO_PHONE_NUMBER=+1234567890

# Deploy
railway up
```

---

## Verify Deployment

```bash
# Health check
curl https://your-app.up.railway.app/health
# → {"status":"ok","timestamp":"..."}

# Test API (replace YOUR_API_KEY)
curl -H "x-api-key: YOUR_API_KEY" https://your-app.up.railway.app/api/contacts
# → {"contacts":[],"total":0}
```

---

## Local Development

```bash
# Clone the repo
git clone https://github.com/danielgift865-droid/twilio-sms-transactional
cd twilio-sms-transactional

# Copy env
cp .env.example .env
# Edit .env with your values

# Start everything (app + worker + postgres + redis)
docker-compose up -d

# Run migrations
docker-compose exec app npx prisma migrate deploy

# Open dashboard
open http://localhost:3000

# Run tests
npm test
```

---

## Architecture on Railway

```
Railway Project
├── 🟢 App Service       (Docker — Express + React frontend)  → :3000
├── 🟢 Worker Service    (Docker — BullMQ worker)
├── 🐘 PostgreSQL        (managed — auto DATABASE_URL)
└── 🔴 Redis             (managed — auto REDIS_URL)
```

All services communicate via Railway's private network.
Only the App Service is exposed publicly (your domain).

---

## Postman Collection

Import `postman_collection.json` into Postman.
Set `baseUrl` variable to your Railway URL and `apiKey` to your API_KEY.

