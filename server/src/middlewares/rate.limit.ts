import { rateLimit } from "express-rate-limit"

export const createBasicRateLimiter = (maxRequests: number, time: number) => {
  return rateLimit({
    max: maxRequests,
    windowMs: time,
    message: "Too many Request, Please try again later",
    standardHeaders: true,
    legacyHeaders: false
  })
}