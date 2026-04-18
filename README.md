# Vybrex CRM

A full-stack business management system for **Vybrex Solutions** — internal use only (2 users).

## Default Login Credentials

| User | Email | Password | Role |
|------|-------|----------|------|
| Abdul | abdul@vybrex.com | Vybrex@Abdul123 | Owner |
| Amina | amina@vybrex.com | Vybrex@Amina123 | Partner |

> Change passwords after first login via **Settings → Change Password**

---

## Modules

| Module | Features |
|--------|----------|
| **Dashboard** | Revenue cards, 6-month bar chart, alerts panel, activity feed |
| **Clients** | Add/edit/delete clients, payment tracking, overdue alerts, progress bar |
| **Employees** | Team management, salary history, PDF payslip generator |
| **Payments & Expenses** | Full transaction ledger, P&L, pie chart, CSV export |
| **Reports** | PDF reports: monthly revenue, client payments, employee salary, outstanding |
| **Settings** | Company info, change password, full JSON data export |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (24h expiry, 2 hardcoded users) |
| Charts | Recharts |
| PDF | jsPDF + jsPDF-AutoTable |

---

## Deploy to Railway (Recommended — Free)

**Step 1 — Push to GitHub**
```bash
git remote add origin https://github.com/YOUR_USERNAME/vybrex-crm.git
git push -u origin main
```

**Step 2 — Create Railway Project**
1. Go to [railway.app](https://railway.app) → **New Project**
2. Select **Deploy from GitHub Repo** → connect `vybrex-crm`

**Step 3 — Add PostgreSQL**
- In your Railway project → **+ New** → **Database** → **PostgreSQL**
- `DATABASE_URL` is auto-injected into your service

**Step 4 — Set Environment Variables**

In Railway dashboard → your web service → **Variables**:
```
JWT_SECRET=replace_with_any_long_random_string_32chars
NODE_ENV=production
PORT=3000
```

**Step 5 — Run Database Migration + Seed**

After the first successful deploy, open the Railway shell:
```bash
cd server && npx prisma migrate deploy && node prisma/seed.js
```

**Step 6 — Get Your Live URL**
- Railway service → **Settings** → **Generate Domain**
- Share the URL with Amina and both log in with the default credentials

---

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### Setup

```bash
# 1. Install server dependencies
cd server && npm install

# 2. Create server env file
cp ../.env.example .env
# Edit .env — set DATABASE_URL to your local Postgres URL and choose a JWT_SECRET

# 3. Run database migration
npx prisma migrate dev --name init

# 4. Seed default users
node prisma/seed.js

# 5. Start server (port 3000)
npm run dev

# 6. In a new terminal — install and start frontend
cd ../client && npm install && npm run dev
# Frontend: http://localhost:5173 (proxies API to :3000)
```

---

## Folder Structure

```
vybrex-crm/
├── client/                  ← React 18 + Vite frontend
│   ├── public/
│   └── src/
│       ├── api/             ← Axios API calls per module
│       ├── components/      ← Sidebar, Navbar, Modal, etc.
│       ├── hooks/           ← useAuth (JWT context)
│       ├── pages/           ← Dashboard, Clients, Employees...
│       └── utils/           ← formatCurrency, pdfGenerator
├── server/                  ← Node.js + Express backend
│   ├── controllers/         ← Business logic per module
│   ├── middleware/          ← JWT auth, error handler
│   ├── prisma/
│   │   ├── schema.prisma    ← Database schema (7 models)
│   │   └── seed.js          ← Seeds 2 default users
│   ├── routes/              ← Express route definitions
│   └── index.js             ← App entry point
├── .env.example             ← Environment variable template
├── Dockerfile               ← Docker build (optional)
├── railway.toml             ← Railway deployment config
└── README.md
```

---

## Other Hosting Options

| Option | Cost | Effort |
|--------|------|--------|
| **Railway.app** | Free tier (recommended) | 10 min |
| **Render.com** | Free tier | 15 min |
| **Fly.io** | Free tier | 20 min |
| **DigitalOcean VPS** | ~$6/mo | 45 min |
| **Local LAN** | Free | 5 min |

---

## API Endpoints

```
POST   /api/auth/login
GET    /api/auth/profile
PUT    /api/auth/change-password

GET    /api/dashboard/summary
GET    /api/dashboard/revenue-chart
GET    /api/dashboard/alerts
GET    /api/dashboard/activity

GET    /api/clients
POST   /api/clients
GET    /api/clients/:id
PUT    /api/clients/:id
DELETE /api/clients/:id
POST   /api/clients/:id/payments
DELETE /api/clients/:id/payments/:paymentId

GET    /api/employees
POST   /api/employees
GET    /api/employees/:id
PUT    /api/employees/:id
DELETE /api/employees/:id
POST   /api/employees/:id/salary-payments
DELETE /api/employees/:id/salary-payments/:paymentId

GET    /api/payments/ledger
GET    /api/payments/summary
GET    /api/payments/expenses
POST   /api/payments/expenses
PUT    /api/payments/expenses/:id
DELETE /api/payments/expenses/:id

GET    /api/settings
PUT    /api/settings
GET    /api/settings/export

GET    /api/health
```
