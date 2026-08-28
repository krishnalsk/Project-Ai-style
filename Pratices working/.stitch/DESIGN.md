# Design System: CookSmart Mobile App

## 1. Visual Theme & Atmosphere
A warm, cozy, yet modern dark interface tailored for culinary inspiration. The design features a deep charcoal canvas with high-contrast warm orange highlights resembling fire and copper cookware. The layout is clean and spacious (Balanced daily density), utilizing generous rounded corners and crisp white typography to feel premium and inviting.

## 2. Color Palette & Roles
- **Canvas Charcoal** (#0C0A09) — Primary background canvas of the application (Stone 950 deep warm black).
- **Surface Card** (#1C1917) — Card and modal surfaces (Stone 900).
- **White Accent** (#FFFFFF) — Primary typography and high-emphasis icons.
- **Warm Orange** (#EA580C) — Primary interactive accent for active states, CTA buttons, highlighted icons, and focus indicators (Orange 600).
- **Muted Sage** (#78716C) — Secondary text, labels, and helper descriptions (Stone 500).
- **Faint Border** (rgba(120, 113, 108, 0.15)) — Divider lines and input borders.

## 3. Typography Rules
- **Display & Headlines:** Outfit — Track-tight, bold weight, clean sans-serif. Hierarchy achieved using color contrast (White vs Orange vs Muted Sage) and size.
- **Body Text:** Outfit — Regular weight, line height 1.6, maximum width for reading comfortable recipes.
- **Mono:** Geist Mono / JetBrains Mono — Used for preparation times, servings counters, and calorie estimates.
- **Banned:** Inter (use Outfit instead), generic serif fonts, oversized screaming text.

## 4. Component Stylings
- **Buttons:** Large touch targets (min 48px). Primary CTA uses a Solid Warm Orange (#EA580C) background with White (#FFFFFF) text. Secondary buttons use transparent backgrounds with a Faint Border and white text. Active button state has a subtle press down translation effect (`transform: translateY(1px)`).
- **Cards/Containers:** Highly rounded corners (`border-radius: 1rem` / 16px). Solid background of Surface Card (#1C1917). Low-contrast warm shadows.
- **Inputs & Search Bars:** Rounded pill or 12px corners, Charcoal background with Faint Border, White cursor/text. The placeholder text should be Muted Sage. Left-aligned search icon.
- **Bottom Navigation Bar:** Floating or fixed at the bottom with a dark surface blur backdrop (`backdrop-filter: blur(12px)`), Faint Border top, active menu icon in Warm Orange, inactive icons in Muted Sage.

## 5. Layout Principles
- Mobile viewport-locked container (max-width: 480px, centered on desktop) to enforce a true app feel.
- No overlapping elements — clean vertical layout stacks.
- Touch targets strictly spaced to prevent misclicks.
- Scrolling sections (like featured recipe carousels) should feel fluid and support horizontal swipes with no scrollbars.

## 6. Motion & Interaction
- Smooth transitions on interactive buttons (all: 200ms ease-in-out).
- Subtle scale-up effect on recipe card hover/tap (scale: 1.02).
- Micro-interactions (e.g., active icon state pulses gently).

## 7. Anti-Patterns (Banned)
- No emojis anywhere in the interface.
- No pure black (#000000) surfaces.
- No purple or neon blue glowing shadows.
- No generic serif typography.
- No fake round statistics/invented SLA metrics.
- No broken image links — use stable SVG representations or high-quality Pexels/Picsum URLs.
