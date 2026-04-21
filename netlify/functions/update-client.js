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
        const { id, name, email, username, password, company, projectUrl, clientType, status, notes } = JSON.parse(event.body);

        if (!id) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Client id is required' }) };
        }

        const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

        const fields = {};
        if (name !== undefined) fields.Name = name.trim();
        if (email !== undefined) fields.Email = email.trim().toLowerCase();
        if (username !== undefined) fields.Username = username.trim();
        if (password !== undefined && password !== '') fields.PasswordHash = password;
        if (company !== undefined) fields.Company = company ? company.trim() : '';
        if (projectUrl !== undefined) fields.ProjectURL = projectUrl.trim();
        if (clientType !== undefined) fields.ClientType = clientType || null;
        if (status !== undefined) fields.Status = status || null;
        if (notes !== undefined) fields.Notes = notes || '';

        const updated = await base('Clients').update([{ id, fields }]);

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                client: {
                    id: updated[0].id,
                    name: updated[0].get('Name'),
                    email: updated[0].get('Email'),
                    username: updated[0].get('Username') || '',
                    company: updated[0].get('Company') || '',
                    projectUrl: updated[0].get('ProjectURL') || '',
                    clientType: updated[0].get('ClientType') || '',
                    status: updated[0].get('Status') || '',
                    notes: updated[0].get('Notes') || ''
                }
            })
        };

    } catch (error) {
        console.error('Update client error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to update client' }) };
    }
};
