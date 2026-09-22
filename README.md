<div align="center">

# 🩸 Aarogyam — Blood & Organ Donor Network

**Connecting Life, One Match at a Time.**

A city-based platform that connects individual donors and hospitals for real-time, transparent, and priority-driven blood and organ allocation.

</div>

---

## Table of Contents

1. About the Project
2. Problem Statement
3. Key Features
4. System Architecture
5. Core Workflow
6. Gamification (Donor Engagement Engine)
7. Tech Stack
8. Project Structure
9. Getting Started
10. Environment Variables
11. Available Scripts
12. Roadmap
13. Contributing
14. Code of Conduct
15. License
16. Acknowledgments
17. Repository

---

## About the Project

**Aarogyam** is a web platform designed to close the gap between people who need blood or organs and the donors who can provide them — matched fast, fairly, and within the same city, since organs and blood have an extremely short viable transport window.

Individuals can register as donors (living blood donors or post-mortem organ pledgers), and hospitals can raise emergency requests that are instantly matched against an explainable scoring engine, dispatched to the best-fit donor, tracked through simulated logistics, and permanently logged with a cryptographic verification hash.

This project was built for a hackathon and is now open for community contributions to grow it into a production-ready system.

---

## Problem Statement

Organs and blood have an extremely short viable transport window, so allocation has to happen fast, fairly, and within the same city. Today:
- Individuals who need an organ often don't know where or how to find one.
- Hospitals in an emergency have no fast, transparent way to locate and reach eligible donors.
- Existing donor registries are often static lists with no real-time matching or accountability.

**Aarogyam** solves this with an instant, explainable matching engine for hospitals and a simple, engaging registration experience for individuals.

---

## Key Features

- 🧍 **Individual registration** — sign up as a donor, pledge organs for post-mortem donation, and register as a living blood donor
- 🏥 **Hospital emergency requests** — create urgent requests for a specific blood type or organ
- ⚡ **Matching Engine** — live, explainable scoring of eligible donors on compatibility, proximity, and urgency
- 📲 **Emergency Dispatch (simulated)** — top-ranked donor alerted via a simulated WhatsApp/SMS message, with automatic fallback to the next donor
- 🚑 **Live Logistics View** — auto-generated route with an animated transport vehicle and simulated temperature telemetry
- 🔐 **Transparency Log** — every allocation recorded with a SHA-256 verification hash to prove priority-based, not favoritism-based, allocation
- 🤖 **AI Recommendations** — rule-based insight cards for donors (tier progress, high-demand blood types) and hospitals (seasonal demand trends)
- 📊 **Reports Page** — charts covering donations over time, fulfillment rate, and city-wise donor distribution
- 🗺️ **Nearby Hospital Search** — Google Maps-based lookup for cross-hospital transfer requests when local supply is short
- 🏆 **Gamification** — donor levels, unlockable badges, and a city leaderboard to drive repeat donations

<details>
<summary><strong>▸ Full page list</strong></summary>

- Landing Page
- Login / Signup (Individual & Hospital)
- Individual Dashboard
- Organ Donation Registration
- Hospital Dashboard
- Create Emergency Request
- Matching Engine
- Emergency Dispatch Simulation
- Live Logistics View
- Transparency Log / Verification
- AI Recommendations
- Reports
- Nearby Hospital Search

</details>

---

## System Architecture

![Architecture Diagram](./architecture-diagram.svg)

---

## Core Workflow

![Workflow Diagram](./workflow-diagram.svg)

<details>
<summary><strong>▸ Click to expand the full step-by-step workflow</strong></summary>

1. **Hospital Request** — Hospital logs in and creates an urgent request (e.g. O- blood or a kidney match).
2. **Matching Engine** — All eligible donors in the same city are scored live on compatibility, proximity, and urgency; the formula is shown on-screen for transparency.
3. **Emergency Dispatch (simulated)** — The top-ranked donor receives a simulated WhatsApp/SMS alert. If declined, the system automatically cascades to the next-ranked donor.
4. **Live Logistics View** — Once accepted, an auto-generated route is shown with an animated transport vehicle and simulated temperature telemetry.
5. **Transparency Log** — The completed allocation is recorded with a SHA-256 verification hash, proving it followed medical priority rather than favoritism.

</details>

---

## Gamification — Donor Engagement Engine

![Gamification Tiers](./gamification-tiers.svg)

<details>
<summary><strong>▸ Why gamification?</strong></summary>

Donor drop-off after a single donation is one of the biggest real-world problems for blood/organ networks. Aarogyam counters this with:
- **Donor Levels** (Bronze → Silver → Gold → Platinum Lifesaver)
- **Unlockable badges** for milestones (e.g. "First Pledge", "Blood Hero x3", "Universal Donor")
- **City-wise leaderboard** for friendly competition
- **Progress bars and micro-animations** on every pledge/donation action

