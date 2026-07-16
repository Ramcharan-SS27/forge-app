# Forge Company Setup Guide

This file is for whoever owns Forge at your company (CTO, engineering lead, or CEO).

---

## Step 1: Set your company DNA

Edit `lib/company.config.ts`. This is the single most important file.
Everything your developers see from Forge is shaped by it.

```typescript
export const COMPANY = {
  name: 'Your Company Name',          // Shows everywhere in the UI
  tagline: 'Your upskilling tagline',
  
  mission: `Your company's philosophy on AI upskilling.
  Write 2-3 sentences. This gets injected into EVERY AI response.
  Be specific about what you expect from developers.`,
  
  values: [
    'Your first value',
    'Your second value',
    'Your third value',
  ],
  
  stack: [                             // What you want people to learn
    'Python',
    'TypeScript',
    'Your AI stack here',
  ],
  
  endGoal: 'Forward Deployment Engineer',  // or 'AI Engineer', or whatever
  trackDuration: '90 days',
}
```

**This single file changes:**
- Every daily brief
- Every chat response
- Every goal analysis
- Every project plan
- Every learning curriculum
- The sidebar (shows your company name)

---

## Step 2: Customize the FDE Track

Edit `lib/tracks.ts` to match your company's actual upskilling path.

You can:
- Change milestone titles and descriptions
- Add company-specific tasks ("Set up our internal API sandbox")
- Add internal resources ("Our internal ML platform docs")
- Change the timeline (8 weeks, 12 weeks, etc.)
- Add multiple tracks (Junior Dev → Senior, AI Engineer, Data Engineer)

---

## Step 3: Deploy for your team

### Option A: One shared deployment (recommended for small teams)
1. Deploy to Vercel (see README.md)
2. Share the URL with your team
3. Each person creates their own profile on first visit
4. Their data stays in their browser (localStorage)

### Option B: With team accounts (for real team dashboards)
1. Set up Supabase: `supabase.com` → create project
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```
3. Update `lib/storage.ts` to use Supabase instead of localStorage
4. Now the `/team` page shows real data

### Option C: Internal deployment
Deploy behind your company VPN/SSO for full enterprise setup.

---

## Step 4: The CEO view

Go to `/team` — this is your dashboard.
It shows who's active, who's progressing, and where people are getting stuck.

In production (with Supabase), this updates in real time.

---

## Customization examples

### Make Forge feel like your company

**Aggressive upskilling culture:**
```
mission: "We don't wait. Every engineer here learns AI by doing.
Week 1 you call an API. Week 8 you ship something to production.
There is no middle ground."
```

**Supportive culture:**
```
mission: "We believe every developer has the capacity to become an AI engineer.
We invest in you. Forge is part of that investment.
Take your time — but keep moving."
```

**Product-focused culture:**
```
mission: "We ship AI products. Not prototypes, not demos — products.
Every developer here learns to build things customers actually use.
That's the bar."
```

---

## The 5 places philosophy shows up

1. **Daily brief** — Forge tells developers how their day connects to the company mission
2. **Chat coaching** — Every response frames skill-building through the FDE lens
3. **Goal analysis** — Forge evaluates progress against company track expectations
4. **Project plans** — All plans reference company stack and FDE demo skills
5. **Learning curricula** — All curricula connect to the company's end goal

---

## Questions?

The code is yours. Modify it freely.
The company.config.ts is designed so a non-engineer can edit it.
