
const Koa = require('koa');
const Router = require('koa-router');
const koaBody = require('koa-body').default;

const { DBArrs, DBObj } = require('./db/PgDBConnection.js');
const TelegramBotService = require('./TelegramBotService.js');

const urlToGetWebhooks = process.env.URL_TO_GET_WEBHOOKS
const botToken = process.env.TELEGRAM_BOT_TOKEN;

const createServer = () => {

   const app = new Koa();
   const router = new Router();

   const tgService = new TelegramBotService(botToken)

   const urlToGetWebhooks = process.env.URL_TO_GET_WEBHOOKS
   const xTelegramBotApiSecretToken = process.env.X_TELEGRAM_BOT_API_SECRET_TOKEN

   if (!urlToGetWebhooks) {
      console.error('URL_TO_GET_WEBHOOKS is not defined in the .env file.');
      process.exit(1);
   }

   if (!xTelegramBotApiSecretToken) {
      console.error('X_TELEGRAM_BOT_API_SECRET_TOKEN is not defined in the .env file.');
      process.exit(1);
   }

   const messageTypes = ['text', 'photo', 'video', 'document', 'voice', 'sticker'];

   const commands = {
      '/options': async (data = {}) => {
         console.log('/options');
         tgService.sendMsg({
            type: 'text',
            chatId: data?.message?.chat?.id,
            content: 'OK',
            buttons: [
               [{ text: 'Browser link', callback_data: 'send#browser_link' }],
               [{ text: 'Webview app', callback_data: 'send#webview_app' }]
            ]
         })
      },

      '/start': async (data = {}) => {
         console.log('/start');
         await tgService.sendMsg({
            chatId: data?.message?.chat?.id,
            type: 'text',
            content: 'Opening WebView...',
            buttons: [
               [{
                  text: 'Open Google',
                  web_app: { url: 'https://www.google.com?data=asfaga11' }
               }],
               [{
                  text: 'Open Google',
                  url: 'https://www.google.com?data=asfaga'
               }]
            ]
         });
      },
   }

   // const commandsList = Object.keys(commands)

   async function getMessageType(update) {
      try {

         if (update?.callback_query) {
            return [1200, 'callback_query'];
         }

         if (!update?.message || typeof update?.message !== 'object') {
            return false
         }

         const index = messageTypes.findIndex(type => update?.message.hasOwnProperty(type));

         if (index !== -1)
            return [index, messageTypes[index]];
         else
            return false

      } catch (error) {
         console.error('Err:', error);
         return false
      }
   }

   async function handleCallbackQuery(callbackQuery) {
      const { id, data, message } = callbackQuery;

      console.log('Received callback:', data);

      await tgService.bot.answerCallbackQuery(id, { text: 'Button clicked!' });

      if (data === 'button1') {
         await tgService.sendMsg({
            chatId: message.chat.id,
            type: 'text',
            content: 'You clicked Button 1!'
         });
      }
   }

   router.post(urlToGetWebhooks, koaBody(), async (ctx) => {
      try {

         if (ctx.request.headers?.['x-telegram-bot-api-secret-token'] !== xTelegramBotApiSecretToken) {
            console.error('Err WXT');
            ctx.status = 403;
            ctx.body = 'WXT';
            return false
         }

         const receivedData = ctx.request.body;
         if (!receivedData) {
            console.error('Err');
            ctx.status = 400;
            ctx.body = 'ERR';
            return false
         }

         const msgType = await getMessageType(receivedData) || [0, 'unknown']

         const sqlQueryResult = await DBObj(`INSERT INTO public.events ("data", type_id, type_str) VALUES ($1::json, $2, $3) RETURNING *;`, {
            params: [
               JSON.stringify(receivedData),
               msgType[0],
               msgType[1],
            ]
         })


         console.log('Received update:');
         console.log(receivedData);
         console.log(msgType);
         console.log(sqlQueryResult);
         // console.log(ctx.request.headers);

         if (msgType[1] === 'callback_query') {
            await handleCallbackQuery(receivedData.callback_query);
         } else {
            const command = receivedData?.message?.text || undefined;

            if (command && command.startsWith('/') && commands?.[command]) {
               await commands?.[command](receivedData);
            }
         }

         ctx.status = 200;
         ctx.body = 'OK';
      } catch (err) {
         console.error('Error:', err);
         ctx.status = 500;
         ctx.body = 'ISE';
      }
   });

   app
      .use(router.routes())
      .use(router.allowedMethods());

   const port = process.env.APP_PORT || 3000;
   app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
   });

}

module.exports = createServer