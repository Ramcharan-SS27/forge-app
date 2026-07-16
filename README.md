# Forge — AI Developer Companion

Your personalized AI companion for learning, building, and growing as a developer.

**Features:** Daily AI brief · Multi-mode chat (Plan/Learn/Work/Reflect) · Goal tracking with work logs · Project tracker with AI planning · Learning path with AI curriculum · Persistent cross-session memory

---

## 🚀 Deploy in 5 Minutes (Vercel)

### Step 1: Get your Anthropic API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create a free account
3. Navigate to **API Keys** → **Create Key**
4. Copy the key (starts with `sk-ant-api03-...`)

### Step 2: Push to GitHub
```bash
git init
git add .
git commit -m "feat: Forge AI companion"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/forge-ai.git
git push -u origin main
```

### Step 3: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → **Sign in with GitHub**
2. Click **New Project** → Import your `forge-ai` repository
3. In **Environment Variables**, add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your key from Step 1
4. Click **Deploy**

### Step 4: Open your app
Your URL will be `https://forge-ai-xxxx.vercel.app` — complete the onboarding and you're live.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Set your API key
cp .env.example .env.local
# Edit .env.local and add your ANTHROPIC_API_KEY

# Run the dev server
npm run dev

# Open http://localhost:3000
```

---

## 📱 Demo Script (for CEO meeting)

**1. Dashboard** — "This is your personalized daily brief. Forge analyzes your goals, projects, and memory to generate what to focus on each morning."

**2. Chat** — Switch modes (Plan → Learn → Work → Reflect). "Forge adapts its entire personality and approach based on the mode. It also remembers everything from past sessions."

**3. Goals** — Add a goal live. Log some work. Hit "AI Analysis" — "Forge tracks your pace and tells you if you're on track, not just what you did."

**4. Projects** — Add a project. Hit "Generate AI Plan" — "A full dev plan with stack recommendations, milestones, and this week's tasks in seconds."

**5. Learn** — Add a skill. Generate a curriculum — "A personalized 6-week curriculum matched to your learning style and goal."

---

## 🏗️ Architecture

```
forge-app/
├── app/
│   ├── page.tsx           # Dashboard with daily AI brief
│   ├── chat/page.tsx      # Multi-mode AI chat
│   ├── goals/page.tsx     # Goal tracker + work logs
│   ├── projects/page.tsx  # Project tracker + AI planning
│   ├── learn/page.tsx     # Skill tracker + AI curriculum
│   ├── settings/page.tsx  # API key + profile
│   └── api/               # Server-side Anthropic API proxy
├── components/
│   ├── Sidebar.tsx        # Navigation
│   ├── Onboarding.tsx     # First-time setup
│   └── Markdown.tsx       # AI response renderer
└── lib/
    ├── types.ts           # TypeScript interfaces
    ├── storage.ts         # localStorage utilities
    └── prompts.ts         # All AI system prompts
```

**Stack:** Next.js 14 · TypeScript · Tailwind CSS · Anthropic SDK  
**Storage:** localStorage (no database needed for MVP)  
**Deployment:** Vercel (zero-config)

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Your Anthropic API key |

---

Built with ⚡ by Forge
