import fetch from 'node-fetch';

async function testStats() {
    try {
        console.log('Testing GET /api/stats/products...');
        const response = await fetch('http://localhost:5000/api/stats/products');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));

        if (Array.isArray(data)) {
            console.log('SUCCESS: Received array of product stats');
        } else {
            console.error('FAILURE: Expected array, got', typeof data);
        }
    } catch (error) {
        console.error('ERROR:', error.message);
    }
}

testStats();
