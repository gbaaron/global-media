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
        const { projectName, clientEmail, projectType, stage, previewUrl, liveUrl, startDate, launchDate, notes } = JSON.parse(event.body);

        if (!projectName) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Project name is required' }) };
        }

        const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

        const fields = { ProjectName: projectName.trim() };
        if (clientEmail) fields.ClientEmail = clientEmail.trim().toLowerCase();
        if (projectType) fields.ProjectType = projectType;
        if (stage) fields.Stage = stage;
        if (previewUrl) fields.PreviewURL = previewUrl.trim();
        if (liveUrl) fields.LiveURL = liveUrl.trim();
        if (startDate) fields.StartDate = startDate;
        if (launchDate) fields.LaunchDate = launchDate;
        if (notes) fields.Notes = notes;

        const created = await base('Projects').create([{ fields }]);
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, id: created[0].id })
        };
    } catch (error) {
        console.error('create-project error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to create project' }) };
    }
};
