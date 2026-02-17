
const { createClient } = require('@sanity/client');
require('dotenv').config();

const client = createClient({
    projectId: process.env.SANITY_PROJECT_ID,
    dataset: process.env.SANITY_DATASET || 'production',
    token: process.env.SANITY_API_TOKEN,
    useCdn: false,
    apiVersion: '2023-05-03',
});

async function main() {
    console.log('Testing Sanity WRITE access...');
    console.log('Project ID:', process.env.SANITY_PROJECT_ID);

    const doc = {
        _type: 'product',
        title: 'Test Product Direct Write',
        slug: {
            _type: 'slug',
            current: 'test-product-direct-write'
        },
        medusaId: 'test_medusa_id_123',
        subtitle: 'Created directly via script'
    };

    try {
        const res = await client.create(doc);
        console.log('✅ Document created successfully in Sanity!');
        console.log('Document ID:', res._id);

        // Clean up
        await client.delete(res._id);
        console.log('✅ Document deleted (cleanup).');
    } catch (error) {
        console.error('❌ Failed to create document in Sanity:');
        console.error(error.message);
        if (error.response) {
            console.error('Status:', error.response.statusCode);
            console.error('Body:', error.response.body);
        }
    }
}

main();
