# WashWise — Backend API

A Spring Boot REST API for WashWise, a laundry marketplace app. Covers two layers:

1. **Core counter/staff features** (the original shop-side tool): Customer Management, Order Management, Laundry Item Management, Pricing Management (automatic cost calc + discounts), Payment System (partial/full payments, receipts, history), and Order Tracking (Received → Washing → Drying → Ironing → Ready → Delivered).
2. **Marketplace layer** (customers browsing/booking laundries, laundry owners listing businesses) — see the dedicated section further down.

## Tech Stack
- Java 17, Spring Boot 3.3 (Web, Data JPA, Validation, Security)
- H2 in-memory database by default (zero setup — just run it)
- MySQL connector included and ready to switch to (see `application.properties`)
- JWT auth (jjwt) for the marketplace layer
- Lombok for boilerplate reduction

## Requirements
- Java 17+ (`java -version`)
- Maven 3.8+ (or use the included `mvnw` if you add a wrapper — see note below)

## Running It

```bash
cd washwise-backend
mvn spring-boot:run
```

The API starts on **http://localhost:8080**. A default price list plus demo laundry
businesses/accounts are seeded automatically on first run (see `DataSeeder.java`).
An H2 console is available at **http://localhost:8080/h2-console**
(JDBC URL: `jdbc:h2:mem:laundrydb`, user `sa`, no password) so you can inspect the
tables while testing.

> Note: this project doesn't ship the Maven Wrapper binary (`mvnw`/`mvnw.cmd`) since it's a
> non-text file. If you don't have Maven installed locally, run `mvn -N io.takari:maven:wrapper`
> once inside the project folder to generate it, or install Maven directly.

## Switching to MySQL

1. Install MySQL and create nothing manually — the app can auto-create the DB.
2. In `src/main/resources/application.properties`, comment out the H2 block and
   uncomment the MySQL block, then set your username/password.
3. Restart the app. Tables are created automatically via `spring.jpa.hibernate.ddl-auto=update`.

## API Reference

### Customers
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/customers` | Register a new customer |
| GET | `/api/customers` | List all customers |
| GET | `/api/customers?search=keyword` | Search by name, phone, or email |
| GET | `/api/customers/{id}` | Get one customer |
| PUT | `/api/customers/{id}` | Update customer details |
| DELETE | `/api/customers/{id}` | Delete a customer |

**Register example:**
```json
POST /api/customers
{
  "fullName": "Ama Owusu",
  "phoneNumber": "0244000000",
  "email": "ama@example.com",
  "address": "Kumasi, Ashanti"
}
```

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders` | Create a new order (auto-calculates pricing) |
| GET | `/api/orders` | List all orders |
| GET | `/api/orders?customerId={id}` | Orders for one customer |
| GET | `/api/orders?status=WASHING` | Orders filtered by status |
| GET | `/api/orders/{id}` | Get one order |
| GET | `/api/orders/code/{orderCode}` | Get one order by its order code |
| PATCH | `/api/orders/{id}/status` | Move the order to the next tracking stage |

**Create order example:**
```json
POST /api/orders
{
  "customerId": 1,
  "items": [
    { "garmentType": "SHIRT", "serviceType": "WASH_AND_IRON", "quantity": 4 },
    { "garmentType": "TROUSER", "serviceType": "DRY_CLEAN", "quantity": 2 }
  ],
  "discountPercent": 5
}
```
The response includes the generated `orderCode`, per-item `subtotal`, and the order's
`subtotal`, `discountAmount`, and `totalAmount`.

**Update status example:**
```json
PATCH /api/orders/1/status
{ "status": "WASHING" }
```
Statuses must move forward through `RECEIVED → WASHING → DRYING → IRONING → READY → DELIVERED`
(or jump to `CANCELLED` at any point). An order can't be marked `DELIVERED` until it's fully paid.

### Payments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/orders/{orderId}/payments` | Record a payment (partial or full) |
| GET | `/api/orders/{orderId}/payments` | Payment history for an order |
| GET | `/api/orders/{orderId}/payments/balance` | Remaining balance |

**Record payment example:**
```json
POST /api/orders/1/payments
{ "amount": 20.00, "method": "MOBILE_MONEY" }
```
Each payment gets an auto-generated `receiptNumber`. The order's `paymentStatus`
automatically becomes `PARTIALLY_PAID` or `PAID`.

