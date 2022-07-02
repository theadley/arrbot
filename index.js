"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Require the framework and instantiate it
const fastify_1 = __importDefault(require("fastify"));
// import { Server, IncomingMessage, ServerResponse } from 'http'
const telegraf_1 = require("telegraf");
const API_KEY_SONARR = process.env.API_KEY_SONARR;
const API_KEY_TELEGRAM = process.env.API_KEY_TELEGRAM;
if (!API_KEY_SONARR) {
    console.error('[error]: The "API_KEY_SONARR" environment variable is required');
    process.exit(1);
}
if (!API_KEY_TELEGRAM) {
    console.error('[error]: The "API_KEY_TELEGRAM" environment variable is required');
    process.exit(1);
}
const server = (0, fastify_1.default)({});
const opts = {
    schema: {
        response: {
            200: {
                type: 'object',
                properties: {
                    pong: {
                        type: 'string'
                    }
                }
            }
        }
    }
};
// Declare a route
server.get('/', async (request, reply) => {
    return { hello: 'world' };
});
server.get('/ping', opts, async (request, reply) => {
    return { pong: 'it worked!' };
});
const bot = new telegraf_1.Telegraf(API_KEY_TELEGRAM);
bot.command('quit', (ctx) => {
    // Explicit usage
    ctx.telegram.leaveChat(ctx.message.chat.id);
    // Using context shortcut
    ctx.leaveChat();
});
// bot.on('text', (ctx) => {
//   // Explicit usage
//   ctx.telegram.sendMessage(ctx.message.chat.id, `Hello ${ctx.state.role}`)
//   // Using context shortcut
//   ctx.reply(`Hello ${ctx.state.role}`)
// })
// bot.on('callback_query', (ctx) => {
//   // Explicit usage
//   ctx.telegram.answerCbQuery(ctx.callbackQuery.id)
//   // Using context shortcut
//   ctx.answerCbQuery()
// })
// bot.on('inline_query', (ctx) => {
//   const result: readonly InlineQueryResult[] = []
//   // Explicit usage
//   ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result)
//   // Using context shortcut
//   ctx.answerInlineQuery(result)
// })
bot.start((ctx) => ctx.reply('Welcome'));
bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on('sticker', (ctx) => ctx.reply('👍'));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));
bot.launch();
// Launch the missiles!
server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
