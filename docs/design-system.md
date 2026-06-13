# Design System

The visual language of the site: colors, typography, and the reusable patterns. The aesthetic
is a **dark terminal / neon** theme that mirrors how the GPG key is used on the command line.

Tailwind CSS 4 is configured **CSS-first**: the palette, font stack, and animations are defined
in the `@theme` block of `src/styles/global.css`. There is no active `tailwind.config.js`
content config — `tailwind.config.mjs` is retained for documentation only.

## Brand Colors

Defined as `@theme` tokens in `src/styles/global.css`. Each maps to a Tailwind utility
(`--color-ghost-cyan` → `text-ghost-cyan`, `bg-ghost-cyan`, `border-ghost-cyan`).

| Token | Hex | Usage |
|-------|-----|-------|
| `ghost-bg` | `#0a0a12` | Page background (near-black) |
| `ghost-surface` | `#12121a` | Cards, terminals, key blocks |
| `ghost-border` | `#1e1e2e` | Borders and dividers |
| `ghost-text` | `#e0e0e0` | Primary body text |
| `ghost-muted` | `#888899` | Muted / secondary text, code output |
| `ghost-cyan` | `#4fd1c5` | Primary accent — headings, links, key actions |
| `ghost-teal` | `#38b2ac` | Secondary accent |
| `ghost-blue` | `#3b82f6` | Tertiary accent |
| `ghost-glow` | `#64ffda` | Highlight / glow — key ID, fingerprint, emphasis |

Use the tokens through Tailwind utilities (`text-ghost-cyan`, `bg-ghost-surface`,
`border-ghost-border`). Avoid hard-coding hex values so the palette stays consistent.

> The documentation Mermaid diagrams use this same palette in their init blocks
> (`primaryColor #12121a`, `lineColor #38b2ac`, accents `#4fd1c5` / `#64ffda`), while preserving
> semantic colors: clean green `#10B981`, banned/deny red `#EF4444`, external/decisions amber
> `#F59E0B`.

## Typography

- **Font family:** the mono stack — `--font-family-mono: 'JetBrains Mono', 'Fira Code',
  monospace` — applied site-wide via `font-mono` on `<body>`. JetBrains Mono is loaded from
  Google Fonts in `Layout.astro`.
- **Body:** `font-mono`, `text-ghost-text`, on a `bg-ghost-bg` background.
- **Headings** are bold and `text-ghost-cyan`; the main title uses the `animate-pulse-glow`
  effect.

| Element | Sizes |
|---------|-------|
| `h1` (title) | `text-3xl` → `md:text-4xl` |
| `h2` (section) | `text-xl` |
| `h3` (card) | `text-sm` / `font-semibold` |

## Animations

Custom keyframes are declared in the `@theme` block and exposed as `animate-*` utilities:

| Utility | Keyframes | Usage |
|---------|-----------|-------|
| `animate-pulse-glow` | `pulse-glow` (text-shadow pulse) | The "GhostKellz" title glow |
| `animate-typing` | `typing` (width 0 → 100%) | Terminal typing effect |
| `animate-blink` | `blink` (border transparency) | Cursor blink |

## Component Patterns

The site has no `@layer components` button/section classes (unlike the resolvetech site).
Instead, a small set of repeated Tailwind patterns express the look:

| Pattern | Typical classes |
|---------|-----------------|
| **Surface card** | `bg-ghost-surface border border-ghost-border rounded-lg p-4/p-6` |
| **Terminal window** | surface card + a header bar with red/yellow/green dots and a `ghostkellz@archlinux: ~` label |
| **Code block** | `bg-ghost-bg rounded p-3 text-xs text-ghost-muted overflow-x-auto` |
| **Hover link card** | surface card + `hover:border-ghost-cyan hover:shadow-lg hover:shadow-ghost-cyan/10 hover:-translate-y-1 transition-all` |
| **Copy button** | `text-ghost-muted hover:text-ghost-cyan`; toggles a `text-green-400` "Copied!" state via Alpine |
| **Glow accent** | `text-ghost-glow` for key ID / fingerprint emphasis |

## Custom Element Styles

Beyond the theme, `global.css` styles a few raw elements for the dark look:

- `::selection` — translucent cyan highlight (`rgba(79, 209, 197, 0.3)`).
- Scrollbar — thin (`8px`) track on `#0a0a12` with a `#4fd1c5` cyan thumb.

## Icons

Icons are **inline SVG** written directly into the markup (no icon font, no library). They use
`fill="currentColor"` / `stroke="currentColor"`, so they inherit the surrounding text color
(e.g. `text-ghost-cyan` on a parent tints the icon). Brand icons (GitHub, X, LinkedIn, Discord,
Facebook, ENS) carry their own brand hex via Tailwind arbitrary values (e.g.
`text-[#1793D1]` for the Arch logo).

## Imagery

Brand and content imagery lives in `public/assets/`:

- `AVATAR-GhostKellz.png` — circular avatar in the page header.
- `GhostKellz-Branding.png` — footer branding + Open Graph image.
- `GhostKellz1440p.png`, `GHOSTKELLZ-WALLPAPER2.png` — wallpapers / large brand art.
- `CKTech-Logo_Brand.png`, `cktech-blue.png`, `cktech-banner.png` — CK Technology marks.
- `favicon.svg`, `favicon.ico` — site icons.

See [content.md](content.md) for the full asset inventory.
