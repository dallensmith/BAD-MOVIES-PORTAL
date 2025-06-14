#!/usr/bin/env node

// Test script to verify WordPress authentication
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WORDPRESS_URL = process.env.VITE_WORDPRESS_URL;
const WORDPRESS_API_URL = process.env.VITE_WORDPRESS_API_URL;
const WP_USERNAME = process.env.VITE_WP_USERNAME;
const WP_PASSWORD = process.env.VITE_WP_PASSWORD;

async function testAuthentication() {
  console.log('Testing WordPress Authentication...');
  console.log('WordPress URL:', WORDPRESS_URL);
  console.log('API URL:', WORDPRESS_API_URL);
  console.log('Username:', WP_USERNAME);
  console.log('Password:', WP_PASSWORD ? '***' : 'NOT SET');

  if (!WP_USERNAME || !WP_PASSWORD) {
    console.error('❌ WordPress credentials not found in environment variables');
    return;
  }

  try {
    // Check if JWT auth endpoint exists
    console.log('\n1. Checking if JWT auth endpoint exists...');
    try {
      await axios.get(`${WORDPRESS_URL}/wp-json/jwt-auth/v1/`);
      console.log('✅ JWT auth endpoint available');
    } catch (error) {
      console.warn('⚠️ JWT auth endpoint not available:', error.response?.status, error.response?.data?.message);
      console.log('Trying alternative authentication methods...');
    }

    // Test basic WordPress API access without auth
    console.log('\n2. Testing basic WordPress API access...');
    const apiResponse = await axios.get(`${WORDPRESS_API_URL}/`);
    console.log('✅ WordPress API accessible');
    console.log('Site name:', apiResponse.data.name);

    // Test with application password authentication
    console.log('\n3. Testing with basic auth (application password)...');
    const auth = Buffer.from(`${WP_USERNAME}:${WP_PASSWORD}`).toString('base64');
    
    try {
      const authTestResponse = await axios.get(`${WORDPRESS_API_URL}/users/me`, {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });
      console.log('✅ Basic authentication successful');
      console.log('User:', authTestResponse.data.name);

      // Test movies endpoint with basic auth
      console.log('\n4. Testing movies endpoint with basic auth...');
      try {
        const moviesResponse = await axios.get(`${WORDPRESS_API_URL}/movies`, {
          headers: {
            'Authorization': `Basic ${auth}`
          }
        });
        console.log('✅ Movies endpoint accessible');
        console.log('Movies found:', moviesResponse.data.length);
      } catch (error) {
        console.warn('⚠️ Movies endpoint issue:', error.response?.status, error.response?.data?.message);
      }

      // Test creating a movie with basic auth
      console.log('\n5. Testing movie creation with basic auth...');
      try {
        const testMovie = {
          title: 'Test Movie ' + Date.now(),
          content: 'This is a test movie to verify authentication',
          status: 'publish',
          tmdb_id: 12345,
          original_title: 'Test Movie Original',
          release_date: '2023-01-01',
          runtime: 120,
        };

        const createResponse = await axios.post(`${WORDPRESS_API_URL}/movies`, testMovie, {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('✅ Test movie created successfully with basic auth');
        console.log('Movie ID:', createResponse.data.id);
        console.log('Movie title:', createResponse.data.title?.rendered || createResponse.data.title);

        // Clean up - delete the test movie
        await axios.delete(`${WORDPRESS_API_URL}/movies/${createResponse.data.id}`, {
          headers: {
            'Authorization': `Basic ${auth}`
          },
          params: {
            force: true
          }
        });
        console.log('✅ Test movie cleaned up');

      } catch (error) {
        console.error('❌ Movie creation with basic auth failed:', error.response?.status, error.response?.data?.message);
        if (error.response?.data) {
          console.error('Error details:', JSON.stringify(error.response.data, null, 2));
        }
      }

    } catch (error) {
      console.error('❌ Basic authentication failed:', error.response?.status, error.response?.data?.message);
    }

  } catch (error) {
    console.error('❌ General test failed:', error.message);
  }
}

testAuthentication().catch(console.error);
