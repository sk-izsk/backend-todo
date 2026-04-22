import express from 'express'
import dbSqlite from '../dbSqlite'

const todoRoutes = express.Router()

todoRoutes.get('/', (req, res) => {
  const getTodo = dbSqlite.prepare(
    'SELECT id, user_id, text AS task, complete AS completed FROM todo WHERE user_id = ?',
  )
  // @ts-expect-error
  const todos = getTodo.all(req.userID)
  console.log('todos: ', todos)
  res.json(todos)
})

todoRoutes.post('/', (req, res) => {
  const { task, text } = req.body
  const todoText = task ?? text

  if (!todoText) {
    return res.status(400).json({ message: 'Task text is required' })
  }

  // @ts-expect-error
  const userId = req.userID
  const insertTodo = dbSqlite.prepare('INSERT INTO todo (user_id, text) VALUES (?, ?)')
  const info = insertTodo.run(userId, todoText)

  res.json({ id: info.lastInsertRowid, user_id: userId, task: todoText, completed: false })
})

todoRoutes.put('/:id', (req, res) => {
  const { id } = req.params
  const { completed, complete } = req.body
  const nextCompleted = completed ?? complete

  if (nextCompleted === undefined) {
    return res.status(400).json({ message: 'Complete status is required' })
  }

  // @ts-expect-error
  const userId = req.userID
  const updateTodo = dbSqlite.prepare('UPDATE todo SET complete = ? WHERE id = ? AND user_id = ?')
  const result = updateTodo.run(nextCompleted ? 1 : 0, id, userId)

  if (result.changes === 0) {
    return res.status(404).json({ message: 'Todo not found' })
  }

  res.json({ id: Number(id), completed: Boolean(nextCompleted) })
})

todoRoutes.delete('/:id', (req, res) => {
  const { id } = req.params
  // @ts-expect-error
  const userId = req.userID

  const deleteTodo = dbSqlite.prepare('DELETE FROM todo WHERE id = ? AND user_id = ?')
  const result = deleteTodo.run(id, userId)

  if (result.changes === 0) {
    return res.status(404).json({ message: 'Todo not found' })
  }

  res.json({ id: Number(id) })
})

export default todoRoutes
