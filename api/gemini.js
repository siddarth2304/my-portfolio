
export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = request.body;

  if (!prompt) {
    return response.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return response.status(500).json({ error: 'API key not configured on the server.' });
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  };

  try {
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        console.error('Google API Error:', errorText);
        return response.status(apiResponse.status).json({ error: `Google API Error: ${apiResponse.statusText}` });
    }

    const data = await apiResponse.json();
    
    if (data.candidates && data.candidates.length > 0) {
        return response.status(200).json({ text: data.candidates[0].content.parts[0].text });
    } else {
        return response.status(500).json({ error: 'No content received from AI.' });
    }

  } catch (error) {
    console.error('Internal Server Error:', error);
    return response.status(500).json({ error: 'Failed to fetch from Google API.' });
  }
}
