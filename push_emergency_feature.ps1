# ==============================================================================
# Aarogyam: Emergency Accident Feature & UI Brand Overhaul Commit Script
# Target Repository: https://github.com/Manaspingle/BuildX_027.git
# ==============================================================================

$ErrorActionPreference = "Stop"

Write-Host ">>> [1/4] Checking Git status..." -ForegroundColor Cyan
git status

Write-Host "`n>>> [2/4] Staging and committing modular updates..." -ForegroundColor Cyan

# Commit 1: Brand Assets, Config & Global Styles
git add public/aarogyam-logo.jpg index.html tailwind.config.js src/index.css
git commit -m "feat(brand): integrate official logo and establish brand palette (#00605F teal, #F48552 orange)"

# Commit 2: Multi-Language Support
git add src/context/LanguageContext.tsx src/App.tsx
git commit -m "feat(i18n): add multi-language system supporting English, Hindi, and Marathi"

# Commit 3: Types, City Restrictions, and Emergency Simulation Datasets
git add src/types/index.ts src/lib/constants.ts src/lib/mockData.ts src/pages/AIRecommendations.tsx
git commit -m "feat(emergency/data): add ambulance fleet, hospital triage data, and restrict cities to Mumbai, Pune, Nagpur"

# Commit 4: Emergency Accident Modal Component
git add src/components/EmergencyAccidentModal.tsx
git commit -m "feat(emergency): implement landing page emergency accident triage with 3-option flow and real-time hospital trigger"

# Commit 5: Landing Page & Navigation Overhaul
git add src/components/Navbar.tsx src/pages/LandingPage.tsx src/pages/AuthPage.tsx
git commit -m "feat(ui): revamp landing page with beeping emergency trigger, language switcher, and restricted registration"

Write-Host "`n>>> [3/4] Current Git Log summary:" -ForegroundColor Cyan
git log -n 6 --oneline

Write-Host "`n>>> [4/4] Pushing commits to GitHub (origin main)..." -ForegroundColor Cyan
git push origin main

Write-Host "`n>>> Successfully pushed all changes to GitHub!" -ForegroundColor Green
