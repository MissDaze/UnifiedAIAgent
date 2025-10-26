# Design Guidelines: AI Nexus Multi-Model Collaboration Platform

## Design Approach

**Selected System**: Linear + Vercel hybrid aesthetic with Stripe's restraint

**Justification**: AI Nexus demands exceptional information density management with a premium, trustworthy appearance. Linear's typography and spacing principles combine with Vercel's futuristic polish and Stripe's confident simplicity to create an interface that communicates technical sophistication while remaining highly functional.

**Core Principles**:
- Trust through restraint and precision
- Information clarity as visual sophistication
- Premium feel through purposeful spacing and typography
- Cutting-edge aesthetic without gimmicks
- Functional beauty for complex workflows

---

## Color System

**Primary Palette**:
- **Deep Professional Blue**: #0A2540 (primary text, headers, key UI)
- **Trust Blue**: #1E40AF (primary actions, links, active states)
- **Ocean Depth**: #0F172A (backgrounds, containers)

**Neutrals**:
- **Pure White**: #FFFFFF (backgrounds, cards)
- **Soft Gray**: #F8FAFC (subtle backgrounds)
- **Border Gray**: #E2E8F0 (dividers, borders)
- **Text Gray**: #64748B (secondary text)
- **Deep Gray**: #334155 (tertiary elements)

**Accents**:
- **Electric Cyan**: #06B6D4 (success, highlights)
- **Amber**: #F59E0B (warnings, attention)
- **Slate Purple**: #8B5CF6 (premium features, badges)

**Semantic Colors**:
- Success: #10B981
- Error: #EF4444
- Warning: #F59E0B
- Info: #3B82F6

**Application**:
- Light mode default with option for dark mode
- High contrast ratios (4.5:1 minimum for text)
- Subtle gradients only for CTAs and hero backgrounds (blue → purple)

---

## Typography System

**Primary Font**: Inter (Google Fonts, weights: 400, 500, 600, 700)
**Secondary Font**: JetBrains Mono (Google Fonts, weights: 400, 500) for code/model identifiers

**Type Scale**:
- Display: text-7xl, font-weight 700, tracking-tight, Deep Professional Blue
- Hero Headline: text-6xl, font-weight 700, tracking-tight
- Page Title: text-4xl, font-weight 600, Deep Professional Blue
- Section Header: text-3xl, font-weight 600
- Card Title: text-xl, font-weight 600
- Body Large: text-lg, font-weight 400, leading-relaxed
- Body: text-base, font-weight 400, leading-normal
- Small: text-sm, font-weight 400
- Caption: text-xs, font-weight 500, tracking-wide, uppercase, Text Gray

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16, 24

**Common Patterns**:
- Card padding: p-6 to p-8
- Section spacing: py-16 to py-32
- Grid gaps: gap-6 to gap-8
- Vertical rhythm: mb-4, mb-6, mb-8

**Container Strategy**:
- Maximum width: max-w-7xl mx-auto px-6
- Dashboard content: max-w-screen-xl
- Reading content: max-w-4xl
- Sidebar: w-72 fixed

---

## Landing Page Layout

**Hero Section** (min-h-screen with gradient background):
- Full-width image: Futuristic AI collaboration network visualization (interconnected neural nodes, data streams, holographic interface elements)
- Image treatment: Deep blue gradient overlay (from transparent to #0A2540 at 60% opacity) for text contrast
- Content: Centered max-w-5xl
  - Display headline (text-7xl) + subheadline (text-2xl, Text Gray)
  - Dual CTAs: Primary (blurred background backdrop-blur-md bg-Trust Blue/20 border border-white/20) + Secondary outlined
  - Trust indicator below: "Trusted by 5,000+ AI teams worldwide" with company logo strip

**Enterprise Feature Grid** (py-24):
- 3-column grid (grid-cols-1 md:grid-cols-3 gap-8)
- Each feature card:
  - Icon (Electric Cyan glow effect)
  - Title (text-2xl font-semibold)
  - Description (text-lg Text Gray)
  - Micro-stat (e.g., "50+ AI models supported")

**Workflow Visualization** (py-32, Soft Gray background):
- Horizontal stepper showing: Configure Bots → Assemble Team → Submit Brief → Multi-View Analysis → Refine & Export
- Each step: Numbered badge + title + description + connecting animated line
- Screenshot of actual interface at each step

**Social Proof** (py-20):
- 2-column layout
- Left: Large testimonial with avatar, quote, name, title, company
- Right: Grid of 4 smaller testimonials (2x2)

**Pricing/CTA Section** (py-24):
- Centered content with strong headline
- 3-tier pricing cards with feature comparison
- Primary CTA: "Start Free Trial"

**Footer** (py-16, Ocean Depth background, white text):
- 5-column grid: Product, Solutions, Resources, Company, Legal
- Newsletter signup with input + button
- Social links + trust badges
- Copyright with "Powered by OpenRouter" badge

---

## Dashboard Layout

**Structure**: Fixed sidebar (w-72) + top bar (h-16) + main content

**Sidebar**:
- Logo + "AI Nexus" wordmark (p-6)
- Navigation groups with dividers:
  - **Workspace**: Dashboard, Library, Teams
  - **Creation**: New Bot, New Team, History
  - **Settings**: Profile, API Keys, Billing
- User profile card at bottom: Avatar + name + plan badge + dropdown

**Top Bar**:
- Breadcrumbs (left)
- Global search (center, w-96)
- Notifications + quick actions + user menu (right)

**Main Content**:
- Dashboard Overview: 4 stat cards (grid-cols-4 gap-6) showing Bots Created, Teams Active, Outputs Generated, API Calls This Month
- Quick Actions panel (mb-8): "Create Bot" + "Build Team" + "Import Configuration" buttons
- Recent Activity (2-column grid):
  - Left: Active Teams list (cards with avatar stack + team name + last activity)
  - Right: Recent Outputs (cards with brief preview + timestamp + team badge)

---

## Bot Configuration Page

**Split Layout** (60/40):
- **Left Panel**: Configuration form with sections (space-y-8)
  - Bot Profile: Name input, description textarea, avatar upload
  - Model Selection: Dropdown with model cards showing specs (GPT-4, Claude, Gemini, etc.)
  - System Prompt: Large textarea (min-h-48) with JetBrains Mono font
  - Parameters: Sliders for temperature, max tokens, top-p with live value display
  - Capabilities: Multi-select tags (vision, code, analysis, creative writing)
  
- **Right Panel** (sticky): Live preview card showing bot appearance + test conversation interface
  - Preview updates in real-time as user configures

**Bot Library View**:
- Grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6)
- Filterable header with search + model filter + sort dropdown
- Each bot card: Avatar + name + model badge (Slate Purple) + capability tags + action menu

