const Airtable = require('airtable');
const { requireAdmin } = require('./_auth');

exports.handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const auth = requireAdmin(event);
    if (!auth.ok) {
        return { statusCode: auth.statusCode, body: JSON.stringify(auth.body) };
    }

    try {
        const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
        const leads = [];
        await base('PipelineLeads').select({
            pageSize: 100,
            sort: [{ field: 'Submitted', direction: 'desc' }]
        }).eachPage((records, next) => {
            records.forEach(r => leads.push({
                id: r.id,
                name: r.get('Name') || '',
                email: r.get('Email') || '',
                brand: r.get('Brand') || '',
                category: r.get('Category') || '',
                message: r.get('Message') || '',
                stage: r.get('Stage') || '',
                source: r.get('Source') || '',
                submitted: r.get('Submitted') || ''
            }));
            next();
        });

        return { statusCode: 200, body: JSON.stringify({ leads }) };
    } catch (error) {
        console.error('get-leads error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch leads' }) };
    }
};
