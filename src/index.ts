// Require the framework and instantiate it
import { fastify, FastifyInstance, RouteShorthandOptions } from 'fastify'
// import { Server, IncomingMessage, ServerResponse } from 'http'
import { Telegraf, Markup } from 'telegraf'
import fetch from 'node-fetch';
import { CalendarEntry, TelegramCalendarResponseLine } from './models/series.js';


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


// Politely borrowed from markdown-escape - not ES6 friendly
function escape(inputString: string) {
  const replacements: [RegExp, string, string][] = [
    [/\*/g, '\\*', 'asterisks'],
    [/#/g, '\\#', 'number signs'],
    [/\//g, '\\/', 'slashes'],
    [/\(/g, '\\(', 'parentheses'],
    [/\)/g, '\\)', 'parentheses'],
    [/\[/g, '\\[', 'square brackets'],
    [/\]/g, '\\]', 'square brackets'],
    [/</g, '&lt;', 'angle brackets'],
    [/>/g, '&gt;', 'angle brackets'],
    [/-/g, '\\-', 'hyphen'],
    [/!/g, '\\!', 'exclamation'],
    [/\./g, '\\.', 'dot'],
    [/_/g, '\\_', 'underscores']
  ]

  return replacements.reduce((inputString, replacement) => {
    return inputString.replace(replacement[0], replacement[1])
  }, inputString)
}







const bot = new Telegraf(API_KEY_TELEGRAM);
bot.use(Telegraf.log());

bot.start((ctx) => ctx.reply('Welcome!\nTry the /help command for more info.'))

//@ts-ignore
const cal = async (ctx) => {
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
              hasFile: calendarEntry.hasFile,
              bannerUrl: calendarEntry.series.images.find(image => image.coverType === 'banner')?.url
            } as TelegramCalendarResponseLine
          });
          // ctx.reply(replyData.map(responseLine => `
          //   ${responseLine.airDate}\n${responseLine.seriesName} S${responseLine.seasonNumber}E${responseLine.episodeNumber}\n
          //   ${responseLine.overview ? responseLine.overview + '\n': ''}
          //   ${responseLine.hasFile ? 'Downloaded' : 'Pending'}\n`)
          //   .join('\n'))

          // const reply = replyData.map(responseLine => `
          // ${escape(responseLine.airDate)}\n
          // ${responseLine.bannerUrl ? '![](' + responseLine.bannerUrl + ')\n' : ''}
          // # ${escape(responseLine.seriesName)} S${responseLine.seasonNumber}E${responseLine.episodeNumber}\n
          // ${responseLine.overview ? '*' + escape(responseLine.overview) + '*\n': ''}
          // ${responseLine.hasFile ? 'Downloaded' : 'Pending'}\n`)
          // .join('\n');
          // ctx.reply(reply, { parse_mode: "MarkdownV2" })

          const reply = replyData.map(responseLine => `
${responseLine.airDate}
<b>${responseLine.seriesName} S${responseLine.seasonNumber}E${responseLine.episodeNumber}</b>${responseLine.overview ? '\n' + responseLine.overview: ''}
<i>${responseLine.hasFile ? 'Downloaded' : 'Pending'}</i>
`).join('');
          ctx.replyWithHTML(reply, {disable_web_page_preview: false})
        })
        .catch(err => ctx.reply(String(err)))
    })
    .catch(err => ctx.reply(String(err)))

}


bot.help(async (ctx) => {
  return await ctx.reply('Custom buttons keyboard', Markup
    .keyboard([
      ['🔍 Search', '📅 Calendar'], // Row1 with 2 buttons
      ['☸ Settings', '📞 Feedback'], // Row2 with 2 buttons
      // ['📢 Ads', '⭐️ Rate us', '👥 Share'] // Row3 with 3 buttons
    ])
    .oneTime()
    .resize()
  )
})

bot.hears('🔍 Search', ctx => ctx.reply('Working on it!'))
bot.hears('☸ Settings', ctx => ctx.reply('Working on it!'))
bot.hears('📞 Feedback', ctx => ctx.reply('Working on it!'))

bot.command('calendar', async (ctx) => cal(ctx))
bot.hears('📅 Calendar', async (ctx) => cal(ctx))
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