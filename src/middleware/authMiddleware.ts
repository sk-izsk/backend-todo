import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

export type AuthenticatedRequest = Request & {
  userId?: number
}

type JwtPayload = {
  id: number
}

const AUTH_COOKIE_NAME = 'token'

function readToken(req: Request): string | undefined {
  const authorization = req.headers.authorization
  const headerToken = authorization?.startsWith('Bearer ') ? authorization.slice(7) : authorization
  return req.cookies?.[AUTH_COOKIE_NAME] ?? headerToken
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = readToken(req)
  const jwtSecret = process.env.JWT_SECRET

  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  if (!jwtSecret) {
    return res.status(500).json({ message: 'JWT_SECRET is not configured' })
  }

  try {
    const decoded = jwt.verify(token, jwtSecret)
    if (typeof decoded !== 'object' || decoded === null || !('id' in decoded)) {
      return res.status(401).json({ message: 'Invalid token payload' })
    }

    const userId = Number((decoded as JwtPayload).id)
    if (Number.isNaN(userId)) {
      return res.status(401).json({ message: 'Invalid token payload' })
    }

    req.userId = userId
    next()
  } catch {
    return res.status(401).json({ message: 'Failed to authenticate token' })
  }
}

export default authMiddleware
