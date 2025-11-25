import express from 'express'
import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import z from 'zod'
import { env } from './env/schema.ts'

const client = new OpenAI({
  apiKey: env.API_KEY,
})

export const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const schemaRequest = z.object({
  message: z.string(),
})
const schemaProducts = z.object({
  products: z.array(z.string()),
})

app.post('/generate', async (req, res) => {
  const { message: content } = schemaRequest.parse(req.body)

  const completion = await client.chat.completions.parse({
    model: 'gpt-4o-mini',
    max_completion_tokens: 100,
    response_format: zodResponseFormat(schemaProducts, 'products_schema'),
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
        content,
      },
    ],
  })

  res.status(200).json(completion.choices[0].message.parsed)
})
