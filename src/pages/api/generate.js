// File to generate the prompt for OpenAI API
import OpenAI from "openai"
const openai = new OpenAI()

export default async function (req, res) {
  if (!openai.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      },
    })
    return
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: req.body }],
      temperature: 0.6,
      max_completion_tokens: 4096,
      response_format: { type: "json_object" },
    })
    res.status(200).json({ result: completion.choices[0].message.content })
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data)
      res.status(error.response.status).json(error.response.data)
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`)
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      })
    }
  }
}
