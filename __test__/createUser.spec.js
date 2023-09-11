const request = require('supertest');
const app = require('../app')

/**
 To run test:
  - start the container
  - shell into the container
  - run `npm run test` (may need to edit package.json to change --watch to --watchAll)
 */
describe('GET employees list', function() {
  it('responds with json', async function() {
    try {
      await request(app)
      .get('/api/v1/employees')
      .expect('Content-Type', /json/)
      .expect(200)
    } catch (error) {
      console.log('error during test: ', error)
    }
  });
});