import { Request, Response } from "express"
import User, { IUser } from "@/models/user"
import { generateAccessToken, generateRefreshToken } from "@/utils/generate.token"
import { sendOTP, verifyStoredOTP } from "@/utils/otp" 
import logger from "@/utils/logger"
import RefreshToken from "@/models/refresh.token"
import { addHours } from "date-fns"

async function signUpUser(req: Request, res: Response): Promise<any> {
  try {
    logger.info("SignUpUser Endpoint Hit")
    const { username, full_name, email, password, phone } = req.body
    if (!username || !full_name || !email || !password || !phone) {
       return res.status(422).json({ status: "error", message: "All fields are required" })
    }

   const existingUser = await User.findOne({ email })
    if (existingUser) {
     return res.status(409).json({ status: "error", message: "Email already in use"  })
    }
    const existingUsername = await User.findOne({ username })
    if (existingUsername) {
      return res.status(409).json({ status: "error", message: "Username already taken", })
    }
    const user = await User.create({
      full_name,
      username,
      password, 
      phone,
      email,
      is_verified: false
    })

   const otp = await sendOTP(email) 

  return res.status(201).json({
      status: "success",
      data: { 
        userId: user?._id,
        message: "OTP sent to email" 
      }
    })
  } catch (error) {
    logger.error("Signup error:", error)
    return res.status(500).json({ status: "error", message: "Internal server error" })
  }
}

async function verifyOTP(req: Request, res: Response): Promise<any> {
  try {
    logger.info("VerifyOtp Endpoint Hit")
    const { userId, otp } = req.body

    if (!userId || !otp) {
       return res.status(400).json({ status: "error", message: "User ID and OTP are required",})
    }

    const isValid = await verifyStoredOTP(userId, otp);
    if (!isValid) {
      return res.status(400).json({status: "error",message: "Invalid/expired OTP", })
    }

 
    const user = await User.findByIdAndUpdate(
     userId, { is_verified: true }, { new: true }).select("-password")

    if (!user) {
      return res.status(404).json({ status: "error", message: "User not found",})
    }
  
    const accessToken = generateAccessToken(user._id, user.email)
    const refreshToken = generateRefreshToken(user._id, user.email)

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    })

     return res.status(200).json({
      data: {
        user: {
          _id: user._id,
          email: user.email,
          username: user.username,
          is_verified: user.is_verified,
          wallet_balance: user.wallet_balance,
        },
        accessToken,
      },
    })
  } catch (error) {
    logger.error("OTP verification error:", error)
    return res.status(500).json({ status: "error",message: "Internal server error"})
  }
}

async function loginUser(req: Request, res: Response): Promise<any> {
  try {
    logger.info("Login Endpoint Hit")
    const { email, password } = req.body
    if(!email || !password){
     return res.status(400).json({ status: "error", message: "All fields are required" })
    }
    const user = await User.findOne({ email }).exec()
    if(!user){
     return res.status(401).json({ status: "error", message: "Invalid Credentials", })
    }
    
    const isPasswordValid = await user.comparePassword(password)
    if(!isPasswordValid){
     return res.status(401).json({ status: "error", message: "Invalid Credentials"})
    }
    
    if(!user.is_verified){
     return res.status(403).json({ status: "error", message: "Account Not Verified. Please kindly check your mail and verify"})
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
      maxAge: 15 * 60 * 1000, 
    })
     res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    })

    user.last_login = new Date()
    await user.save()
    
   return res.status(200).json({
      data: {
        user: {
         _id: user._id,
        email: user.email,
        username: user.username,
        is_verified: user.is_verified,
        wallet_balance: user.wallet_balance,
        },
        accessToken,
      },
    })
  } catch(error){
    logger.error("Login User error:", error)
    return res.status(500).json({ status: "error", message: "Internal server error" })
  }
}
 
async function logoutUser(req: Request, res: Response): Promise<any>{
  logger.info("Logout Endpoint Hit")
  try{
    const refreshToken = req.cookies.refreshToken
    res.clearCookie("refreshToken", {
     httpOnly: true,
     secure: process.env.NODE_ENV === "production",
     sameSite: "strict",
    })
    
    if(refreshToken){
      await RefreshToken.findOneAndDelete(refreshToken)
    }
   return res.status(200).json({ status: "success", message: "Logout Successful"})
  } catch(error){
    logger.error("Logout error:", error)
    return res.status(500).json({ status: "error", message: "Internal server error", })
  }
}

async function refreshAccessToken(req: Request, res: Response): Promise<any> {
  logger.info("Refresh Endpoint Hit")
 try {
    const refreshToken = req.cookies.refreshToken
    if(!refreshToken){
     return res.status(400).json({ status: "error", message: "Refresh Token is required"})
    }
    const storedToken = await RefreshToken.findOne({ token: refreshToken }).populate<{ user: IUser }>("user")
    if(!storedToken){
      res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
     })
     return res.status(401).json({ status: "error", message: "Invalid Refresh Token"})
  }
  
  if(new Date() > storedToken.expiresAt) {
    await RefreshToken.findByIdAndDelete(storedToken._id)
     res.clearCookie("refreshToken", {
      httpOnly: true,
       secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
     })
     return res.status(401).json({ status: "error", message: "Expired Refresh Token"})
  }
  
  const user = storedToken.user
  const accessToken = generateAccessToken(user._id, user.email)
   res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, 
   })
  return res.status(200).json({ status: "success", data: { accessToken }})
 } catch(error){
   logger.error("Refesresh Access Token error:", error)
   return res.status(500).json({ status: "error", message: "Internal server error", })
  }
}
export { signUpUser, verifyOTP, loginUser, logoutUser, refreshAccessToken}



