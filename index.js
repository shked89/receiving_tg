require('dotenv').config();

const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body');
// const { Pool } = require('pg');

console.log(1);
// const pool = new Pool({
//    user: process.env.DB_USER,
//    host: process.env.DB_HOST,
//    database: process.env.DB_NAME,
//    password: process.env.DB_PASSWORD,
//    port: process.env.DB_PORT,
// });

const app = new Koa();
const router = new Router();

const URL_TO_GET_WEBHOOKS = process.env.URL_TO_GET_WEBHOOKS

if (!URL_TO_GET_WEBHOOKS) {
   console.error('URL_TO_GET_WEBHOOKS is not defined in the .env file.');
   process.exit(1);
}

router.post(URL_TO_GET_WEBHOOKS, koaBody(), async (ctx) => {
   // const { update_id, ...data } = ctx.request.body;

   try {
      // await pool.query(
      //    'INSERT INTO webhooks (update_id, data) VALUES ($1, $2) ON CONFLICT (update_id) DO NOTHING',
      //    [update_id, data]
      // );
      console.log('Received update:');
      console.log(ctx.request.body);
      ctx.status = 200;
      ctx.body = 'OK';
   } catch (err) {
      console.error('Error:', err);
      ctx.status = 500;
      ctx.body = 'Internal Server Error';
   }
});

app
   .use(router.routes())
   .use(router.allowedMethods());

// Запускаем сервер
const port = process.env.PORT || 3000;
app.listen(port, () => {
   console.log(`Server is running on http://localhost:${port}`);
});
