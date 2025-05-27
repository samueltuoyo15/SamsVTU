import { Router } from "express"
import { createBasicRateLimiter } from "@/middlewares/rate.limit"
import { authenticateUser } from "@/middlewares/authenticate.request"
import { fundWallet, handlePaystackWebHook } from "@/controllers/payment.controller"

const router = Router()

router.post("/fund-wallet", createBasicRateLimiter(100, 3600000), authenticateUser, fundWallet)
router.post("/verify-payment", createBasicRateLimiter(100, 3600000), authenticateUser, handlePaystackWebHook)

export default router 



