# AD Automation Aurora UI Design System

Source: `.agents/skills/ui-ux-pro-max/SKILL.md` applied to a security-first SaaS/admin dashboard for fictional Active Directory CRUD.

## Product posture

- Product type: authenticated enterprise admin shell.
- Primary users: ADMIN operators managing users, groups, audit trails, and backend status.
- Design stance: **Aurora command center** — luminous, layered, calm, dense enough for operations, never playful or cyberpunk-heavy.

## Visual principles

1. Accessibility before atmosphere: contrast, keyboard focus, labels, and state clarity outrank glow effects.
2. Use semantic tokens only in components; raw colors live in global CSS/Tailwind config.
3. Dark-first interface with translucent glass surfaces, subtle grain, thin borders, and restrained cyan/violet/mint accents.
4. Navigation must always show icon + label, active state, and a predictable logout/destructive separation.
5. Admin data must be scan-friendly: tabular figures, status chips with text + icon, explicit empty/loading/error states.

## Tokens

- Background: deep ink navy.
- Surface: layered navy glass.
- Primary: aurora cyan for main action/focus.
- Secondary: violet-blue for depth.
- Accent: mint/teal for positive system glow.
- Success/warning/destructive: semantic status colors, never color-only.
- Radius: 16px controls, 24px cards, 32px hero/shell panels.
- Motion: 150–300ms, transform/opacity only, respects `prefers-reduced-motion`.

## Typography

- Display: Sora-class geometric headings.
- Body: Manrope-class readable UI text.
- Mono: IBM Plex Mono for IDs, timestamps, role metadata, token/status-like values.
- Body text minimum 16px where possible; labels may be 12–14px when secondary.

## Layout

- Desktop: persistent left sidebar + top command bar + main canvas.
- Tablet: sidebar remains compact; cards reflow.
- Mobile: stacked header/nav blocks; no horizontal overflow.
- Spacing: 4/8px rhythm with 24–32px section gaps.

## Components

- Buttons: 44px minimum, visible focus ring, loading copy, clear destructive variant.
- Cards: glass panels with border, blur, subtle inner highlight, no random shadows.
- Inputs: visible labels, helper/error text adjacent, autocomplete enabled.
- Badges: uppercase micro-labels with text; status colors are supported by icon/text.
- Alerts: role-aware, recoverable copy; destructive states include what happened and next step.

## Accessibility checklist

- Contrast ≥ 4.5:1 for normal text.
- Focus rings visible on every interactive element.
- Touch targets ≥ 44×44px.
- No hover-only affordances.
- Respect reduced motion.
- Forms have labels, autocomplete, inline errors, and loading disabled states.