---

## Team Builder Page

**Three-Section Layout**:
- **Available Bots Sidebar** (w-80, left): Searchable list with bot cards (compact view)
- **Team Canvas** (center): Drag-drop zone or multi-select interface showing selected bots as cards with role assignments
- **Configuration Panel** (w-96, right): Team name, description, collaboration mode (sequential/parallel/debate), output merging preferences

**Team Display**: Cards arranged showing interaction flow with connecting lines indicating sequence

---

## Brief Submission & Multi-View Output

**Input Section** (sticky top, bg-white shadow):
- Team indicator bar showing active members (avatar stack + team name)
- Large textarea for brief (min-h-40) with rich formatting toolbar
- Submit button + advanced options dropdown

**Output Display**:
- **Tab Navigation**: Combined View | Individual Outputs | Side-by-Side | Consensus Analysis
- **Combined View**: Single prose-styled column (max-w-4xl) with merged output
- **Individual Outputs**: Grid (grid-cols-1 lg:grid-cols-2 gap-6)
  - Each card: Bot header (avatar + name + model) + formatted response + action buttons (copy, iterate, save)
- **Side-by-Side**: Table format with synchronized scrolling
- **Consensus Analysis**: AI-generated summary highlighting agreements/disagreements

**Action Bar** (sticky bottom):
- Save to Library + Export (PDF/Markdown) + Share + Iterate buttons
- Follow-up prompt input (collapsed by default)

---

## Component Specifications

**Cards**: rounded-xl border border-Border Gray bg-white shadow-sm hover:shadow-md transition, p-6

**Buttons**:
- Primary: bg-Trust Blue text-white rounded-lg px-6 py-3 font-semibold
- Secondary: border-2 border-Trust Blue text-Trust Blue rounded-lg px-6 py-3 font-semibold
- Tertiary: text-Trust Blue font-semibold hover:underline
- On images: backdrop-blur-md bg-white/10 border border-white/20 text-white

**Inputs**: border border-Border Gray rounded-lg px-4 py-3 focus:ring-2 focus:ring-Trust Blue

**Badges**: 
- Model: bg-Slate Purple/10 text-Slate Purple px-3 py-1 rounded-full text-xs font-medium
- Status: bg-Electric Cyan/10 text-Electric Cyan px-2 py-1 rounded text-xs

**Modals**: Centered card max-w-2xl bg-white rounded-2xl shadow-2xl p-8 with backdrop blur

---

## Images

**Hero Image**: Required - Full-width abstract AI network visualization
- Style: Futuristic, interconnected nodes, holographic data streams, neural pathways
- Colors: Deep blues, cyans, purples with glowing elements
- Treatment: Gradient overlay for text readability
- Placement: Full background with centered content overlay

**Empty States**: Minimal line-art illustrations in Electric Cyan
- No bots: Bot creation graphic
- No teams: Team collaboration graphic
- No outputs: Data visualization graphic

**Bot Avatars**: Geometric patterns or AI-generated abstract representations consistent with brand colors

---

## Animation

**Minimal, purposeful only**:
- Card hover: translate-y-[-2px] shadow-lg
- Button hover: opacity-90
- Modal: Fade + slide-up
- Loading: Subtle pulse on skeleton screens
- NO scroll animations or parallax