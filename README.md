# WashWise

This zip contains both halves of the app:

```
washwise-app/
  washwise-backend/    Spring Boot API (Java) — run this first
  washwise-mobile/     Expo / React Native app — run this second
```

## Quick start

**1. Backend** (needs Java 17+ and Maven):
```
cd washwise-backend
mvn spring-boot:run
```
Wait for "Started WashWiseApplication". It runs on port 8080 with an
in-memory database, seeded automatically with 50+ demo laundry businesses
and demo accounts (`customer@demo.com` / `owner@demo.com`, both
`password123`). See `washwise-backend/README.md` for full API docs.

**2. Mobile app** (needs Node.js 18+ and the Expo Go app on your phone):
```
cd washwise-mobile
npm install
npx expo install --fix
npx expo start
```
Scan the QR code with Expo Go. Do **not** press `w` / open it in a browser —
this app targets iOS/Android via Expo Go only; the map and a few other
pieces aren't built for the web preview and will error there.

On first launch, tap the "Connected to…" banner on the Login screen and
point it at your computer's LAN IP (not `localhost` — your phone is a
separate device from your computer). See `washwise-mobile/README.md` for
full details, including simulator vs. physical-device addressing.

## Notes
- Both folders are otherwise independent projects — the backend has no
  dependency on the mobile app's code, and vice versa. Only the running
  backend's address (configured in-app) connects them.
- Each subfolder has its own more detailed README with the full feature
  list, project structure, and known simplifications.
- The mobile app requests location permission (for the home dashboard's
  "nearby" distances) and notification permission (for push) — both are
  optional; the app works with either denied, just with fallback text/no
  push.
- Log in as owner@demo.com to see the dark-navy owner dashboard (Business/
  Orders tabs); customer@demo.com sees the light-themed customer side.
- Paystack test checkout is available from customer bookings. Set
  `PAYSTACK_SECRET_KEY` in the backend environment before using it; never put
  the secret key in the mobile `.env`.
