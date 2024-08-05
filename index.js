
require('dotenv').config();

const { initSQLModel } = require('./server/db/PgDBConnection.js');
const createServer = require('./server/CreateServer.js');

(async () => {
   await initSQLModel();
   createServer()
})();
