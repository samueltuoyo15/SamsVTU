import express, { Application } from "express"
import helmet from "helmet"
import compression from "compression"
import { createBasicRateLimiter } from "@/middlewares/rate.limit"
import { corsConfig } from "@/config/cors.config"
import { requestLogger } from "@/middlewares/request.logger"
import authRoute from "@/routes/auth.route"
import connectToDb from "@/config/connect.db"
import dotenv from "dotenv"
dotenv.config()
  
const app = express()
app.use(requestLogger)
app.use(corsConfig())
app.use(createBasicRateLimiter(100, 900000))
app.use(helmet())
app.use(compression())
app.set("trust proxy", "1")
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/api/auth", authRoute)

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`)
  connectToDb()
})






