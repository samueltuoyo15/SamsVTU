import { Router } from "express"
import { createBasicRateLimiter } from "@/middlewares/rate.limit"
import { authenticateUser } from "@/middlewares/authenticate.request"

const router = Router()

export default router 



