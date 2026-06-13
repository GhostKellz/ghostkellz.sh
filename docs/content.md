# Content & Integrations

A map of the site's page, components, static assets, identity links, and external services.

## Pages

File-based routing — each file in `src/pages/` maps to a route. This is a single-page site.

| File | Route | Purpose |
|------|-------|---------|
| `index.astro` | `/` | The identity page: header/avatar, terminal verify animation, public key block, "How to Verify" commands, key details, GitHub links, social/connect links, GhostFetch card, footer |

## Components

Reusable `.astro` components in `src/components/`.

| Component | Key behavior | Purpose |
|-----------|--------------|---------|
| `Terminal.astro` | Alpine `terminal()` factory; auto-replay loop with play/pause | Animated `gpg --locate-keys` + `gpg --verify` demo. Shows the key's expiry (`expires: 2027-04-05`), fingerprint, UID, and a "Good signature" line |
| `KeyBlock.astro` | Alpine `x-data` (`copied`, `showKey`); inline armored key constant + `fingerprint` | Fingerprint display with copy, "Download Key" (`/ghostkellz_pubkey.asc`), and a collapsible "View Key" block that reveals/copies the full armored key |
| `GhostFetch.astro` | Alpine `ghostfetch()` factory; IntersectionObserver triggers reveal on scroll | neofetch-style "daily driver" card with Arch ASCII art and system info, plus replay |

`layouts/Layout.astro` is the shared HTML shell: `<head>` meta + Open Graph tags, the JetBrains
Mono font links, the favicon, and the one-time Alpine bootstrap (`Alpine.start()`).

## Identity Files (`public/`)

Served as-is from the site root. These are the artifacts that make the site verifiable.

| Path | Purpose |
|------|---------|
| `ghostkellz_pubkey.asc` | Armored public key — downloadable, linked from KeyBlock |
| `.well-known/openpgpkey/hu/msouy1e76znciz3dm918wx9kkwdkhszd` | WKD binary key for `gpg --locate-keys ckelley@ghostkellz.sh` (advanced/direct method) |

See [gpg.md](gpg.md) for the full key facts, WKD lookup flow, and renewal procedure.

## Static Assets (`public/assets/`)

| Path | Purpose |
|------|---------|
| `AVATAR-GhostKellz.png` | Header avatar |
| `GhostKellz-Branding.png` | Footer branding + Open Graph image |
| `GhostKellz1440p.png` | Large brand art / wallpaper |
| `GHOSTKELLZ-WALLPAPER2.png` | Wallpaper |
| `CKTech-Logo_Brand.png`, `cktech-blue.png`, `cktech-banner.png` | CK Technology marks |
| `public/favicon.svg`, `public/favicon.ico` | Site icons |

## Identity Details

These values appear across `index.astro`, `KeyBlock.astro`, and `Terminal.astro`. Update **all**
references together when the key changes (see [gpg.md](gpg.md#renewal-procedure)).

| Field | Value |
|-------|-------|
| Name | GhostKellz (Christopher Kelley) |
| UID | `GhostKellz <ckelley@ghostkellz.sh>` |
| Email | ckelley@ghostkellz.sh |
| Fingerprint | `478D3EFD1D9694F6BAD0AC1F777538754BA2B57D` |
| Key ID | `777538754BA2B57D` |
| Algorithm | Ed25519 (sign) / Cv25519 (encrypt) |
| Created | 2025-04-11 |
| Expires | 2027-04-05 (reconciled — see [gpg.md](gpg.md#key-facts)) |
| Discovery | WKD / DANE |

## Identity & Social Links

Rendered as hover link cards on the identity page.

| Link | Target |
|------|--------|
| GitHub — GhostKellz Arch | https://github.com/ghostkellz/arch |
| GitHub — GhostKellz | https://github.com/ghostkellz |
| GitHub — CK-Technology | https://github.com/CK-Technology |
| X / Twitter | https://x.com/Gh0stKellz |
| LinkedIn | https://www.linkedin.com/in/christopherkelley89/ |
| Discord | `ghostkellz.sh` (copy action) |
| Facebook | https://www.facebook.com/ckelley89 |
| ENS | `ckelley.eth` (copy action) |
| Email | mailto:ckelley@ghostkellz.sh |

## External Services

| Service | Purpose | Notes |
|---------|---------|-------|
| Google Fonts | JetBrains Mono typeface | Preconnected and loaded in `Layout.astro` |
| [Alpine.js](https://alpinejs.dev) | Copy buttons, key reveal, terminal/GhostFetch replay | Bundled (`alpinejs ^3.15.12`), started once in the layout |

No analytics or third-party tracking scripts are loaded. The only client-side behavior is the
Alpine interactions; no data leaves the visitor's browser except the optional armored-key
download and WKD lookup.

## Verification Surfaces

The page exposes copyable commands for every verification path (full reference in
[gpg.md](gpg.md#verification-commands)):

| Action | Command shown |
|--------|---------------|
| Import via WKD | `gpg --locate-keys ckelley@ghostkellz.sh` |
| Import from URL | `curl -sL https://ghostkellz.sh/ghostkellz_pubkey.asc \| gpg --import` |
| Verify a signature | `gpg --verify file.sig file` |
| Check fingerprint | `gpg --fingerprint ckelley@ghostkellz.sh` |
