#!/usr/bin/env node

const axios = require('axios');

// Load environment variables
require('dotenv').config();

const WORDPRESS_URL = process.env.VITE_WORDPRESS_URL;

console.log('Exploring available Pods API routes...');

async function explorePodsRoutes() {
  try {
    console.log('=== Checking Pods API root ===');
    const response = await axios.get(`${WORDPRESS_URL}/wp-json/pods/v1`);
    
    console.log('Available routes:');
    if (response.data.routes) {
      Object.keys(response.data.routes).forEach(route => {
        console.log('  -', route);
        const routeData = response.data.routes[route];
        if (routeData.methods) {
          console.log('    Methods:', routeData.methods);
        }
      });
    }
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.data || error.message);
  }
}

explorePodsRoutes();
