
const { Pool, Client } = require('pg')
const log = require('../log.js');

let client

const initSQLModel = async () => {

   try {

      const pool = new Pool({
         host: process.env.DB_HOST,
         user: process.env.DB_USERNAME,
         database: process.env.DB_DATABASE,
         password: process.env.DB_PASSWORD,
         port: process.env.DB_PORT,
         // max: 20,
         idleTimeoutMillis: 30000,
         connectionTimeoutMillis: 20000,
      })

      client = await pool.connect()

   } catch (error) {
      console.log('\x1b[91m%s\x1b[0m', `\nDB connection error!`);
      console.log(`Error: ${process.env.DB_HOST}:${process.env.DB_PORT} db:'${process.env.DB_DATABASE}'\n`);
      process.exit();
   }

   return true
}

const DB = (sql) => {
   return client.query({
      rowMode: 'array',
      text: sql,
   })
      .then((e) => { return e.rows })
      .catch((e) => { log_e(e); return [] })
}

const DBparams = (sql, params = []) => {
   return client.query({
      rowMode: 'object',
      text: sql,
      values: params
   })
      .then(e => e.rows)
      .catch(e => {
         log_e(e.detail);
         return e.detail;
      });
}

const DBObj = (sql, options = {}) => {
   return client.query({
      rowMode: 'object',
      text: sql,
      values: options.params || []
   })
      .then((e) => { return e.rows })
      .catch((e) => {
         log_e(e);
         return [];
      });
}

const DBvErr = (sql) => {
   return client.query({
      rowMode: 'array',
      text: sql,
   })
      .then((e) => { return e.rows })
      .catch((e) => { return e })
}

const DBArrs = (sql, options = {}) => {
   return client.query({
      rowMode: 'array',
      text: sql,
      values: options.params || []
   })
      .then((e) => {
         let arr = []
         try {
            e.rows.forEach(el => {
               arr.push(el[0])
            });
         } catch (er) {
         }
         return arr
      })
      .catch((e) => { log_e(e); return [] })
}

const DBOnce = (sql) => {
   return client.query({
      rowMode: 'array',
      text: sql,
   })
      .then((e) => { return e.rows[0] || [] })
      .catch((e) => { log_e(e); return [] })
}

const DBCount = (sql) => {
   return client.query({
      rowMode: 'array',
      text: sql,
   })
      .then((e) => { return parseInt(e.rows[0][0] || 0) })
      .catch((e) => { log_e(e); return 0 })
}

module.exports = {
   DB,
   DBparams,
   DBObj,
   DBvErr,
   DBArrs,
   DBOnce,
   DBCount,
   initSQLModel
} 
