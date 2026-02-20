Write-Host "=== AkFinance Launcher ===" -ForegroundColor Cyan

# 1. Docker
Write-Host "[1/3] Starting Docker DB..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\infra\docker"
docker compose up -d
Start-Sleep -Seconds 3

# 2. Kill port 8080
Write-Host "[2/3] Freeing port 8080..." -ForegroundColor Yellow
$pids = (Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue).OwningProcess | Sort-Object -Unique
foreach ($p in $pids) { Stop-Process -Id $p -Force -ErrorAction SilentlyContinue }
Start-Sleep -Seconds 2

# 3. Backend in new window
Write-Host "[3/3] Starting backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\AkFinance\services\api'; mvn spring-boot:run"

Write-Host "Waiting 25s for backend to start..." -ForegroundColor Gray
Start-Sleep -Seconds 25

# 4. Frontend in new window
Write-Host "[4/3] Starting frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'E:\AkFinance\apps\web'; npm run dev"

Start-Sleep -Seconds 5
Write-Host ""
Write-Host "=== READY ===" -ForegroundColor Green
Write-Host "Open: http://localhost:5173" -ForegroundColor Cyan
Start-Process "http://localhost:5173"
