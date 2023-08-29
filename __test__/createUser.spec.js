const request = require('supertest');
const app = require('../app')

describe('GET /api/v1/employees', function() {
  it('responds with json', async function() {
    await request(app)
      .get('/api/v1/employees')
      .expect('Content-Type', /json/)
      .expect(200)
  });
});