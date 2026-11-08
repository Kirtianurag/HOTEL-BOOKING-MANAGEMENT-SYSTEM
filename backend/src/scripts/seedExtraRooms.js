import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

import RoomType from '../models/RoomType.js';
import Room from '../models/Room.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stayease';

const roomTypesData = [
  {
    name: 'Standard',
    description: 'Comfortable room with essential amenities, perfect for solo travelers or couples seeking a clean and cozy stay.',
    maxOccupancy: 2,
    baseRate: 99.99,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Coffee Maker', 'Safe', 'Hair Dryer'],
    images: ['https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80'],
    isActive: true,
  },
  {
    name: 'Deluxe',
    description: 'Spacious room with premium furnishings, city views, and enhanced amenities for a luxurious experience.',
    maxOccupancy: 3,
    baseRate: 179.99,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Safe', 'Hair Dryer', 'Bathrobe', 'City View'],
    images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80'],
    isActive: true,
  },
  {
    name: 'Suite',
    description: 'Elegant suite with separate living area, premium bath amenities, and panoramic views. Ideal for discerning travelers.',
    maxOccupancy: 4,
    baseRate: 349.99,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Safe', 'Hair Dryer', 'Bathrobe', 'Living Area', 'Jacuzzi', 'Panoramic View', 'Butler Service'],
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'],
    isActive: true,
  },
  {
    name: 'Family',
    description: 'Generously sized room designed for families, with extra beds, child-friendly amenities, and convenient layout.',
    maxOccupancy: 6,
    baseRate: 249.99,
    amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Safe', 'Hair Dryer', 'Extra Beds', 'Family Bathroom', 'Game Console'],
    images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80'],
    isActive: true,
  },
  {
    name: 'Executive Club',
    description: 'Spacious business suite on high floors with dedicated ergonomic workstation, Nespresso bar, and club lounge access.',
    maxOccupancy: 2,
    baseRate: 219.99,
    amenities: ['High-speed WiFi', '4K Smart TV', 'Ergonomic Desk', 'Nespresso Machine', 'Lounge Access', 'Safe', 'Luxury Bathrobe', 'Skyline View'],
    images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80'],
    isActive: true,
  },
  {
    name: 'Presidential Villa',
    description: 'Opulent top-tier residence featuring private plunge pool, master jacuzzi, 24/7 dedicated butler service, and panoramic ocean vistas.',
    maxOccupancy: 6,
    baseRate: 599.99,
    amenities: ['Private Infinity Pool', 'Master Jacuzzi', 'Dedicated Butler', 'Wine Cellar', 'Walk-in Closet', 'Home Cinema', 'Terrace Deck', 'Airport Chauffeur'],
    images: ['https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80'],
    isActive: true,
  },
];

