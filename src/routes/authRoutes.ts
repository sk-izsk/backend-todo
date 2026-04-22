import bycrypt from 'bcryptjs'
import express from 'express'
import jwt from 'jsonwebtoken'
import dbSqlite from '../dbSqlite'
import authMiddleware from '../middleware/authMiddleware'

const authRoutes = express.Router()

authRoutes.post('/register', (req, res) => {
  const { username, password } = req.body
  console.log('password: ', password)
  console.log('username: ', username)
  console.log('request body: ', req.body)

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }

  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    return res.status(500).json({ message: 'JWT_SECRET is not configured' })
  }

  const hashedPassword = bycrypt.hashSync(password, 8)
  console.log('hashedPassword: ', hashedPassword)

  try {
    const insertUser = dbSqlite.prepare(`INSERT INTO users (username, password) VALUES (?, ?)`)
    const result = insertUser.run(username, hashedPassword)
    console.log('result: ', result)

    const defaultTodo = `Hello ${username}, Add your first Todo!`
    const insertTodo = dbSqlite.prepare(`INSERT INTO todo (user_id, text) VALUES (?, ?)`)
    insertTodo.run(result.lastInsertRowid, defaultTodo)

    const token = jwt.sign({ id: result.lastInsertRowid }, jwtSecret, { expiresIn: '24h' })
    res.status(201).json({ message: 'User registered successfully', token })
  } catch (error) {
    console.error('Error registering user: ', error)
    res.sendStatus(503).json({ message: 'Internal server error' })
  }
})

authRoutes.post('/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' })
  }

  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) {
    return res.status(500).json({ message: 'JWT_SECRET is not configured' })
  }

  try {
    const getUser = dbSqlite.prepare(`SELECT * FROM users WHERE username = ?`)
    const user = getUser.get(username)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    //@ts-expect-error
    const passwordIsValid = bycrypt.compareSync(password, user.password)

    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Invalid password' })
    }

    const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '24h' })
    res.status(200).json({ message: 'User logged in successfully', token })
  } catch (error) {
    console.error('Error logging in user: ', error)
    res.sendStatus(503).json({ message: 'Internal server error' })
  }
})

authRoutes.post('/logout', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'User logged out successfully' })
})

export default authRoutes
