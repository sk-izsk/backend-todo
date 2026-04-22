import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import path from 'path'
import { ENV } from './config/config'
import authMiddleware from './middleware/authMiddleware'
import authRoutes from './routes/authRoutes'
import todoRoutes from './routes/todoRoutes'

const parsedPort = Number.parseInt(ENV.PORT ?? '', 10)
const port = Number.isNaN(parsedPort) ? 3020 : parsedPort

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store')
    next()
  })
}

app.use(express.static(path.join(__dirname, '../public')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'))
})

app.use('/auth', authRoutes)
app.use('/todos', authMiddleware, todoRoutes)

app.listen(port)
