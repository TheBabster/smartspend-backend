// api/smartspend.js – CommonJS handler for Vercel

module.exports = async function handler(req, res) {
  // Allow your Replit frontend to call this
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { message } = req.body || {};

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing 'message' string in body" });
    }

    // Call OpenAI Responses API
    const openaiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `
You are SmartSpend, a friendly budgeting and spending coach for teenagers.

The user says: "${message}"

Give short, clear advice:
- 2–4 sentences
- Very simple language
- Say if the purchase looks sensible or not and why.
        `,
      }),
    });

    const data = await openaiRes.json();

    if (!openaiRes.ok) {
      console.error("OpenAI error:", data);
      return res.status(500).json({ error: "OpenAI API error" });
    }

    const reply =
      data?.output?.[0]?.content?.[0]?.text ??
      "Sorry, I had trouble answering. Please try again.";

    return res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};
