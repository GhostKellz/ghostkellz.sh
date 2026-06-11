<p align="center">
  <img src="assets/logo/AVATAR-GhostKellz.png" alt="GhostKellz Avatar" width="180">
</p>

<h1 align="center">ghostkellz.sh</h1>

<p align="center">
  <strong>Official GhostKellz GPG identity and public key verification site</strong>
</p>

<p align="center">
  <a href="https://ghostkellz.sh"><img src="https://img.shields.io/badge/Live-ghostkellz.sh-4fd1c5?style=for-the-badge" alt="Live Site"></a>
  <img src="https://img.shields.io/badge/Astro-6.4.6-BC52EE?style=for-the-badge&logo=astro&logoColor=white" alt="Astro">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.3.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Alpine.js-3.15.12-8BC0D0?style=for-the-badge&logo=alpinedotjs&logoColor=white" alt="Alpine.js">
  <img src="https://img.shields.io/badge/GPG-Ed25519-4fd1c5?style=for-the-badge&logo=gnupg&logoColor=white" alt="GPG">
  <img src="https://img.shields.io/badge/Static-Site-12121a?style=for-the-badge" alt="Static Site">
</p>

---

## Overview

`ghostkellz.sh` is a compact static identity site for publishing and verifying the official GhostKellz GPG public key. It provides the public key fingerprint, download link, copyable verification commands, project/social links, and a terminal-style identity presentation.

The site is intentionally simple: Astro builds the static page, Tailwind CSS owns the visual system, and Alpine.js powers the small interactive pieces like copy buttons, key reveal, and terminal replay.

## Features

### GPG Identity
- Official GhostKellz public key fingerprint
- Downloadable armored public key
- Copyable GPG import and verification commands
- Key metadata including algorithm, key ID, UID, creation date, and expiration date

### Verification Workflow
- WKD import command for `ckelley@ghostkellz.sh`
- Direct URL import from `https://ghostkellz.sh/ghostkellz_pubkey.asc`
- Signature verification command examples
- Fingerprint copy action for quick comparison

### Site Experience
- Terminal-style signature verification animation
- Collapsible public key block
- GhostFetch daily-driver terminal card
- Responsive static layout
- Branded Open Graph metadata

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Astro 6 |
| **Styling** | Tailwind CSS 4 |
| **Interactions** | Alpine.js 3 |
| **Build Tool** | Vite 7 |
| **Output** | Static HTML/CSS/JS |
| **Assets** | Local files in `public/` |

## Quick Start

### Prerequisites
- Node.js 22.12+ recommended
- npm 11+

### Development

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build static site
npm run build

# Preview production build
npm run preview
```

The local dev server defaults to `http://localhost:4321`.

## Project Structure

```text
ghostkellz.sh/
├── public/
│   ├── assets/                  # Branding and image assets
│   ├── favicon.svg
│   ├── favicon.ico
│   └── ghostkellz_pubkey.asc    # Public GPG key
├── src/
│   ├── components/
│   │   ├── GhostFetch.astro     # Daily-driver terminal card
│   │   ├── KeyBlock.astro       # Fingerprint and key viewer
│   │   └── Terminal.astro       # Verification animation
│   ├── layouts/
│   │   └── Layout.astro         # Base document shell and Alpine setup
│   ├── pages/
│   │   └── index.astro          # Main identity page
│   └── styles/
│       └── global.css           # Tailwind 4 theme tokens and globals
├── astro.config.mjs
├── package.json
└── tailwind.config.mjs
```

## GPG Details

| Field | Value |
|-------|-------|
| **UID** | `GhostKellz <ckelley@ghostkellz.sh>` |
| **Fingerprint** | `478D3EFD1D9694F6BAD0AC1F777538754BA2B57D` |
| **Key ID** | `777538754BA2B57D` |
| **Algorithm** | Ed25519 / Cv25519 |
| **Public Key** | [`public/ghostkellz_pubkey.asc`](public/ghostkellz_pubkey.asc) |

## Deployment

This project builds to static files in `dist/`.

```bash
npm run build
```

Deploy the generated `dist/` directory to the static host serving `https://ghostkellz.sh`.

## Notes

- Tailwind CSS 4 theme tokens live in [`src/styles/global.css`](src/styles/global.css).
- `tailwind.config.mjs` is retained for compatibility/documentation, but the active Tailwind 4 setup is driven by CSS-first `@theme` configuration.
- Alpine.js is initialized once in [`src/layouts/Layout.astro`](src/layouts/Layout.astro).

## License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

<p align="center">
  Built for verifiable GhostKellz identity
</p>
