const { createClient } = require('@sanity/client');
require('dotenv').config();

const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || 'production',
    useCdn: false,
    apiVersion: '2023-05-03',
    token: process.env.SANITY_API_TOKEN
});

async function testConnection() {
    console.log('Testing Sanity connection from Backend...');
    console.log(`Project ID: ${process.env.SANITY_PROJECT_ID}`);
    console.log(`Dataset: ${process.env.SANITY_DATASET}`);

    try {
        const products = await client.fetch('*[_type == "product"][0...5]');
        console.log('✅ Connection Successful!');
        console.log(`Found ${products.length} products.`);
        if (products.length > 0) {
            console.log('Sample product:', products[0].title);
        }
    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
    }
}

testConnection();