This is the platform's retention engine — it directly targets repeat engagement, not just one-time sign-ups.

</details>

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | React + TypeScript | Component-based UI with type safety |
| Styling | Tailwind CSS | Fast, consistent styling and easy theming |
| Animation | Framer Motion | Live scoring counters, vehicle movement, badge unlocks |
| Auth & Database | Firebase (Auth + Firestore) | Serverless auth and real-time listeners power the live matching and logistics views |
| Maps | Google Maps JavaScript API | Real map rendering, distance calculation, route + vehicle simulation |
| Charts | Recharts | Reports and analytics visualizations |
| Verification | SHA-256 (Web Crypto API / crypto-js) | Real cryptographic hashing for the transparency log (not a distributed blockchain) |
| Icons | Lucide React | Consistent icon set |

---

## Project Structure

```
aarogyam/
├── public/                  # Static assets
├── src/
│   ├── assets/               # Images, icons, SVGs
│   ├── components/           # Reusable UI components
│   ├── pages/                 # Route-level pages (Landing, Dashboard, Matching Engine, etc.)
│   ├── features/
│   │   ├── auth/               # Login/signup logic
│   │   ├── matching-engine/     # Scoring algorithm
│   │   ├── dispatch/            # Simulated alert logic
│   │   ├── logistics/           # Route + telemetry simulation
│   │   ├── verification/        # SHA-256 hashing utilities
│   │   └── gamification/        # Levels, badges, leaderboard logic
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Firebase config, Maps config, utilities
│   ├── types/                  # TypeScript types/interfaces
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── package.json
├── tailwind.config.js
├── LICENSE
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- A Firebase project (Auth + Firestore enabled)
- A Google Maps API key with the Maps JavaScript API and Distance Matrix API enabled

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Aarogyam

# Install dependencies
npm install

# Copy the example environment file and fill in your keys
cp .env.example .env

# Start the development server
npm run dev
```

The app should now be running at `http://localhost:5173` (or whichever port your dev server prints).

---

## Environment Variables

Create a `.env` file in the project root with the following:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

> Never commit your `.env` file. `.env.example` should be kept in the repo with placeholder values for contributors.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs the app in development mode |
| `npm run build` | Builds the app for production |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs the linter across the codebase |
| `npm run format` | Formats code with Prettier |

---

## Roadmap

- [ ] Real WhatsApp/SMS integration via Twilio or a similar provider
- [ ] Real-time GPS tracking for organ transport vehicles
- [ ] ML-based demand forecasting to replace rule-based AI recommendations
- [ ] Integration with government/national organ registries
- [ ] Inter-city transport support via cold-chain logistics partners
- [ ] Multi-language support for wider accessibility
- [ ] Automated test coverage (unit + integration)
- [ ] Accessibility (WCAG) audit and improvements

Have an idea not listed here? Open an issue with the `enhancement` label.

---

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. **Fork** the repository
2. **Create your feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit your changes** using a clear, conventional message
   ```bash
   git commit -m "feat: add proximity-based donor sorting"
   ```
4. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request** against the `main` branch, describing what you changed and why

### Guidelines

- Keep pull requests focused on a single feature or fix — smaller PRs are reviewed faster.
- Follow the existing code style (run `npm run lint` and `npm run format` before committing).
- Write clear commit messages, ideally following the Conventional Commits style (`feat:`, `fix:`, `docs:`, `refactor:`, etc.).
- If you're adding a new feature, briefly describe it in your PR and update this README if relevant.
- For larger changes, please open an issue first to discuss what you'd like to change.
- Be respectful and constructive in code reviews and discussions.

### Good first issues

If you're new to the project, look for issues tagged `good first issue` — these are scoped to be approachable without deep context on the whole codebase. Good starting points include:
- Wiring up a real Twilio integration behind a feature flag
- Adding form validation to the signup pages
- Improving mobile responsiveness on the dashboard
- Adding unit tests for the matching engine's scoring function

---

## Code of Conduct

This project follows a standard Contributor Code of Conduct. Be kind, be respectful, and assume good intent. Harassment or discriminatory language/behavior of any kind will not be tolerated. Consider adopting a standard contributor covenant as a starting point if a `CODE_OF_CONDUCT.md` file doesn't yet exist in this repo.

---

## License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## Acknowledgments

- Built as a hackathon submission under the **Healthcare** theme
- Inspired by real gaps in blood/organ donation infrastructure in emergency care
- Thanks to every contributor who helps take this from a hackathon prototype to something deployable

---

## Repository

`https://github.com/Manaspingle/BuildX_027`

