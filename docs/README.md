# ghostkellz.sh — Documentation

Project documentation for the [ghostkellz.sh](https://ghostkellz.sh) website — a compact
static Astro site that publishes and lets visitors verify the official **GhostKellz GPG public
key**.

This directory explains how the project is built, how to work on it, how it ships to
production, and how the GPG identity is published and verified. For a high-level summary and
quick start, see the [root README](../README.md).

## Contents

| Document | Description |
|----------|-------------|
| [architecture.md](architecture.md) | Tech stack rationale, key decisions, and trade-offs |
| [development.md](development.md) | Local setup, project conventions, adding components |
| [deployment.md](deployment.md) | Build, transfer pipeline, NGINX config, TLS, WKD handling |
| [security.md](security.md) | Trust planes, network posture, CrowdSec, observability |
| [design-system.md](design-system.md) | Brand colors, typography, component patterns |
| [content.md](content.md) | Page map, components, identity links, external services |
| [gpg.md](gpg.md) | Key facts, WKD layout, publication, renewal, verification |
| [cloudflare.md](cloudflare.md) | Cloudflare (free plan) edge, WAF, caching, TLS posture |

## At a Glance

| | |
|---|---|
| **Owner / Developer** | Christopher Kelley (GhostKellz) |
| **Type** | Static GPG-identity / key-verification site |
| **Framework** | Astro 6.4.x (zero JS by default) |
| **Styling** | Tailwind CSS 4 (CSS-first `@theme`) |
| **Interactions** | Alpine.js 3 (copy buttons, key reveal, terminal replay) |
| **Build tool** | Vite 7 |
| **Package manager** | npm (`package-lock.json`) |
| **Hosting** | PVE1 bare-metal cloud node — NGINX VM on the Proxmox SDN |
| **Edge** | Cloudflare (standard / free plan) |
| **Deploy** | tar + rclone over SFTP via Tailscale (no public SSH) |
| **TLS** | acme.sh + Let's Encrypt, DNS-01 via Cloudflare API token |
| **Identity** | GPG key published via site `.asc`, WKD binary, and DNS |
| **Domains** | ghostkellz.sh, www.ghostkellz.sh |

## Quick Links

- **Live site:** https://ghostkellz.sh
- **Public key (armored):** https://ghostkellz.sh/ghostkellz_pubkey.asc
- **WKD lookup:** `gpg --locate-keys ckelley@ghostkellz.sh`
- **Source:** `src/` (pages, components, layout, styles)
- **Identity reference:** [gpg.md](gpg.md)
