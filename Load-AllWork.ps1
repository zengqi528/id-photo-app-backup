# Load-AllWork.ps1
Write-Host "--- Antigravity Global Sync: LOADING ---" -ForegroundColor Cyan

# 1. Pull Latest Project
Write-Host "[1/3] Loading latest Project..." -ForegroundColor Yellow
cd "C:\Users\Master\.gemini\antigravity\scratch\id-photo-app"
git pull origin master
npm install

# 2. Pull Latest Skills
Write-Host "[2/3] Loading latest Skills..." -ForegroundColor Yellow
cd "C:\Users\Master\.agents\skills"
git pull origin master

# 3. Pull Latest Brain
Write-Host "[3/3] Loading latest Brain/History..." -ForegroundColor Yellow
cd "C:\Users\Master\.gemini\antigravity\brain\e1fe7e1d-3e1d-49dc-b1dc-b20c79fe90c7"
git pull origin master

Write-Host "--- ALL SYNCED! READY TO WORK ---" -ForegroundColor Green
Pause
