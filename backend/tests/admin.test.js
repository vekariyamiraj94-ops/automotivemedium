import request from 'supertest';
import app from '../src/server.js';

describe('Admin Profile & Security APIs', () => {
  it('GET /api/admin/profile should reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/admin/profile');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.message).toMatch(/Not authorized/i);
  });

  it('PUT /api/admin/profile should reject unauthenticated update requests with 401', async () => {
    const res = await request(app)
      .put('/api/admin/profile')
      .send({ name: 'Hacker Admin' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('success', false);
  });

  it('PUT /api/admin/change-password should reject unauthenticated password change with 401', async () => {
    const res = await request(app)
      .put('/api/admin/change-password')
      .send({
        currentPassword: 'wrong',
        newPassword: 'newPassword123!',
        confirmPassword: 'newPassword123!',
      });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('success', false);
  });

  it('PUT /api/admin/settings should reject unauthenticated settings update with 401', async () => {
    const res = await request(app)
      .put('/api/admin/settings')
      .send({ language: 'Hindi' });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('success', false);
  });

  it('POST /api/admin/logout should clear cookie and return success message', async () => {
    const res = await request(app).post('/api/admin/logout');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.message).toMatch(/logged out successfully/i);
  });
});
