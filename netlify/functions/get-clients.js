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

        const records = [];
        await base('Clients').select({
            pageSize: 100,
            sort: [{ field: 'CreatedAt', direction: 'desc' }]
        }).eachPage((pageRecords, fetchNextPage) => {
            pageRecords.forEach(r => records.push({
                id: r.id,
                name: r.get('Name') || '',
                email: r.get('Email') || '',
                username: r.get('Username') || '',
                company: r.get('Company') || '',
                projectUrl: r.get('ProjectURL') || '',
                clientType: r.get('ClientType') || '',
                status: r.get('Status') || '',
                createdAt: r.get('CreatedAt') || '',
                lastLogin: r.get('LastLogin') || '',
                notes: r.get('Notes') || ''
            }));
            fetchNextPage();
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ clients: records })
        };
    } catch (error) {
        console.error('Get clients error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch clients' }) };
    }
};
