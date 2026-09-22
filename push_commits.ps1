# ==============================================================================
# Aarogyam: Modular Feature-by-Feature Git Commit and Push Script
# Target Repository: https://github.com/Manaspingle/BuildX_027.git
# ==============================================================================

Continue = "Stop"
 = "https://github.com/Manaspingle/BuildX_027.git"

Write-Host ">>> [1/4] Checking Git repository status..." -ForegroundColor Cyan

# Stage and commit Vercel configuration
git add vercel.json
git commit -m "chore(deploy): add vercel.json rewrite rules for SPA client-side routing"

# Stage and commit ThemeContext and dark mode support
git add src/context/ThemeContext.tsx tailwind.config.js
git commit -m "feat(theme): add Dark/Light mode theme provider with localStorage persistence"

# Stage and commit Multilingual translations
git add src/context/LanguageContext.tsx
git commit -m "feat(i18n): expand full Hindi and Marathi translations for hospital and donor dashboards"

# Stage and commit Navigation bar updates
git add src/components/Navbar.tsx
git commit -m "feat(navbar): relocate language switcher to landing page and add dark mode toggle"

# Stage and commit Authentication enhancements
git add src/context/AuthContext.tsx src/pages/AuthPage.tsx
git commit -m "feat(auth): add one-click login quick-fill chips for GMC, Kingsway, KEM, and Sassoon hospitals"

# Stage and commit Mock Data and Nagpur ambulances
git add src/lib/mockData.ts
git commit -m "feat(data): add Kingsway Hospitals Nagpur and verified Nagpur ambulance contacts"

# Stage and commit Incident data layer
git add src/types/index.ts src/lib/firebaseDb.ts
git commit -m "feat(models): add EmergencyIncident data models and real-time casualty broadcast listeners"

# Stage and commit Emergency Accident Modal
git add src/components/EmergencyAccidentModal.tsx
git commit -m "feat(emergency): implement multi-patient triage, bed allocation fallback, and modal scroll fix"

# Stage and commit Landing Page enhancements
git add src/pages/LandingPage.tsx
git commit -m "feat(landing): replace redundant SOS buttons with doctor and donor photo showcase and Devanagari font fix"

# Stage and commit Hospital Dashboard live alerts
git add src/pages/HospitalDashboard.tsx
git commit -m "feat(dashboard/hospital): implement real-time casualty alert banner with bay prep actions"

# Stage and commit Donor Dashboard enhancements
git add src/pages/IndividualDashboard.tsx
git commit -m "feat(dashboard/donor): implement multilingual support and responsive dark mode"

# Stage and commit Nearby Hospitals single-city isolation
git add src/pages/NearbyHospitals.tsx
git commit -m "feat(network): enforce strict city isolation for hospital search and cold-chain transfers"

# Stage and commit Application routing entry
git add src/App.tsx
git commit -m "refactor(app): wrap application root in ThemeProvider and clean routing providers"

# Stage and commit Documentation
git add README.md
git commit -m "docs: add comprehensive architecture overview, feature breakdown, and Vercel deployment guide"

Write-Host ">>> [2/3] All changes committed. Pushing to GitHub ()..." -ForegroundColor Cyan
git push origin main

Write-Host ">>> [3/3] Success! All updates pushed to GitHub." -ForegroundColor Green
