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
        const { id, projectName, clientEmail, projectType, stage, previewUrl, liveUrl, startDate, launchDate, notes } = JSON.parse(event.body);
        if (!id) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Project id is required' }) };
        }

        const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
        const fields = {};
        if (projectName !== undefined) fields.ProjectName = projectName.trim();
        if (clientEmail !== undefined) fields.ClientEmail = (clientEmail || '').trim().toLowerCase();
        if (projectType !== undefined) fields.ProjectType = projectType || null;
        if (stage !== undefined) fields.Stage = stage || null;
        if (previewUrl !== undefined) fields.PreviewURL = (previewUrl || '').trim();
        if (liveUrl !== undefined) fields.LiveURL = (liveUrl || '').trim();
        if (startDate !== undefined) fields.StartDate = startDate || '';
        if (launchDate !== undefined) fields.LaunchDate = launchDate || '';
        if (notes !== undefined) fields.Notes = notes || '';

        await base('Projects').update([{ id, fields }]);
        return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (error) {
        console.error('update-project error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to update project' }) };
    }
};
