# WashWise — Mobile (Expo / React Native)

## Current state (full marketplace app)

App flow: **rotating splash logo → welcome → login/signup → role-based main app.**

Customers get: Explore (browse/search laundry businesses, view details, book
with delivery/pickup choice, leave reviews after completion), Bookings
(track status, rate completed orders), Alerts (notifications), Settings.

Laundry owners get: Business (register/edit listings — hours, working days,
delivery, address), Orders (incoming bookings, advance status), Alerts,
Settings.

Both roles share: Settings hub (change password, delete account, Privacy
Policy / Terms of Service / Terms of Use — placeholder legal text, see
`src/legalContent.js`), and a persistent, editable backend connection
address.

Demo accounts (seeded automatically by the backend on first run):
- Customer: `customer@demo.com` / `password123`
- Laundry owner: `owner@demo.com` / `password123` (owns 3 seeded demo businesses)

The original counter/staff screens (Orders/Customers/Pricing — the shop-side
tool for walk-in customers) are still in the codebase under `src/screens/`
and `src/components/` (OrdersScreen, CustomersScreen, PricingScreen) but
aren't wired into `App.js`, since the app's focus is now the marketplace.
They're a separate, still-functional system you can re-attach behind a
"staff mode" screen later if useful.

### Previously-flagged simplifications — now resolved
- **Real map**: `src/components/MapView.js` renders an actual pannable/
  zoomable map (Leaflet.js + OpenStreetMap tiles) inside a `react-native-webview`.
  Deliberately **not** `react-native-maps` — that needs a custom native
  build (`eas build`/`expo run:android`), leaving Expo Go entirely, plus a
  Google Maps API key. This needs neither: no key, works in Expo Go as-is.
- **Reviewed tracking is now real**: `Booking.reviewed` on the backend,
  set when a review is submitted with that booking's id
  (`src/screens/MyBookingsScreen.js` passes `bookingId` to `submitReview`).
  Survives app restarts — no more local-state-only tracking.
