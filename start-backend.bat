@echo off
echo ===================================
echo   AkFinance - Restart Backend
echo ===================================

echo.
echo [1/3] Stopping old backend on port 8080...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    taskkill /PID %%a /F >nul 2>&1
    echo Killed PID %%a
)

echo.
echo [2/3] Building backend (this takes ~30 seconds)...
cd /d E:\AkFinance\services\api
call mvn clean package -DskipTests -q
if errorlevel 1 (
    echo BUILD FAILED! Check errors above.
    pause
    exit /b 1
)
echo BUILD SUCCESS!

echo.
echo [3/3] Starting backend...
echo Backend will start on http://localhost:8080
echo Press Ctrl+C to stop.
echo.
call mvn spring-boot:run
pause
