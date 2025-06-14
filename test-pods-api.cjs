#!/usr/bin/env node

const axios = require('axios');

// Load environment variables
require('dotenv').config();

const WORDPRESS_URL = process.env.VITE_WORDPRESS_URL;
const WORDPRESS_API_URL = process.env.VITE_WORDPRESS_API_URL;
const WP_USERNAME = process.env.VITE_WP_USERNAME;
const WP_PASSWORD = process.env.VITE_WP_PASSWORD;

console.log('Testing WordPress Pods API endpoints...');
console.log('WordPress URL:', WORDPRESS_URL);
console.log('WordPress API URL:', WORDPRESS_API_URL);

async function testPodsEndpoints() {
  try {
    // First, authenticate if credentials are available
    let authToken = null;
    if (WP_USERNAME && WP_PASSWORD) {
      try {
        console.log('\n=== Authenticating ===');
        const authResponse = await axios.post(`${WORDPRESS_URL}/wp-json/jwt-auth/v1/token`, {
          username: WP_USERNAME,
          password: WP_PASSWORD
        });
        authToken = authResponse.data.token;
        console.log('Authentication successful');
      } catch (authError) {
        console.warn('Authentication failed:', authError.response?.data || authError.message);
      }
    }

    // Set up headers
    const headers = {
      'Content-Type': 'application/json'
    };
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    // Test various Pods API endpoints
    const endpointsToTest = [
      `${WORDPRESS_URL}/wp-json/pods/v1/experiment/_pod`,
      `${WORDPRESS_URL}/wp-json/pods/v1/fields/experiment/event_location`,
      `${WORDPRESS_URL}/wp-json/pods/v1/experiment/fields/event_location`,
      `${WORDPRESS_URL}/wp-json/pods/v1/experiment/fields`,
      `${WORDPRESS_URL}/wp-json/pods/v1/experiment`,
      `${WORDPRESS_URL}/wp-json/pods/v1/fields`,
      `${WORDPRESS_URL}/wp-json/pods/v1`,
    ];

    for (const endpoint of endpointsToTest) {
      try {
        console.log(`\n=== Testing: ${endpoint} ===`);
        const response = await axios.get(endpoint, { headers });
        console.log('Status:', response.status);
        console.log('Data structure:', typeof response.data);
        
        if (response.data) {
          // Look for event_location field specifically
          if (response.data.fields) {
            const eventLocationField = response.data.fields.find(field => field.name === 'event_location');
            if (eventLocationField) {
              console.log('Found event_location field:', eventLocationField);
              if (eventLocationField.pick_custom) {
                const platforms = eventLocationField.pick_custom.split('\n').map(name => name.trim()).filter(name => name);
                console.log('Available platforms:', platforms);
              }
            } else {
              console.log('Available fields:', response.data.fields.map(f => f.name));
            }
          } else if (response.data.pick_custom) {
            console.log('Found pick_custom directly:', response.data.pick_custom);
          } else if (Array.isArray(response.data)) {
            console.log('Response is array with', response.data.length, 'items');
            if (response.data.length > 0) {
              console.log('First item keys:', Object.keys(response.data[0]));
            }
          } else {
            console.log('Response keys:', Object.keys(response.data));
          }
        }
      } catch (error) {
        console.log('Error:', error.response?.status, error.response?.statusText);
        if (error.response?.data) {
          console.log('Error data:', error.response.data);
        }
      }
    }

    // Test getting existing experiments to see structure
    console.log(`\n=== Testing existing experiments ===`);
    try {
      const experimentsResponse = await axios.get(`${WORDPRESS_API_URL}/experiments`, {
        headers,
        params: { per_page: 3 }
      });
      console.log('Experiments found:', experimentsResponse.data.length);
      if (experimentsResponse.data.length > 0) {
        const firstExperiment = experimentsResponse.data[0];
        console.log('First experiment keys:', Object.keys(firstExperiment));
        if (firstExperiment.event_location) {
          console.log('event_location:', firstExperiment.event_location);
          console.log('event_location type:', typeof firstExperiment.event_location);
        }
      }
    } catch (error) {
      console.log('Error fetching experiments:', error.response?.status, error.response?.data);
    }

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testPodsEndpoints();
