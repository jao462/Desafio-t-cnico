-- SQL 01: Users with the highest number of courses.
SELECT u.id, u.name, u.email, COUNT(c.id) AS total_courses
FROM users u
LEFT JOIN courses c ON c.user_id = u.id
GROUP BY u.id, u.name, u.email
ORDER BY total_courses DESC, u.name;

-- SQL 02: Course with the highest number of contents.
SELECT c.id, c.code, c.title, COUNT(DISTINCT ct.id) AS total_contents
FROM courses c
LEFT JOIN modules m ON m.course_id = c.id
LEFT JOIN contents ct ON ct.module_id = m.id
GROUP BY c.id, c.code, c.title
ORDER BY total_contents DESC, c.title;

-- SQL 03: All courses with their module and content totals in one query.
SELECT c.id, c.code, c.title,
       COUNT(DISTINCT m.id) AS total_modules,
       COUNT(DISTINCT ct.id) AS total_contents
FROM courses c
LEFT JOIN modules m ON m.course_id = c.id
LEFT JOIN contents ct ON ct.module_id = m.id
GROUP BY c.id, c.code, c.title
ORDER BY c.title;

-- SQL 04: All contents with their course name in one query.
SELECT ct.id, ct.title AS content_title, ct.content,
       m.title AS module_title, c.title AS course_title
FROM contents ct
JOIN modules m ON m.id = ct.module_id
JOIN courses c ON c.id = m.course_id
ORDER BY c.title, m.title, ct.title;

-- Bonus: Users who watched content with ID 2.
-- IDs are UUIDs in this project, so replace the value with the UUID of the desired content.
SELECT u.id, u.name, u.email, cp.watched_at
FROM users u
JOIN content_progress cp ON cp.user_id = u.id
JOIN contents ct ON ct.id = cp.content_id
WHERE ct.id = 'REPLACE-WITH-CONTENT-UUID';
