import jwt from "jsonwebtoken"

export const generateAccessToken = (userId, email) => {
  const token = jwt.sign(
    {
      userId,
      email,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "15m",
    }
  )

  return token
}

export const generateRefreshToken = (userId, email) => {
  const token = jwt.sign(
    {
      userId,
      email,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "7d",
    }
  )

  return token
}

export const generateMailToken = (userId, email) => {
  const token = jwt.sign(
    {
      userId,
      email,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "5m",
    }
  )

  return token
}