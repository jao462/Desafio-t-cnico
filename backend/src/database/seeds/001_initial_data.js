const { randomUUID } = require('crypto');

exports.seed = async function (knex) {
  await knex('content_progress').del();
  await knex('contents').del();
  await knex('modules').del();
  await knex('courses').del();
  await knex('users').del();

  const users = [
    { id: randomUUID(), name: 'Alice Johnson', email: 'alice@example.com', status: 'active' },
    { id: randomUUID(), name: 'Robert Smith', email: 'robert@example.com', status: 'active' },
    { id: randomUUID(), name: 'Maria Garcia', email: 'maria@example.com', status: 'active' },
    { id: randomUUID(), name: 'David Brown', email: 'david@example.com', status: 'inactive' },
    { id: randomUUID(), name: 'Sofia Wilson', email: 'sofia@example.com', status: 'active' }
  ];
  await knex('users').insert(users);

  const courseSpecs = [
    { code: 'WEB-001', title: 'Web Development Fundamentals', description: 'Learn the foundations of the modern web.', owner: 0, modules: 5, contentsPerModule: 3 },
    { code: 'DB-002', title: 'Database Design', description: 'Understand relational database design and SQL.', owner: 1, modules: 3, contentsPerModule: 5 },
    { code: 'JS-003', title: 'JavaScript Essentials', description: 'Build programming skills with JavaScript.', owner: 2, modules: 2, contentsPerModule: 4 },
    { code: 'UX-004', title: 'User Experience Basics', description: 'Introduction to usability and user-centered design.', owner: 3, modules: 1, contentsPerModule: 1 },
    { code: 'API-005', title: 'API Development', description: 'Design and build REST APIs.', owner: 4, modules: 1, contentsPerModule: 1 }
  ];
  const courses = courseSpecs.map((spec) => ({ id: randomUUID(), code: spec.code, title: spec.title, description: spec.description, user_id: users[spec.owner].id }));
  await knex('courses').insert(courses);

  const modules = [];
  const contents = [];
  courseSpecs.forEach((spec, courseIndex) => {
    for (let moduleIndex = 1; moduleIndex <= spec.modules; moduleIndex += 1) {
      const moduleId = randomUUID();
      modules.push({ id: moduleId, course_id: courses[courseIndex].id, title: `Module ${moduleIndex}: ${['Introduction', 'Core Concepts', 'Practical Skills', 'Advanced Topics', 'Final Project'][moduleIndex - 1] || 'Additional Topics'}`, description: `Learning objectives for module ${moduleIndex}.`, user_id: users[spec.owner].id });
      for (let contentIndex = 1; contentIndex <= spec.contentsPerModule; contentIndex += 1) {
        contents.push({ id: randomUUID(), module_id: moduleId, title: `Lesson ${contentIndex}: Topic ${contentIndex}`, content: `This is the learning material for lesson ${contentIndex} in module ${moduleIndex} of ${spec.title}.` });
      }
    }
  });
  await knex('modules').insert(modules);
  await knex('contents').insert(contents);
  await knex('content_progress').insert(contents.slice(0, 5).map((content, index) => ({ user_id: users[index % users.length].id, content_id: content.id })));
};
