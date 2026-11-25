import request from 'supertest';
import app from '../src/server.js';

describe('Health Check API Endpoint', () => {
  it('GET /api/health should respond with json and service information', async () => {
    const res = await request(app).get('/api/health');
    
    // Status can be 200 (if connected) or 503 (if DB offline), but structure is strictly valid
    expect([200, 503]).toContain(res.statusCode);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('service', 'Automotivemedium API');
    expect(res.body).toHaveProperty('version', '1.0.0');
    expect(res.body).toHaveProperty('uptimeSeconds');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('database');
    expect(res.body.database).toHaveProperty('status');
  });

  it('GET / should return welcome payload and documentation links', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('healthCheck', '/api/health');
  });

  it('GET /api/unknown-route should return 404 with standard error format', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('message');
  });
});
