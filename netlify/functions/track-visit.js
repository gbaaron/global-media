const Airtable = require('airtable');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { page, referrer } = JSON.parse(event.body || '{}');
        const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

        await base('PageViews').create([{
            fields: {
                Page: (page || 'unknown').substring(0, 100),
                Referrer: (referrer || '').substring(0, 500),
                UserAgent: (event.headers['user-agent'] || '').substring(0, 500),
                IP: event.headers['x-forwarded-for'] || event.headers['client-ip'] || '',
                Timestamp: new Date().toISOString()
            }
        }]);

        return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (error) {
        // fire-and-forget: never surface errors to the client
        console.error('track-visit error:', error);
        return { statusCode: 200, body: JSON.stringify({ success: false }) };
    }
};
