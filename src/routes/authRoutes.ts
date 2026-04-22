import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import express, { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import authMiddleware from '../middleware/authMiddleware'
import prisma from '../prismaClient'

const authRoutes = express.Router()
const AUTH_COOKIE_NAME = 'token'
const ONE_DAY_MS = 24 * 60 * 60 * 1000

type AuthBody = {
  username?: string
  password?: string
}

function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: ONE_DAY_MS,
    path: '/',
  })
}

function clearAuthCookie(res: Response) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
}

authRoutes.post(
  '/register',
  async (req: Request<Record<string, never>, unknown, AuthBody>, res) => {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' })
    }

    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      return res.status(500).json({ message: 'JWT_SECRET is not configured' })
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 8)

      const user = await prisma.user.create({
        data: {
          email: username,
          password: hashedPassword,
        },
      })

      const defaultTodo = `Hello ${username}, Add your first Todo!`
      // const insertTodo = dbSqlite.prepare(`INSERT INTO todo (user_id, text) VALUES (?, ?)`)
      // insertTodo.run(result.lastInsertRowid, defaultTodo)
      await prisma.todo.create({
        data: {
          userId: user.id,
          title: defaultTodo,
        },
      })

      const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '24h' })
      setAuthCookie(res, token)
      res.status(201).json({ message: 'User registered successfully' })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        return res.status(409).json({ message: 'User already exists' })
      }

      res.status(503).json({ message: 'Internal server error' })
    }
  },
)

authRoutes.post('/login', async (req: Request<Record<string, never>, unknown, AuthBody>, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }

  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    return res.status(500).json({ message: 'JWT_SECRET is not configured' })
  }

  try {
    // const getUser = dbSqlite.prepare(`SELECT * FROM users WHERE username = ?`)
    // const user = getUser.get(username)

    const user = await prisma.user.findUnique({
      where: {
        email: username,
      },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const passwordIsValid = await bcrypt.compare(password, user.password)

    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Invalid password' })
    }

    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '24h' })
    setAuthCookie(res, token)
    res.status(200).json({ message: 'User logged in successfully' })
  } catch {
    res.status(503).json({ message: 'Internal server error' })
  }
})

authRoutes.post('/logout', authMiddleware, (req, res) => {
  clearAuthCookie(res)
  res.status(200).json({ message: 'User logged out successfully' })
})

export default authRoutes
