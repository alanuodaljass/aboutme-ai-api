export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { content } = req.body

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Summarize articles in a short modern way."
        },
        {
          role: "user",
          content: content
        }
      ]
    })
  })

  const data = await response.json()

  res.status(200).json({
    summary: data.choices[0].message.content
  })
}
