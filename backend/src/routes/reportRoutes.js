const express = require('express');
const db = require('../database/db');
const asyncHandler = require('../utils/asyncHandler');
const router = express.Router();

router.get('/users-courses', asyncHandler(async (req, res) => {
  const rows = await db('users as u').leftJoin('courses as c', 'c.user_id', 'u.id').select('u.id', 'u.name', 'u.email').count('c.id as total_courses').groupBy('u.id').orderBy('total_courses', 'desc');
  res.json(rows);
}));
router.get('/courses-content-count', asyncHandler(async (req, res) => {
  const rows = await db('courses as c').leftJoin('modules as m', 'm.course_id', 'c.id').leftJoin('contents as ct', 'ct.module_id', 'm.id').select('c.id', 'c.code', 'c.title').countDistinct('ct.id as total_contents').groupBy('c.id').orderBy('total_contents', 'desc');
  res.json(rows);
}));
router.get('/courses-summary', asyncHandler(async (req, res) => {
  const rows = await db('courses as c').leftJoin('modules as m', 'm.course_id', 'c.id').leftJoin('contents as ct', 'ct.module_id', 'm.id').select('c.id', 'c.code', 'c.title').countDistinct('m.id as total_modules').countDistinct('ct.id as total_contents').groupBy('c.id').orderBy('c.title');
  res.json(rows);
}));
router.get('/contents-with-course', asyncHandler(async (req, res) => {
  const rows = await db('contents as ct').join('modules as m', 'm.id', 'ct.module_id').join('courses as c', 'c.id', 'm.course_id').select('ct.id', 'ct.title as content_title', 'ct.content', 'm.title as module_title', 'c.title as course_title').orderBy('c.title');
  res.json(rows);
}));
router.get('/content-2-viewers', asyncHandler(async (req, res) => {
  const contentId = req.query.contentId || '2';
  const rows = await db('users as u').join('content_progress as cp', 'cp.user_id', 'u.id').join('contents as ct', 'ct.id', 'cp.content_id').where('ct.id', contentId).select('u.id', 'u.name', 'u.email', 'cp.watched_at');
  res.json(rows);
}));
module.exports = router;
