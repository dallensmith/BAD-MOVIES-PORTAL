#!/usr/bin/env node

const axios = require('axios');

// Load environment variables
require('dotenv').config();

const WORDPRESS_URL = process.env.VITE_WORDPRESS_URL;
const WORDPRESS_API_URL = process.env.VITE_WORDPRESS_API_URL;
const WP_USERNAME = process.env.VITE_WP_USERNAME;
const WP_PASSWORD = process.env.VITE_WP_PASSWORD;

console.log('Testing the platform fetching as the portal would do it...');

async function testPortalPlatformFetching() {
  try {
    // Simulate the portal's authentication process
    console.log('=== Step 1: Authenticate (Basic Auth) ===');
    
    if (!WP_USERNAME || !WP_PASSWORD) {
      console.log('❌ No WordPress credentials found');
      return;
    }

    // Create basic auth token like the portal does
    const basicAuthToken = Buffer.from(`${WP_USERNAME}:${WP_PASSWORD}`).toString('base64');
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${basicAuthToken}`
    };

    // Test authentication by getting user info
    try {
      const userResponse = await axios.get(`${WORDPRESS_URL}/wp-json/wp/v2/users/me`, {
        headers: authHeaders
      });
      console.log('✅ Authentication successful, user:', userResponse.data.name);
    } catch (authError) {
      console.log('❌ Authentication failed:', authError.response?.data);
      return;
    }

    console.log('\n=== Step 2: Fetch Platform List ===');
    
    // Method 1: Try the primary Pods endpoint
    try {
      const podsFieldUrl = `${WORDPRESS_URL}/wp-json/pods/v1/pods/experiment/fields/event_location`;
      console.log('Trying primary endpoint:', podsFieldUrl);
      
      const response = await axios.get(podsFieldUrl, { headers: authHeaders });
      
      if (response.data && response.data.field && response.data.field.pick_custom) {
        const pickCustom = response.data.field.pick_custom;
        console.log('✅ Found pick_custom field:', JSON.stringify(pickCustom));
        
        const platformNames = pickCustom.split('\n').map(name => name.trim()).filter(name => name);
        console.log('✅ Available platforms:', platformNames);
        
        // Verify "test" platform is included
        if (platformNames.includes('test')) {
          console.log('🎯 SUCCESS: "test" platform is included in the list!');
        } else {
          console.log('❌ "test" platform is NOT in the list');
        }
        
        return platformNames;
      }
    } catch (error) {
      console.log('❌ Primary endpoint failed:', error.response?.status, error.response?.data);
    }

    // Method 2: Try the fields endpoint
    try {
      const podsFieldsUrl = `${WORDPRESS_URL}/wp-json/pods/v1/fields`;
      console.log('Trying fields endpoint:', podsFieldsUrl);
      
      const response = await axios.get(podsFieldsUrl, { headers: authHeaders });
      
      if (response.data && response.data.fields) {
        const eventLocationField = response.data.fields.find(field => field.name === 'event_location');
        if (eventLocationField && eventLocationField.pick_custom) {
          const pickCustom = eventLocationField.pick_custom;
          console.log('✅ Found pick_custom from fields:', JSON.stringify(pickCustom));
          
          const platformNames = pickCustom.split('\n').map(name => name.trim()).filter(name => name);
          console.log('✅ Available platforms:', platformNames);
          
          if (platformNames.includes('test')) {
            console.log('🎯 SUCCESS: "test" platform is included in the list!');
          }
          
          return platformNames;
        }
      }
    } catch (error) {
      console.log('❌ Fields endpoint failed:', error.response?.status, error.response?.data);
    }

    console.log('❌ Could not fetch platforms from any Pods endpoint');

  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testPortalPlatformFetching();
