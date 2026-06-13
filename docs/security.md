# Security Posture

How the site and its host are protected. The guiding principle is a **split between a public
data plane and a private control plane**: visitors only ever touch Cloudflare and the NGINX
origin over HTTPS, while all administration, deployment, and security signalling happen over a
private Tailscale network.

This is a **production** deployment — the origin runs on a PVE bare-metal cloud node with the
same hardened posture, central security engine, and observability stack as the other CK
production edges.

## Trust Planes

```mermaid
%%{init: {'theme':'base','themeVariables':{'fontFamily':'JetBrains Mono, ui-monospace, monospace','primaryColor':'#12121a','primaryBorderColor':'#4fd1c5','primaryTextColor':'#e0e0e0','lineColor':'#38b2ac','fontSize':'14px'}}}%%
flowchart TB
    subgraph PUBLIC["Public Internet — 443 only"]
        USER(["Site visitors"]):::public
        CF["Cloudflare edge<br/>free plan · WAF · TLS"]:::edge
        LE["Let's Encrypt<br/>ACME CA"]:::external
        OTHER["SSH / mgmt ports<br/>direct host access"]:::deny
    end

    subgraph TAILNET["Tailscale Tailnet — WireGuard, private"]
        ADMIN["Dev workstation<br/>admin + deploy"]:::dev
        CROWD["Central CrowdSec LAPI<br/>production PVE cluster"]:::security
    end

    subgraph VM["PVE1 NGINX VM — hardened host"]
        direction TB
        NGX["NGINX<br/>TLS 1.2/1.3 · security headers"]:::host
        BNC["CrowdSec nginx bouncer"]:::security
        ACMECL["acme.sh<br/>DNS-01 renewer"]:::host
        NGX --- BNC
    end

    CFDNS["Cloudflare DNS<br/>scoped API token"]:::external

    USER ==>|"HTTPS 443"| CF
    CF ==>|"proxy to origin<br/>over Tailscale"| NGX
    ADMIN -.->|"SSH key auth<br/>Tailscale-only"| VM
    BNC -.->|"pull ban decisions"| CROWD
    ACMECL -->|"DNS-01 TXT challenge"| CFDNS
    LE -.->|"issue / renew cert"| ACMECL
    OTHER -.->|"DENY at PVE firewall"| VM

    classDef dev fill:#12121a,stroke:#4fd1c5,stroke-width:1.5px,color:#e0e0e0;
    classDef host fill:#1e1e2e,stroke:#4fd1c5,stroke-width:1.5px,color:#e0e0e0;
    classDef edge fill:#1e1e2e,stroke:#38b2ac,stroke-width:1.5px,color:#64ffda;
    classDef security fill:#0f2a22,stroke:#10B981,stroke-width:1.5px,color:#10B981;
    classDef public fill:#0a0a12,stroke:#888899,stroke-width:1.5px,color:#e0e0e0;
    classDef external fill:#1e1e2e,stroke:#F59E0B,stroke-width:1.5px,color:#F59E0B;
    classDef deny fill:#2a1212,stroke:#EF4444,stroke-width:1.5px,color:#EF4444;
```

**Reading the diagram**

- **Solid edges** are the public data path (visitors → Cloudflare → NGINX origin). **Dotted
  edges** are private control/observe flows (admin SSH, CrowdSec decisions, certificate
  renewal).
- The only inbound public exposure is **HTTPS/443**, and it arrives proxied through Cloudflare.
  SSH and management ports are blocked at the **PVE firewall (default-deny except 443)** and
  reachable only across the Tailscale mesh.
