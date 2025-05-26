import { Request, Response } from "express"
import User, { IUser } from "@/models/user"
import logger from "@/utils/logger"
import { redis } from "@/config/connect.redis"

async function getCurrentUser(req: Request, res: Response): Promise<any> {
    logger.info("Me Endpoint Hit")
  try {
    const userId = req?.user?._id
    logger.info(`User Id: ${userId}`)
    
    if(!userId) {
      return res.status(422).json({ status: "error", message: "user Id is required" })
    }
    
    const cachedUser = await redis.get(`currentUser:${userId}`)
    if (cachedUser) {
      return res.status(200).json({ status: "success", data: JSON.parse(cachedUser)})
    }
    
    const user = await User.findById(userId)
  
    if(!user) {
     return res.status(404).json({ status: "error", message: "user does not exist"})
    }
    
    await redis.set(`currentUser:${userId}`, JSON.stringify(user), "EX", 5 * 60)
    return res.status(200).json({ status: "success", data: user })
  } catch(error) {
    logger.error("error getting user:", error)
    return res.status(500).json({ status: "error", message: "Internal server error" })
  }
}
 