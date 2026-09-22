# 🩸 Aarogyam (आरोग्यम्)

> **Empowering Immediate Emergency Accident Response & Ethical Organ & Blood Allocation across Maharashtra.**

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployment%20Ready-black?logo=vercel)](https://vercel.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Executive Overview

**Aarogyam** is a next-generation healthcare coordination ecosystem engineered for **Maharashtra (Mumbai, Pune, and Nagpur)**. It bridges the critical minutes between roadside emergency accidents, patient triage, ambulance mobilization, hospital trauma bay preparation, and lifesaving blood/organ allocation.

Built with real-time responsiveness, bilingual support (**English, हिन्दी, मराठी**), and a cryptographic transparency ledger, Aarogyam ensures **zero favoritism**, **instant dispatch (< 3 minutes)**, and seamless **multi-hospital casualty distribution**.

---

## 🚀 Key Modules & Capabilities

### 1. 🚨 Roadside Accident Emergency Triage & Multi-Patient Allocation
- **Zero-Login Emergency Dispatch**: Any bystander or Good Samaritan can trigger an emergency triage without logging in.
- **Multiple Patient Distribution**: Bystanders can select the number of accident victims (1, 2, 3, 4, 5, 8). If the nearest hospital has limited trauma beds, Aarogyam's allocation engine automatically reserves all available beds at the primary center and re-routes overflow victims to the next nearest accredited hospital in the same city.
- **Dedicated Nagpur Ambulance Fleet Direct-Dialing**: Instant, one-touch clickable telephone dialing (`tel:`) to verified ambulances:
  - **Ambulance 1**: `+91 9067375860`
  - **Ambulance 2**: `+91 8530779934`
- **City Isolation**: Strict geographic boundaries ensuring users and hospitals in **Nagpur, Mumbai, or Pune** only interact with local fleets, trauma beds, and navigation corridors.

### 2. 🏥 Hospital Command Center & Live Casualty Alert Banner
- **Real-Time Casualty Broadcast**: When an emergency incident is triggered by a bystander, all allocated hospitals receive an instant, pulsating casualty notification banner with:
  - Incident Token ID.
  - Number of victims allocated.
  - Estimated arrival time (ETA) and trauma bay preparation instructions.
  - One-click **"Acknowledge & Ready Trauma Bay"** and **"Mark Victims Received"** status controls.
- **Emergency Demand Requests**: Submit instant matching requests for critical blood units (Whole Blood, PRBC, Platelets, FFP) and organs.
- **Pre-registered Mock Hospital Accounts**: Quick access chips for immediate testing:
  - `gmc.nagpur@aarogyam.org` (GMC Nagpur)
  - `kingsway.nagpur@aarogyam.org` (Kingsway Hospitals Nagpur)
  - `kem.mumbai@aarogyam.org` (KEM Hospital Mumbai)
  - `sassoon.pune@aarogyam.org` (Sassoon General Hospital Pune)

### 3. 🌐 Multilingual Accessibility & UI/UX
- **Full Dashboard Translation**: Both the Hospital Portal and Donor Portal seamlessly translate all UI labels, stats, badges, and action tables across **English, Hindi (हिन्दी), and Marathi (मराठी)**.
- **Optimized Devanagari Typography**: Relaxed leading and adjusted tracking prevent upper/lower vowel matras from clipping on mobile and desktop viewports.
- **Landing Page Language Switcher**: Centrally placed on the Landing Page header for quick access by citizens.
- **Dark & Light Mode**: Accessible via the navigation bar, persisting user preferences across sessions.
- **Inspiring Hero Showcase**: Photo gallery spotlighting dedicated medical doctors, blood donation heroes, volunteer helpers, and green corridor trauma logistics.

### 4. 🫀 Posthumous Organ Pledge Registry & Donor Card
- **Digital Consent Architecture**: Individuals can legally pledge organs (Kidneys, Liver, Heart, Lungs, Corneas, Pancreas) under the Transplantation of Human Organs Act (THOA).
- **Downloadable Donor Card**: Digital card with unique Donor ID and verifiable QR code for rapid on-site emergency verification.

### 5. ⚡ Explainable AI Matching Engine
- Multi-factor algorithmic scoring evaluates candidate compatibility using:
  - **Biological Compatibility (50%)**: ABO/Rh blood matching and antigen compatibility.
  - **Geographic Proximity (30%)**: Haversine distance-decay metric prioritizing local donors to minimize transit ischaemia time.
  - **Reliability & Availability (20%)**: Historical donation frequency and emergency response score.

### 6. 🔒 Cryptographic Transparency Ledger
- **SHA-256 Hashed Audit Trail**: Every match and bed allocation generates an immutable cryptographic proof (sha256(request_id + donor_id + timestamp + salt)).
- **Public Verifiability**: Eliminates corruption, VIP queue-jumping, and black-market organ trading by offering a verifiable hash ledger.

### 7. 🚚 Simulated Cold-Chain Telemetry & Green Corridors
- Real-time dispatch status tracking, temperature alerts (maintaining ^\circ\text{C} - 6^\circ\text{C}$ for organs and blood), and transit ETA simulation.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework**: [React 18](https://react.dev/) + [Vite 7](https://vitejs.dev/)
- **Programming Language**: [TypeScript](https://www.typescriptlang.org/) (Strict type checking, 0 errors)
- **Styling & UI**: [Tailwind CSS 3.4](https://tailwindcss.com/) + [Framer Motion 13](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router DOM v7](https://reactrouter.com/)
- **Backend / Storage**: [Firebase 11](https://firebase.google.com/) (Auth & Cloud Firestore) with automatic local memory/demo fallback
- **Cryptography**: Native Web Crypto API (SHA-256)
- **Deployment Platform**: [Vercel](https://vercel.com/) (SPA configured via ercel.json)

---

## 📁 Project Structure

`
BuildX_027/
├── public/                     # Static assets (logo, favicon)
├── src/
│   ├── components/             # Reusable UI & Modal components
│   │   ├── EmergencyAccidentModal.tsx # Multi-patient emergency triage & dispatch
│   │   ├── Navbar.tsx          # Nav with Dark/Light toggle
│   │   └── Layout.tsx          # Core application layout wrapper
│   ├── context/                # Global state providers
│   │   ├── AuthContext.tsx     # Role-based auth (Hospital / Donor / Bystander)
│   │   ├── LanguageContext.tsx # English, Hindi, and Marathi translation engine
│   │   └── ThemeContext.tsx    # Light / Dark mode persistence
│   ├── lib/                    # Business logic & utilities
│   │   ├── compatibility.ts    # Medical matching & Haversine distance
│   │   ├── constants.ts        # Blood types, organ constants, levels
│   │   ├── firebase.ts         # Firebase initialization
│   │   ├── firebaseDb.ts       # Firestore & emergency incident broadcast
│   │   ├── hash.ts             # SHA-256 cryptographic verification
│   │   └── mockData.ts         # Hospitals, donors, ambulances, testimonials
│   ├── pages/                  # Views and dashboards
│   │   ├── LandingPage.tsx     # Showcase, emergency trigger, stats, and reviews
│   │   ├── AuthPage.tsx        # Login & Signup with quick-fill chips
│   │   ├── HospitalDashboard.tsx # Trauma command center & casualty banner
│   │   ├── IndividualDashboard.tsx # Donor progression, badges, leaderboard
│   │   ├── NearbyHospitals.tsx # City hospital locator & cold-chain transfers
│   │   ├── MatchingEngine.tsx  # Multi-variable compatibility engine
│   │   ├── EmergencyDispatch.tsx # Cold-chain tracking & telemetry
│   │   ├── OrganPledge.tsx     # Organ pledge registry & digital ID card
│   │   └── TransparencyLog.tsx # Cryptographic public ledger
│   ├── types/                  # TypeScript interfaces and data models
│   ├── App.tsx                 # Route declarations & providers
│   ├── main.tsx                # Application root mount
│   └── index.css               # Global Tailwind CSS definitions
├── vercel.json                 # Vercel SPA routing rewrite rules
├── package.json
└── tsconfig.json
`

---

## 🚦 Getting Started Locally

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm or pnpm

### Installation

1. **Clone the repository:**
   `ash
   git clone https://github.com/Manaspingle/BuildX_027.git
   cd BuildX_027
   `

2. **Install dependencies:**
   `ash
   npm install
   `

3. **Run TypeScript check:**
   `ash
   npm run typecheck
   `

4. **Launch development server:**
   `ash
   npm run dev
   `
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for production:**
   `ash
   npm run build
   `

---

## ☁️ Deployment on Vercel

The project includes [ercel.json](./vercel.json) pre-configured with SPA route rewriting rules to prevent 404 errors on direct URL navigations:

`json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
`

### Steps to Deploy:
1. Push your latest code to GitHub:
   `powershell
   .\push_commits.ps1
   `
2. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import the BuildX_027 repository.
4. Select **Vite** as the framework preset (Build Command: 
pm run build, Output Directory: dist).
5. Click **Deploy**.

---

## 👥 Demo Credentials (One-Click Testing)

You can log in directly using the quick-fill chips on the /auth page, or enter:

| Role | Name / Facility | Email | City |
| :--- | :--- | :--- | :--- |
| **Hospital** | Kingsway Hospitals | kingsway.nagpur@aarogyam.org | Nagpur |
| **Hospital** | Government Medical College (GMC) | gmc.nagpur@aarogyam.org | Nagpur |
| **Hospital** | KEM Hospital | kem.mumbai@aarogyam.org | Mumbai |
| **Hospital** | Sassoon General Hospital | sassoon.pune@aarogyam.org | Pune |
| **Individual Donor** | Rajesh Kumar Sharma (O-) | ajesh.sharma@example.com | Nagpur |

*(All demo accounts use password: password123)*

---

## 📜 Good Samaritan & Legal Compliance
Aarogyam adheres to:
- **Good Samaritan Law (India)**: Protects bystanders reporting roadside accidents from civil and criminal liability.
- **THOA (Transplantation of Human Organs Act, 1994 & Amendments)**: Ensures ethical, verifiable, and voluntary posthumous pledges with digital recordkeeping.
- **NOTTO / ROTTO / SOTTO Guidelines**: Comports with national and state organ and tissue transplant organization standards.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
