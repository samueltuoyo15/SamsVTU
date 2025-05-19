import dotenv from "dotenv"
dotenv.config()
import express, { Application, Request, Response } from "express"
import helmet from "helmet"
import compression from "compression"
import mongoose from "mongoose"
import { createBasicRateLimiter } from "@/middlewares/rate.limit"
import { corsConfig } from "@/config/cors.config"
import requestLogger from "@/middlewares/request.logger"
import errorHandler from "@/middlewares/error.handler"
import authRoute from "@/routes/auth.route"
import { connectToDb, disconnectFromDb } from "@/config/connect.db"
import { redis, disconnectRedis } from "@/config/connect-redis"
import logger from "@/utils/logger"

const app = express()
const PORT = process.env.PORT || 5000
app.use(corsConfig())
app.use(helmet())
app.use(createBasicRateLimiter(100, 900000))
app.use(compression())
app.set("trust proxy", "1")
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(requestLogger)
app.use("/api/auth", authRoute)
app.get("/health", async (req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "OK" : "DOWN"
  const redisStatus = (await redis.ping()) === "PONG" ? "OK" : "DOWN"
  res.status(200).json({ server: "OK",  db: dbStatus,  cache: redisStatus, uptime: process.uptime() })
  return 
})
app.use(errorHandler)

const server = app.listen(PORT, async () => {
  try {
    await connectToDb()
    logger.info(`Server running on port ${PORT}`)
  } catch (err) {
    logger.error("Failed to start server:", err)
    process.exit(1)
  }
})

process.on("unhandledRejection", (reason, promise) => {
  logger.error("unhandled Rejection at:", promise, "reason:", reason)
  process.exit(1)
})

process.on("uncaughtException", (error) => {
  logger.error("uncaughtException", error)
  process.exit(1)
})

const gracefulShutdown = async () => {
  try {
    await disconnectFromDb()
    await disconnectRedis()
    server.close(() => {
      logger.info("Server closed gracefully")
      process.exit(0)
    })
  } catch (err) {
    logger.error("Shutdown error:", err)
    process.exit(1)
  }
}

process.on("SIGTERM", gracefulShutdown)
process.on("SIGINT", gracefulShutdown)




