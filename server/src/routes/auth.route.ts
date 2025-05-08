import { Router } from "express"
import { createBasicRateLimiter } from "@/middlewares/rate.limit"
import { validateSignUpInput } from "@/middlewares/signup.schema"
import { signUpUser,  } from "@/controllers/auth.controller"
const router = Router()

router.post("/sign-up", createBasicRateLimiter(100, 3600000), validateSignUpInput, signUpUser)

export default router 



