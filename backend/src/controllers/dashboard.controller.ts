import { NextFunction, Request, Response } from 'express'
import { getDashboardOverviewService } from '@/services/dashboard.service.ts'

/**
 * GET /admin/dashboard
 */
export const getDashboardOverview = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await getDashboardOverviewService()
    if (!result.success) {
      res.status(500).json({ success: false, error: result.error })
      return
    }
    res.status(200).json(result.data)
  } catch (error) {
    next(error)
  }
}
