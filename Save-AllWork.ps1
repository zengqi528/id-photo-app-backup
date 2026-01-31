# Save-AllWork.ps1
Write-Host "--- Antigravity Global Sync: SAVING ---" -ForegroundColor Cyan

# 1. Sync Current Project
Write-Host "[1/3] Syncing Main Project..." -ForegroundColor Yellow
cd "C:\Users\Master\.gemini\antigravity\scratch\id-photo-app"
git add .
git commit -m "Global sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push origin master

# 2. Sync Skills
Write-Host "[2/3] Syncing Skills..." -ForegroundColor Yellow
cd "C:\Users\Master\.agents\skills"
git add .
git commit -m "Skills sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push origin master

# 3. Sync Brain (Tasks/History)
Write-Host "[3/3] Syncing Brain/Context..." -ForegroundColor Yellow
cd "C:\Users\Master\.gemini\antigravity\brain\e1fe7e1d-3e1d-49dc-b1dc-b20c79fe90c7"
git add .
git commit -m "Brain sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push origin master

Write-Host "--- ALL DONE! Your entire work environment is on GitHub ---" -ForegroundColor Green
Pause
