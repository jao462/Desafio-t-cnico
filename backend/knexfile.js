require('dotenv').config();
module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgres://course_user:course_password@localhost:5432/course_manager',
    migrations: { directory: './src/database/migrations' },
    seeds: { directory: './src/database/seeds' },
    pool: { min: 0, max: 10 }
  }
};
