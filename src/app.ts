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
    messages: [
      {
        role: 'developer',
        content: `
          - Você é um assistente e desenvolvedor de tecnologia.
          - Use emoji no final da frase.
          - O emoji no final da frase é obrigatório.
          - Gere um texto de uma frase com no máximo uma frase.
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
