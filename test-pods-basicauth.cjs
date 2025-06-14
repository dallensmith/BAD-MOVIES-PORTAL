#!/usr/bin/env node

const axios = require('axios');

// Load environment variables
require('dotenv').config();

const WORDPRESS_URL = process.env.VITE_WORDPRESS_URL;
const WP_USERNAME = process.env.VITE_WP_USERNAME;
const WP_PASSWORD = process.env.VITE_WP_PASSWORD;

console.log('Testing Pods API with Basic Auth...');

async function testPodsWithBasicAuth() {
  if (!WP_USERNAME || !WP_PASSWORD) {
    console.log('No WordPress credentials found in environment variables');
    return;
  }

  try {
    // Create basic auth token
    const basicAuthToken = Buffer.from(`${WP_USERNAME}:${WP_PASSWORD}`).toString('base64');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${basicAuthToken}`
    };

    console.log('Using Basic Auth with username:', WP_USERNAME);

    // Test the field-specific endpoint
    const fieldEndpoints = [
      `${WORDPRESS_URL}/wp-json/pods/v1/pods/experiment/fields/event_location`,
      `${WORDPRESS_URL}/wp-json/pods/v1/pods/experiment`,
      `${WORDPRESS_URL}/wp-json/pods/v1/fields`,
    ];

    for (const endpoint of fieldEndpoints) {
      try {
        console.log(`\n=== Testing: ${endpoint} ===`);
        const response = await axios.get(endpoint, { headers });
        console.log('✅ Status:', response.status);
        console.log('Response keys:', Object.keys(response.data));
        
        // Look for field configuration
        if (response.data.pick_custom) {
          console.log('🎯 Found pick_custom:', response.data.pick_custom);
          const platforms = response.data.pick_custom.split('\n').map(name => name.trim()).filter(name => name);
          console.log('🎯 Available platforms:', platforms);
        } else if (response.data.options) {
          console.log('Found options:', response.data.options);
        } else if (response.data.fields) {
          console.log('Found fields structure');
          const eventLocationField = response.data.fields.find(f => f.name === 'event_location');
          if (eventLocationField) {
            console.log('🎯 event_location field:', eventLocationField);
            if (eventLocationField.pick_custom) {
              console.log('🎯 pick_custom in field:', eventLocationField.pick_custom);
              const platforms = eventLocationField.pick_custom.split('\n').map(name => name.trim()).filter(name => name);
              console.log('🎯 Available platforms:', platforms);
            }
          }
        } else if (Array.isArray(response.data)) {
          console.log('Response is array with', response.data.length, 'items');
          if (response.data.length > 0) {
            console.log('First item keys:', Object.keys(response.data[0]));
          }
        } else {
          console.log('Full response (first 500 chars):', JSON.stringify(response.data, null, 2).substring(0, 500));
        }
      } catch (error) {
        console.log('❌ Error:', error.response?.status, error.response?.statusText);
        if (error.response?.data) {
          console.log('Error details:', error.response.data);
        }
      }
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testPodsWithBasicAuth();
