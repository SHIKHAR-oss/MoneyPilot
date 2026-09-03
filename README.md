# MoneyPilot

> **"AI can suggest. The system checks. The user decides."**

MoneyPilot is a full-stack, AI-powered financial decision intelligence platform designed to help users understand the potential consequences of financial choices before making them. Rather than acting as a simple expense tracker or generic chat interface, MoneyPilot combines deterministic calculation engines, financial scenario simulations, and an AI explanation layer powered by Google Gemini.

---

## 🏛 Decision Intelligence Pipeline

```
User Request
     ↓
Financial Data Aggregation Service (server/src/services/financialDataService.js)
     ↓
Deterministic Calculation Engines (metricsEngine, healthScoreEngine, simulationEngine, riskEngine)
     ↓
Verified Deterministic Results (Cash Flow, Net Worth, 0-100 Health Score, Risks, Deltas)
     ↓
AI Explanation Service (server/src/services/aiExplanationService.js)
     ↓
Google Gemini API (Backend only, sanitized prompt, JSON output mode)
     ↓
Structured Human-Readable Explanation
     ↓
User Decision
```

> **Important Principle**: Gemini does **not** perform or alter authoritative financial calculations. MoneyPilot's deterministic backend engines calculate all financial metrics, health scores, simulation comparisons, and risk detections first. Gemini is utilized strictly to translate and explain those verified results into clear, understandable, and actionable language.

---

## 📂 Project Architecture

```text
MoneyPilot/
├── client/                     # Frontend (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── assets/             # Static assets and icons
│   │   ├── components/         # UI & Layout components
│   │   ├── context/            # React Context providers
│   │   ├── hooks/              # Custom React hooks
│   │   ├── layouts/            # Page shell layouts (Header, Footer, Navigation)
│   │   ├── pages/              # Placeholder pages (Home, Dashboard, Simulator, Analytics, Auth)
│   │   ├── routes/             # Central route manager (React Router)
│   │   ├── services/           # API fetch client (api.js)
│   │   ├── utils/              # Client formatting helpers
│   │   ├── App.jsx             # Main application component
│   │   ├── index.css           # Tailwind CSS directives
│   │   └── main.jsx            # DOM entry point
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                     # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/             # DB & Gemini AI client configuration
│   │   ├── controllers/        # Request controllers (auth, profile, transactions, goals, investments, financial, simulations, ai)
│   │   ├── engines/            # Pure deterministic engines (metricsEngine, healthScoreEngine, simulationEngine, riskEngine)
│   │   ├── middleware/         # Auth (JWT) & Database availability middleware
│   │   ├── models/             # Mongoose database models (User, FinancialProfile, Transaction, Goal, Investment)
│   │   ├── routes/             # REST endpoints (/auth, /profile, /transactions, /goals, /investments, /financial, /simulations, /ai, /health)
│   │   ├── services/           # Data aggregation & Gemini AI explanation service
│   │   ├── utils/              # Math helpers, JWT utility, AI response validator
│   │   ├── app.js              # Express app & middleware setup
│   │   └── server.js           # Server bootstrap & graceful shutdown
│   ├── .env.example
│   └── package.json
│
├── package.json                # Monorepo helper scripts
└── README.md
```

---

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, JavaScript, Tailwind CSS, React Router DOM, Framer Motion, Recharts, Lucide React
- **Backend**: Node.js, Express.js (ES Modules)
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, bcryptjs
- **AI Integration**: Google Gemini API (`@google/generative-ai`) via backend proxy

---

## 🔌 API Endpoints Reference

### Public Endpoints
- `GET /api/health` — Server health, uptime, environment, and DB status.
- `POST /api/auth/register` — Register new user and return JWT token.
- `POST /api/auth/login` — Authenticate credentials and return JWT token.

