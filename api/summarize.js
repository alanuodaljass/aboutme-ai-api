export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
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
            content:
              "Write a short, clear summary in one sentence. Keep it simple and modern.",
          },
          {
            role: "user",
            content: content,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenAI request failed",
      });
    }

    const summary = data.choices?.[0]?.message?.content || "";

    return res.status(200).json({ summary });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Server error",
    });
  }
}
