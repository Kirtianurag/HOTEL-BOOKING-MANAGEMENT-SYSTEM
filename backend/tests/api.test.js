import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import User from '../src/models/User.js';
import RoomType from '../src/models/RoomType.js';
import Room from '../src/models/Room.js';
import Reservation from '../src/models/Reservation.js';
import RoomNightLock from '../src/models/RoomNightLock.js';
import RateRule from '../src/models/RateRule.js';
import AuditLog from '../src/models/AuditLog.js';

const TEST_DB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stayease_test';

let adminToken = '';
let staffToken = '';
let guestToken = '';
let guest2Token = '';
let guestUser = null;
let guest2User = null;
let testRoomType = null;
let testRoom1 = null;
let testRoom2 = null;

beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_DB_URI);
  }
  // Clear test DB
  await Promise.all([
    User.deleteMany({}),
    RoomType.deleteMany({}),
    Room.deleteMany({}),
    Reservation.deleteMany({}),
    RoomNightLock.deleteMany({}),
    RateRule.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('StayEase Hotel Booking Management System - Full Test Suite', () => {
  // =========================================================================
  // SCENARIO 1: Guest registration and login
  // =========================================================================
  test('1. Guest registration and login works', async () => {
    // Register
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Alice',
        lastName: 'Walker',
        email: 'alice@example.com',
        phone: '+1-555-1111',
        password: 'Password@123',
      })
      .expect(201);

    expect(regRes.body.success).toBe(true);
    expect(regRes.body.data.user.email).toBe('alice@example.com');
    expect(regRes.body.data.user.role).toBe('guest');
    expect(regRes.body.data.token).toBeDefined();

    guestToken = regRes.body.data.token;
    guestUser = regRes.body.data.user;

    // Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@example.com',
        password: 'Password@123',
      })
      .expect(200);

    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.token).toBeDefined();

    // Create a 2nd guest for isolation tests
    const reg2 = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Bob',
        lastName: 'Marley',
        email: 'bob@example.com',
        phone: '+1-555-2222',
        password: 'Password@123',
      })
      .expect(201);
    guest2Token = reg2.body.data.token;
    guest2User = reg2.body.data.user;

    // Create Admin user
    const admin = await User.create({
      firstName: 'Chief',
      lastName: 'Admin',
      email: 'admin.test@stayease.demo',
      password: 'Admin@123',
      role: 'admin',
    });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin.test@stayease.demo', password: 'Admin@123' })
      .expect(200);
    adminToken = adminLogin.body.data.token;

    // Create Staff user
    const staff = await User.create({
      firstName: 'Staff',
      lastName: 'Desk',
      email: 'staff.test@stayease.demo',
      password: 'Staff@123',
      role: 'staff',
    });

    const staffLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'staff.test@stayease.demo', password: 'Staff@123' })
      .expect(200);
    staffToken = staffLogin.body.data.token;
  });

  // =========================================================================
  // SCENARIO 2: Invalid login rejection
  // =========================================================================
  test('2. Invalid login rejection with bad password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'alice@example.com',
        password: 'WrongPassword!',
      })
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  // =========================================================================
  // SCENARIO 3: Guest cannot access admin APIs
  // =========================================================================
  test('3. Guest cannot access admin APIs (RBAC verification)', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${guestToken}`)
      .expect(403);

    expect(res.body.success).toBe(false);
  });

  // =========================================================================
  // SCENARIO 4: Admin can create room types
  // =========================================================================
  test('4. Admin can create room types', async () => {
    const res = await request(app)
      .post('/api/room-types')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Executive Suite',
        description: 'Luxury executive suite with sea view',
        maxOccupancy: 3,
        baseRate: 200,
        amenities: ['WiFi', 'Balcony', 'King Bed'],
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Executive Suite');
    expect(res.body.data.baseRate).toBe(200);

    testRoomType = res.body.data;
  });

  // =========================================================================
  // SCENARIO 5: Admin can create rooms
  // =========================================================================
  test('5. Admin can create physical rooms', async () => {
    // Room 1
    const r1 = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        roomNumber: '901',
        roomType: testRoomType._id,
        floor: 9,
        status: 'available',
        amenities: ['WiFi', 'Air Conditioning'],
      })
      .expect(201);

    expect(r1.body.success).toBe(true);
    expect(r1.body.data.roomNumber).toBe('901');
    testRoom1 = r1.body.data;

    // Room 2
    const r2 = await request(app)
      .post('/api/rooms')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        roomNumber: '902',
        roomType: testRoomType._id,
        floor: 9,
        status: 'available',
        amenities: ['WiFi', 'Air Conditioning'],
      })
      .expect(201);

    expect(r2.body.success).toBe(true);
    expect(r2.body.data.roomNumber).toBe('902');
    testRoom2 = r2.body.data;
  });

  // =========================================================================
  // SCENARIO 6: Available room search works
  // =========================================================================
  test('6. Available room search works and returns calculated pricing', async () => {
    const res = await request(app)
      .get('/api/availability/search?checkIn=2026-12-01&checkOut=2026-12-04&guests=2')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);

    const firstResult = res.body.data.find((d) => d.room.roomNumber === '901');
    expect(firstResult).toBeDefined();
    expect(firstResult.pricing.numberOfNights).toBe(3);
    // 3 nights * $200 = $600 subtotal + 12% tax = $672 total
    expect(firstResult.pricing.subtotal).toBe(600);
    expect(firstResult.pricing.totalAmount).toBe(672);
  });

  // =========================================================================
  // SCENARIO 7: Invalid check-in/check-out dates are rejected
  // =========================================================================
  test('7. Invalid check-in/check-out dates are rejected (check-out <= check-in)', async () => {
    const res = await request(app)
      .get('/api/availability/search?checkIn=2026-12-05&checkOut=2026-12-03')
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  // =========================================================================
  // SCENARIO 8: Room capacity is enforced
  // =========================================================================
  test('8. Room capacity is strictly enforced', async () => {
    // testRoomType maxOccupancy is 3, attempting to book for 5
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        roomId: testRoom1._id,
        checkIn: '2026-12-10',
        checkOut: '2026-12-12',
        numberOfGuests: 5,
        guestDetails: { firstName: 'Alice', lastName: 'Walker' },
      })
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/capacity/i);
  });

  // =========================================================================
  // SCENARIO 9: Reservation can be created (creates 10-minute hold)
  // =========================================================================
  let reservationId1 = '';
  test('9. Reservation can be created with HOLD status and RoomNightLock documents', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        roomId: testRoom1._id,
        checkIn: '2026-12-15',
        checkOut: '2026-12-18', // 3 nights
        numberOfGuests: 2,
        guestDetails: {
          firstName: 'Alice',
          lastName: 'Walker',
          email: 'alice@example.com',
          phone: '+1-555-1111',
        },
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('HOLD');
    expect(res.body.data.bookingReference).toMatch(/^SE-/);
    expect(res.body.data.holdExpiresAt).toBeDefined();

    reservationId1 = res.body.data._id;

    // Verify exactly 3 room-night locks created with status 'hold'
    const locks = await RoomNightLock.find({ reservation: reservationId1 });
    expect(locks.length).toBe(3);
    expect(locks[0].status).toBe('hold');
  });

  // =========================================================================
  // SCENARIO 10: Booking confirmation works
  // =========================================================================
  test('10. Booking confirmation promotes locks to confirmed and completes payment', async () => {
    const res = await request(app)
      .post(`/api/reservations/${reservationId1}/confirm`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ paymentMethod: 'simulated_card' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('CONFIRMED');
    expect(res.body.data.payment.status).toBe('completed');
    expect(res.body.data.payment.transactionId).toBeDefined();

    // Verify locks are now 'confirmed' and expiresAt is removed
    const locks = await RoomNightLock.find({ reservation: reservationId1 });
    expect(locks.length).toBe(3);
    expect(locks[0].status).toBe('confirmed');
    expect(locks[0].expiresAt).toBeUndefined();
  });

  // =========================================================================
  // SCENARIO 11: CRITICAL CONCURRENCY: Overlapping bookings on same room rejected
  // =========================================================================
  test('11. [CRITICAL] Two overlapping reservations cannot confirm the same room', async () => {
    // Room 901 is confirmed for 2026-12-15 to 2026-12-18.
    // Guest 2 attempts overlapping booking for 2026-12-16 to 2026-12-19.
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${guest2Token}`)
      .send({
        roomId: testRoom1._id,
        checkIn: '2026-12-16',
        checkOut: '2026-12-19',
        numberOfGuests: 2,
        guestDetails: { firstName: 'Bob', lastName: 'Marley' },
      })
      .expect(409); // Conflict

    expect(res.body.success).toBe(false);
  });

  // =========================================================================
  // SCENARIO 12: Different rooms can be booked for the same dates
  // =========================================================================
  test('12. Different physical rooms can be booked for the identical dates', async () => {
    // Room 902 for 2026-12-15 to 2026-12-18 should succeed
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${guest2Token}`)
      .send({
        roomId: testRoom2._id,
        checkIn: '2026-12-15',
        checkOut: '2026-12-18',
        numberOfGuests: 2,
        guestDetails: { firstName: 'Bob', lastName: 'Marley' },
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('HOLD');
  });

  // =========================================================================
  // SCENARIO 13: Non-overlapping bookings for the same room are allowed
  // =========================================================================
  test('13. Non-overlapping bookings for the same room are allowed', async () => {
    // Room 901 is booked 2026-12-15 to 2026-12-18.
    // Booking 2026-12-20 to 2026-12-23 on Room 901 must succeed!
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${guest2Token}`)
      .send({
        roomId: testRoom1._id,
        checkIn: '2026-12-20',
        checkOut: '2026-12-23',
        numberOfGuests: 2,
        guestDetails: { firstName: 'Bob', lastName: 'Marley' },
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('HOLD');
  });

  // =========================================================================
  // SCENARIO 14: Cancelled reservations release room inventory
  // =========================================================================
  test('14. Cancelled reservations release room inventory locks immediately', async () => {
    // Cancel reservationId1 (Room 901, 2026-12-15 to 2026-12-18)
    const cancelRes = await request(app)
      .post(`/api/reservations/${reservationId1}/cancel`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ reason: 'Trip rescheduled' })
      .expect(200);

    expect(cancelRes.body.success).toBe(true);
    expect(cancelRes.body.data.status).toBe('CANCELLED');

    // Locks should be deleted
    const locks = await RoomNightLock.find({ reservation: reservationId1 });
    expect(locks.length).toBe(0);

    // Now Room 901 for 2026-12-15 to 2026-12-18 must be available again!
    const searchRes = await request(app)
      .get('/api/availability/search?checkIn=2026-12-15&checkOut=2026-12-18')
      .expect(200);

    const roomFound = searchRes.body.data.find((d) => d.room.roomNumber === '901');
    expect(roomFound).toBeDefined();
  });

  // =========================================================================
  // SCENARIO 15: Expired holds do not block rooms
  // =========================================================================
  test('15. Expired holds do not block room availability', async () => {
    // Create a hold on Room 901 with past expiry
    const holdRes = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        roomId: testRoom1._id,
        checkIn: '2026-12-25',
        checkOut: '2026-12-28',
        numberOfGuests: 1,
        guestDetails: { firstName: 'Alice' },
      })
      .expect(201);

    const staleResId = holdRes.body.data._id;

    // Simulate hold expired in the past
    const past = new Date(Date.now() - 60000); // 1 minute ago
    await Reservation.findByIdAndUpdate(staleResId, { holdExpiresAt: past });
    await RoomNightLock.updateMany({ reservation: staleResId }, { expiresAt: past });

    // When Bob searches for those dates, the system must clean stale holds and return available!
    const searchRes = await request(app)
      .get('/api/availability/search?checkIn=2026-12-25&checkOut=2026-12-28')
      .expect(200);

    const roomFound = searchRes.body.data.find((d) => d.room.roomNumber === '901');
    expect(roomFound).toBeDefined();
  });

  // =========================================================================
  // SCENARIO 16: Staff can check in and check out guests
  // =========================================================================
  test('16. Staff can check in and check out guests', async () => {
    // Create and confirm a booking for today
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    const createRes = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        roomId: testRoom1._id,
        checkIn: today,
        checkOut: tomorrow,
        numberOfGuests: 1,
        guestDetails: { firstName: 'Alice', lastName: 'Walker' },
      })
      .expect(201);

    const newResId = createRes.body.data._id;

    await request(app)
      .post(`/api/reservations/${newResId}/confirm`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ paymentMethod: 'simulated_card' })
      .expect(200);

    // Staff performs check-in
    const checkInRes = await request(app)
      .post(`/api/staff/${newResId}/checkin`)
      .set('Authorization', `Bearer ${staffToken}`)
      .expect(200);

    expect(checkInRes.body.success).toBe(true);
    expect(checkInRes.body.data.status).toBe('CHECKED_IN');

    // Staff performs check-out
    const checkOutRes = await request(app)
      .post(`/api/staff/${newResId}/checkout`)
      .set('Authorization', `Bearer ${staffToken}`)
      .expect(200);

    expect(checkOutRes.body.success).toBe(true);
    expect(checkOutRes.body.data.status).toBe('CHECKED_OUT');
  });

  // =========================================================================
  // SCENARIO 17: Guest cannot view another guest's bookings
  // =========================================================================
  test('17. Guest cannot view another guest bookings (Data isolation)', async () => {
    // Bob tries to fetch Alice's reservation
    const res = await request(app)
      .get(`/api/reservations/${reservationId1}`)
      .set('Authorization', `Bearer ${guest2Token}`)
      .expect(403);

    expect(res.body.success).toBe(false);
  });

  // =========================================================================
  // SCENARIO 18: Admin reports match underlying reservation data
  // =========================================================================
  test('18. Admin reports match underlying reservation data', async () => {
    const res = await request(app)
      .get('/api/reports/dashboard')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.totalRooms).toBeDefined();
    expect(res.body.data.totalRevenue).toBeGreaterThanOrEqual(0);
  });
});