### Protected Endpoints (Requires `Authorization: Bearer <token>`)
- `GET /api/auth/me` — Retrieve current authenticated user.
- `GET /api/profile` / `PUT /api/profile` — Get or upsert user's financial profile.
- `GET /api/transactions` / `POST /api/transactions` / `PUT /:id` / `DELETE /:id` — Transaction ledger CRUD.
- `GET /api/goals` / `POST /api/goals` / `PUT /:id` / `DELETE /:id` — Financial goals CRUD.
- `GET /api/investments` / `POST /api/investments` / `PUT /:id` / `DELETE /:id` — Investment assets CRUD.
- `GET /api/financial/overview` — Deterministic financial metrics, 0–100 health score, and risk analysis.
- `POST /api/simulations/run` — Deterministic 'what-if' decision simulation (Before vs After comparisons).
- `POST /api/ai/explain-overview` — AI-powered explanation of verified financial metrics & risks.
- `POST /api/ai/explain-simulation` — AI-powered explanation of decision simulation trade-offs.

---

## 🚀 Getting Started

### 1. Installation
```bash
# Install dependencies in both client and server
npm run install:all
```

### 2. Environment Configuration
```bash
# In server directory
cp server/.env.example server/.env

# In client directory
cp client/.env.example client/.env
```

### 3. Running Development Servers
```bash
# Backend Express API (http://localhost:5000)
npm run dev:server

# Frontend React App (http://localhost:5173)
npm run dev:client
```

### 4. Running Automated Verification Tests
```bash
# Run comprehensive financial engine and HTTP endpoint test suite
npm test

# Build frontend production bundle
npm run build:client
```

---

## 🌐 Production Cloud Deployment Guide

MoneyPilot is architected for clean, independent separation of concerns across standard cloud tiers without requiring complex container orchestration.

### Tier 1: Managed Database (MongoDB Atlas)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster (M0).
3. Under **Database Access**, create a database user with username and password.
4. Under **Network Access**, add IP `0.0.0.0/0` (Allow Access from Anywhere) to permit cloud backend connections.
5. In **Clusters** → **Connect** → **Drivers**, copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/moneypilot?retryWrites=true&w=majority
   ```

### Tier 2: Backend API (Render / Railway)
1. Connect your MoneyPilot GitHub repository to [Render](https://render.com) or [Railway](https://railway.app).
2. Create a new **Web Service** with the following settings:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Configure the following **Environment Variables**:
   | Variable | Value / Description |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` (or auto-assigned by host) |
   | `MONGODB_URI` | Your MongoDB Atlas connection URI string |
   | `JWT_SECRET` | Secure random string (minimum 32 characters) |
   | `GEMINI_API_KEY` | Your Google Gemini API key |
   | `GEMINI_MODEL` | `gemini-1.5-flash` |
   | `CLIENT_URL` | Your frontend deployment URL (e.g., `https://moneypilot.vercel.app`) |
4. Deploy the service and note your backend URL (e.g. `https://moneypilot-backend.onrender.com`).

### Tier 3: Frontend Client (Vercel / Netlify)
1. Connect your MoneyPilot GitHub repository to [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Create a new project with the following settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Configure the following **Environment Variable**:
   | Variable | Value / Description |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | Your deployed backend API URL + `/api` (e.g., `https://moneypilot-backend.onrender.com/api`) |
4. Deploy the frontend application.
5. Update `CLIENT_URL` in the backend service environment variables with your newly generated Vercel/Netlify domain if not set previously.

---

## 🔒 Security & Architecture Guarantees

1. **Deterministic Core**: All metrics, 0–100 health scores, and before/after simulation deltas are calculated strictly by deterministic mathematical engines.
2. **AI Safety & Non-Authority**: Google Gemini strictly explains already-computed calculations; it never invents, modifies, or overrides financial metrics.
3. **Data Isolation**: All database operations are user-scoped using authenticated JWT tokens (`userId: req.user._id`).
4. **Secret Protection**: API keys and secrets exist only in environment variables on the backend; never exposed to the client bundle.
5. **Graceful Offline Degradation**: The platform operates deterministically even if MongoDB or Gemini AI are temporarily offline.

---

## 📄 License
MIT
