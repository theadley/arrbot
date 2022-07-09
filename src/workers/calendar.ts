import fetch from 'node-fetch';
import { CalendarEntry, TelegramCalendarResponseLine } from '../models/series.js';
import { mapSeries } from '../utils/mapseries.js';

const controller = new AbortController()
const signal = controller.signal
setTimeout(() => { 
  controller.abort()
}, 30000)

//@ts-ignore
export const cal = async (ctx, URL_SONARR: string, API_KEY_SONARR: string, isLong = false) => {
  let URL = `${URL_SONARR}/api/calendar?apikey=${API_KEY_SONARR}`;
  if (isLong) {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    URL = `${URL_SONARR}/api/calendar?apikey=${API_KEY_SONARR}&start=${lastWeek.toISOString().split('T')[0]}&end=${nextWeek.toISOString().split('T')[0]}`;
  }
  await fetch(URL)
    .then(res => {
      res.json()
        .then(json => {
          const replyData = (json as CalendarEntry[])
            .sort((a, b) => a.airDateUtc < b.airDateUtc ? -1 : a.airDateUtc > b.airDateUtc ? 1 : 0)
            .map(calendarEntry => {
            return {
              seriesName: calendarEntry.series.title,
              seasonNumber: calendarEntry.seasonNumber,
              episodeNumber: calendarEntry.episodeNumber,
              airDate: calendarEntry.airDate,
              overview: calendarEntry.overview,
              hasFile: calendarEntry.hasFile,
              seriesType: calendarEntry.series.seriesType,
              quality: calendarEntry.episodeFile?.quality ? calendarEntry.episodeFile.quality.quality.resolution + 'p': '',
              genres: calendarEntry.series.genres
            } as TelegramCalendarResponseLine
          });

          const reply = replyData.map(responseLine => `
            ${responseLine.seriesType === 'standard' ? '📺': '🍙'} ${responseLine.airDate} • <i>${responseLine.hasFile ? 'Downloaded ' + (responseLine.quality.length ? '@' + responseLine.quality : '') : 'Pending'}</i>
            <b>${responseLine.seriesName} S${responseLine.seasonNumber < 10 ? '0' : ''}${responseLine.seasonNumber}E${responseLine.episodeNumber < 10 ? '0' : ''}${responseLine.episodeNumber}</b>${responseLine.genres ? '\n<i>' + responseLine.genres.join(', ') + '</i>' : ''}${responseLine.overview ? '\n' + responseLine.overview : ''}
            `);
          if (reply.join('').replace(/ {2,}/g, '').length < 4096) {
            ctx.replyWithHTML(reply.join('').replace(/ {2,}/g, ''))
          } else {
            reply.push('<b>This message was too long to send in one message, sorry.</b>');
            mapSeries(reply.map(line => line.replace(/ {2,}/g, '')), (p) => ctx.replyWithHTML(p))
            .then(() =>
              console.log('All done!')
            )
          }
        })
        .catch(err => ctx.reply(String(err)))
    })
    .catch(err => ctx.reply('😮‍💨 SIGH. I can\'t get a hold of TimTV. Probably load shedding 🙄'))
}