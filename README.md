# ⚫ 99subcircle

> **Minimalist Shared Subscription Circles & Monthly Rotation Platform**

`99subcircle` is a web application designed to manage and automate shared family & friend subscriptions (YouTube Premium, Netflix, Spotify, Amazon Prime, ChatGPT Plus, Apple One, and custom plans).

Every month on your chosen billing day, **99subcircle** automatically calculates whose turn it is to pay, sends a minimal, high-contrast reminder email to that member and the circle host, and advances the rotation to the next member for the following month.

---

## ✨ Features

- **🖤 Minimal Black & White UI**: Refined, distraction-free design with monospaced accents, subtle hairline borders, and a human-crafted logo mark.
- **🔄 Autonomous Rotation System**: Automatically tracks active circle members, determines who is responsible for the current month, and queues up the next member in line.
- **📧 Dual Email Notification**: Sends responsive HTML email templates to both the paying member (with exact due amount, billing cycle, and UPI/payment details) and the circle host.
- **🎛️ Manual Controls**:
  - **Remind**: Instantly dispatches reminder notices and advances rotation.
  - **Paid**: Marks the current month paid offline and advances without sending an email.
  - **Skip**: Skips a member's turn and passes responsibility to the next member.
  - **Preview**: Live in-app iframe preview of the exact HTML email template.
- **☁️ Cloud Database Ready**: Pre-configured for PostgreSQL (Aiven Cloud, Neon, Supabase, or Render Postgres) with a local JSON fallback.
- **⚡ 100% Internal Automation**: Zero external webhook secrets or parameters needed—simply ping `/api/health` to keep Render awake or trigger the daily check.
- **📋 Audit Logs**: Complete dispatch history and status tracking.

---

## 🚀 Quickstart (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/sunkusaarthak/subscription-mailer.git
cd subscription-mailer
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
npm --prefix client install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (you can copy `.env.example`):
```env
PORT=5000
NODE_ENV=development

# 1. Email Configuration (Gmail App Password)
GMAIL_USER=yourname@gmail.com
GMAIL_APP_PASSWORD=your16characterpassword
EMAIL_FROM_NAME="99subcircle"
EMAIL_FROM_ADDRESS=yourname@gmail.com

# 2. Database (PostgreSQL)
DATABASE_URL=postgres://user:password@host:port/dbname?sslmode=require

# 3. Schedule Settings
CRON_SCHEDULE="0 9 * * *"
CRON_SECRET=subscription-secret-token-123
```

*(Note: If you leave `GMAIL_USER` and `GMAIL_APP_PASSWORD` blank, the app runs in **Mock Mode**, simulating email delivery in your terminal so you can test immediately without credentials).*

### 4. Initialize Database Tables
Run the database setup script to verify connection and create required tables (`subscription_groups`, `reminder_logs`):
```bash
npm run db:setup
```

### 5. Build & Start the App
```bash
# Build the React frontend
npm run build

# Start the unified server
npm start
```
Open **`http://localhost:5000`** in your browser.

---

## 📧 Free Email Setup (Gmail SMTP)

The recommended free method is using **Gmail SMTP with a Google App Password** (500 free emails/day, zero domain verification required, high inbox deliverability).

