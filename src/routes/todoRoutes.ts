import express, { Request } from 'express'
import { AuthenticatedRequest } from '../middleware/authMiddleware'
import prisma from '../prismaClient'

const todoRoutes = express.Router()

type CreateTodoBody = {
  task?: string
  text?: string
}

type UpdateTodoBody = {
  completed?: boolean | number
  complete?: boolean | number
}

function getUserId(req: AuthenticatedRequest): number {
  if (!req.userId) {
    throw new Error('Authenticated user id missing from request')
  }

  return req.userId
}

todoRoutes.get('/', async (req: Request & AuthenticatedRequest, res) => {
  const userId = getUserId(req)

  const todos = await prisma.todo.findMany({
    where: {
      userId,
    },
    orderBy: {
      id: 'asc',
    },
  })

  res.json(
    todos.map((todo) => ({
      id: todo.id,
      userId: todo.userId,
      task: todo.title,
      completed: todo.completed,
    })),
  )
})

todoRoutes.post(
  '/',
  async (
    req: Request<Record<string, never>, unknown, CreateTodoBody> & AuthenticatedRequest,
    res,
  ) => {
    const { task, text } = req.body
    const todoText = (task ?? text)?.trim()

    if (!todoText) {
      return res.status(400).json({ message: 'Task text is required' })
    }

    const userId = getUserId(req)

    const insertedTodo = await prisma.todo.create({
      data: {
        userId,
        title: todoText,
      },
    })

    res.json({
      id: insertedTodo.id,
      userId: insertedTodo.userId,
      task: insertedTodo.title,
      completed: insertedTodo.completed,
    })
  },
)

todoRoutes.put(
  '/:id',
  async (req: Request<{ id: string }, unknown, UpdateTodoBody> & AuthenticatedRequest, res) => {
    const { id } = req.params
    const { completed, complete } = req.body
    const nextCompleted = completed ?? complete
    const todoId = Number.parseInt(id, 10)

    if (nextCompleted === undefined) {
      return res.status(400).json({ message: 'Complete status is required' })
    }

    if (Number.isNaN(todoId)) {
      return res.status(400).json({ message: 'Invalid todo id' })
    }

    const userId = getUserId(req)

    const updatedTodo = await prisma.todo.updateMany({
      where: {
        id: todoId,
        userId,
      },
      data: {
        completed: Boolean(nextCompleted),
      },
    })

    if (updatedTodo.count === 0) {
      return res.status(404).json({ message: 'Todo not found' })
    }

    res.json({ id: todoId, completed: Boolean(nextCompleted) })
  },
)

todoRoutes.delete('/:id', async (req: Request<{ id: string }> & AuthenticatedRequest, res) => {
  const { id } = req.params
  const todoId = Number.parseInt(id, 10)

  if (Number.isNaN(todoId)) {
    return res.status(400).json({ message: 'Invalid todo id' })
  }

  const userId = getUserId(req)

  const deletedTodo = await prisma.todo.deleteMany({
    where: {
      id: todoId,
      userId,
    },
  })

  if (deletedTodo.count === 0) {
    return res.status(404).json({ message: 'Todo not found' })
  }

  res.json({ id: todoId })
})

export default todoRoutes
