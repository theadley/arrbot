// Require the framework and instantiate it
import { fastify, FastifyInstance, RouteShorthandOptions } from 'fastify'
// import { Server, IncomingMessage, ServerResponse } from 'http'
import { Telegraf } from 'telegraf'
import { InlineQueryResult } from 'typegram';
import fetch from 'node-fetch';
import { CalendarEntry, TelegramCalendarResponseLine } from './models/series';

const URL_SONARR = process.env.URL_SONARR;
const API_KEY_SONARR = process.env.API_KEY_SONARR;
const API_KEY_TELEGRAM = process.env.API_KEY_TELEGRAM;

if (!URL_SONARR) {
    console.error('[error]: The "URL_SONARR" environment variable is required')
    process.exit(1)
}

if (!API_KEY_SONARR) {
    console.error('[error]: The "API_KEY_SONARR" environment variable is required')
    process.exit(1)
}

if (!API_KEY_TELEGRAM) {
    console.error('[error]: The "API_KEY_TELEGRAM" environment variable is required')
    process.exit(1)
}

const server: FastifyInstance = fastify({})

const opts: RouteShorthandOptions = {
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
}

// Declare a route
server.get('/', async (request, reply) => {
  return { hello: 'world' }
})

server.get('/ping', opts, async (request, reply) => {
  return { pong: 'it worked!' }
})



const bot = new Telegraf(API_KEY_TELEGRAM)

bot.command('quit', (ctx) => {
  // Explicit usage
  ctx.telegram.leaveChat(ctx.message.chat.id)

  // Using context shortcut
  ctx.leaveChat()
})

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

bot.start((ctx) => ctx.reply('Welcome'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hey there'))
bot.command('calendar', async (ctx) => {
  await fetch(`${URL_SONARR}/api/calendar?apikey=${API_KEY_SONARR}`)
    .then(res => {
      res.json()
        .then(json => {
          const replyData = (json as CalendarEntry[]).map(calendarEntry => {
            return {
              seriesName: calendarEntry.series.title,
              seasonNumber: calendarEntry.seasonNumber,
              episodeNumber: calendarEntry.episodeNumber,
              airDate: calendarEntry.airDate,
              overview: calendarEntry.overview,
              hasFile: calendarEntry.hasFile
            } as TelegramCalendarResponseLine
          });
          ctx.reply(replyData.map(responseLine => `${responseLine.airDate}\n${responseLine.seriesName} S${responseLine.seasonNumber}E${responseLine.episodeNumber}\n${responseLine.overview ? responseLine.overview + '\n': ''}${responseLine.hasFile ? 'Downloaded' : 'Pending'}\n`).join('\n'))
        })
        .catch(err => ctx.reply(String(err)))
    })
    .catch(err => ctx.reply(String(err)))

  // const response = await fetch(`http://localhost:8989/api/v3/calendar?apikey=${API_KEY_SONARR}`);
  // const data = await response.json();

})
bot.launch()





// Launch the missiles!

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))