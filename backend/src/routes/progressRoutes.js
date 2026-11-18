const express = require('express');
const db = require('../database/db');
const asyncHandler = require('../utils/asyncHandler');
const router = express.Router();
router.get('/', asyncHandler(async (req, res) => res.json(await db('content_progress').select('*').orderBy('watched_at', 'desc'))));
router.post('/', asyncHandler(async (req, res) => {
  const { user_id, content_id } = req.body;
  if (!user_id || !content_id) return res.status(400).json({ error: 'user_id and content_id are required' });
  const [row] = await db('content_progress').insert({ user_id, content_id }).onConflict(['user_id', 'content_id']).merge({ watched_at: db.fn.now() }).returning('*');
  res.status(201).json(row);
}));
router.delete('/:id', asyncHandler(async (req, res) => {
  const count = await db('content_progress').where({ id: req.params.id }).del();
  if (!count) return res.status(404).json({ error: 'Progress record not found' });
  res.status(204).send();
}));
module.exports = router;
