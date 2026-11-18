const express = require('express');
const db = require('../database/db');
const asyncHandler = require('./asyncHandler');

function createCrudRouter(table, fields, options = {}) {
  const router = express.Router();
  const writable = fields.filter((field) => field !== 'id' && field !== 'created_at' && field !== 'updated_at');
  router.get('/', asyncHandler(async (req, res) => {
    const rows = await db(table).select('*').orderBy('created_at', 'desc');
    res.json(rows);
  }));
  router.get('/:id', asyncHandler(async (req, res) => {
    const row = await db(table).where({ id: req.params.id }).first();
    if (!row) return res.status(404).json({ error: `${options.label || table} not found` });
    res.json(row);
  }));
  router.post('/', asyncHandler(async (req, res) => {
    const payload = {};
    writable.forEach((field) => { if (req.body[field] !== undefined) payload[field] = req.body[field]; });
    const missing = (options.required || []).filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === '');
    if (missing.length) return res.status(400).json({ error: 'Validation failed', fields: missing });
    if (options.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email || '')) return res.status(400).json({ error: 'A valid email is required' });
    if (options.status && !['active', 'inactive'].includes(payload.status)) return res.status(400).json({ error: 'Status must be active or inactive' });
    const [created] = await db(table).insert(payload).returning('*');
    res.status(201).json(created);
  }));
  router.put('/:id', asyncHandler(async (req, res) => {
    const payload = {};
    writable.forEach((field) => { if (req.body[field] !== undefined) payload[field] = req.body[field]; });
    if (!Object.keys(payload).length) return res.status(400).json({ error: 'Provide at least one field to update' });
    if (options.email && payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) return res.status(400).json({ error: 'A valid email is required' });
    if (options.status && payload.status && !['active', 'inactive'].includes(payload.status)) return res.status(400).json({ error: 'Status must be active or inactive' });
    payload.updated_at = db.fn.now();
    const [updated] = await db(table).where({ id: req.params.id }).update(payload).returning('*');
    if (!updated) return res.status(404).json({ error: `${options.label || table} not found` });
    res.json(updated);
  }));
  router.delete('/:id', asyncHandler(async (req, res) => {
    const deleted = await db(table).where({ id: req.params.id }).del();
    if (!deleted) return res.status(404).json({ error: `${options.label || table} not found` });
    res.status(204).send();
  }));
  return router;
}
module.exports = createCrudRouter;