- **Business hours now step in 15-minute increments**, not whole hours only
  (`BusinessFormModal.js`'s `TimeStepper`) — still zero new date-picker
  dependency, just finer-grained custom steppers.
- **Push notifications are wired end-to-end**: the app requests permission
  and registers an Expo push token (`src/notifications.js`) with the
  backend (`PATCH /api/auth/push-token`) on login; the backend sends a real
  push via Expo's free push API whenever an in-app notification is created
  (e.g. booking completed). **One real caveat**: Expo Go on Android no
  longer supports *receiving* remote push in recent SDKs (a Google Play
  Services restriction Expo can't work around inside the shared Expo Go
  client) — this works reliably on iOS Expo Go and on any future custom
  dev build; on Android Expo Go specifically, the push send will succeed
  server-side but may not visibly arrive. The in-app Alerts inbox always
  works regardless of platform.

## Logo & splash screen

The WashWise mark is a droplet with a spin-cycle swirl inside — generated
as an original design (`assets/logo-mark.png` for the blue-gradient screens,
plus `icon.png`/`adaptive-icon.png`/`splash-icon.png`/`favicon.png` derived
from it for the app icon and native splash). Swap any of these files for a
final logo whenever you have one — same filenames, same usage.

`src/screens/SplashScreen.js` runs a 3-stage animation over ~7 seconds:
entrance (scale/fade/slide in), a slow continuous spin, then a fade-out
before handing off to the Welcome screen. Adjust `ENTRANCE_MS`, `SPIN_MS`,
`EXIT_MS` at the top of that file to retime it.

## Design concept

## Home dashboard (Explore tab)

Rebuilt to match a shared UI reference: avatar + location header (real
device location via `expo-location`, reverse-geocoded to an area/city label
— falls back to a static label if permission is denied), a search bar that
switches into a 2-column browse/grid mode, quick-category service tiles,
a promo banner, and a horizontally-scrolling "Popular Laundry Nearby" rail.
Business cards now show a real photo, live-computed Open/Closed status
(from the business's actual hours), service tags, delivery badges, a
starting price, and real distance from your current location.

**Three things are deterministic display stand-ins, not real backend data**
(flagged since they might look like bugs otherwise):
- **Photos** — the backend doesn't store a photo per business, so
  `src/businessImages.js` assigns one of 13 real Pexels laundromat photos
  (free-to-use license, no attribution required) by business id.
- **Service tags** ("Wash & Fold", "Dry Cleaning", etc.) — the backend
  doesn't model which services each business offers, so
  `src/businessTags.js` assigns 1-2 from a fixed pool by business id.
- **Starting price** ("From ₵XX") — pricing in the backend is a single
  shared price list (from the counter-tool side), not per-business, so
  this is also id-derived for display purposes.

Open/Closed status and distance, by contrast, **are real** — computed live
from each business's actual `workingDays`/`openTime`/`closeTime` and from
your device's actual GPS coordinates via the haversine formula
(`src/businessHours.js`, `src/geo.js`).

Curved gradient-blue backgrounds, icon-badge pill inputs, and gradient pill
buttons (per the reference you shared) on the auth screens; the ticket/stamp
visual language (stamped status tracks) carried into booking status. Built
without a final UI direction for the marketplace screens (Explore, Bookings,
Business, Settings) — those use a plain card-based layout in the same color
system, ready to be restyled once you share more direction for them
specifically.

## Requirements
- Node.js 18+
- The [Expo Go](https://expo.dev/go) app on your phone, or an Android/iOS simulator
- The backend running and reachable from your phone (see networking note below)

## Setup

```bash
cd laundry-mobile
npm install
npx expo install --fix
npx expo start
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

## Connecting to your backend — the one real gotcha

Your phone is a separate device from your computer, so `http://localhost:8080`
does **not** point at your backend the way it does in a browser on the same
machine. On the Login screen, tap the "Connected to…" banner and set the
address to:

- **Physical phone (Expo Go):** your computer's LAN IP, e.g. `http://192.168.1.20:8080/api`
  (find it with `ipconfig` on Windows or `ifconfig`/`ipconfig getifaddr en0` on Mac).
  If your computer connects to the internet through your phone's hotspot,
  use the IP in that hotspot's subnet (often `172.20.10.x`) instead.
- **Android emulator:** `http://10.0.2.2:8080/api`
- **iOS simulator:** `http://localhost:8080/api` works fine here

The address is saved on-device, so you only need to set it once.

## Project structure

```
App.js                          splash -> welcome -> login/signup -> MainApp orchestration
src/
  api/client.js                  API context: base URL + auth token (persisted) + every request
  theme.js                       shared colors/fonts/spacing
  legalContent.js                 placeholder Privacy Policy / Terms text
  MainApp.js                      role-based bottom-tab shell (customer vs laundry owner)
  screens/
    SplashScreen.js                rotating/entrance/fade logo animation (~7s)
    WelcomeScreen.js                Get Started / I already have an account
    LoginScreen.js, SignupScreen.js
    ExploreScreen.js                customer: search/browse businesses
    BusinessDetailScreen.js          business info, map placeholder, reviews, Book Now
    MyBookingsScreen.js              customer: booking list, status track, review prompt
    MyBusinessScreen.js              owner: manage business listings
    OwnerBookingsScreen.js           owner: incoming orders, advance/cancel status
    NotificationsScreen.js           shared inbox
    SettingsScreen.js                shared hub
    OrdersScreen.js, CustomersScreen.js, PricingScreen.js   (original counter/staff tool, not wired into App.js)
  components/
    AuthBackground.js, IconPillInput.js, GradientButton.js, CheckRow.js, SlideFadeIn.js   (auth screens)
    BusinessCard.js, RatingStars.js, MapPlaceholder.js, StatusTrack.js   (marketplace display)
    BookingModal.js, ReviewModal.js, BusinessFormModal.js                (marketplace forms)
    SettingsRow.js, ScreenHeader.js, ChangePasswordModal.js, DeleteAccountModal.js, LegalTextModal.js   (settings)
    ApiSettingsBanner.js, ChipSelect.js, BottomTabBar.js                 (shared)
    NewOrderModal.js, PaymentModal.js, OrderTicket.js                    (original counter/staff tool)
```

## What's next

The app is functionally complete end-to-end against the backend. The
"Known simplifications" section above lists what's stubbed or simplified —
a real map (needs your Google Maps API key), push notifications, and the
reviewed-booking tracking are the main candidates for a follow-up pass.
Otherwise: send over your UI direction for the marketplace screens
(Explore/Business/Bookings/Settings) whenever you're ready and I'll restyle
them to match, the same way the auth screens were redone from your reference.