### Pricing
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/price-list` | View all garment/service prices |
| POST | `/api/price-list` | Add a price entry |
| PUT | `/api/price-list/{id}` | Update a price entry |
| DELETE | `/api/price-list/{id}` | Remove a price entry |

## Business Rules Implemented
- Order pricing is looked up automatically from the `price_list` table per (garment, service) pair.
- Discounts combine a manual `discountPercent` with a small loyalty bonus (1% per 100 points, capped at 20%), overall capped at 50%.
- Loyalty points are awarded automatically (1 point per 10 currency units) when an order is marked `DELIVERED`.
- Orders can't skip backwards in status, and can't be delivered while unpaid.
- Payments can't exceed the remaining balance on an order.

## Marketplace Layer (auth, businesses, bookings, reviews, notifications)

Added on top of the original counter/staff system above. Demo accounts are
seeded automatically on first run:
- Laundry owner: `owner@demo.com` / `password123` (owns 3 seeded demo businesses)
- Customer: `customer@demo.com` / `password123`

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | Create an account (`role`: `CUSTOMER` or `LAUNDRY_OWNER`) |
| POST | `/api/auth/login` | — | Returns a JWT (`token`) — send as `Authorization: Bearer <token>` |
| GET | `/api/auth/me` | required | Current user's profile |
| PATCH | `/api/auth/change-password` | required | `{ currentPassword, newPassword }` |
| DELETE | `/api/auth/me` | required | Delete own account |

### Laundry businesses
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/laundry-businesses` | — | Browse all (add `?search=` to filter) |
| GET | `/api/laundry-businesses/{id}` | — | One business |
| GET | `/api/laundry-businesses/mine` | owner | Businesses you own |
| POST | `/api/laundry-businesses` | owner | Register a business |
| PUT | `/api/laundry-businesses/{id}` | owner (must own it) | Edit a business |

### Reviews (drives the auto-rating)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/laundry-businesses/{id}/reviews` | — | All reviews for a business |
| POST | `/api/laundry-businesses/{id}/reviews` | customer | Submit a review — `averageRating` recalculates automatically |

### Bookings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/bookings` | customer | `{ laundryBusinessId, deliveryRequested, notes }` |
| GET | `/api/bookings/mine` | customer | Your bookings |
| GET | `/api/bookings/business/{businessId}` | — | A business's bookings (for the owner's view) |
| PATCH | `/api/bookings/{id}/status` | owner (must own the business) | Advance status; `COMPLETED` auto-notifies the customer |

### Notifications
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/notifications/mine` | required | Your notification inbox |
| GET | `/api/notifications/mine/unread-count` | required | `{ unread: n }` |
| PATCH | `/api/notifications/{id}/read` | required | Mark one as read |

### Paystack payments
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/payments/paystack/initialize` | customer | `{ bookingId, amount }`; returns a hosted Paystack authorization URL (or sandbox mock) |
| POST | `/api/payments/paystack/verify` | customer | `{ reference }`; verifies with Paystack and marks the booking paid |
| POST | `/api/payments/paystack/webhook` | public (HMAC SHA-512) | Paystack webhook listener (`x-paystack-signature` header); handles `charge.success` |

#### Testing & Configuration

1. **Built-in Sandbox / Mock Mode (Zero Setup)**:
   By default (`PAYSTACK_MOCK_ENABLED=true`), if no `PAYSTACK_SECRET_KEY` is provided (or set to `mock`), the backend and mobile app activate the **Paystack Sandbox Simulator**. You can test full payment lifecycles, booking confirmation, in-app notifications, and receipts out of the box without needing an active merchant account.

2. **Connecting Real Paystack Test / Live Keys**:
   To connect to live Paystack APIs (`api.paystack.co`):
   ```powershell
   $env:PAYSTACK_SECRET_KEY = "sk_test_your_secret_key_here"
   $env:PAYSTACK_CURRENCY = "GHS"
   mvn spring-boot:run
   ```
   Or create a `.env` file (see `.env.example`).

3. **Webhook Verification**:
   Paystack calls `POST /api/payments/paystack/webhook` when events like `charge.success` occur. The backend verifies the `x-paystack-signature` header using HMAC-SHA512 with your secret key, automatically updates the booking status to `PAID`, records `paidAmount`, and dispatches in-app notifications to both customer and business owner.

### Known simplifications (flagged intentionally)
- **Rating** is currently a simple average of each review's overall score. Each review also stores sub-scores (cleanliness, accuracy, quality/timeliness, pricing fairness, pickup/delivery convenience) and total booking count is tracked — the data's there for a proper weighted composite formula later.
- **CORS is wide open** (`allowedOriginPatterns("*")`) for local development across simulators/devices/LAN IPs. Tighten this in `SecurityConfig.java` before deploying anywhere real.
- **JWT secret** in `application.properties` is a placeholder for local dev only — generate a real one (`openssl rand -base64 48`) before deploying.
- The original counter/staff endpoints (`/api/customers`, `/api/orders`, `/api/price-list`) are untouched and still fully open (no auth) — they're a separate flow from the new marketplace auth system.

