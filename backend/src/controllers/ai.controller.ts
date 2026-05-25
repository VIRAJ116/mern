import { NextFunction, Request, Response } from 'express'
import {
  chatWithAi,
  chatWithAiStream,
  generatePizzaDescription,
} from '@/services/ai.service.ts'

export const generateDescription = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body
    const description = await generatePizzaDescription({ name })
    res.status(200).json({ success: true, data: { description } })
  } catch (error) {
    next(error)
  }
}

export const chatController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { messages } = req.body
    if (!Array.isArray(messages)) {
      return res
        .status(400)
        .json({ success: false, message: 'Messages must be an array' })
    }
    const aiResponse = await chatWithAi({ messages })
    res.status(200).json({ success: true, data: { aiResponse } })
  } catch (error) {
    next(error)
  }
}

export const chatStreamController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { messages } = req.body
    if (!Array.isArray(messages)) {
      return res
        .status(400)
        .json({ success: false, message: 'Messages must be an array' })
    }

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.flushHeaders()

    const stream = chatWithAiStream({ messages })

    for await (const text of stream) {
      res.write(`data: ${JSON.stringify({ text })}\n\n`)
    }

    res.write('data: [DONE]\n\n')
    res.end()
  } catch (error) {
    // If headers already sent, just end the response
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`)
      res.end()
    } else {
      next(error)
    }
  }
}
