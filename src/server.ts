import cors from 'cors'
import express from 'express'
import path from 'path'
import { ENV } from './config/config'
import authRoutes from './routes/authRoutes'
import todoRoutes from './routes/todoRoutes'

const parsedPort = Number.parseInt(ENV.PORT ?? '', 10)
const port = Number.isNaN(parsedPort) ? 3020 : parsedPort

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(path.join(__dirname, '../public')))

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'))
})

app.use('/auth', authRoutes)
app.use('/todos', todoRoutes)

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
