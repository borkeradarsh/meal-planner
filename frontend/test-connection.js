// Test script to verify backend connection
const API_BASE = 'http://localhost:5000';

async function testConnection() {
  console.log('Testing backend connection...');
  
  try {
    // Test health endpoint
    const healthResponse = await fetch(`${API_BASE}/api/health`);
    const healthData = await healthResponse.json();
    console.log('Health check:', healthData);
    
    // Test pantry endpoint
    const pantryResponse = await fetch(`${API_BASE}/api/pantry`);
    const pantryData = await pantryResponse.json();
    console.log('Pantry data:', pantryData);
    
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

testConnection();
