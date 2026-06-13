# Development

How to set up the project locally and work on it.

## Prerequisites

- **Node.js** 22.12 or newer (recommended)
- **npm** 11+ (this project uses npm, not pnpm)

## Setup

```bash
npm install
```

For reproducible installs (CI or clean checkouts), use the committed lockfile:

```bash
npm ci
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server at `http://localhost:4321` with hot reload |
| `npm run build` | Build the static site into `dist/` |
| `npm run preview` | Serve the production build locally |

The scripts wrap the Astro CLI directly (`astro dev`, `astro build`, `astro preview`). You can
also invoke Astro with `npx astro …` (e.g. `npx astro check`).

## Project Layout

```
public/
├── assets/                          # Branding and image assets
├── favicon.svg, favicon.ico
├── ghostkellz_pubkey.asc            # Armored public key (downloadable)
└── .well-known/openpgpkey/hu/
    └── msouy1e76znciz3dm918wx9kkwdkhszd   # WKD binary key
src/
├── components/   # GhostFetch.astro, KeyBlock.astro, Terminal.astro
├── layouts/      # Layout.astro (HTML shell + Alpine bootstrap)
├── pages/        # index.astro (the single route)
└── styles/       # global.css (Tailwind 4 @theme tokens + globals)
archive/          # Legacy static HTML build, original nginx configs, GPG renewal notes
docs/             # This documentation
```

See [content.md](content.md) for the full page and component inventory.

## Conventions

### Styling

- Use Tailwind utility classes directly in markup.
- Use the **GhostKellz theme tokens** (`bg-ghost-bg`, `text-ghost-cyan`, `text-ghost-glow`,
  `border-ghost-border`, etc.) rather than raw hex values, so the dark neon palette stays
  consistent. The tokens are defined in the `@theme` block of `src/styles/global.css`. See
  [design-system.md](design-system.md).
- The default body font is the mono stack (`font-mono` → JetBrains Mono), loaded from Google
  Fonts in `Layout.astro`.

### Interactivity (Alpine)

- Alpine is imported and started once in `src/layouts/Layout.astro`:

  ```html
  <script>
    import Alpine from 'alpinejs';
    window.Alpine = Alpine;
    Alpine.start();
  </script>
  ```

- Components use inline `x-data` for local state (e.g. `{ copied: false, showKey: false }`) and
  register named components via `alpine:init` + `Alpine.data(...)` (the `terminal()` and
  `ghostfetch()` factories).

### Tailwind 4 theme tokens

- Brand colors, the mono font family, and custom animations live in the `@theme` block in
  `global.css`. Adding a token there makes it available as a Tailwind utility automatically.
- `tailwind.config.mjs` is retained for compatibility/documentation only; the live config is
  the CSS-first `@theme`.

## Common Tasks

### Update the published GPG key

The key appears in **multiple places** and they must stay in sync:

- `public/ghostkellz_pubkey.asc` — the downloadable armored key.
- `public/.well-known/openpgpkey/hu/msouy1e76znciz3dm918wx9kkwdkhszd` — the WKD binary key.
- `src/components/KeyBlock.astro` — the inline armored key shown in the "View Key" block.
- The **Key Details** block in `src/pages/index.astro` (algorithm, key ID, created, expires).
- The terminal sample output in `src/components/Terminal.astro` (expiry date shown in the
  `gpg --locate-keys` output).

Follow the full procedure in [gpg.md](gpg.md#renewal-procedure).

### Update key metadata shown on the page

Key ID, fingerprint, algorithm, created, and expiry are rendered in `index.astro` (Key Details)
and referenced in `Terminal.astro`/`KeyBlock.astro`. Update all references together. See the
reconciliation note in [gpg.md](gpg.md#key-facts).

### Adjust the terminal or GhostFetch animation

The terminal replay and GhostFetch reveal are Alpine components in
`src/components/Terminal.astro` and `src/components/GhostFetch.astro`. Timing is controlled by
`delay(ms)` calls inside the `animate()`/`loop()` methods.

## Build Output

`npm run build` produces a fully static `dist/` directory — HTML, CSS, and the bundled Alpine
JS. There is no server-side runtime. See [deployment.md](deployment.md) for shipping it.
