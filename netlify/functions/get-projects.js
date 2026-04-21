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
        const projects = [];
        await base('Projects').select({ pageSize: 100 }).eachPage((records, next) => {
            records.forEach(r => projects.push({
                id: r.id,
                projectName: r.get('ProjectName') || '',
                clientEmail: r.get('ClientEmail') || '',
                projectType: r.get('ProjectType') || '',
                stage: r.get('Stage') || '',
                previewUrl: r.get('PreviewURL') || '',
                liveUrl: r.get('LiveURL') || '',
                startDate: r.get('StartDate') || '',
                launchDate: r.get('LaunchDate') || '',
                notes: r.get('Notes') || ''
            }));
            next();
        });

        return { statusCode: 200, body: JSON.stringify({ projects }) };
    } catch (error) {
        console.error('get-projects error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch projects' }) };
    }
};
