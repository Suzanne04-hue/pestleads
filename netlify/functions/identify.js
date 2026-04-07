/* ============================================
   PESTLEADS — IDENTIFY.JS
   Netlify serverless function
   Claude API key never touches client code
   ============================================ */

exports.handler = async (event) => {

  /* ─── Only allow POST ─── */
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { type, description, image, mimeType } = JSON.parse(event.body);

    /* ─── Build message content ─── */
    let content;

    if (type === 'image') {
      content = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType,
            data: image
          }
        },
        {
          type: 'text',
          text: `You are an expert Australian pest identifier. Analyse this image and identify the pest.

Respond ONLY with a valid JSON object in this exact format, no other text:
{
  "pestName": "Common name of pest",
  "latinName": "Latin/scientific name",
  "severity": "moderate" or "high" or "urgent",
  "timeframe": "Act within the week" or "Act within 24-48 hours" or "Contact a professional today",
  "description": "One plain English sentence about this pest and why it needs attention.",
  "emergency": false or true
}

Set emergency to true ONLY for highly venomous or immediately life-threatening pests like funnel-web spiders, eastern brown snakes, or similar.
Severity urgent is for serious pests needing same-day attention but not life-threatening.
Always respond as if you are helping an Australian homeowner.`
        }
      ];
    } else {
      content = `You are an expert Australian pest identifier. A homeowner has described a pest they found.

Description: "${description}"

Respond ONLY with a valid JSON object in this exact format, no other text:
{
  "pestName": "Common name of pest",
  "latinName": "Latin/scientific name",
  "severity": "moderate" or "high" or "urgent",
  "timeframe": "Act within the week" or "Act within 24-48 hours" or "Contact a professional today",
  "description": "One plain English sentence about this pest and why it needs attention.",
  "emergency": false or true
}

Set emergency to true ONLY for highly venomous or immediately life-threatening pests like funnel-web spiders, eastern brown snakes, or similar.
Severity urgent is for serious pests needing same-day attention but not life-threatening.
Always respond as if you are helping an Australian homeowner.`;
    }

    /* ─── Call Claude API ─── */
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: content
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Claude API error:', err);
      return { statusCode: 500, body: JSON.stringify({ error: 'Claude API error' }) };
    }

    const claudeData = await response.json();
    const raw = claudeData.content[0].text.trim();

    /* ─── Parse JSON response ─── */
    const clean = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    };

  } catch (err) {
    console.error('Function error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Something went wrong' })
    };
  }
};
