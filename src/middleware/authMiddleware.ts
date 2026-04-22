import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']

  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Failed to authenticate token' })
    }

    // @ts-expect-error
    req.userID = decoded.id
    next()
  })
}

export default authMiddleware
