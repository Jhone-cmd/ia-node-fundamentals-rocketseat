import express from 'express'
import OpenAI from 'openai'
import { env } from './env/schema.ts'

const client = new OpenAI({
  apiKey: env.API_KEY,
})

export const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/generate', async (req, res) => {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_completion_tokens: 100,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'developer',
        content: `
          - Liste 3 produtos que atendam a necessidade do usuário.
          - Responda no formato JSON { produtos: string[] }
        `,
      },
      {
        role: 'user', // user | developer | assistant
        content: req.body.message,
      },
    ],
  })

  res.status(200).json({ message: completion.choices[0].message.content })
})
