import express from 'express';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources';
import z from 'zod';
import { produtosEmEstoque, produtosEmFalta } from './db.ts';
import { env } from './env/schema.ts';

const client = new OpenAI({
  apiKey: env.API_KEY,
});

export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const schemaRequest = z.object({
  message: z.string(),
});
const schemaProducts = z.object({
  products: z.array(z.string()),
});

const tools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'produtos_em_estoque',
      description: 'Lista os produtos em estoque',
      parameters: {
        type: 'object',
        proprieties: {},
        additionalProperties: false,
      },
      strict: true,
    },
  },

  {
    type: 'function',
    function: {
      name: 'produtos_em_falta',
      description: 'Lista os produtos em falta no estoque',
      parameters: {
        type: 'object',
        proprieties: {},
        additionalProperties: false,
      },
      strict: true,
    },
  },
];

app.post('/generate', async (req, res) => {
  const { message: content } = schemaRequest.parse(req.body);
  const messages: ChatCompletionMessageParam[] = [
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
  ];

  try {
    const completion = await client.chat.completions.parse({
      model: 'gpt-4o-mini',
      max_completion_tokens: 100,
      response_format: zodResponseFormat(schemaProducts, 'products_schema'),
      tools,
      messages,
    });

    if (completion.choices[0].message.refusal) {
      res.status(400).json({ error: 'refusal' });
      return;
    }

    const { tool_calls } = completion.choices[0].message;
    if (tool_calls) {
      const [tool_call] = tool_calls;
      const toolsMap = {
        produtos_em_estoque: produtosEmEstoque,
        produtos_em_falta: produtosEmFalta,
      };

      const functionToolCall = toolsMap[tool_call.function.name];
      if (!functionToolCall) {
        throw new Error('Function not found.');
      }

      const result = functionToolCall(tool_call.function.parsed_arguments);
    }

    res.status(200).json(completion.choices[0].message.parsed);
  } catch (error) {
    console.error(error);
    res.status(500).json('Internal Server Error');
    return;
  }
});
