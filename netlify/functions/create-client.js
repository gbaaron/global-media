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
        const { name, email, username, password, company, projectUrl, clientType, status, notes } = JSON.parse(event.body);

        if (!name || !email || !username || !password || !projectUrl) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Name, email, username, password, and project URL are required' })
            };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email format' }) };
        }

        if (password.length < 6) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Password must be at least 6 characters' }) };
        }

        const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

        const existing = await base('Clients').select({
            filterByFormula: `OR(LOWER({Email}) = '${email.toLowerCase().replace(/'/g, "\\'")}', {Username} = '${username.replace(/'/g, "\\'")}')`,
            maxRecords: 1
        }).firstPage();

        if (existing.length > 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'A client with this email or username already exists' })
            };
        }

        const fields = {
            Name: name.trim(),
            Email: email.trim().toLowerCase(),
            Username: username.trim(),
            Password: password,
            Company: company ? company.trim() : '',
            ProjectURL: projectUrl.trim(),
            CreatedAt: new Date().toISOString()
        };
        if (clientType) fields.ClientType = clientType;
        if (status) fields.Status = status;
        if (notes) fields.Notes = notes;

        const newRecord = await base('Clients').create([{ fields }]);

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                client: {
                    id: newRecord[0].id,
                    name: newRecord[0].get('Name'),
                    email: newRecord[0].get('Email'),
                    username: newRecord[0].get('Username'),
                    company: newRecord[0].get('Company'),
                    projectUrl: newRecord[0].get('ProjectURL'),
                    clientType: newRecord[0].get('ClientType') || '',
                    status: newRecord[0].get('Status') || '',
                    createdAt: newRecord[0].get('CreatedAt'),
                    notes: newRecord[0].get('Notes') || ''
                }
            })
        };

    } catch (error) {
        console.error('Create client error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to create client' }) };
    }
};
