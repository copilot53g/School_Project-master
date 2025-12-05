export default async function handler(req, res) {
  try {
    const { get } = await import('@vercel/blob');

    const path = 'students/students.json';
    const content = await get(path);
    if (!content) return res.status(404).json({ error: 'Not found' });

    try {
      return res.status(200).json(JSON.parse(content));
    } catch {
      return res.status(200).send(content);
    }
  } catch (err) {
    console.warn('get-students error', err);
    return res.status(404).json({ error: 'No remote students' });
  }
}