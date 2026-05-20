import { NextFunction, Request, Response } from 'express'
import { generatePizzaDescription } from '@/services/ai.service.ts'

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
