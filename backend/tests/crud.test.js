import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from '../src/server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

describe('CRUD & MongoDB Aggregation Endpoints', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0 && process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    }
  }, 10000);

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('GET /api/customers should return list of customers', async () => {
    const res = await request(app).get('/api/customers');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/service-packages should return active service packages', async () => {
    const res = await request(app).get('/api/service-packages');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/inventory should return inventory parts', async () => {
    const res = await request(app).get('/api/inventory');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/service-centres should return workshop network centres', async () => {
    const res = await request(app).get('/api/service-centres');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/bookings should return service bookings', async () => {
    const res = await request(app).get('/api/bookings');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/reports/dashboard-kpis should return aggregated MongoDB KPIs', async () => {
    const res = await request(app).get('/api/reports/dashboard-kpis');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('totalBookings');
    expect(res.body.data).toHaveProperty('totalRevenue');
  });

  it('GET /api/reports/bookings-by-brand should execute MongoDB aggregation pipeline', async () => {
    const res = await request(app).get('/api/reports/bookings-by-brand');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/reports/monthly-revenue should execute monthly revenue pipeline', async () => {
    const res = await request(app).get('/api/reports/monthly-revenue');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
