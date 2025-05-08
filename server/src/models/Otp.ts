import mongoose, { Document, Schema } from "mongoose"

interface IOtp extends Document {
  email: string
  otp: string
  expiresAt: Date
  createdAt?: Date
}

const OtpSchema = new Schema<IOtp>({
  email: { 
    type: String, 
    required: true,
    index: true 
  },
  otp: { 
    type: String, 
    required: true 
  },
  expiresAt: { 
    type: Date, 
    required: true,
    index: { expires: "10m" } 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
})

export default mongoose.model<IOtp>("Otp", OtpSchema)