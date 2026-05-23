export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { product, audience, tone } = req.body;

    if (!product || !audience || !tone) {
      return res.status(400).json({ error: "Product, audience, and tone are required" });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a creative marketing assistant. Generate short, catchy marketing hooks. Return only 5 hooks, each on a new line."
          },
          {
            role: "user",
            content: `Product: ${product}\nAudience: ${audience}\nTone: ${tone}`
          }
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenAI request failed",
      });
    }

    const text = data.choices?.[0]?.message?.content || "";
    const hooks = text
      .split("\n")
      .map(item => item.replace(/^\d+[\).\s-]*/, "").trim())
      .filter(Boolean);

    return res.status(200).json({ hooks });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error",
    });
  }
}
