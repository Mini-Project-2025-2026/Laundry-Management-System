# WashWise 🧺✨
### Next-Generation Smart Laundry Management & On-Demand Service Platform

[![Android APK](https://img.shields.io/badge/Android%20APK-Download%20v1.0.0-success?style=for-the-badge&logo=android)](https://expo.dev/artifacts/eas/0g1JtHb3c_O3K4Xz-3aBzCzw_gGU-dpT_D8yS0yMgCY.apk)
[![Spring Boot](https://img.shields.io/badge/Backend-Spring%20Boot%203-brightgreen?style=for-the-badge&logo=springboot)](washwise-backend)
[![React Native](https://img.shields.io/badge/Mobile-React%20Native%20%2F%20Expo-blue?style=for-the-badge&logo=expo)](washwise-mobile)

---

## 📱 Instant Download & Mobile Install

Anyone visiting this repository can directly download and install the **WashWise Android App** onto their physical Android device:

| Download Source | Direct Link |
| :--- | :--- |
| **🚀 Direct High-Speed APK Download** | [**Download WashWise.apk**](https://expo.dev/artifacts/eas/0g1JtHb3c_O3K4Xz-3aBzCzw_gGU-dpT_D8yS0yMgCY.apk) |
| **📦 GitHub Repository File** | [**WashWise.apk** (in repository root)](WashWise.apk) |
| **🔍 Cloud Build & QR Code** | [**Expo EAS Build Dashboard**](https://expo.dev/accounts/lokko577/projects/washwise/builds/2ec9a824-04a8-4ccd-a3d7-ed31f8ac563d) |

### 📲 How to Install on Android:
1. Tap the **[Download WashWise.apk](https://expo.dev/artifacts/eas/0g1JtHb3c_O3K4Xz-3aBzCzw_gGU-dpT_D8yS0yMgCY.apk)** link from your phone.
2. When the download completes, tap the file notification (or find `WashWise.apk` in your `Downloads` folder).
3. Tap **Install** *(if prompted, enable "Allow installation from unknown sources" in settings)*.
4. Open **WashWise**!

---

## 💻 1-Click Desktop Launcher (For Presentations & Demonstrations)

WashWise comes with a complete automated launcher for running the entire system on Windows laptops with **zero command line setup**:

* **To Start**: Double-click **`Launch-WashWise.bat`**
  - Automatically verifies Java and Node.js.
  - Starts the Spring Boot backend on port `8080`.
  - Boots the frontend and launches WashWise in a dedicated borderless standalone mobile frame.
* **To Stop**: Double-click **`Stop-WashWise.bat`**
  - Safely stops all background servers and frees ports `8080` and `8081`.
* **To Rebuild APK**: Double-click **`Build-Android-APK.bat`**
  - Triggers a new cloud APK compilation via Expo Application Services (EAS).

---

## 🏗️ System Architecture

```
washwise-app/
├── WashWise.apk          # Pre-compiled Standalone Android APK
├── Launch-WashWise.bat   # 1-Click Windows Full-Stack Launcher
├── Stop-WashWise.bat     # 1-Click Windows Graceful Process Stopper
├── Build-Android-APK.bat # 1-Click Cloud APK Build Script
│
├── washwise-backend/     # Spring Boot REST API (Java 17+, Maven, JPA/Hibernate, Security)
│   ├── src/main/java/com/washwise/
│   │   ├── config/       # Security, WebMvc, Database seeders
│   │   ├── controller/   # Auth, Orders, Businesses, Payments, Admin
│   │   ├── model/        # User, Order, Business, Service, Review
│   │   └── service/      # Business logic & Paystack payment integration
│   └── pom.xml
│
└── washwise-mobile/      # React Native / Expo Mobile Application
    ├── app/              # Screens & navigation (Customer & Business Owner modes)
    ├── components/       # UI components, interactive maps, receipt cards
    ├── services/         # API clients, auth storage, notifications
    ├── eas.json          # EAS cloud build configuration (APK build profile)
    └── app.json          # App manifest, permissions, package identifiers
```

---

## 🔑 Demo Login Credentials

The system automatically initializes and seeds demo accounts and 50+ localized laundry businesses:

| Role | Email | Password | Experience |
| :--- | :--- | :--- | :--- |
| **Customer** | `customer@demo.com` | `password123` | Clean light theme, nearby laundry discovery, booking, interactive tracking, Paystack checkout |
| **Business Owner** | `owner@demo.com` | `password123` | Premium navy dark theme, order management, status updates, catalog editing, revenue analytics |

---

## 💳 Payment Gateway & Testing

WashWise features end-to-end payment processing:
- **Paystack Integration**: Full support for Mobile Money (MTN, Vodafone/Telecel, AirtelTigo) and Debit/Credit Cards in GHS currency.
- **Built-in Sandbox Simulator**: Allows seamless offline and evaluation testing without real charges.
- **Live / Test Keys**: Configurable securely in `washwise-backend/.env` via `PAYSTACK_SECRET_KEY` with HMAC-SHA512 webhook signature verification.

---

## 🛠️ Manual Developer Quick Start

### 1. Backend (Java 17+ & Maven)
```bash
cd washwise-backend
mvn spring-boot:run
```
API runs on `http://localhost:8080/api`.

### 2. Mobile App (Node 18+ & npm)
```bash
cd washwise-mobile
npm install
npx expo start
```
Configure the API endpoint banner on the login screen to point to your backend IP (e.g. `http://192.168.x.x:8080/api`).

---

## 📄 License & Project Info
Developed for final year capstone & laundry management automation.
All rights reserved © 2025–2026.