- Certificate issuance never needs inbound HTTP — acme.sh proves control via **DNS-01** by
  writing TXT records in Cloudflare DNS (see
  [deployment.md](deployment.md#tls-certificates)).

## Controls Summary

| Layer | Control |
|-------|---------|
| **Edge (public)** | Cloudflare free plan — managed WAF ruleset, basic rate limiting, bot fight mode, HTTP/3 |
| **Transport** | TLS 1.2/1.3, `HIGH:!aNULL:!MD5` ciphers, HTTP→HTTPS redirect; Cloudflare TLS Full (Strict) with origin cert |
| **HTTP headers** | `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`, `Referrer-Policy` |
| **Host access** | Tailscale-only SSH, key-based auth, no password auth, port 22 not public |
| **Firewall** | PVE firewall default-deny; only 443 reaches the origin |
| **Edge protection** | CrowdSec nginx bouncer enforcing decisions from a central CrowdSec LAPI |
| **Certificates** | acme.sh + Let's Encrypt, DNS-01 via Cloudflare scoped API token |
| **Attack surface** | Static files only — no app runtime, database, or CMS to exploit |
| **Secrets** | Cloudflare token, SSH keys live on the host only; never committed (`.env*`, `*.pem`, `*.key` are gitignored) |

## CrowdSec — NGINX Bouncer

The PVE1 NGINX VM runs the **CrowdSec NGINX bouncer**, which checks every incoming request
against a decision list and blocks known-bad IPs before they reach the site. Rather than
running a full standalone CrowdSec install on the public edge, the bouncer **queries a central
CrowdSec security engine (LAPI + database) on the production PVE cluster over Tailscale** — the
decision-making and threat intelligence stay on the private control plane. This is the same
pattern used across every production edge (see
[Production Topology](#crowdsec--production-topology--threat-feed) below).

```mermaid
%%{init: {'theme':'base','themeVariables':{'fontFamily':'JetBrains Mono, ui-monospace, monospace','primaryColor':'#12121a','primaryBorderColor':'#4fd1c5','primaryTextColor':'#e0e0e0','lineColor':'#38b2ac','fontSize':'14px'}}}%%
flowchart TB
    VISITOR(["Visitor / bot"]):::public

    subgraph VM["PVE1 NGINX VM — public edge"]
        direction TB
        NGX["NGINX"]:::host
        BNC["nginx bouncer<br/>Lua / OpenResty"]:::security
        CACHE["local decision<br/>cache · TTL"]:::host
        NGX --> BNC
        BNC -.- CACHE
    end

    subgraph BRAIN["Production PVE cluster — CrowdSec brain, over Tailscale"]
        direction TB
        AGENT["CrowdSec agent<br/>parsers + scenarios"]:::security
        LAPI["CrowdSec LAPI<br/>:8080"]:::security
        DB["security engine + DB<br/>decisions · community blocklist"]:::security
        AGENT --> LAPI
        LAPI -.- DB
    end

    OK(["200 — served"]):::secure
    BLOCK(["403 / 429 — dropped"]):::deny

    VISITOR ==>|"HTTPS request"| NGX
    BNC <-.->|"decisions API · API key · over Tailscale"| LAPI
    BNC ==>|"clean"| OK
    BNC ==>|"banned"| BLOCK

    classDef host fill:#1e1e2e,stroke:#4fd1c5,stroke-width:1.5px,color:#e0e0e0;
    classDef security fill:#0f2a22,stroke:#10B981,stroke-width:1.5px,color:#10B981;
    classDef public fill:#0a0a12,stroke:#888899,stroke-width:1.5px,color:#e0e0e0;
    classDef secure fill:#0f2a22,stroke:#10B981,stroke-width:1.5px,color:#10B981;
    classDef deny fill:#2a1212,stroke:#EF4444,stroke-width:1.5px,color:#EF4444;

    %% link indices follow edge declaration order
    %% 5 = decisions API (amber control link) · 6 = clean (green) · 7 = banned (red)
    linkStyle 5 stroke:#F59E0B,stroke-width:2px;
    linkStyle 6 stroke:#10B981,stroke-width:2.5px;
    linkStyle 7 stroke:#EF4444,stroke-width:2.5px;
```

**How it works**

1. A request hits NGINX. The bouncer (Lua module / OpenResty) intercepts it before it is
   served.
2. The bouncer consults its local decision cache; on a miss or refresh interval it queries the
   **central CrowdSec LAPI over Tailscale** (`GET /v1/decisions`, authenticated with a bouncer
   API key). Because the call rides the tailnet, the LAPI is never exposed to the internet.
3. If the source IP carries an active **ban** decision, the request is dropped (`403`/`429`).
   Clean traffic is served normally.
4. The CrowdSec **agent** on the production PVE cluster maintains the decision list from parsed
   signals and the CrowdSec **community blocklist**, so the public edge benefits from shared
   threat intelligence without putting the brain on the public host.

> Log acquisition (which signals the agent parses) can run either locally on the VM shipping
> events to the central LAPI, or centrally — the enforcement path shown here (bouncer → central
> LAPI over Tailscale) is the part specific to this deployment.

## CrowdSec — Production Topology & Threat Feed

This site's bouncer is one node in a wider production setup. A **single CrowdSec security
engine + database (LAPI)** runs centrally on the production PVE cluster; every public edge runs
only a lightweight **bouncer** that consults it over Tailscale. The same brain also publishes a
**public blocklist mirror** at `https://threat.cktechnology.io/crowdsec.txt`, which any host —
including third-party or non-tailnet edges — can pull as a plain IP feed.

```mermaid
%%{init: {'theme':'base','themeVariables':{'fontFamily':'JetBrains Mono, ui-monospace, monospace','primaryColor':'#12121a','primaryBorderColor':'#4fd1c5','primaryTextColor':'#e0e0e0','lineColor':'#38b2ac','fontSize':'14px'}}}%%
flowchart TB
    COMMUNITY["CrowdSec<br/>community blocklist"]:::external

    subgraph PVE["Production PVE cluster — control plane, over Tailscale"]
        direction TB
        ENGINE["CrowdSec security engine<br/>parsers · scenarios · agent"]:::security
        LAPI["LAPI + database<br/>:8080 · decisions"]:::security
        ENGINE --> LAPI
    end

    FEED["threat.cktechnology.io/crowdsec.txt<br/>public IP blocklist mirror"]:::external

    subgraph EDGE["Production edge — bouncers only"]
        direction TB
        GK["PVE1 NGINX VM · ghostkellz.sh<br/>nginx + bouncer"]:::host
        PVEWEB["PVE virtualized webservers<br/>nginx + bouncer · HA"]:::host
        EDGE3["other production edge devices"]:::host
    end

    FORTI["FortiGate firewalls<br/>external threat-feed connector"]:::external
    EXT(["Any other host serving traffic<br/>(off-tailnet, pulls public feed)"]):::public

    COMMUNITY -.->|"enrich decisions"| ENGINE
    GK <-.->|"decisions API · Tailscale"| LAPI
    PVEWEB <-.->|"decisions API · Tailscale"| LAPI
    EDGE3 <-.->|"decisions API · Tailscale"| LAPI
    LAPI ==>|"publish decisions + community blocklist"| FEED
    FEED ==>|"HTTPS pull"| EDGE
    FEED ==>|"threat feed import"| FORTI
    FEED ==>|"HTTPS pull"| EXT

    classDef host fill:#1e1e2e,stroke:#4fd1c5,stroke-width:1.5px,color:#e0e0e0;
    classDef security fill:#0f2a22,stroke:#10B981,stroke-width:1.5px,color:#10B981;
    classDef public fill:#0a0a12,stroke:#888899,stroke-width:1.5px,color:#e0e0e0;
    classDef external fill:#1e1e2e,stroke:#F59E0B,stroke-width:1.5px,color:#F59E0B;

    %% edge index 0 is ENGINE-->LAPI inside the PVE subgraph
    %% decisions API (private, amber) vs feed publish/pull (public, cyan)
    linkStyle 2 stroke:#F59E0B,stroke-width:2px;
    linkStyle 3 stroke:#F59E0B,stroke-width:2px;
    linkStyle 4 stroke:#F59E0B,stroke-width:2px;
    linkStyle 5 stroke:#4fd1c5,stroke-width:2.5px;
    linkStyle 6 stroke:#4fd1c5,stroke-width:2.5px;
    linkStyle 7 stroke:#4fd1c5,stroke-width:2.5px;
    linkStyle 8 stroke:#4fd1c5,stroke-width:2.5px;
```

- **One brain, many edges.** Only the central engine holds the database and runs the
  decision-making logic. Edges (this PVE1 NGINX VM, PVE-hosted virtualized webservers behind HA,
  and the other production edge devices) carry just a bouncer, so there is no per-host CrowdSec
  DB to manage or expose.
- **Two distribution paths.** Tailnet edges pull live decisions over the private decisions API
  (amber, authenticated, never public). Anything that can't join the tailnet — third-party or
  external hosts — pulls the same intelligence from the public `crowdsec.txt` mirror (cyan,
  plain HTTPS), so the threat feed travels even where Tailscale doesn't.
- **Block at scale via the firewalls.** The mirror publishes the engine's **decisions plus the
  community blocklist** as a single IP list. **FortiGate firewalls import it as an external
  threat feed** wherever applicable, so malicious actors are dropped at the network edge —
  before they ever reach a web server — across every site that consumes the feed.
- **Shared intelligence.** The CrowdSec community blocklist enriches the central engine, and
  every edge inherits it automatically — local scenarios plus crowd-sourced reputation.

## Observability — Metrics, Logs, and SIEM

Every production host (this PVE1 NGINX VM included) ships telemetry to a central observability
stack reached over Tailscale. The stack is **observe-only**: it reads existing endpoints rather
than running security components itself.

```mermaid
%%{init: {'theme':'base','themeVariables':{'fontFamily':'JetBrains Mono, ui-monospace, monospace','primaryColor':'#12121a','primaryBorderColor':'#4fd1c5','primaryTextColor':'#e0e0e0','lineColor':'#38b2ac','fontSize':'14px'}}}%%
flowchart TB
    subgraph HOSTS["Every production host — PVE1 NGINX VM, PVE webservers, edge"]
        direction TB
        NE["node_exporter<br/>:9100 host metrics"]:::host
        LOGS["syslog-ng shipper<br/>nginx + system logs"]:::host
        WA["Wazuh agent<br/>FIM · security events"]:::security
    end

    CSL["CrowdSec LAPI<br/>:6060 cs_* metrics"]:::security

    subgraph OBS["Observability server — over Tailscale"]
        direction TB
        PROM["Prometheus<br/>:9090 · 15s scrape"]:::host
        LOKI["Loki<br/>:3100 log store"]:::host
        WI["Wazuh indexer<br/>:9200 OpenSearch"]:::security
        GRAF["Grafana<br/>:3000 dashboards + alerts"]:::host
    end

    NE -.->|"scrape"| PROM
    CSL -.->|"scrape decisions/alerts"| PROM
    LOGS ==>|"push logs"| LOKI
    WA ==>|"agent → indexer"| WI
    PROM --> GRAF
    LOKI --> GRAF
    WI -.->|"OpenSearch datasource"| GRAF

    classDef host fill:#1e1e2e,stroke:#4fd1c5,stroke-width:1.5px,color:#e0e0e0;
    classDef security fill:#0f2a22,stroke:#10B981,stroke-width:1.5px,color:#10B981;
```

- **Metrics** — `node_exporter` on each host and the **CrowdSec LAPI** (`:6060`, `cs_*`
  decision/alert metrics) are scraped by **Prometheus**, which drives alerting.
- **Logs** — `syslog-ng` ships nginx and system logs to **Loki** with low-cardinality labels
  (`host`, `app`, `severity`) for fast query-time filtering in Grafana.
- **SIEM** — **Wazuh** agents report file-integrity and security events to the Wazuh indexer
  (OpenSearch); **Grafana** reads it directly as a datasource alongside Prometheus and Loki,
  giving one pane for infra health, logs, and security signals.

This is the same heimdall-stack posture (CrowdSec + Wazuh/Loki/Prometheus) used across the other
CK production sites.

## Zero Trust Management Plane

Across every environment the rule is the same: **nothing administrative is reachable from the
public internet.** The CrowdSec LAPI, the observability UIs (Grafana/Prometheus/Alertmanager),
the Wazuh indexer, and all SSH live only on the **Tailscale mesh**, gated by tight tailnet
**ACLs** so each host can reach exactly the services it needs and no more. SSH is **key-based
only** — no password authentication, port 22 not published. Public ingress is limited to HTTPS
on the edge; everything else is **default-deny at the PVE host firewall**. Least privilege plus
full observability is the whole point — see [Trust Planes](#trust-planes).

## What This Buys Us

- **Minimal public attack surface** — one port (443), static files, no server-side code.
- **No public management plane** — SSH and the CrowdSec brain live behind Tailscale.
- **Automated, hands-off TLS** — DNS-01 renewals with no inbound exposure.
- **Trustworthy identity** — the same hardened production posture protects the host that serves
  the canonical GhostKellz public key (see [gpg.md](gpg.md)).
- **Resilient** — the site is fully reproducible from this repo with `npm run build`.