async function seedExtraRooms() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.\n');

    // Upsert Room Types
    const typeMap = {};
    for (const data of roomTypesData) {
      let rt = await RoomType.findOne({ name: data.name });
      if (!rt) {
        rt = await RoomType.create(data);
        console.log(`✅ Created Room Type: ${rt.name}`);
      } else {
        await RoomType.updateOne({ _id: rt._id }, { $set: data });
        console.log(`ℹ️ Updated Room Type: ${rt.name}`);
      }
      typeMap[data.name] = rt._id;
    }

    const roomsToEnsure = [
      // Floor 1: Standard (101-105)
      { roomNumber: '101', roomType: typeMap['Standard'], floor: 1, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Coffee Maker'] },
      { roomNumber: '102', roomType: typeMap['Standard'], floor: 1, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Safe'] },
      { roomNumber: '103', roomType: typeMap['Standard'], floor: 1, amenities: ['WiFi', 'TV', 'Air Conditioning'] },
      { roomNumber: '104', roomType: typeMap['Standard'], floor: 1, amenities: ['WiFi', 'TV', 'Air Conditioning'] },
      { roomNumber: '105', roomType: typeMap['Standard'], floor: 1, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Garden View'] },

      // Floor 2: Deluxe (201-206)
      { roomNumber: '201', roomType: typeMap['Deluxe'], floor: 2, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'City View'] },
      { roomNumber: '202', roomType: typeMap['Deluxe'], floor: 2, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'City View'] },
      { roomNumber: '203', roomType: typeMap['Deluxe'], floor: 2, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Bathrobe'] },
      { roomNumber: '204', roomType: typeMap['Deluxe'], floor: 2, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'] },
      { roomNumber: '205', roomType: typeMap['Deluxe'], floor: 2, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Balcony'] },
      { roomNumber: '206', roomType: typeMap['Deluxe'], floor: 2, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Espresso Bar'] },

      // Floor 3: Suite (301-305)
      { roomNumber: '301', roomType: typeMap['Suite'], floor: 3, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Jacuzzi', 'Panoramic View'] },
      { roomNumber: '302', roomType: typeMap['Suite'], floor: 3, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Jacuzzi'] },
      { roomNumber: '303', roomType: typeMap['Suite'], floor: 3, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Living Area', 'Jacuzzi'] },
      { roomNumber: '304', roomType: typeMap['Suite'], floor: 3, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Butler Service', 'Panoramic View'] },
      { roomNumber: '305', roomType: typeMap['Suite'], floor: 3, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Safe', 'Jacuzzi', 'City View'] },

      // Floor 4: Family (401-404)
      { roomNumber: '401', roomType: typeMap['Family'], floor: 4, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Extra Beds', 'Game Console'] },
      { roomNumber: '402', roomType: typeMap['Family'], floor: 4, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Extra Beds', 'Family Bathroom'] },
      { roomNumber: '403', roomType: typeMap['Family'], floor: 4, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Extra Beds', 'Mini Bar'] },
      { roomNumber: '404', roomType: typeMap['Family'], floor: 4, amenities: ['WiFi', 'TV', 'Air Conditioning', 'Extra Beds', 'Kid Toys'] },

      // Floor 5: Executive Club (501-504)
      { roomNumber: '501', roomType: typeMap['Executive Club'], floor: 5, amenities: ['High-speed WiFi', '4K Smart TV', 'Ergonomic Desk', 'Lounge Access'] },
      { roomNumber: '502', roomType: typeMap['Executive Club'], floor: 5, amenities: ['High-speed WiFi', '4K Smart TV', 'Skyline View', 'Nespresso Machine'] },
      { roomNumber: '503', roomType: typeMap['Executive Club'], floor: 5, amenities: ['High-speed WiFi', '4K Smart TV', 'Club Lounge Access', 'Luxury Bathrobe'] },
      { roomNumber: '504', roomType: typeMap['Executive Club'], floor: 5, amenities: ['High-speed WiFi', '4K Smart TV', 'Executive Desk', 'Complimentary Breakfast'] },

      // Floor 6: Presidential Villa (601-602)
      { roomNumber: '601', roomType: typeMap['Presidential Villa'], floor: 6, amenities: ['Private Infinity Pool', 'Master Jacuzzi', 'Dedicated Butler', 'Wine Cellar'] },
      { roomNumber: '602', roomType: typeMap['Presidential Villa'], floor: 6, amenities: ['Private Plunge Pool', 'Master Jacuzzi', 'Airport Chauffeur', 'Terrace Deck'] },
    ];

    console.log('\nEnsuring rooms inventory...');
    let added = 0;
    for (const r of roomsToEnsure) {
      const exists = await Room.findOne({ roomNumber: r.roomNumber });
      if (!exists) {
        await Room.create({ ...r, status: 'available', isActive: true });
        console.log(`✅ Created Room #${r.roomNumber} (Floor ${r.floor})`);
        added++;
      }
    }

    const totalRooms = await Room.countDocuments({ isActive: true });
    console.log(`\n🎉 Room inventory updated! Added ${added} new rooms. Total active rooms: ${totalRooms}.\n`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error seeding extra rooms:', err.message);
    process.exit(1);
  }
}

seedExtraRooms();

