@echo off
setlocal
title Push WashWise to GitHub
cd /d "%~dp0"

echo ========================================================
echo    WashWise - Push Full Project to GitHub
echo ========================================================
echo.
echo Target Remote Repository:
git remote -v
echo.
echo Commits to be pushed:
git log origin/main..HEAD --oneline
echo.
echo --------------------------------------------------------
echo Uploading project files, launchers, and WashWise.apk...
echo (Uploading the 78 MB APK file may take 1-2 minutes)
echo --------------------------------------------------------
echo.
git push origin main --progress

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo    [SUCCESS] Project successfully pushed to GitHub!
    echo ========================================================
    echo.
    echo Anyone visiting your GitHub repository can now access:
    echo   * WashWise.apk (Direct installable Android app)
    echo   * Launch-WashWise.bat (1-Click Windows desktop launcher)
    echo   * Stop-WashWise.bat & Build-Android-APK.bat
    echo   * Complete Spring Boot Backend and React Native codebase
    echo.
) else (
    echo.
    echo ========================================================
    echo    [NOTICE] Push requires GitHub Authentication
    echo ========================================================
    echo If a GitHub sign-in window or browser opened:
    echo   1. Sign in to your GitHub account and click 'Authorize'.
    echo   2. If prompted for password, use a GitHub Personal Access Token (PAT).
    echo.
)

echo.
pause
