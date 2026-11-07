# StayEase: 3–5 Minute Video & Assessment Walkthrough Script

**Project:** Hotel Booking Management System  
**Organization:** ALGIONS AI LABS PRIVATE LIMITED  
**Application Name:** StayEase  

---

## Walkthrough Timeline Overview (Total: 4:30)

| Minute | Segment | Role / View | Key Engineering Highlights |
|:------:|---------|-------------|----------------------------|
| 0:00 - 0:45 | Architecture & Landing Page | Public | White minimalist theme, Ken Burns hero background animation, responsive layout |
| 0:45 - 2:00 | Guest Booking Journey | Guest | Live MongoDB availability search, dynamic pricing, 10-minute hold lock, simulated payment, receipt |
| 2:00 - 2:45 | Double-Booking Prevention | Guest (Conflict Test) | Compound unique index, instant 409 rejection of overlapping dates for the same physical room |
| 2:45 - 3:30 | Front Desk Operations | Staff | Today's arrivals, one-click check-in, room key issuance, one-click check-out |
| 3:30 - 4:15 | Admin Management & Analytics | Admin | 7 KPI cards, Recharts (revenue trend, room distribution), room CRUD, audit log trail |
| 4:15 - 4:30 | Automated Test Evidence | Terminal / CLI | 18 passing Jest/Supertest automated tests |

---

## Step-by-Step Demonstration Script

### Segment 1: Introduction & Landing Page (0:00 - 0:45)
- **Action:** Open browser at `http://localhost:5173`.
- **Narration:**
  > *"Welcome to StayEase, a database-backed hotel booking management system built for the Algions AI Labs internship assessment. Notice the minimalist white aesthetic with elegant muted lavender accents, Inter typography, and subtle Ken Burns animated hero background with smooth entrance transitions."*
- **Action:** Scroll down to show Featured Rooms (populated dynamically from MongoDB), Hotel Amenities, Why Choose Us, and Testimonials.

---

### Segment 2: Guest Booking Journey (0:45 - 2:00)
- **Action:** In the hero search bar, pick check-in and check-out dates (e.g., 3 nights), select 2 guests, and click **"Search"**.
- **Narration:**
  > *"The system queries the database, checks operational statuses (ignoring rooms under cleaning or maintenance), filters by guest capacity, and calculates an itemized pricing breakdown with 12% statutory tax."*
- **Action:** Click **"Book Now"** on Room 101.
- **Action:** If not logged in, use the **Quick Demo Credentials** pill to sign in as `guest@stayease.demo` (Password: `Guest@123`).
- **Action:** Fill in contact details and click **"Hold Room & Proceed to Payment"**.
- **Narration:**
  > *"Notice the 10-minute countdown timer! The backend has created a temporary RoomNightLock for every night of our stay, preventing any other user from booking this physical room."*
- **Action:** Select Simulated Credit Card and click **"Confirm & Pay"**.
- **Action:** Show the confirmation receipt with unique Booking Reference (e.g., `SE-20261108-XXXX`) and itemized snapshot breakdown.

---

### Segment 3: Double-Booking Prevention Demonstration (2:00 - 2:45)
- **Narration:**
  > *"Now let's demonstrate the critical double-booking prevention engine. Room 101 is now confirmed for our dates."*
- **Action:** Open an incognito window or log in as a second guest (`jane.smith@example.com`).
- **Action:** Attempt to book the exact same Room 101 for overlapping dates.
- **Narration:**
  > *"The system immediately detects the collision via MongoDB's unique compound index on { room: 1, stayDate: 1 } and rejects the operation with an HTTP 409 Conflict, ensuring complete database inventory integrity."*

---

### Segment 4: Staff Concierge Desk (2:45 - 3:30)
- **Action:** Log in as staff: `staff@stayease.demo` (Password: `Staff@123`) and navigate to `/staff`.
- **Narration:**
  > *"Front desk staff has a dedicated dashboard with today's arrivals and departures. Here is the reservation we just created!"*
- **Action:** Click **"Check In"** on the arriving guest. The status updates to `CHECKED_IN` and key is issued.
- **Action:** Switch to the Departures tab or search by booking reference, and click **"Check Out"**.
- **Narration:**
  > *"Checking out updates the status to CHECKED_OUT and releases the room for housekeeping."*

---

### Segment 5: Admin Console, Analytics & Audit Trail (3:30 - 4:15)
- **Action:** Log in as administrator: `admin@stayease.demo` (Password: `Admin@123`) and navigate to `/admin`.
- **Narration:**
  > *"The Admin Dashboard features 7 live KPI cards computed via MongoDB aggregation pipelines: Total Rooms, Available, Occupied, Arrivals, Departures, Total Reservations, and Verified Revenue."*
- **Action:** Show the Recharts Area Chart for revenue trends and Pie Chart for room type revenue share.
- **Action:** Navigate to **"Rooms"** to show room operational status management (`available`, `cleaning`, `maintenance`, `inactive`) and the **"Add Physical Room"** modal.
- **Action:** Navigate to **"Reports"** to show the custom date range picker and the occupancy rate formula: `(Occupied Room-Nights ÷ Sellable Units) × 100`.
- **Action:** Navigate to **"Audit Logs"** and click **"View Diff"** on an entry.
- **Narration:**
  > *"Every significant business action—logins, room creation, status modifications, and reservations—is immutably recorded with previous and new values in the AuditLog collection."*

---

### Segment 6: Test Suite Verification (4:15 - 4:30)
- **Action:** Switch to terminal and run `npm test`.
- **Narration:**
  > *"Our automated test suite runs 18 end-to-end integration tests using Jest and Supertest, verifying guest auth, role authorization, capacity enforcement, overlapping collision rejections, hold evictions, and report fidelity. All 18 tests pass with 100% success."*

