import { Router } from "express"
import { createBasicRateLimiter } from "@/middlewares/rate.limit"
import { validateSignUpInput, signInValidationSchema } from "@/middlewares/signup.schema"
import { signUpUser, verifyOTP, loginUser, logoutUser, refreshAccessToken, forgotPassword, resetPassword, changePassword, deleteAccount } from "@/controllers/auth.controller"

const router = Router()

router.post("/signup", createBasicRateLimiter(100, 3600000), validateSignUpInput, signUpUser)
router.get("/verify-otp", createBasicRateLimiter(100, 3600000), verifyOTP)
router.post("/signin", createBasicRateLimiter(100, 3600000), validateSignInInput, loginUser)
router.get("/logout-user", createBasicRateLimiter(100, 3600000), logoutUser)
router.get("/refresh-access-token", createBasicRateLimiter(100, 3600000), refreshAccessToken)
router.post("/forgot-password", createBasicRateLimiter(100, 3600000), forgotPassword)
router.post("/reset-password", createBasicRateLimiter(100, 3600000), resetPassword)
router.post("/change-password", createBasicRateLimiter(100, 3600000), changePassword)
router.post("/delete-account", createBasicRateLimiter(100, 3600000), deleteAccount)

export default router 



