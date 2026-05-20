import { GoogleGenAI } from '@google/genai'

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
