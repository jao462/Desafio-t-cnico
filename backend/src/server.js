require('dotenv').config();
const app = require('./app');
const db = require('./database/db');
const port = process.env.PORT || 3001;
const server = app.listen(port, () => console.log(`API running at http://localhost:${port}`));
const shutdown = async () => { server.close(); await db.destroy(); process.exit(0); };
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
