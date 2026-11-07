/**
 * StayEase Database Seed Script
 * 
 * Creates demo data for local development and testing.
 * This script is idempotent - safe to run multiple times.
 * 
 * Demo Credentials:
 *   Admin: admin@stayease.demo / Admin@123
 *   Staff: staff@stayease.demo / Staff@123
 *   Guest: guest@stayease.demo / Guest@123
 * 
 * Usage: npm run seed
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

import User from '../models/User.js';
import RoomType from '../models/RoomType.js';
import Room from '../models/Room.js';
import Reservation from '../models/Reservation.js';
import RoomNightLock from '../models/RoomNightLock.js';
import AuditLog from '../models/AuditLog.js';
import RateRule from '../models/RateRule.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stayease';

// ============================================================
// Seed Data
// ============================================================

const usersData = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@stayease.demo',
    password: 'Admin@123',
    phone: '+1-555-0100',
    role: 'admin'
  },
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'staff@stayease.demo',
    password: 'Staff@123',
    phone: '+1-555-0200',
    role: 'staff'
  },
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'guest@stayease.demo',
    password: 'Guest@123',
    phone: '+1-555-0300',
    role: 'guest'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@example.com',
    password: 'Guest@123',
    phone: '+1-555-0400',
    role: 'guest'
  },
  {
    firstName: 'Robert',
    lastName: 'Wilson',
    email: 'robert.wilson@example.com',
    password: 'Guest@123',
    phone: '+1-555-0500',
    role: 'guest'
  }
];

const roomTypesData = [
  {
    name: 'Standard',
    description: 'Comfortable room with essential amenities, perfect for solo travelers or couples seeking a clean and cozy stay.',
    maxOccupancy: 2,
    baseRate: 99.99,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Coffee Maker', 'Safe', 'Hair Dryer'],
    images: ['/images/rooms/standard-1.jpg', '/images/rooms/standard-2.jpg'],
    isActive: true
  },
  {
    name: 'Deluxe',
    description: 'Spacious room with premium furnishings, city views, and enhanced amenities for a luxurious experience.',
    maxOccupancy: 3,
    baseRate: 179.99,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Safe', 'Hair Dryer', 'Bathrobe', 'City View'],
    images: ['/images/rooms/deluxe-1.jpg', '/images/rooms/deluxe-2.jpg'],
    isActive: true
  },
  {
    name: 'Suite',
    description: 'Elegant suite with separate living area, premium bath amenities, and panoramic views. Ideal for discerning travelers.',
    maxOccupancy: 4,
    baseRate: 349.99,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Safe', 'Hair Dryer', 'Bathrobe', 'Living Area', 'Jacuzzi', 'Panoramic View', 'Butler Service'],
    images: ['/images/rooms/suite-1.jpg', '/images/rooms/suite-2.jpg'],
    isActive: true
  },
  {
    name: 'Family',
    description: 'Generously sized room designed for families, with extra beds, child-friendly amenities, and convenient layout.',
    maxOccupancy: 6,
    baseRate: 249.99,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Safe', 'Hair Dryer', 'Extra Beds', 'Family Bathroom', 'Game Console'],
    images: ['/images/rooms/family-1.jpg', '/images/rooms/family-2.jpg'],
    isActive: true
  }
];

// ============================================================
// Seed Function
// ============================================================

async function seed() {
  try {
    console.log('🌱 Starting StayEase database seed...\n');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      RoomType.deleteMany({}),
      Room.deleteMany({}),
      Reservation.deleteMany({}),
      RoomNightLock.deleteMany({}),
      AuditLog.deleteMany({}),
      RateRule.deleteMany({})
    ]);
    console.log('   Done.\n');

    // Create Users
    console.log('👤 Creating users...');
    const users = [];
    for (const userData of usersData) {
      const user = await User.create(userData);
      users.push(user);
      console.log(`   ✅ ${user.role.toUpperCase()}: ${user.email}`);
    }
    console.log('');

    const adminUser = users[0];
    const staffUser = users[1];
    const guestUser = users[2];

    // Create Room Types
    console.log('🏷️  Creating room types...');
    const roomTypes = [];
    for (const rtData of roomTypesData) {
      const rt = await RoomType.create(rtData);
      roomTypes.push(rt);
      console.log(`   ✅ ${rt.name} - $${rt.baseRate}/night (max ${rt.maxOccupancy} guests)`);
    }
    console.log('');

    const [standardType, deluxeType, suiteType, familyType] = roomTypes;

    // Create Rooms
    console.log('🚪 Creating rooms...');
    const roomsData = [
      // Standard rooms - Floor 1
      { roomNumber: '101', roomType: standardType._id, floor: 1, status: 'available', amenities: ['WiFi', 'TV', 'Air Conditioning'] },
      { roomNumber: '102', roomType: standardType._id, floor: 1, status: 'available', amenities: ['WiFi', 'TV', 'Air Conditioning'] },
      { roomNumber: '103', roomType: standardType._id, floor: 1, status: 'available', amenities: ['WiFi', 'TV', 'Air Conditioning'] },
      { roomNumber: '104', roomType: standardType._id, floor: 1, status: 'cleaning', amenities: ['WiFi', 'TV', 'Air Conditioning'] },
      // Deluxe rooms - Floor 2
      { roomNumber: '201', roomType: deluxeType._id, floor: 2, status: 'available', amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'City View'] },
      { roomNumber: '202', roomType: deluxeType._id, floor: 2, status: 'available', amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'City View'] },
      { roomNumber: '203', roomType: deluxeType._id, floor: 2, status: 'available', amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'] },
      { roomNumber: '204', roomType: deluxeType._id, floor: 2, status: 'maintenance', amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'] },
      // Suite rooms - Floor 3
      { roomNumber: '301', roomType: suiteType._id, floor: 3, status: 'available', amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Jacuzzi', 'Panoramic View'] },
      { roomNumber: '302', roomType: suiteType._id, floor: 3, status: 'available', amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Jacuzzi'] },
      // Family rooms - Floor 4
      { roomNumber: '401', roomType: familyType._id, floor: 4, status: 'available', amenities: ['WiFi', 'TV', 'Air Conditioning', 'Extra Beds', 'Game Console'] },
      { roomNumber: '402', roomType: familyType._id, floor: 4, status: 'available', amenities: ['WiFi', 'TV', 'Air Conditioning', 'Extra Beds'] },
    ];

    const rooms = [];
    for (const roomData of roomsData) {
      const room = await Room.create(roomData);
      rooms.push(room);
      console.log(`   ✅ Room ${room.roomNumber} (Floor ${room.floor}) - ${room.status}`);
    }
    console.log('');

    // Create sample reservations
    console.log('📋 Creating sample reservations...');
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Helper to add days to a date
    const addDays = (date, days) => {
      const d = new Date(date);
      d.setUTCDate(d.getUTCDate() + days);
      return d;
    };

    // Helper to create date range locks
    const createLocks = async (roomId, reservationId, checkIn, checkOut, status = 'confirmed') => {
      const locks = [];
      const current = new Date(checkIn);
      while (current < checkOut) {
        locks.push({
          room: roomId,
          stayDate: new Date(current),
          reservation: reservationId,
          status
        });
        current.setUTCDate(current.getUTCDate() + 1);
      }
      if (locks.length > 0) {
        await RoomNightLock.insertMany(locks);
      }
    };

    // Reservation 1: Active confirmed booking (arriving today)
    const res1CheckIn = today;
    const res1CheckOut = addDays(today, 3);
    const res1 = await Reservation.create({
      bookingReference: 'SE-DEMO-0001',
      guest: guestUser._id,
      room: rooms[0]._id,     // Room 101
      roomType: standardType._id,
      checkIn: res1CheckIn,
      checkOut: res1CheckOut,
      numberOfGuests: 2,
      numberOfNights: 3,
      status: 'CONFIRMED',
      pricing: {
        nightlyRate: 99.99,
        subtotal: 299.97,
        taxRate: 0.12,
        taxAmount: 36.00,
        totalAmount: 335.97
      },
      guestDetails: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'guest@stayease.demo',
        phone: '+1-555-0300'
      },
      payment: {
        method: 'simulated',
        status: 'completed',
        transactionId: 'TXN-DEMO-001',
        paidAt: addDays(today, -1)
      },
      confirmedAt: addDays(today, -1)
    });
    await createLocks(rooms[0]._id, res1._id, res1CheckIn, res1CheckOut);
    console.log(`   ✅ ${res1.bookingReference} - CONFIRMED (arriving today)`);

    // Reservation 2: Checked-in guest (departing tomorrow)
    const res2CheckIn = addDays(today, -2);
    const res2CheckOut = addDays(today, 1);
    const res2 = await Reservation.create({
      bookingReference: 'SE-DEMO-0002',
      guest: users[3]._id,     // Jane Smith
      room: rooms[4]._id,      // Room 201
      roomType: deluxeType._id,
      checkIn: res2CheckIn,
      checkOut: res2CheckOut,
      numberOfGuests: 2,
      numberOfNights: 3,
      status: 'CHECKED_IN',
      pricing: {
        nightlyRate: 179.99,
        subtotal: 539.97,
        taxRate: 0.12,
        taxAmount: 64.80,
        totalAmount: 604.77
      },
      guestDetails: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0400'
      },
      payment: {
        method: 'simulated',
        status: 'completed',
        transactionId: 'TXN-DEMO-002',
        paidAt: addDays(today, -3)
      },
      confirmedAt: addDays(today, -3),
      checkedInAt: res2CheckIn
    });
    await createLocks(rooms[4]._id, res2._id, res2CheckIn, res2CheckOut);
    console.log(`   ✅ ${res2.bookingReference} - CHECKED_IN (departing tomorrow)`);

    // Reservation 3: Future booking
    const res3CheckIn = addDays(today, 5);
    const res3CheckOut = addDays(today, 8);
    const res3 = await Reservation.create({
      bookingReference: 'SE-DEMO-0003',
      guest: users[4]._id,     // Robert Wilson
      room: rooms[8]._id,      // Room 301 (Suite)
      roomType: suiteType._id,
      checkIn: res3CheckIn,
      checkOut: res3CheckOut,
      numberOfGuests: 2,
      numberOfNights: 3,
      status: 'CONFIRMED',
      pricing: {
        nightlyRate: 349.99,
        subtotal: 1049.97,
        taxRate: 0.12,
        taxAmount: 126.00,
        totalAmount: 1175.97
      },
      guestDetails: {
        firstName: 'Robert',
        lastName: 'Wilson',
        email: 'robert.wilson@example.com',
        phone: '+1-555-0500'
      },
      payment: {
        method: 'simulated',
        status: 'completed',
        transactionId: 'TXN-DEMO-003',
        paidAt: addDays(today, -1)
      },
      confirmedAt: addDays(today, -1)
    });
    await createLocks(rooms[8]._id, res3._id, res3CheckIn, res3CheckOut);
    console.log(`   ✅ ${res3.bookingReference} - CONFIRMED (future booking)`);

    // Reservation 4: Past checked-out booking
    const res4CheckIn = addDays(today, -10);
    const res4CheckOut = addDays(today, -7);
    const res4 = await Reservation.create({
      bookingReference: 'SE-DEMO-0004',
      guest: guestUser._id,
      room: rooms[5]._id,      // Room 202
      roomType: deluxeType._id,
      checkIn: res4CheckIn,
      checkOut: res4CheckOut,
      numberOfGuests: 1,
      numberOfNights: 3,
      status: 'CHECKED_OUT',
      pricing: {
        nightlyRate: 179.99,
        subtotal: 539.97,
        taxRate: 0.12,
        taxAmount: 64.80,
        totalAmount: 604.77
      },
      guestDetails: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'guest@stayease.demo',
        phone: '+1-555-0300'
      },
      payment: {
        method: 'simulated',
        status: 'completed',
        transactionId: 'TXN-DEMO-004',
        paidAt: addDays(today, -11)
      },
      confirmedAt: addDays(today, -11),
      checkedInAt: res4CheckIn,
      checkedOutAt: res4CheckOut
    });
    console.log(`   ✅ ${res4.bookingReference} - CHECKED_OUT (past)`);

    // Reservation 5: Cancelled booking
    const res5 = await Reservation.create({
      bookingReference: 'SE-DEMO-0005',
      guest: users[3]._id,
      room: rooms[1]._id,      // Room 102
      roomType: standardType._id,
      checkIn: addDays(today, 2),
      checkOut: addDays(today, 4),
      numberOfGuests: 1,
      numberOfNights: 2,
      status: 'CANCELLED',
      pricing: {
        nightlyRate: 99.99,
        subtotal: 199.98,
        taxRate: 0.12,
        taxAmount: 24.00,
        totalAmount: 223.98
      },
      guestDetails: {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1-555-0400'
      },
      payment: {
        method: 'simulated',
        status: 'refunded',
        transactionId: 'TXN-DEMO-005'
      },
      cancelledAt: addDays(today, -1),
      cancelReason: 'Change of plans'
    });
    console.log(`   ✅ ${res5.bookingReference} - CANCELLED`);
    console.log('');

    // Create Rate Rules (weekend premium)
    console.log('💰 Creating rate rules...');
    const nextSaturday = new Date(today);
    nextSaturday.setUTCDate(nextSaturday.getUTCDate() + (6 - nextSaturday.getUTCDay()));
    const nextSunday = addDays(nextSaturday, 1);

    for (const rt of roomTypes) {
      await RateRule.create({
        roomType: rt._id,
        startDate: nextSaturday,
        endDate: nextSunday,
        nightlyRate: Math.round(rt.baseRate * 1.25 * 100) / 100,
        name: 'Weekend Premium',
        isActive: true
      });
      console.log(`   ✅ Weekend premium for ${rt.name}: $${Math.round(rt.baseRate * 1.25 * 100) / 100}`);
    }
    console.log('');

    // Create Audit Logs
    console.log('📝 Creating audit logs...');
    const auditEntries = [
      { userId: adminUser._id, userRole: 'admin', action: 'USER_LOGIN', entityType: 'User', entityId: adminUser._id },
      { userId: adminUser._id, userRole: 'admin', action: 'ROOM_TYPE_CREATED', entityType: 'RoomType', entityId: standardType._id, newValues: { name: 'Standard' } },
      { userId: adminUser._id, userRole: 'admin', action: 'ROOM_TYPE_CREATED', entityType: 'RoomType', entityId: deluxeType._id, newValues: { name: 'Deluxe' } },
      { userId: adminUser._id, userRole: 'admin', action: 'ROOM_CREATED', entityType: 'Room', entityId: rooms[0]._id, newValues: { roomNumber: '101' } },
      { userId: adminUser._id, userRole: 'admin', action: 'ROOM_CREATED', entityType: 'Room', entityId: rooms[4]._id, newValues: { roomNumber: '201' } },
      { userId: guestUser._id, userRole: 'guest', action: 'RESERVATION_CREATED', entityType: 'Reservation', entityId: res1._id, newValues: { bookingReference: 'SE-DEMO-0001' } },
      { userId: guestUser._id, userRole: 'guest', action: 'RESERVATION_CONFIRMED', entityType: 'Reservation', entityId: res1._id },
      { userId: staffUser._id, userRole: 'staff', action: 'GUEST_CHECKED_IN', entityType: 'Reservation', entityId: res2._id },
      { userId: staffUser._id, userRole: 'staff', action: 'GUEST_CHECKED_OUT', entityType: 'Reservation', entityId: res4._id },
      { userId: guestUser._id, userRole: 'guest', action: 'RESERVATION_CANCELLED', entityType: 'Reservation', entityId: res5._id },
    ];

    for (const entry of auditEntries) {
      await AuditLog.create(entry);
    }
    console.log(`   ✅ Created ${auditEntries.length} audit log entries`);
    console.log('');

    // Summary
    console.log('═══════════════════════════════════════════');
    console.log('  🎉 StayEase seed completed successfully!');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('  📊 Summary:');
    console.log(`     Users:        ${users.length}`);
    console.log(`     Room Types:   ${roomTypes.length}`);
    console.log(`     Rooms:        ${rooms.length}`);
    console.log(`     Reservations: 5`);
    console.log(`     Audit Logs:   ${auditEntries.length}`);
    console.log('');
    console.log('  🔑 Demo Credentials:');
    console.log('     Admin: admin@stayease.demo / Admin@123');
    console.log('     Staff: staff@stayease.demo / Staff@123');
    console.log('     Guest: guest@stayease.demo / Guest@123');
    console.log('');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

seed().catch(() => process.exit(1));

