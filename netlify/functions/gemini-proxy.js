const fetch = require('node-fetch');

// Ny anarana ho an'ny Gemini API Key ao amin'ny Netlify Environment Variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; 

exports.handler = async (event) => {
    // Hamarino raha POST request izy ary misy body
    if (event.httpMethod !== 'POST' || !event.body) {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    }

    // Hamarino raha misy ny API Key
    if (!GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY not set in Netlify environment variables.");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server configuration error: API Key is missing.' }),
        };
    }

    try {
        const { prompt, systemInstruction } = JSON.parse(event.body);

        if (!prompt) {
            return { statusCode: 400, body: JSON.stringify({ error: 'Prompt is required.' }) };
        }

        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent';

        // Amboary ny payload ho an'ny Gemini API
        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            // Mampiasa Google Search ho an'ny fanamarinam-baovao
            tools: [{ "google_search": {} }],
            // Ampidiro ny toromarika manokana raha misy
            ...(systemInstruction && { 
                systemInstruction: { parts: [{ text: systemInstruction }] }
            }),
        };

        // Manao antso mankany amin'ny Gemini API
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                // Ampiasaina eto ny API Key avy amin'ny Netlify Environment Variable
                'X-Goog-Api-Key': GEMINI_API_KEY, 
            },
            body: JSON.stringify(payload)
        });

        const geminiResult = await geminiResponse.json();
        
        // Averina ho an'ny Front-end ny valiny rehetra avy amin'ny Gemini
        return {
            statusCode: geminiResponse.status,
            body: JSON.stringify(geminiResult),
        };

    } catch (error) {
        console.error('Error in Netlify Function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error during API call.', details: error.message }),
        };
    }

};
