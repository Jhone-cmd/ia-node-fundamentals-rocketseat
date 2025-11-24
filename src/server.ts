import OpenAI from 'openai'
import { env } from './env/schema.ts'

const client = new OpenAI({
  apiKey: env.API_KEY,
})

await client.chat.completions
  .create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: 'Escreva uma mensagem de uma frase sobre nodejs',
      },
    ],
  })
  .then((completion) => {
    console.log('completion:', completion.choices[0].message.content)
  })
