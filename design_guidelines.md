# Statistical Test Selection Tool - Design Guidelines

## Design Approach

**Selected Approach:** Design System + Reference-Based Hybrid
- Primary inspiration: Linear (clean, minimal) + Notion (content hierarchy) + academic research tools
- Focus on clarity, readability, and efficient decision-making
- Professional, distraction-free interface optimized for researchers

## Typography System

**Font Stack:**
- Primary: Inter (Google Fonts) - headings, UI elements
- Secondary: IBM Plex Mono (Google Fonts) - code snippets, test names

**Hierarchy:**
- Page titles: text-4xl font-bold
- Section headers: text-2xl font-semibold
- Subsection headers: text-xl font-medium
- Body text: text-base
- Helper text: text-sm text-gray-600
- Statistical test names: font-mono text-lg

## Layout System

**Spacing Primitives:** Tailwind units of 3, 4, 6, 8, 12, 16
- Component padding: p-6 or p-8
- Section spacing: space-y-6 or space-y-8
- Card gaps: gap-6
- Form element spacing: space-y-4

**Container Strategy:**
- Max width: max-w-5xl for wizard content
- Full-width sidebar navigation when needed
- Centered layouts with consistent margins

## Core Components

### Navigation & Progress
- **Stepper Component:** Horizontal progress indicator showing: Research Goal → Data Structure → Assumptions → Test Selection
- Active step emphasized, completed steps with checkmarks
- Subtle line connecting steps
- Fixed position at top of wizard container

### Wizard Interface
- **Question Cards:** Large, clean cards (p-8) with clear question text and radio/checkbox options
- Option buttons as full-width selectable cards with subtle borders
- Hover states with slight elevation
- Selected state with accent border (left-4 border)

### Decision Tree Visualization
- **Tree Node Cards:** Hierarchical card layout showing decision path
- Breadcrumb trail showing current position
- Expandable/collapsible sections for complex branches
- Clear parent-child relationships with connecting lines

### Test Results Display
- **Recommendation Card:** Prominent card highlighting suggested test
- Supporting information in accordion sections
- "Why this test?" explanation section
- Assumption checklist with icons
- "Alternative tests" section below

### Action Buttons
- Primary actions: Large, rounded-lg buttons (px-8 py-3)
- Secondary actions: Outlined style
- "Back" and "Next" navigation always visible
- "Start Over" link in header

## Page Layouts

### Landing/Home Page
- **Hero Section (60vh):** Centered content
  - Main headline: "Find the Right Statistical Test"
  - Subheading explaining the tool's purpose
  - Large CTA button: "Start Selection Wizard"
  - Brief description of how it works (3-4 steps visualization)
- **Features Section:** 3-column grid showcasing benefits (Simple, Accurate, Comprehensive)
- **Quick Stats:** Single row showing number of tests covered, decision paths
- **Footer:** Minimal with about/contact links

### Wizard Pages
- Consistent layout: Progress stepper at top, question in center, navigation at bottom
- Single-column focused design
- Generous whitespace around question text
- Option cards in vertical stack or 2-column grid for many options

### Results Page
- **Test Recommendation:** Full-width featured card at top
- **Details Section:** Tabbed interface (Overview, Assumptions, Examples, Alternatives)
- **Actions:** Export to PDF, Email results, Start new selection
- Sidebar with decision summary

## Icons & Assets

**Icon Library:** Heroicons (via CDN)
- Check circles for completed steps
- Arrow icons for navigation
- Information icons for tooltips
- Chevrons for expandable sections

**Images:**
This application does not require hero images given its utility-focused nature. All visual interest comes from clean layout and typography.

## Interaction Patterns

- Smooth transitions between wizard steps (no page reload)
- Validation feedback inline with form elements
- Tooltips for complex statistical terms (hover/click)
- Keyboard navigation support throughout wizard
- Auto-save progress (local storage)

## Accessibility Standards

- Clear focus indicators on all interactive elements
- ARIA labels for stepper and progress indicators
- Semantic HTML structure (nav, main, section)
- High contrast text throughout
- Form labels properly associated