import { Router } from "express"
import { createBasicRateLimiter } from "@/middlewares/rate.limit"
import { authenticateUser } from "@/middlewares/authenticate.request"
import { getCurrentUser } from "@/controllers/user.controller"

const router = Router()

router.get("/get-auth-user", createBasicRateLimiter(100, 3600000), authenticateUser, getCurrentUser)

export default router 



