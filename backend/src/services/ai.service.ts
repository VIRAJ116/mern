import { GoogleGenAI } from '@google/genai'
import { getAllPizzas } from './pizza.service.ts'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

interface PizzaDescriptionInput {
  name: string
}

export const generatePizzaDescription = async ({
  name,
}: PizzaDescriptionInput): Promise<string | undefined> => {
  const parts = [`Pizza name: ${name}`]

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: parts.join('\n'),
    config: {
      thinkingConfig: { thinkingBudget: 0 },
      systemInstruction:
        'You are a copywriter for a pizza shop. Write a single mouth-watering sentence (max 20 words). No emojis. No quotes around the sentence.',
      maxOutputTokens: 150,
      temperature: 0.7,
    },
  })
  return response.text
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export const chatWithAi = async ({ messages }: { messages: ChatMessage[] }) => {
  const pizzas = await getAllPizzas()
  const systemInstruction = `You are a helpful assistant for a pizza shop. 

  Here is our current menu (use only this info for menu questions):
  ${JSON.stringify(pizzas.data, null, 2)}

  Answer customer questions about menu items, prices, and order status. Keep answers short and friendly. If asked for a phone number, provide this one: +1 (555) 123-4567.`

  const contents = messages.slice(-20).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: contents,
    config: {
      thinkingConfig: { thinkingBudget: 0 },
      systemInstruction,
      maxOutputTokens: 300,
      temperature: 0.7,
    },
  })
  return response.text
}

export const chatWithAiStream = async function* ({
  messages,
}: {
  messages: ChatMessage[]
}) {
  const pizzas = await getAllPizzas()
  const systemInstruction = `You are a helpful assistant for a pizza shop. 

  Here is our current menu (use only this info for menu questions):
  ${JSON.stringify(pizzas.data, null, 2)}

  Answer customer questions about menu items, prices, and order status. Keep answers short and friendly. If asked for a phone number, provide this one: +1 (555) 123-4567.`

  const contents = messages.slice(-20).map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const stream = await ai.models.generateContentStream({
    model: 'gemini-2.5-flash',
    contents,
    config: {
      thinkingConfig: { thinkingBudget: 0 },
      systemInstruction,
      maxOutputTokens: 300,
      temperature: 0.7,
    },
  })

  for await (const chunk of stream) {
    if (chunk.text) {
      yield chunk.text
    }
  }
}
