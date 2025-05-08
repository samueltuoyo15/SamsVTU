import { Request, Response, NextFunction } from "express"
import logger from "@/utils/logger"
declare module "express" {
  interface Request {
    timestamp?: string
  }
}

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString()
  const method = req.method
  const url = req.url
  const userAgent = req.get("User-Agent")
  
  logger.info(`[${timestamp}] ${method} ${url} - User-Agent: ${userAgent}`)
  next()
}

