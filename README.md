<div align="center">

# Limpopo Connect

[![Deploy to GitHub Pages](https://github.com/Tshikwetamakole/Limpopo-Connect/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/Tshikwetamakole/Limpopo-Connect/actions/workflows/deploy-pages.yml)

An accessible, mobile‑first community web application connecting residents, local businesses, visitors, and opportunities across Limpopo Province, South Africa.

🌐 **Live Site**: https://limpopoconnect.site

</div>

---

## 🧭 Vision & Status

Limpopo Connect aims to become a unified digital hub for the province: discovery of local businesses, promotion of events, tourism enablement, and community storytelling. The current repository contains the **frontend (React + TypeScript)**, a basic Node proxy server, and infrastructure templates. Backend service endpoints referenced in older docs have been removed/refactored – Supabase integration is being introduced incrementally for auth and data.

> STATUS: Active development (early stage). Expect rapid iteration and occasional breaking changes.

## ✨ Feature Overview (Planned vs Current)

| Domain | Implemented | In Progress / Planned |
| ------ | ----------- | --------------------- |
| Authentication | Supabase client scaffolding | Role-based flows, session UI |
| Business Directory | Basic page route | Search, filtering, reviews |
| Events | Placeholder page | Calendar & registration |
| Marketplace | Placeholder page | Listings, transactions (future) |
| Tourism | Placeholder page | Attractions catalog |
| News | Placeholder page | Curated feed |
| Connections | Multiple themed connection pages | Matching & messaging |
| PWA | Manifest + service worker scaffold | Offline caching strategy |
| Accessibility | Semantic layout, Tailwind utilities | Automated a11y tests |

## 🛠️ Tech Stack

| Layer | Tools |
| ----- | ----- |
| UI | React 19, TypeScript, Tailwind CSS |
| Routing | react-router-dom v7 |
| Icons | lucide-react |
| State / Data | (Lightweight local state for now) |
| Auth / Backend Integration | Supabase JS Client (scaffold) |
| Build / Dev | Vite 7, TypeScript project refs |
| Testing | Vitest, @testing-library/react, JSDOM |
| Infra (IaC) | Azure Bicep modules in `infra/` |
| Deployment | GitHub Pages (static) via workflow badge above |
| Progressive Web App | `public/manifest.json`, `public/sw.js` |

## 📂 Project Structure (Current)

```
├── server.js                 # Lightweight Express proxy/server (if needed)
├── public/                   # Static assets (manifest, service worker)
├── src/
│  ├── App.tsx                # Root component
│  ├── main.tsx               # Entry point
│  ├── pages/                 # Route-level pages (directory, events, etc.)
│  ├── components/
│  │  └── layout/             # Layout primitives (Header, Footer, Layout)
│  ├── lib/
│  │  └── supabase.ts         # Supabase client factory
│  ├── assets/                # (Reserved for images/media)
│  └── setupTests.ts          # Vitest / RTL setup
├── infra/                    # Azure Bicep deployment modules
├── scripts/                  # Utility scripts
└── README.md
```

Legacy references to `limpopo-api/` (Azure Functions backend) remain in commit history but are not part of this repository snapshot.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm (bundled) – or adapt commands for pnpm/yarn

### 1. Clone & Install
```bash
git clone https://github.com/Tshikwetamakole/Limpopo-Connect.git
cd Limpopo-Connect
npm install
```

### 2. Environment Variables
Create a `.env.local` (or export shell vars) for optional Supabase auth:
```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_public_key
```
If these are absent the app still builds; Supabase-powered features will throw when invoked.

### 3. Run Dev Server
```bash
npm run dev
```
Open: http://localhost:5173

### 4. Build Production Bundle
```bash
npm run build
```
Preview locally:
```bash
npm run preview
```

## 🧪 Testing

Run the full test suite:
```bash
npm test
```

Example tests live in `src/components/layout/Header.test.tsx` and `src/auth/Login.test.tsx`.

Testing stack:
- Vitest (fast TS-aware test runner)
- React Testing Library + jsdom
- `setupTests.ts` for global test config

Planned additions:
- Coverage thresholds
- Accessibility (axe) checks
- Snapshot or visual regression harness

## 📜 Available Scripts

```bash
npm run dev             # Start Vite dev server
npm run build           # Type-check (tsc -b) then production build
npm run build:frontend  # Build only (skip separate type build step)
npm run preview         # Preview the production build locally
npm run typecheck       # TypeScript diagnostics only (no emit)
npm run lint            # ESLint static analysis
npm test                # Vitest test suite
npm run check           # Composite: lint + typecheck + tests
npm run deploy:gh-pages # Build & publish /dist to gh-pages branch
```

> Legacy API dev scripts were removed from `package.json` as the backend folder is no longer present.

## 🔐 Environment & Secrets

Current required at runtime: none (app renders static routes). Optional:

| Variable | Purpose | Required |
| -------- | ------- | -------- |
| `VITE_SUPABASE_URL` | Supabase project base URL | Optional |
| `VITE_SUPABASE_ANON_KEY` | Public anon key for client auth | Optional |

Never commit service role keys or private JWT secrets. For production, prefer build-time secrets via GitHub Actions + environment protection.

## 🌐 PWA Notes

- `public/manifest.json` defines name, icons, theme color
- `public/sw.js` placeholder for future offline caching strategy
- Future: asset pre-caching & runtime strategies (e.g., Workbox integration)

## 🧩 Design & UI

Uses Tailwind CSS utility-first approach. High-level palette (subject to refinement):
- Primary: `#2D5016` (Limpopo Green)
- Accent: `#FFD700` (Gold)
- Secondary: `#1E40AF` (Blue)

## 🏗️ Infrastructure (Infra-as-Code)

Azure Bicep modules in `infra/` include storage, key vault, and function scaffolding templates. These are forward-looking and may not all be actively deployed yet. See inline comments within each `.bicep` file.

## 🔒 Security

See `SECURITY.md` for disclosure policy & baseline practices. Planned improvements: dependency audit gating, security headers, and CSP tightening.

## 🤝 Contributing

Contributions welcome!
1. Fork & branch (`feat/<short-description>`)
2. Keep commits small & meaningful
3. Ensure `npm run lint && npm test && npm run build` succeed
4. Open PR with clear context / before-after screenshots if UI

### Coding Guidelines
- TypeScript strictness: keep types explicit for public exports
- Prefer functional components + hooks
- Keep components small & composable
- Avoid premature abstraction

## 🗺️ Roadmap (Excerpt)

- [ ] Integrate Supabase auth flows (login, register, reset)
- [ ] Business directory data model & search
- [ ] Events calendar & subscription
- [ ] Offline caching strategy
- [ ] Accessibility automated checks
- [ ] Theming & design tokens

## 📄 License

Released under the MIT License. See [LICENSE](./LICENSE).

## 🙏 Acknowledgements

Built for the vibrant communities of Limpopo Province — with a focus on inclusion, access, and local economic empowerment.

## 📬 Contact

| Channel | Details |
| ------- | ------- |
| Email | info@limpopoconnect.co.za |
| GitHub | https://github.com/Tshikwetamakole |

---

**Limpopo Connect** — Connecting Communities, Growing Together 🌍
