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

        const views = [];
        await base('PageViews').select({ pageSize: 100 }).eachPage((records, next) => {
            records.forEach(r => views.push({
                page: r.get('Page') || '',
                timestamp: r.get('Timestamp') || '',
                referrer: r.get('Referrer') || ''
            }));
            next();
        });

        const clients = [];
        await base('Clients').select({ pageSize: 100 }).eachPage((records, next) => {
            records.forEach(r => clients.push({
                status: r.get('Status') || '',
                clientType: r.get('ClientType') || '',
                createdAt: r.get('CreatedAt') || ''
            }));
            next();
        });

        const leads = [];
        await base('PipelineLeads').select({ pageSize: 100 }).eachPage((records, next) => {
            records.forEach(r => leads.push({
                stage: r.get('Stage') || '',
                category: r.get('Category') || '',
                submitted: r.get('Submitted') || ''
            }));
            next();
        });

        const projects = [];
        await base('Projects').select({ pageSize: 100 }).eachPage((records, next) => {
            records.forEach(r => projects.push({
                stage: r.get('Stage') || '',
                projectType: r.get('ProjectType') || ''
            }));
            next();
        });

        // Aggregate by page
        const pageCounts = {};
        views.forEach(v => { pageCounts[v.page] = (pageCounts[v.page] || 0) + 1; });

        // Views in last 30 days grouped by day
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        const last30 = {};
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now - i * dayMs).toISOString().slice(0, 10);
            last30[d] = 0;
        }
        views.forEach(v => {
            const d = (v.timestamp || '').slice(0, 10);
            if (d in last30) last30[d]++;
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                totalViews: views.length,
                totalClients: clients.length,
                totalLeads: leads.length,
                totalProjects: projects.length,
                pageCounts,
                dailyViews: last30,
                clientsByType: countBy(clients, 'clientType'),
                clientsByStatus: countBy(clients, 'status'),
                leadsByStage: countBy(leads, 'stage'),
                leadsByCategory: countBy(leads, 'category'),
                projectsByStage: countBy(projects, 'stage'),
                projectsByType: countBy(projects, 'projectType')
            })
        };
    } catch (error) {
        console.error('Analytics error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to fetch analytics' }) };
    }
};

function countBy(arr, key) {
    const out = {};
    arr.forEach(item => {
        const k = item[key] || 'Unspecified';
        out[k] = (out[k] || 0) + 1;
    });
    return out;
}
