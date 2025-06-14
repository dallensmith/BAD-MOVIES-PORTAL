/**
 * Debug script to test different WordPress Pods REST API endpoints
 * Run this to see what endpoints are available and what data they return
 */

async function debugPodsAPI() {
  console.log('=== Debugging WordPress Pods REST API ===\n');
  
  const baseUrl = 'http://wp-headless.local';
  const endpoints = [
    // Try different possible endpoints for field metadata
    '/wp-json/pods/v1/fields/experiment/event_location',
    '/wp-json/pods/v1/experiment/fields/event_location',
    '/wp-json/pods/v1/experiment',
    '/wp-json/wp/v2/experiment?_fields=meta',
    
    // Generic discovery endpoints
    '/wp-json/pods/v1',
    '/wp-json/pods/v1/fields',
    '/wp-json/pods/v1/experiment/fields',
    
    // Try accessing the experiment pod definition
    '/wp-json/pods/v1/experiment/_pod',
  ];
  
  for (const endpoint of endpoints) {
    console.log(`\n--- Testing: ${endpoint} ---`);
    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Success:', JSON.stringify(data, null, 2));
      } else {
        console.log(`❌ HTTP ${response.status}: ${response.statusText}`);
        if (response.status === 404) {
          console.log('   (Endpoint not found)');
        }
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }
}

// Run the debug function
debugPodsAPI().catch(console.error);
