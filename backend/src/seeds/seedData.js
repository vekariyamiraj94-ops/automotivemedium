import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Brand } from '../models/Brand.js';
import { Customer } from '../models/Customer.js';
import { Vehicle } from '../models/Vehicle.js';
import { ServiceCentre } from '../models/ServiceCentre.js';
import { ServicePackage } from '../models/ServicePackage.js';
import { InventoryPart } from '../models/InventoryPart.js';
import { Booking } from '../models/Booking.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in .env');
    }

    console.log('Connecting to MongoDB for seeding...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected. Clearing existing collections...');

    await Promise.all([
      User.deleteMany({}),
      Brand.deleteMany({}),
      Customer.deleteMany({}),
      Vehicle.deleteMany({}),
      ServiceCentre.deleteMany({}),
      ServicePackage.deleteMany({}),
      InventoryPart.deleteMany({}),
      Booking.deleteMany({}),
    ]);

    console.log('🌱 Seeding Service Centres...');
    const serviceCentres = await ServiceCentre.insertMany([
      {
        name: 'Mumbai Central Auto Hub',
        code: 'SC-MUM-01',
        city: 'Mumbai',
        address: 'Worli Industrial Estate, Dr Annie Besant Rd, Worli',
        phone: '+91 98200 11223',
        email: 'mumbai@automotivemedium.com',
        capacityBays: 16,
        activeMechanics: 10,
      },
      {
        name: 'Pune Hinjewadi Workshop',
        code: 'SC-PUN-02',
        city: 'Pune',
        address: 'Phase 1, Hinjewadi Rajiv Gandhi Infotech Park',
        phone: '+91 98200 22334',
        email: 'pune@automotivemedium.com',
        capacityBays: 12,
        activeMechanics: 8,
      },
      {
        name: 'Ahmedabad SG Highway Express Bay',
        code: 'SC-AHM-03',
        city: 'Ahmedabad',
        address: 'Near Iskcon Cross Roads, SG Highway',
        phone: '+91 98200 33445',
        email: 'ahmedabad@automotivemedium.com',
        capacityBays: 14,
        activeMechanics: 9,
      },
      {
        name: 'Bengaluru Whitefield Service Center',
        code: 'SC-BLR-04',
        city: 'Bengaluru',
        address: 'ITPL Main Rd, Kundalahalli, Brookefield',
        phone: '+91 98200 44556',
        email: 'bengaluru@automotivemedium.com',
        capacityBays: 18,
        activeMechanics: 12,
      },
      {
        name: 'Delhi NCR Mega Workshop',
        code: 'SC-DEL-05',
        city: 'Delhi',
        address: 'Okhla Phase III, Industrial Area',
        phone: '+91 98200 55667',
        email: 'delhi@automotivemedium.com',
        capacityBays: 20,
        activeMechanics: 14,
      },
    ]);

    console.log('🌱 Seeding Users (Admin, Advisors, Mechanics)...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123', salt);

    const users = await User.insertMany([
      {
        name: 'DevOps & System Admin',
        email: 'admin@automotivemedium.com',
        password: hashedPassword,
        role: 'admin',
        phone: '+91 99999 00001',
        serviceCentre: serviceCentres[0]._id,
      },
      {
        name: 'Rajesh Sharma (Advisor)',
        email: 'rajesh.advisor@automotivemedium.com',
        password: hashedPassword,
        role: 'service_advisor',
        phone: '+91 99999 00002',
        serviceCentre: serviceCentres[0]._id,
      },
      {
        name: 'Sunil Kumar (Senior Mechanic)',
        email: 'sunil.mechanic@automotivemedium.com',
        password: hashedPassword,
        role: 'mechanic',
        phone: '+91 99999 00003',
        serviceCentre: serviceCentres[0]._id,
      },
    ]);

    console.log('🌱 Seeding Multi-Brand Catalog...');
    const brands = await Brand.insertMany([
      {
        name: 'Maruti Suzuki',
        country: 'India',
        logoUrl: 'https://img.icons8.com/color/96/suzuki.png',
        popularModels: ['Swift', 'Baleno', 'Brezza', 'Grand Vitara', 'Ertiga', 'Dzire'],
      },
      {
        name: 'Hyundai',
        country: 'South Korea',
        logoUrl: 'https://img.icons8.com/color/96/hyundai.png',
        popularModels: ['Creta', 'Venue', 'i20', 'Verna', 'Tucson', 'Alcazar'],
      },
      {
        name: 'Tata Motors',
        country: 'India',
        logoUrl: 'https://img.icons8.com/color/96/tata.png',
        popularModels: ['Nexon', 'Harrier', 'Safari', 'Punch', 'Altroz', 'Curvv'],
      },
      {
        name: 'Mahindra',
        country: 'India',
        logoUrl: 'https://img.icons8.com/color/96/mahindra.png',
        popularModels: ['XUV700', 'Scorpio-N', 'Thar', 'Bolero', 'XUV300'],
      },
      {
        name: 'Toyota',
        country: 'Japan',
        logoUrl: 'https://img.icons8.com/color/96/toyota.png',
        popularModels: ['Innova Hycross', 'Fortuner', 'Urban Cruiser', 'Glanza', 'Camry'],
      },
      {
        name: 'Honda',
        country: 'Japan',
        logoUrl: 'https://img.icons8.com/color/96/honda.png',
        popularModels: ['City', 'Amaze', 'Elevate', 'Civic'],
      },
    ]);

    console.log('🌱 Seeding Service Packages...');
    const servicePackages = await ServicePackage.insertMany([
      {
        name: 'Periodic Comprehensive Service',
        category: 'Periodic Maintenance',
        description: 'Engine oil replacement, oil filter, air filter cleaning, 50-point safety check',
        basePrice: 3499,
        estimatedDurationHours: 3,
      },
      {
        name: 'Front & Rear Brake Overhaul',
        category: 'Brake Service',
        description: 'Brake pad inspection, disc caliper cleaning, rotor skimming & brake fluid bleed',
        basePrice: 1899,
        estimatedDurationHours: 2,
      },
      {
        name: 'Complete AC Super Chill Service',
        category: 'AC Service',
        description: 'Condenser wash, cabin pollen filter cleaning, AC gas leak check & refrigerant refill',
        basePrice: 2499,
        estimatedDurationHours: 2.5,
      },
      {
        name: 'OBD-II Computerized Engine Diagnostics',
        category: 'Engine Diagnostic',
        description: 'ECU scanning, sensor calibration, fuel injector pressure check & emission tuning',
        basePrice: 1299,
        estimatedDurationHours: 1.5,
      },
      {
        name: '3D Laser Wheel Alignment & Balancing',
        category: 'Wheel Alignment',
        description: '4-wheel computerized alignment, tire rotation, rim runout check & lead balancing',
        basePrice: 999,
        estimatedDurationHours: 1,
      },
      {
        name: '9H Ceramic Shield Detailing',
        category: 'Body Repair & Detailing',
        description: 'Multi-stage paint correction, foam wash, 3-layer 9H ceramic coating protection',
        basePrice: 8999,
        estimatedDurationHours: 6,
      },
    ]);

    console.log('🌱 Seeding Spare Parts Inventory...');
    const inventoryParts = await InventoryPart.insertMany([
      {
        partNumber: 'ENG-OIL-5W30',
        name: 'Full Synthetic Engine Oil 5W-30 (4L)',
        category: 'Fluids',
        compatibleBrands: [brands[0]._id, brands[1]._id, brands[2]._id, brands[4]._id],
        unitCost: 1400,
        sellingPrice: 2200,
        stockQuantity: 45,
        minReorderThreshold: 10,
        supplier: 'Castrol India Ltd',
      },
      {
        partNumber: 'FLT-OIL-OEM01',
        name: 'OEM High-Flow Oil Filter',
        category: 'Filters',
        compatibleBrands: [brands[0]._id, brands[1]._id],
        unitCost: 180,
        sellingPrice: 350,
        stockQuantity: 60,
        minReorderThreshold: 15,
        supplier: 'Purolator India',
      },
      {
        partNumber: 'FLT-AIR-UNIV',
        name: 'Micro-Porous Engine Air Filter',
        category: 'Filters',
        compatibleBrands: [brands[2]._id, brands[3]._id],
        unitCost: 280,
        sellingPrice: 550,
        stockQuantity: 32,
        minReorderThreshold: 8,
        supplier: 'Bosch Automotive',
      },
      {
        partNumber: 'BRK-PAD-CER01',
        name: 'Front Ceramic Brake Pads (Set of 4)',
        category: 'Brakes',
        compatibleBrands: [brands[0]._id, brands[1]._id, brands[4]._id],
        unitCost: 950,
        sellingPrice: 1850,
        stockQuantity: 24,
        minReorderThreshold: 6,
        supplier: 'Brembo Aftermarket',
      },
      {
        partNumber: 'BRK-PAD-SUV02',
        name: 'Heavy Duty SUV Brake Pads',
        category: 'Brakes',
        compatibleBrands: [brands[2]._id, brands[3]._id, brands[4]._id],
        unitCost: 1400,
        sellingPrice: 2600,
        stockQuantity: 18,
        minReorderThreshold: 5,
        supplier: 'Endurance Technologies',
      },
      {
        partNumber: 'AC-CAB-FLT01',
        name: 'Activated Carbon AC Cabin Filter',
        category: 'Filters',
        compatibleBrands: [brands[0]._id, brands[1]._id, brands[5]._id],
        unitCost: 320,
        sellingPrice: 650,
        stockQuantity: 3, // LOW STOCK TRIGGER
        minReorderThreshold: 8,
        supplier: 'Mann+Hummel India',
      },
      {
        partNumber: 'IGN-SPK-IRD01',
        name: 'Laser Iridium Spark Plugs (Pack of 4)',
        category: 'Engine',
        compatibleBrands: [brands[0]._id, brands[1]._id, brands[5]._id],
        unitCost: 1200,
        sellingPrice: 2100,
        stockQuantity: 4, // LOW STOCK TRIGGER
        minReorderThreshold: 6,
        supplier: 'NGK Spark Plugs',
      },
      {
        partNumber: 'BAT-12V-45AH',
        name: 'Maintenance-Free Car Battery 12V 45Ah',
        category: 'Electrical',
        compatibleBrands: [brands[0]._id, brands[1]._id, brands[2]._id, brands[5]._id],
        unitCost: 3400,
        sellingPrice: 5200,
        stockQuantity: 15,
        minReorderThreshold: 4,
        supplier: 'Exide Industries',
      },
      {
        partNumber: 'FLUID-COOL-5L',
        name: 'Premixed Long-Life Coolant (5 Litres)',
        category: 'Fluids',
        compatibleBrands: [brands[0]._id, brands[1]._id, brands[2]._id, brands[3]._id, brands[4]._id],
        unitCost: 450,
        sellingPrice: 850,
        stockQuantity: 28,
        minReorderThreshold: 8,
        supplier: 'Motul India',
      },
      {
        partNumber: 'WPR-BLD-HYB24',
        name: 'Aerodynamic Hybrid Wiper Blades (Pair)',
        category: 'Body',
        compatibleBrands: [brands[0]._id, brands[1]._id, brands[2]._id, brands[4]._id],
        unitCost: 350,
        sellingPrice: 750,
        stockQuantity: 2, // LOW STOCK TRIGGER
        minReorderThreshold: 10,
        supplier: 'Bosch Automotive',
      },
    ]);

    console.log('🌱 Seeding Customers...');
    const customers = await Customer.insertMany([
      {
        name: 'Aarav Patel',
        email: 'aarav.patel@gmail.com',
        phone: '+91 98765 43210',
        city: 'Mumbai',
        address: 'B-402, Sea Breeze Apts, Bandra West',
      },
      {
        name: 'Pooja Kulkarni',
        email: 'pooja.kulkarni@yahoo.com',
        phone: '+91 98765 43211',
        city: 'Pune',
        address: 'Flat 12, Lotus Residency, Kothrud',
      },
      {
        name: 'Chirag Shah',
        email: 'chirag.shah@outlook.com',
        phone: '+91 98765 43212',
        city: 'Ahmedabad',
        address: '101, Shivalik High Street, Bodakdev',
      },
      {
        name: 'Karthik Rao',
        email: 'karthik.rao@gmail.com',
        phone: '+91 98765 43213',
        city: 'Bengaluru',
        address: '304, Green Glen Layout, Bellandur',
      },
      {
        name: 'Vikramjit Singh',
        email: 'vikram.singh@gmail.com',
        phone: '+91 98765 43214',
        city: 'Delhi',
        address: 'D-14, Greater Kailash Part 1',
      },
      {
        name: 'Neha Deshmukh',
        email: 'neha.deshmukh@gmail.com',
        phone: '+91 98765 43215',
        city: 'Pune',
        address: 'A-10, Aundh Renaissance, Aundh',
      },
      {
        name: 'Ananya Verma',
        email: 'ananya.verma@gmail.com',
        phone: '+91 98765 43216',
        city: 'Mumbai',
        address: 'Flat 801, Oberoi Splendor, Andheri East',
      },
    ]);

    console.log('🌱 Seeding Customer Vehicles...');
    const vehicles = await Vehicle.insertMany([
      {
        regNumber: 'MH02-EK-1001',
        brand: brands[0]._id, // Maruti Suzuki
        model: 'Swift',
        year: 2022,
        fuelType: 'Petrol',
        customer: customers[0]._id,
        mileageKm: 28500,
        chassisNumber: 'MA3FBEBS300192831',
      },
      {
        regNumber: 'MH12-PQ-2045',
        brand: brands[2]._id, // Tata
        model: 'Nexon',
        year: 2023,
        fuelType: 'EV',
        customer: customers[1]._id,
        mileageKm: 19400,
        chassisNumber: 'MAT62381928391823',
      },
      {
        regNumber: 'GJ01-AB-3099',
        brand: brands[1]._id, // Hyundai
        model: 'Creta',
        year: 2021,
        fuelType: 'Diesel',
        customer: customers[2]._id,
        mileageKm: 46200,
        chassisNumber: 'MALC1428391829102',
      },
      {
        regNumber: 'KA03-MG-4120',
        brand: brands[4]._id, // Toyota
        model: 'Innova Hycross',
        year: 2023,
        fuelType: 'Hybrid',
        customer: customers[3]._id,
        mileageKm: 31000,
        chassisNumber: 'MB1H8192839182736',
      },
      {
        regNumber: 'DL08-CR-5544',
        brand: brands[3]._id, // Mahindra
        model: 'XUV700',
        year: 2022,
        fuelType: 'Diesel',
        customer: customers[4]._id,
        mileageKm: 38700,
        chassisNumber: 'MA1TC192839182746',
      },
      {
        regNumber: 'MH14-JH-6611',
        brand: brands[5]._id, // Honda
        model: 'City',
        year: 2020,
        fuelType: 'Petrol',
        customer: customers[5]._id,
        mileageKm: 52000,
        chassisNumber: 'MAKGM192839182948',
      },
      {
        regNumber: 'MH01-DL-7788',
        brand: brands[0]._id, // Maruti Suzuki
        model: 'Brezza',
        year: 2023,
        fuelType: 'CNG',
        customer: customers[6]._id,
        mileageKm: 14500,
        chassisNumber: 'MA3GBE19283918271',
      },
    ]);

    console.log('🌱 Seeding Realistic Historical & Live Bookings...');
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, 15);
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 20);
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 10);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const bookings = await Booking.insertMany([
      // Booking 1 (Completed 3 months ago)
      {
        bookingNumber: 'BK-2026-0001',
        customer: customers[0]._id,
        vehicle: vehicles[0]._id, // Swift
        serviceCentre: serviceCentres[0]._id,
        servicePackages: [
          { package: servicePackages[0]._id, name: servicePackages[0].name, price: 3499 },
          { package: servicePackages[4]._id, name: servicePackages[4].name, price: 999 },
        ],
        partsUsed: [
          { part: inventoryParts[0]._id, name: inventoryParts[0].name, quantity: 1, unitPrice: 2200, totalPrice: 2200 },
          { part: inventoryParts[1]._id, name: inventoryParts[1].name, quantity: 1, unitPrice: 350, totalPrice: 350 },
        ],
        status: 'Completed',
        priority: 'Medium',
        scheduledDate: threeMonthsAgo,
        labourCost: 4498,
        partsCost: 2550,
        totalAmount: 7048,
        paymentStatus: 'Paid',
        assignedMechanic: users[2]._id,
        serviceAdvisor: users[1]._id,
        customerFeedbackRating: 5,
        completedAt: threeMonthsAgo,
      },

      // Booking 2 (Completed 2 months ago)
      {
        bookingNumber: 'BK-2026-0002',
        customer: customers[1]._id,
        vehicle: vehicles[1]._id, // Nexon EV
        serviceCentre: serviceCentres[1]._id,
        servicePackages: [
          { package: servicePackages[1]._id, name: servicePackages[1].name, price: 1899 },
          { package: servicePackages[3]._id, name: servicePackages[3].name, price: 1299 },
        ],
        partsUsed: [
          { part: inventoryParts[3]._id, name: inventoryParts[3].name, quantity: 1, unitPrice: 1850, totalPrice: 1850 },
        ],
        status: 'Completed',
        priority: 'High',
        scheduledDate: twoMonthsAgo,
        labourCost: 3198,
        partsCost: 1850,
        totalAmount: 5048,
        paymentStatus: 'Paid',
        assignedMechanic: users[2]._id,
        serviceAdvisor: users[1]._id,
        customerFeedbackRating: 4,
        completedAt: twoMonthsAgo,
      },

      // Booking 3 (Completed last month)
      {
        bookingNumber: 'BK-2026-0003',
        customer: customers[2]._id,
        vehicle: vehicles[2]._id, // Creta
        serviceCentre: serviceCentres[2]._id,
        servicePackages: [
          { package: servicePackages[0]._id, name: servicePackages[0].name, price: 3499 },
          { package: servicePackages[2]._id, name: servicePackages[2].name, price: 2499 },
        ],
        partsUsed: [
          { part: inventoryParts[0]._id, name: inventoryParts[0].name, quantity: 1, unitPrice: 2200, totalPrice: 2200 },
          { part: inventoryParts[5]._id, name: inventoryParts[5].name, quantity: 1, unitPrice: 650, totalPrice: 650 },
        ],
        status: 'Completed',
        priority: 'Urgent',
        scheduledDate: oneMonthAgo,
        labourCost: 5998,
        partsCost: 2850,
        totalAmount: 8848,
        paymentStatus: 'Paid',
        assignedMechanic: users[2]._id,
        serviceAdvisor: users[1]._id,
        customerFeedbackRating: 5,
        completedAt: oneMonthAgo,
      },

      // Booking 4 (Completed this month)
      {
        bookingNumber: 'BK-2026-0004',
        customer: customers[3]._id,
        vehicle: vehicles[3]._id, // Innova Hycross
        serviceCentre: serviceCentres[3]._id,
        servicePackages: [
          { package: servicePackages[5]._id, name: servicePackages[5].name, price: 8999 },
        ],
        partsUsed: [],
        status: 'Completed',
        priority: 'High',
        scheduledDate: new Date(now.getFullYear(), now.getMonth(), 5),
        labourCost: 8999,
        partsCost: 0,
        totalAmount: 8999,
        paymentStatus: 'Paid',
        assignedMechanic: users[2]._id,
        serviceAdvisor: users[1]._id,
        customerFeedbackRating: 5,
        completedAt: new Date(now.getFullYear(), now.getMonth(), 5),
      },

      // Booking 5 (In Progress right now)
      {
        bookingNumber: 'BK-2026-0005',
        customer: customers[4]._id,
        vehicle: vehicles[4]._id, // XUV700
        serviceCentre: serviceCentres[4]._id,
        servicePackages: [
          { package: servicePackages[0]._id, name: servicePackages[0].name, price: 3499 },
          { package: servicePackages[1]._id, name: servicePackages[1].name, price: 1899 },
        ],
        partsUsed: [
          { part: inventoryParts[4]._id, name: inventoryParts[4].name, quantity: 1, unitPrice: 2600, totalPrice: 2600 },
        ],
        status: 'In Progress',
        priority: 'High',
        scheduledDate: now,
        labourCost: 5398,
        partsCost: 2600,
        totalAmount: 7998,
        paymentStatus: 'Partial',
        assignedMechanic: users[2]._id,
        serviceAdvisor: users[1]._id,
      },

      // Booking 6 (Inspection stage)
      {
        bookingNumber: 'BK-2026-0006',
        customer: customers[5]._id,
        vehicle: vehicles[5]._id, // Honda City
        serviceCentre: serviceCentres[1]._id,
        servicePackages: [
          { package: servicePackages[3]._id, name: servicePackages[3].name, price: 1299 },
        ],
        partsUsed: [
          { part: inventoryParts[6]._id, name: inventoryParts[6].name, quantity: 1, unitPrice: 2100, totalPrice: 2100 },
        ],
        status: 'Inspection',
        priority: 'Medium',
        scheduledDate: now,
        labourCost: 1299,
        partsCost: 2100,
        totalAmount: 3399,
        paymentStatus: 'Pending',
        assignedMechanic: users[2]._id,
        serviceAdvisor: users[1]._id,
      },

      // Booking 7 (Parts Replacement)
      {
        bookingNumber: 'BK-2026-0007',
        customer: customers[6]._id,
        vehicle: vehicles[6]._id, // Brezza
        serviceCentre: serviceCentres[0]._id,
        servicePackages: [
          { package: servicePackages[0]._id, name: servicePackages[0].name, price: 3499 },
        ],
        partsUsed: [
          { part: inventoryParts[7]._id, name: inventoryParts[7].name, quantity: 1, unitPrice: 5200, totalPrice: 5200 },
        ],
        status: 'Parts Replacement',
        priority: 'Medium',
        scheduledDate: now,
        labourCost: 3499,
        partsCost: 5200,
        totalAmount: 8699,
        paymentStatus: 'Pending',
        assignedMechanic: users[2]._id,
        serviceAdvisor: users[1]._id,
      },

      // Booking 8 (Scheduled for Tomorrow)
      {
        bookingNumber: 'BK-2026-0008',
        customer: customers[0]._id,
        vehicle: vehicles[0]._id,
        serviceCentre: serviceCentres[0]._id,
        servicePackages: [
          { package: servicePackages[4]._id, name: servicePackages[4].name, price: 999 },
        ],
        partsUsed: [],
        status: 'Booked',
        priority: 'Low',
        scheduledDate: tomorrow,
        labourCost: 999,
        partsCost: 0,
        totalAmount: 999,
        paymentStatus: 'Pending',
        serviceAdvisor: users[1]._id,
      },
    ]);

    console.log('✅ Database seeded successfully!');
    console.log(`- Service Centres: ${serviceCentres.length}`);
    console.log(`- Users: ${users.length} (Admin: admin@automotivemedium.com / Admin@123)`);
    console.log(`- Brands: ${brands.length}`);
    console.log(`- Service Packages: ${servicePackages.length}`);
    console.log(`- Inventory Parts: ${inventoryParts.length}`);
    console.log(`- Customers: ${customers.length}`);
    console.log(`- Vehicles: ${vehicles.length}`);
    console.log(`- Bookings: ${bookings.length}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
