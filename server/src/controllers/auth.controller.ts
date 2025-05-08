import { Request, Response } from "express"
import User from "@/models/User"
import { generateAccessToken } from "@/utils/generate.token"
import { sendOTP, verifyStoredOTP } from "@/utils/otp" 
import logger from "@/utils/logger"

async function signUpUser(req: Request, res: Response) {
  try {
    const { username, full_name, email, password, phone } = req.body
    if (!username || !full_name || !email || !password || !phone) {
       res.status(422).json({ 
        status: "error",
        message: "All fields are required" 
      })
      return 
    }

   const existingUser = await User.findOne({ email })
    if (existingUser) {
      res.status(409).json({ 
        status: "error",
        message: "Email already in use" 
      })
      return 
    }

    const user = await User.create({
      full_name,
      username,
      password, 
      phone,
      email,
      isVerified: false
    })

   const otp = await sendOTP(email) 

   res.status(201).json({
      status: "success",
      data: { 
        userId: user?._id,
        message: "OTP sent to email" 
      }
    })
    return 
  } catch (error) {
    logger.error("Signup error:", error)
     res.status(500).json({ 
      status: "error",
      message: "Internal server error" 
    })
    return 
  }
}

async function verifyOTP(req: Request, res: Response){
  try {
    const { userId, otp } = req.body
    const isValid = await verifyStoredOTP(userId, otp)
    if (!isValid) {
       res.status(400).json({ 
        status: "error",
        message: "Invalid/expired OTP" 
      })
      return 
    }
    const user = await User.findByIdAndUpdate(
      userId,
      { isVerified: true },
      { new: true }
    )

    const token = generateAccessToken(user?._id, user?.email)

    res.json({
      status: "success",
      data: {
        user: {
          _id: user?._id,
          email: user?.email,
          username: user?.username
        },
        token
      }
    })
   return 
  } catch (error) {
    logger.error("OTP verification error:", error)
    res.status(500).json({ 
      status: "error",
      message: "Internal server error" 
    })
    return 
  }
}

export { signUpUser, verifyOTP }