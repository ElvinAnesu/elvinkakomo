# Product Partner Portfolio – Frontend Scope

## Overview

This project is a **product-focused portfolio and collaboration platform** for a solo product engineer.

The goal is to position the owner as:
- Someone who helps **startups ship products**
- Someone who helps **SMEs build internal tools**
- A long-term **product partner**, not “just a developer”

This is a **frontend-only implementation** using:
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Hard-coded / mock data only

All backend logic (Supabase, Stripe, auth) will be added later.

---

## Core Positioning

**Headline**
> I help startups and SMEs ship real products.

**Subheadline**
> From idea to launch — web apps, mobile apps, and internal tools built fast, clean, and supported long-term.

Tone:
- Confident
- Calm
- Outcome-driven
- Founder-friendly

---

## Design System

### Color Palette

- Primary: `#6B21A8` (Purple-700)
- Secondary: `#9333EA` (Purple-600)
- Background: `#FFFFFF`
- Surface: `#FAFAFA`
- Text Dark: `#0F172A`
- Text Muted: `#64748B`
- Border: `#E5E7EB`

### Style Guidelines

- Minimal, clean UI
- No flashy animations
- Soft shadows
- Rounded-xl components
- Clear spacing
- Product-first design
- Tailwind default fonts

---

## App Structure (Next.js App Router)

```
app/
├── page.tsx                // Home
├── services/page.tsx
├── pricing/page.tsx
├── collaborate/page.tsx
├── dashboard/page.tsx
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── PricingCard.tsx
│   ├── Sidebar.tsx
│   └── ProjectCard.tsx
├── lib/
│   └── mockData.ts
```

---

## Pages

### Home (`/`)

#### Hero Section
- Headline (above)
- Subheadline (above)
- Primary CTA: **Collaborate**
- Secondary CTA: **View Services**

#### Value Proposition (3 Cards)

1. **Idea → MVP**
   - Turn raw ideas into usable products
   - Scope, build, and launch

2. **SME Digital Products**
   - Internal tools, dashboards, systems
   - Replace spreadsheets & WhatsApp workflows

3. **Ongoing Product Support**
   - Continuous improvements
   - Feature development & automation

#### Social Proof
- 3 testimonial cards
- Hard-coded names, roles, and feedback

---

### Services (`/services`)

#### 1. Idea to MVP
- Product scoping
- MVP design & development
- Web or mobile apps
- Deployment support

Outcome:
> You go from idea to a working product users can touch.

---

#### 2. SME Products
- Dashboards
- Booking systems
- Inventory tools
- Customer portals

Outcome:
> Stop running your business on spreadsheets.

---

#### 3. Product Iteration & Growth
- Feature development
- Performance improvements
- UX refinements
- Automation & integrations

Outcome:
> Your product improves every month.

---

### Pricing (`/pricing`)

#### Starter – Product Support
**$400 / month**
- Small feature updates
- Bug fixes
- Basic monitoring
- Priority support

CTA: **Start Collaboration**

---

#### Growth – Product Partner (Highlighted)
**$1,000 / month**
- Ongoing feature development
- Monthly planning & reviews
- Product improvements
- Automation & integrations

CTA: **Start Collaboration**

---

#### Scale – Dedicated Product Engineer
**$2,500 / month**
- Acts as in-house engineer
- Weekly check-ins
- Fast turnaround
- Product & technical decisions

CTA: **Start Collaboration**

Footer note:
> All plans include access to the collaboration portal.

---

### Collaborate (`/collaborate`)

Mock authentication UI only.

- Toggle: Login / Create Account
- Email field
- Password field
- Button: **Continue**

On submit:
- Redirect to `/dashboard`
- No real authentication logic

---

### Dashboard (`/dashboard`) – Client Portal (Mock)

#### Sidebar Navigation
- Projects
- Billing
- Feedback
- Settings

---

#### Projects Section
Each project card displays:
- Project name
- Status badge:
  - Planning
  - Building
  - Review
  - Live
- Progress bar
- Last updated date

---

#### Feedback Section
- Textarea
- Button: **Submit Feedback**
- Submitted feedback appears instantly (local state)

---

#### Billing Section
- Current plan
- Monthly amount
- Button: **Pay Now** (UI only, no logic)

---

#### Testimonials
- Button: **Leave a Testimonial**
- Form or modal
- Submitted testimonials appear immediately

---

## State Management

- React `useState`
- Local in-memory mock auth state
- No external state libraries
- No API calls

---

## Data Handling

- All data stored in:
  - `lib/mockData.ts`
- Arrays and objects only
- Easy replacement with Supabase later

---

## Code Quality Rules

- Strict TypeScript (no `any`)
- Reusable components
- Mobile responsive
- Clean folder structure
- Tailwind utility classes only
- Production-ready frontend

---

## Final Goal

After implementation, the project should:
- Look like a serious product studio
- Clearly communicate product partnership
- Support recurring pricing perception
- Include a convincing collaboration portal
- Be ready for Supabase + Stripe integration
