import nodemailer from "nodemailer"
import { generateAndStoreOTP } from "@/services/otp";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL, 
    pass: process.env.EMAIL_PASSWORD
    }
})

export const sendOTP = async (email: string) => {
  const otp = Math.floor(100000 + Math.random() * 900000)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  await Otp.create({ email, otp, expiresAt })

  await transporter.sendMail({
    from: '"SwiftBills" <no-reply@vtuapp.com>',
    to: email,
    subject: "Verify Your Email",
    html: `Your OTP is <b>${otp}</b>. Expires in 10 minutes.`
  })

  return otp
}

export const verifyStoredOTP = async (email: string, otp: string) => {
  return await verifyOTP(email, otp)
}