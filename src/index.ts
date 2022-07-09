import { Telegraf, Markup } from 'telegraf'
import { cal } from './workers/calendar.js';
import { diskspace } from './workers/space.js';

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

// Robot protector-man
const bot = new Telegraf(API_KEY_TELEGRAM);
bot.use(Telegraf.log());

bot.telegram.sendMessage('791306687', "Oi! I'm alive. Type /help!");

bot.start((ctx) => ctx.reply('Welcome!\nTry the /help command for more info.'))

bot.help(async (ctx) => {
  return await ctx.reply('Pick an option 👇', Markup
    .keyboard([
      ['🔍 Search', '📅 Calendar', '💽 Space'], // Row1 with 2 buttons
      ['📅 Long Calendar', '🙏 Request'], // Row2 with 2 buttons
      // ['📢 Ads', '⭐️ Rate us', '👥 Share'] // Row3 with 3 buttons
    ])
    .oneTime()
    .resize()
  )
})

bot.hears('🔍 Search', ctx => ctx.reply('🚧 Work in progress. Please be patient.'))
bot.hears('🙏 Request', ctx => ctx.reply('🚧 Work in progress. Please be patient.'))

bot.command('calendar', async (ctx) => cal(ctx, URL_SONARR, API_KEY_SONARR))
bot.hears('📅 Calendar', async (ctx) => cal(ctx, URL_SONARR, API_KEY_SONARR))
bot.command('longcalendar', async (ctx) => cal(ctx, URL_SONARR, API_KEY_SONARR, true))
bot.hears('📅 Long Calendar', async (ctx) => cal(ctx, URL_SONARR, API_KEY_SONARR, true))

bot.command('space', ctx => diskspace(ctx, URL_SONARR, API_KEY_SONARR))
bot.hears('💽 Space', ctx => diskspace(ctx, URL_SONARR, API_KEY_SONARR))

bot.command('code', ctx => ctx.replyWithHTML(`<pre language="ts">
    export interface Test {
      name: string;
      age: number;
    }
  </pre>`));



bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))