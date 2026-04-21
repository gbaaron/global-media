const Airtable = require('airtable');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { name, email, brand, category, message, source } = JSON.parse(event.body || '{}');

        if (!name || !email || !message) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Name, email, and message are required' }) };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email format' }) };
        }

        const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

        const fields = {
            Name: name.trim().substring(0, 200),
            Email: email.trim().toLowerCase().substring(0, 200),
            Brand: (brand || '').trim().substring(0, 200),
            Message: message.trim().substring(0, 5000),
            Stage: 'New',
            Source: (source || 'contact-form').substring(0, 100),
            Submitted: new Date().toISOString()
        };
        if (category) fields.Category = category;

        await base('PipelineLeads').create([{ fields }]);

        return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (error) {
        console.error('submit-lead error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to submit. Try again.' }) };
    }
};
