import request from 'supertest';
import app from '../src/server.js';

async function runBenchmark() {
  const endpoints = [
    { name: 'Health Check (/api/health)', path: '/api/health' },
    { name: 'Root Endpoint (/)', path: '/' },
    { name: 'Brand Catalog (/api/brands)', path: '/api/brands' },
    { name: 'Service Packages (/api/service-packages)', path: '/api/service-packages' },
    { name: 'Service Centres (/api/service-centres)', path: '/api/service-centres' },
  ];

  console.log('=== REAL API LATENCY MEASUREMENTS ===');
  for (const ep of endpoints) {
    const times = [];
    for (let i = 0; i < 5; i++) {
      const start = process.hrtime();
      await request(app).get(ep.path);
      const diff = process.hrtime(start);
      const ms = diff[0] * 1e3 + diff[1] * 1e-6;
      times.push(ms);
    }
    const avg = (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2);
    const min = Math.min(...times).toFixed(2);
    const max = Math.max(...times).toFixed(2);
    console.log(`Endpoint: ${ep.name}`);
    console.log(`  Avg Latency: ${avg} ms | Min: ${min} ms | Max: ${max} ms`);
  }
}

runBenchmark().then(() => process.exit(0)).catch((err) => {
  console.error(err);
  process.exit(1);
});
