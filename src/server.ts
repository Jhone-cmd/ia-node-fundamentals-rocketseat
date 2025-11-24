import OpenAI from 'openai'
import { env } from './env/schema.ts'

const client = new OpenAI({
  apiKey: env.API_KEY,
})

async function generateText() {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_completion_tokens: 100,
    messages: [
      {
        role: 'developer',
        content: `
          - USe emoji no final da frase.
          - O emoji no final da frase é obrigatório.
          - Gere um texto de uma frase com no máximo uma frase.
        `,
      },
      {
        role: 'user', // user | developer | assistant
        content: 'Escreva uma mensagem de uma frase sobre nodejs',
      },
      {
        role: 'assistant',
        content:
          'Node.js é uma plataforma poderosa que permite criar aplicações escaláveis e rápidas em JavaScript! 🚀',
      },
      {
        role: 'user',
        content: 'Obrigado!',
      },
    ],
  })

  console.log('completion:', completion.choices[0].message.content)
}

generateText()
