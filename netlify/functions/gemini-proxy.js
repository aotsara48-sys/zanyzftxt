const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

exports.handler = async (event, context) => {
  // CORS - Mba hahafahan'ny browse miteny amin'ny function
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*', // Azo ovaina ho adiresy anao ihany amin'ny production
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Manome valiny ho an'ny OPTIONS (preflight request)
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { prompt, systemInstruction } = JSON.parse(event.body);

    if (!prompt) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Prompt is required' }) };
    }

    // Jerena raha misy ny API Key
    if (!process.env.GOOGLE_API_KEY) {
      console.error('Tsy misy ny GOOGLE_API_KEY');
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'API Key tsy voafetra' }) };
    }

    // Vita ny fangatahana ho an'ny Gemini API
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ googleSearchRetrieval: {} }], // Mampiasa Google Search (grounding)
    };

    if (systemInstruction) {
      payload.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    const response = await fetch(`${API_URL}?key=${process.env.GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: `Gemini API error: ${response.statusText}`, details: errorData }),
      };
    }

    const data = await response.json();
    return { statusCode: 200, headers, body: JSON.stringify(data) };

  } catch (error) {
    console.error('Function error:', error);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal Server Error', message: error.message }) };
  }
};
