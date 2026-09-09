@echo off
title WashWise - Stop Application Services
color 0c

echo =======================================================
echo          Shutting Down WashWise Application            
echo =======================================================
echo.

echo Stopping processes on port 8080 (Spring Boot Backend)...
powershell -Command "Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }" >nul 2>nul

echo Stopping processes on port 8081 (Frontend Metro Server)...
powershell -Command "Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }" >nul 2>nul

echo.
powershell -Command "Start-Sleep -Seconds 2" >nul 2>nul
exit
