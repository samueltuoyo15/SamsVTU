import { Request, Response, NextFunction } from "express"

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.accessToken || req.headers.authorization?.split(" ")[1]

  if (!accessToken) {
     res.status(401).json({ message: "Access denied. No token provided." })
     return 
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!)
    req.user = decoded 
    next()
  } catch (error) {
    console.error(error)
    res.status(401).json({ message: "Invalid token" })
  }
}