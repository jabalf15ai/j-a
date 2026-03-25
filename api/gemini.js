export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server missing GEMINI_API_KEY' });
  }

  let payload = req.body;
  if (!payload || typeof payload === 'string') {
    try {
      payload = payload ? JSON.parse(payload) : {};
    } catch (err) {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  const { text, sys, imageBase64, mimeType } = payload || {};
  if (!text || !sys) {
    return res.status(400).json({ error: 'Both text and sys are required' });
  }

  const parts = [{ text }];
  if (imageBase64 && mimeType) {
    parts.push({ inlineData: { mimeType, data: imageBase64 } });
  }

  const body = {
    contents: [{ parts }],
    systemInstruction: { parts: [{ text: sys }] },
    generationConfig: { temperature: 0.7 }
  };

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }
    );

    const data = await upstream.json();
    if (!upstream.ok) {
      return res
        .status(upstream.status)
        .json({ error: data?.error?.message || 'Upstream request failed' });
    }

    const textResp = (data?.candidates?.[0]?.content?.parts || [])
      .map((part) => part?.text)
      .filter(Boolean)
      .join('\n')
      .trim();

    return res.status(200).json({ text: textResp || 'لم يتم إرجاع محتوى من النموذج.' });
  } catch (err) {
    return res.status(500).json({ error: `Request failed: ${err.message}` });
  }
}
