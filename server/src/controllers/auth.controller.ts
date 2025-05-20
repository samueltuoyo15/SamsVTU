import { Request, Response } from "express"
import User from "@/models/user"
import { generateAccessToken } from "@/utils/generate.token"
import { sendOTP, verifyStoredOTP } from "@/utils/otp" 
import logger from "@/utils/logger"
import RefreshToken from "@/models/refresh.token"
import { dateHours } from "date-fns"

async function signUpUser(req: Request, res: Response) {
  try {
    logger.info("SignUpUser Endpoint Hit")
    const { username, full_name, email, password, phone } = req.body
    if (!username || !full_name || !email || !password || !phone) {
       res.status(422).json({ status: "error", message: "All fields are required" })
      return 
    }

   const existingUser = await User.findOne({ email })
    if (existingUser) {
      res.status(409).json({ status: "error", message: "Email already in use"  })
      return 
    }
    const existingUsername = await User.findOne({ username })
    if (existingUsername) {
       res.status(409).json({ status: "error", message: "Username already taken", })
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
     res.status(500).json({ status: "error", message: "Internal server error" })
  }
}

async function verifyOTP(req: Request, res: Response) {
  try {
    logger.info("VerifyOtp Endpoint Hit")
    const { userId, otp } = req.body

    if (!userId || !otp) {
       res.status(400).json({ status: "error", message: "User ID and OTP are required",})
      return
    }

    const isValid = await verifyStoredOTP(userId, otp);
    if (!isValid) {
       res.status(400).json({status: "error",message: "Invalid/expired OTP", })
      return
    }

 
    const user = await User.findByIdAndUpdate(
     userId, { isVerified: true }, { new: true }).select("-password")

    if (!user) {
       res.status(404).json({ status: "error", message: "User not found",})
      return
    }
  
    const accessToken = generateAccessToken(user._id, user.email)
    const refreshToken = generateRefreshToken(user._id, user.email)

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    })

     res.status(200).json({
      data: {
        user: {
          _id: user._id,
          email: user.email,
          username: user.username,
          isVerified: user.isVerified,
          wallet_balance: user.wallet_balance,
        },
        accessToken,
      },
    })
  } catch (error) {
    logger.error("OTP verification error:", error)
    res.status(500).json({ status: "error",message: "Internal server error"})
  }
}

async function loginUser(req: Request, res: Response) {
  try {
    logger.info("Login Endpoint Hit")
    const { username, password } = req.body
    if(!username || !password){
       res.status(400).json({ status: "error", message: "All fields are required" })
      return 
    }
    const user = User.findOne({ username })
    if(!user){
      res.status(401).json({ status: "error", message: "Invalid Credentials", })
    }
    
    const isPasswordValid = await user.comparePassword(password)
    if(!isPasswordValid){
      res.status(401).json({ status: "error", message: "Invalid Credentials"})
      return 
    }
    
    if(!user.is_verified){
      res.status(403).json({ status: "error", message: "Account Not Verified. Please kindly check your mail and verify"})
      return 
    }
    
    const accessToken = generateAccessToken(user._id, user.email)
    const refreshToken = generateRefreshToken(user._id, user.email)
    
    await RefreshToken.create({
      token: refreshToken,
      user: user._id,
      expiresAt: addHours(new Date(), 168),
    })
    
     res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 1 * 24 * 60 * 60 * 1000, 
    })
     res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    })

    user.last_login = new Date()
    await user.save()
    
    res.status(200).json({
      data: {
        user: {
         _id: user._id,
        email: user.email,
        username: user.username,
        isVerified: user.isVerified,
        wallet_balance: user.wallet_balance,
        },
        accessToken,
      },
    })
  } catch(error){
    logger.error("Login User error:", error)
     res.status(500).json({ status: "error", message: "Internal server error" })
  }
}
 
async function logoutUser(req: Request, res: Response) {
  logger.info("Logout Endpoint Hit")
  try{
    const refreshToken = req.cookies.refreshToken
    res.clearCookie("refreshToken", {
     httpOnly: true,
     secure: process.env.NODE_ENV === "production",
     sameSite: "strict",
    })
    
    if(refreshToken){
      await RefreshToken.fineOneAndDelete(refreshToken)
    }
    res.status(200).json({ status: "success", message: "Logout Successful"})
  } catch(error){
    logger.error("Logout error:", error)
    res.status(500).json({ status: "error", message: "Internal server error", })
  }
}
export { signUpUser, verifyOTP, loginUser, logoutUser}



