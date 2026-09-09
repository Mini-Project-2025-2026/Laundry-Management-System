@echo off
title WashWise - Android APK Builder
color 0a

echo =======================================================
echo              WashWise Android APK Builder              
echo =======================================================
echo.
echo Project Account : @lokko577
echo Project Slug    : washwise
echo Build Target    : Standalone Installable Android APK (.apk)
echo.
echo Starting EAS Build process...
echo (If prompted "Generate a new Android Keystore?", press Enter for Yes)
echo.

cd /d "%~dp0washwise-mobile"
call npx eas-cli build -p android --profile preview

echo.
echo =======================================================
echo Build process finished!                                
echo Use the URL or QR code above to download WashWise.apk  
echo and install it directly on any Android phone.          
echo =======================================================
pause
