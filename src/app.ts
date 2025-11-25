import express from 'express'
import OpenAI from 'openai'
import z from 'zod'
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
          - Responda em JSON no formato { products: string[] }
        `,
      },
      {
        role: 'user', // user | developer | assistant
        content: req.body.message,
      },
    ],
  })

  const output = JSON.parse(completion.choices[0].message.content ?? '')

  const schema = z.object({
    products: z.array(z.string()),
  })

  const result = schema.safeParse(output)

  if (!result.success) {
    res.status(500).end()
    return
  }

  res.status(200).json(output)
})
