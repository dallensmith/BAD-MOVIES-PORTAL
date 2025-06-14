#!/usr/bin/env node

const axios = require('axios');

// Load environment variables
require('dotenv').config();

const WORDPRESS_API_URL = process.env.VITE_WORDPRESS_API_URL;

console.log('Testing experiment data fetching...');
console.log('WordPress API URL:', WORDPRESS_API_URL);

async function testExperimentData() {
  try {
    console.log('\n=== Fetching experiments ===');
    const experimentsResponse = await axios.get(`${WORDPRESS_API_URL}/experiments`, {
      params: { per_page: 10, _embed: true }
    });
    
    console.log('Found', experimentsResponse.data.length, 'experiments');
    
    if (experimentsResponse.data.length > 0) {
      const allPlatforms = new Set();
      
      experimentsResponse.data.forEach((experiment, index) => {
        console.log(`\nExperiment ${index + 1}:`);
        console.log('  Title:', experiment.title?.rendered || 'No title');
        console.log('  event_location:', experiment.event_location);
        console.log('  event_location type:', typeof experiment.event_location);
        console.log('  event_location is array:', Array.isArray(experiment.event_location));
        
        if (experiment.event_location) {
          if (Array.isArray(experiment.event_location)) {
            experiment.event_location.forEach((platform) => {
              console.log(`    Platform: "${platform}" (type: ${typeof platform})`);
              if (typeof platform === 'string') {
                allPlatforms.add(platform.trim());
              }
            });
          } else if (typeof experiment.event_location === 'string') {
            console.log(`    Single platform: "${experiment.event_location}"`);
            allPlatforms.add(experiment.event_location.trim());
          }
        }
      });
      
      console.log('\n=== Collected platforms ===');
      console.log('All platforms found:', Array.from(allPlatforms));
      
      if (allPlatforms.size > 0) {
        console.log('\n✅ Method 3 should work! The platform data is available from existing experiments.');
      } else {
        console.log('\n❌ No platforms found in existing experiments.');
      }
    }
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.data || error.message);
  }
}

testExperimentData();
