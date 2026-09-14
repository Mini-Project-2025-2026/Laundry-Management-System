@echo off
title WashWise - Full Stack Desktop Launcher
color 0b

echo =======================================================
echo          WashWise Laundry Management System            
echo      Full-Stack Standalone Application Launcher       
echo =======================================================
echo.

set ROOT_DIR=%~dp0
cd /d "%ROOT_DIR%"

:: 1. Verify Java Installation
where java >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Java is not installed or not in PATH!
    echo Please ensure Java 17+ is installed.
    pause
    exit /b 1
)

:: 2. Verify Node Installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: 3. Check if Backend JAR exists, build if needed
if not exist "%ROOT_DIR%washwise-backend\target\washwise-backend-1.0.0.jar" (
    echo [1/3] Backend JAR not found. Packaging executable JAR with Maven...
    cd /d "%ROOT_DIR%washwise-backend"
    call mvn clean package -DskipTests
    cd /d "%ROOT_DIR%"
)

:: 4. Start Backend Server (if not already running on port 8080)
echo [1/3] Checking Spring Boot Backend on port 8080...
powershell -Command "$client = New-Object System.Net.Sockets.TcpClient; try { $client.Connect('127.0.0.1', 8080); exit 0 } catch { exit 1 }" >nul 2>nul
if %errorlevel% equ 0 (
    echo       Backend is already running on port 8080.
) else (
    echo       Starting Spring Boot Backend server in background...
    start "WashWise Backend Server (Port 8080)" /d "%ROOT_DIR%washwise-backend" /min java -jar "%ROOT_DIR%washwise-backend\target\washwise-backend-1.0.0.jar"
    
    echo       Waiting for backend to boot up...
    :wait_backend
    timeout /t 2 /nobreak >nul
    powershell -Command "$client = New-Object System.Net.Sockets.TcpClient; try { $client.Connect('127.0.0.1', 8080); exit 0 } catch { exit 1 }" >nul 2>nul
    if %errorlevel% neq 0 goto wait_backend
    echo       Backend started successfully!
)

:: 5. Start Mobile / Web Metro Server (if not already running on port 8081)
echo [2/3] Checking Frontend Server on port 8081...
powershell -Command "$client = New-Object System.Net.Sockets.TcpClient; try { $client.Connect('127.0.0.1', 8081); exit 0 } catch { exit 1 }" >nul 2>nul
if %errorlevel% equ 0 (
    echo       Frontend server is already running on port 8081.
) else (
    echo       Starting Expo Web server in background...
    start "WashWise Frontend Server (Port 8081)" /d "%ROOT_DIR%washwise-mobile" /min cmd /c "cd /d \"%ROOT_DIR%washwise-mobile\" && npx.cmd expo start --web"
    
    echo       Waiting for frontend to bundle...
    :wait_frontend
    timeout /t 2 /nobreak >nul
    powershell -Command "$client = New-Object System.Net.Sockets.TcpClient; try { $client.Connect('127.0.0.1', 8081); exit 0 } catch { exit 1 }" >nul 2>nul
    if %errorlevel% neq 0 goto wait_frontend
    echo       Frontend started successfully!
)

:: 6. Launch Standalone Native Window (Edge or Chrome App Mode)
echo [3/3] Launching WashWise in Standalone Desktop App Window...

set APP_URL=http://localhost:8081
set EDGE_PATH="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not exist %EDGE_PATH% set EDGE_PATH="C:\Program Files\Microsoft\Edge\Application\msedge.exe"

set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist %CHROME_PATH% set CHROME_PATH="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

if exist %EDGE_PATH% (
    start "" %EDGE_PATH% --app=%APP_URL% --window-size=430,932 --app-id=washwise-app
) else if exist %CHROME_PATH% (
    start "" %CHROME_PATH% --app=%APP_URL% --window-size=430,932 --app-id=washwise-app
) else (
    start %APP_URL%
)

echo.
echo =======================================================
echo          WashWise is now running! Enjoy your demo.    
echo      To shut down all services, run Stop-WashWise.bat  
powershell -Command "Start-Sleep -Seconds 3" >nul 2>nul
exit