### How to generate a 16-character App Password (2 minutes):
1. Go to your [Google Account Security Settings](https://myaccount.google.com/security) and ensure **2-Step Verification** is turned **ON**.
2. Open [Google App Passwords](https://myaccount.google.com/apppasswords).
3. Under **App Name**, type `99subcircle` and click **Create**.
4. Copy the generated **16-character password** (e.g. `abcd efgh ijkl mnop`).
5. Set `GMAIL_USER` and `GMAIL_APP_PASSWORD` in your `.env` file.

---

## ☁️ Deploying on Render (Free Tier)

Render allows you to host both the backend and frontend together on a **single free Web Service**.

### Option A: 1-Click Blueprint Deploy (`render.yaml`)
1. Push your repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com/), click **New +** -> **Blueprint**.
3. Select your repository. Render will automatically read `render.yaml` and configure the service.

### Option B: Manual Web Service Setup
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `99subcircle`
   - **Environment**: `Node`
   - **Branch**: `master` (or `main`)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `GMAIL_USER`: `your-email@gmail.com`
   - `GMAIL_APP_PASSWORD`: `your-16-char-app-password`
   - `DATABASE_URL`: Your PostgreSQL connection string (from Aiven, Neon, or Supabase).
   - `CRON_SECRET`: `your-random-secret-token`
5. Click **Deploy Web Service**.

---

## ⏰ Daily Automation & Keep-Alive

Render's free tier spins down after 15 minutes of inactivity. When asleep, internal timers do not run.

You can set **any simple ping** (cron-job.org, UptimeRobot, or BetterUptime) to hit your clean healthcheck:

- **Target URL**: `https://your-app-name.onrender.com/api/health`
- **Schedule**: Once a day (or every 10–14 minutes to keep Render awake 24/7).
- **Zero External Secrets or Triggers**: No secret tokens or trigger parameters needed.

### 🧠 How It Works 100% Internally:
1. When the healthcheck is pinged, Render wakes up the app.
2. The healthcheck endpoint immediately returns `200 OK` (`status: "ok"`).
3. **Internally in the background**, the application automatically inspects which circles are due today, checks if they've already been billed this month, dispatches the emails, and advances the rotation.
4. If you ping every 10–14 minutes, Render **never goes to sleep**, and the internal `node-cron` schedule (`0 9 * * *`) also fires continuously.

---

## 📁 Project Architecture

```
├── client/                     # Frontend (React 18 + Vite + Tailwind CSS + Lucide)
│   ├── src/
│   │   ├── components/         # GroupCard, GroupModal, Navbar, EmailPreviewModal, LogsModal, Logo
│   │   ├── api.js              # REST API Client
│   │   ├── App.jsx             # Main Dashboard & Minimal Metrics
│   │   ├── index.css           # Minimalist Monochrome Theme
│   │   └── main.jsx
│   ├── index.html              # App entry & custom SVG favicon
│   └── vite.config.js          # Dev proxy to Express backend
├── server/                     # Backend (Node.js + Express)
│   ├── index.js                # Express app entry, static asset serving & healthcheck
│   ├── config.js               # Centralized configuration
│   ├── db/
│   │   ├── index.js            # Unified DB interface (Postgres or local JSON)
│   │   ├── postgres.js         # PostgreSQL client (Aiven, Neon, Supabase)
│   │   ├── jsonStore.js        # File-based fallback for local dev
│   │   └── schema.sql          # DB schema definition
│   ├── routes/
│   │   ├── groups.js           # CRUD circles, advance, skip, manual reminder, email preview
│   │   └── cron.js             # Webhook trigger fallback
│   └── services/
│       ├── emailService.js     # Nodemailer transport (Gmail SMTP / Mock mode)
│       ├── emailTemplates.js   # Responsive editorial B&W HTML templates
│       └── scheduler.js        # Daily due-date checker & internal auto-dispatch hook
├── scripts/
│   └── setup-db.js             # Automated database connection & table initialization
├── render.yaml                 # Render Blueprint configuration
├── .env.example                # Sample environment variables
└── package.json                # Project dependencies and npm scripts
```

---

## 🛠️ Available Scripts

| Command | Description |
| :--- | :--- |
| `npm start` | Starts the production Express server on port 5000 (serves API & React UI) |
| `npm run build` | Compiles the React frontend with Vite into `client/dist` |
| `npm run client` | Starts Vite local development server on port 5173 with API proxy |
| `npm run db:setup` | Tests PostgreSQL connection and verifies/creates database tables |

---

## 📄 License

MIT License. Built for seamless subscription pool management.
