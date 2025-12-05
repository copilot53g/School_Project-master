export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // required token provided directly (server-side only)
    const token = 'QgHfUuQRpbHlJKGqZAB8X8QV';

    const { put } = await import('@vercel/blob');

    const content = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {}, null, 2);
    const path = 'students/students.json';

    const { url } = await put(path, content, { access: 'public', token });
    return res.status(200).json({ url });
  } catch (err) {
    console.error('save-students error', err);
    return res.status(500).json({ error: err?.message || String(err) });
  }
}