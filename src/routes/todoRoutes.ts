import express from 'express'
import bycrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dbSqlite from '../dbSqlite'

const todoRoutes = express.Router()

todoRoutes.get('/', (req, res) => {
  res.json({ message: 'Todo route' })
})

todoRoutes.post('/', (req, res) => {
  const { user_id, text } = req.body

  if (!user_id || !text) {
    return res.status(400).json({ message: 'User ID and text are required' })
  }

  const stmt = dbSqlite.prepare('INSERT INTO todo (user_id, text) VALUES (?, ?)')
  const info = stmt.run(user_id, text)

  res.json({ id: info.lastInsertRowid, user_id, text, complete: false })
})

todoRoutes.put('/:id', (req, res) => {
  const { id } = req.params
  const { complete } = req.body

  if (complete === undefined) {
    return res.status(400).json({ message: 'Complete status is required' })
  }

  const stmt = dbSqlite.prepare('UPDATE todo SET complete = ? WHERE id = ?')
  stmt.run(complete, id)

  res.json({ id, complete })
})

todoRoutes.delete('/:id', (req, res) => {
  const { id } = req.params

  const stmt = dbSqlite.prepare('DELETE FROM todo WHERE id = ?')
  stmt.run(id)

  res.json({ id })
})

export default todoRoutes
