/**
 * Server API Tests using Jest
 * 
 * This file contains tests for the server API endpoints using Jest framework.
 * Make sure the server is running before executing these tests.
 * 
 * To run: npm test
 */

// env var provided by hylix testing environment
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:4002';

// Test data - you may need to adjust these based on your actual blob format
const MOCK_WALLET_BLOBS = [
  "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321"
];

const TEST_USER = "test-user-123";

/**
 * Helper function to make HTTP requests
 */
async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });

  const data = await response.text();
  let jsonData;
  try {
    jsonData = JSON.parse(data);
  } catch (e) {
    jsonData = data;
  }

  return {
    status: response.status,
    statusText: response.statusText,
    data: jsonData,
    headers: response.headers
  };
}

describe('Server API Tests', () => {
  // Global setup - check if server is reachable
  beforeAll(async () => {
    try {
      const response = await fetch(`${BASE_URL}/_health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      if (!response.ok) {
        throw new Error(`Server not responding: ${response.status}`);
      }
    } catch (error) {
      throw new Error(`Cannot connect to server at ${BASE_URL}. Make sure the server is running. Error: ${error.message}`);
    }
  });

  describe('Health Endpoint', () => {
    test('should return OK status', async () => {
      const response = await makeRequest(`${BASE_URL}/_health`);

      expect(response.status).toBe(200);
      expect(response.data).toBe("OK");
    });

    test('should respond quickly', async () => {
      const start = Date.now();
      await makeRequest(`${BASE_URL}/_health`);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Should respond within 1 second
    });
  });

  describe('Config Endpoint', () => {
    test('should return configuration data', async () => {
      const response = await makeRequest(`${BASE_URL}/api/config`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('contract_name');
      expect(typeof response.data.contract_name).toBe('string');
      expect(response.data.contract_name.length).toBeGreaterThan(0);
    });

    test('should return valid JSON', async () => {
      const response = await makeRequest(`${BASE_URL}/api/config`);

      expect(response.status).toBe(200);
      expect(typeof response.data).toBe('object');
      expect(response.data).not.toBeNull();
    });
  });

  // describe('Increment Endpoint', () => {
  //   test('should reject requests without authentication', async () => {
  //     const response = await makeRequest(`${BASE_URL}/api/increment`, {
  //       method: 'POST',
  //       body: JSON.stringify({
  //         wallet_blobs: MOCK_WALLET_BLOBS
  //       })
  //     });
  //
  //     expect(response.status).toBe(401);
  //   });
  //
  //   test('should accept requests with authentication header', async () => {
  //     const response = await makeRequest(`${BASE_URL}/api/increment`, {
  //       method: 'POST',
  //       headers: {
  //         'x-user': TEST_USER
  //       },
  //       body: JSON.stringify({
  //         wallet_blobs: MOCK_WALLET_BLOBS
  //       })
  //     });
  //
  //     // Should not return 401 (unauthorized) - auth header is accepted
  //     expect(response.status).not.toBe(401);
  //
  //     // Could be 200 (success) or 400 (bad request due to mock data)
  //     expect([200, 400]).toContain(response.status);
  //   });
  //
  //   test('should require valid JSON body', async () => {
  //     const response = await makeRequest(`${BASE_URL}/api/increment`, {
  //       method: 'POST',
  //       headers: {
  //         'x-user': TEST_USER
  //       },
  //       body: 'invalid json'
  //     });
  //
  //     expect(response.status).toBe(400);
  //   });
  //
  //   test('should require wallet_blobs in request body', async () => {
  //     const response = await makeRequest(`${BASE_URL}/api/increment`, {
  //       method: 'POST',
  //       headers: {
  //         'x-user': TEST_USER
  //       },
  //       body: JSON.stringify({})
  //     });
  //
  //     expect(response.status).toBe(400);
  //   });
  // });

  describe('CORS Headers', () => {
    test('should include CORS headers in responses', async () => {
      const response = await makeRequest(`${BASE_URL}/_health`);

      const corsHeaders = {
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': response.headers.get('access-control-allow-methods'),
        'access-control-allow-headers': response.headers.get('access-control-allow-headers')
      };

      expect(corsHeaders['access-control-allow-origin']).toBeTruthy();
    });

    test('should handle preflight OPTIONS requests', async () => {
      const response = await makeRequest(`${BASE_URL}/_health`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3001',
          'Access-Control-Request-Method': 'GET'
        }
      });

      // OPTIONS request should not return an error
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Error Handling', () => {
    test('should return 404 for non-existent endpoints', async () => {
      const response = await makeRequest(`${BASE_URL}/api/nonexistent`);

      expect(response.status).toBe(404);
    });

    test('should handle malformed requests gracefully', async () => {
      const response = await makeRequest(`${BASE_URL}/api/increment`, {
        method: 'POST',
        headers: {
          'x-user': TEST_USER,
          'Content-Type': 'application/json'
        },
        body: '{"invalid": json}'
      });

      expect(response.status).toBe(400);
    });
  });

});
