import mongoose from "mongoose"
import logger from "@/utils/logger"
import dotenv from "dotenv"
dotenv.config()

const connectToDb = async () => {
  try{
    await mongoose.connect(process.env.MONGO_URI!)
    logger.info("Connected to MongoDb")
  }catch(error){
    logger.error("Failed to connect to mongodb", error)
    process.exit(1)
  }
}

export default connectToDb