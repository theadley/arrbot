var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Require the framework and instantiate it
import { fastify } from 'fastify';
// import { Server, IncomingMessage, ServerResponse } from 'http'
import { Telegraf, Markup } from 'telegraf';
import fetch from 'node-fetch';
const URL_SONARR = process.env.URL_SONARR;
const API_KEY_SONARR = process.env.API_KEY_SONARR;
const API_KEY_TELEGRAM = process.env.API_KEY_TELEGRAM;
if (!URL_SONARR) {
    console.error('[error]: The "URL_SONARR" environment variable is required');
    process.exit(1);
}
if (!API_KEY_SONARR) {
    console.error('[error]: The "API_KEY_SONARR" environment variable is required');
    process.exit(1);
}
if (!API_KEY_TELEGRAM) {
    console.error('[error]: The "API_KEY_TELEGRAM" environment variable is required');
    process.exit(1);
}
const server = fastify({});
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
server.get('/', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    return { hello: 'world' };
}));
server.get('/ping', opts, (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    return { pong: 'it worked!' };
}));
// Politely borrowed from markdown-escape - not ES6 friendly
function escape(inputString) {
    const replacements = [
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
    ];
    return replacements.reduce((inputString, replacement) => {
        return inputString.replace(replacement[0], replacement[1]);
    }, inputString);
}
const bot = new Telegraf(API_KEY_TELEGRAM);
bot.use(Telegraf.log());
bot.start((ctx) => ctx.reply('Welcome!\nTry the /help command for more info.'));
//@ts-ignore
const cal = (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    yield fetch(`${URL_SONARR}/api/calendar?apikey=${API_KEY_SONARR}`)
        .then(res => {
        res.json()
            .then(json => {
            const replyData = json.map(calendarEntry => {
                var _a;
                return {
                    seriesName: calendarEntry.series.title,
                    seasonNumber: calendarEntry.seasonNumber,
                    episodeNumber: calendarEntry.episodeNumber,
                    airDate: calendarEntry.airDate,
                    overview: calendarEntry.overview,
                    hasFile: calendarEntry.hasFile,
                    bannerUrl: (_a = calendarEntry.series.images.find(image => image.coverType === 'banner')) === null || _a === void 0 ? void 0 : _a.url
                };
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
<b>${responseLine.seriesName} S${responseLine.seasonNumber}E${responseLine.episodeNumber}</b>${responseLine.overview ? '\n' + responseLine.overview : ''}
<i>${responseLine.hasFile ? 'Downloaded' : 'Pending'}</i>
`).join('');
            ctx.replyWithHTML(reply, { disable_web_page_preview: false });
        })
            .catch(err => ctx.reply(String(err)));
    })
        .catch(err => ctx.reply(String(err)));
});
bot.help((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    return yield ctx.reply('Custom buttons keyboard', Markup
        .keyboard([
        ['🔍 Search', '📅 Calendar'],
        ['☸ Settings', '📞 Feedback'], // Row2 with 2 buttons
        // ['📢 Ads', '⭐️ Rate us', '👥 Share'] // Row3 with 3 buttons
    ])
        .oneTime()
        .resize());
}));
bot.hears('🔍 Search', ctx => ctx.reply('Working on it!'));
bot.hears('☸ Settings', ctx => ctx.reply('Working on it!'));
bot.hears('📞 Feedback', ctx => ctx.reply('Working on it!'));
bot.command('calendar', (ctx) => __awaiter(void 0, void 0, void 0, function* () { return cal(ctx); }));
bot.hears('📅 Calendar', (ctx) => __awaiter(void 0, void 0, void 0, function* () { return cal(ctx); }));
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
