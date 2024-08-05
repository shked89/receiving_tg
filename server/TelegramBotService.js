const TelegramBot = require('node-telegram-bot-api');
const log = require('./log.js');

class TelegramBotService {
   constructor(token) {
      if (!token) {
         return log.e('Telegram Bot token is required');
      }
      this.bot = new TelegramBot(token);
   }

   async sendMsg(options = {}) {
      const { chatId, type, content, ...otherOptions } = options;

      if (!chatId || !type || !content) {
         return log.e('chatId, type, and content are required fields');
      }

      if (otherOptions?.buttons) {
         otherOptions.reply_markup = {
            inline_keyboard: otherOptions?.buttons
         };
      }

      try {
         let result;
         switch (type) {
            case 'text':
               result = await this.bot.sendMessage(chatId, content, otherOptions);
               break;
            case 'photo':
               result = await this.bot.sendPhoto(chatId, content, otherOptions);
               break;
            case 'audio':
               result = await this.bot.sendAudio(chatId, content, otherOptions);
               break;
            case 'document':
               result = await this.bot.sendDocument(chatId, content, otherOptions);
               break;
            case 'video':
               result = await this.bot.sendVideo(chatId, content, otherOptions);
               break;
            case 'voice':
               result = await this.bot.sendVoice(chatId, content, otherOptions);
               break;
            case 'sticker':
               result = await this.bot.sendSticker(chatId, content, otherOptions);
               break;
            case 'poll':
               const { question, options: pollOptions } = content;
               if (!question || !pollOptions) {
                  return log.e('For poll, both question and options are required');
               }
               result = await this.bot.sendPoll(chatId, question, pollOptions, otherOptions);
               break;
            default:
               return log.e(`Unsupported message type: ${type}`);
         }
         log(`Message sent: ${type}`);
         return result;
      } catch (error) {
         return log.e(`Error sending ${type} message: ${error}, chatId: ${options?.chatId}`);
      }
   }
}

module.exports = TelegramBotService;