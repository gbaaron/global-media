const Airtable = require('airtable');
const { requireAdmin } = require('./_auth');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const auth = requireAdmin(event);
    if (!auth.ok) {
        return { statusCode: auth.statusCode, body: JSON.stringify(auth.body) };
    }

    try {
        const { id } = JSON.parse(event.body);
        if (!id) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Client id is required' }) };
        }

        const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
        await base('Clients').destroy([id]);

        return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (error) {
        console.error('Delete client error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to delete client' }) };
    }
};
