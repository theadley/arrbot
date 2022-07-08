import fetch from 'node-fetch';
import { CalendarEntry, TelegramCalendarResponseLine } from '../models/series.js';

const controller = new AbortController()
const signal = controller.signal
setTimeout(() => { 
  controller.abort()
}, 3000)

//@ts-ignore
export const cal = async (ctx, URL_SONARR: string, API_KEY_SONARR: string) => {
  await fetch(`${URL_SONARR}/api/calendar?apikey=${API_KEY_SONARR}`, { signal })
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
              seriesType: calendarEntry.series.seriesType
            } as TelegramCalendarResponseLine
          });

          const reply = replyData.map(responseLine => `
            ${responseLine.seriesType === 'standard' ? '📺': '🍙'} ${responseLine.airDate} • <i>${responseLine.hasFile ? 'Downloaded' : 'Pending'}</i>
            <b>${responseLine.seriesName} S${responseLine.seasonNumber < 10 ? '0' : ''}${responseLine.seasonNumber}E${responseLine.episodeNumber < 10 ? '0' : ''}${responseLine.episodeNumber}</b>${responseLine.overview ? '\n' + responseLine.overview : ''}
            `).join('').replace(/            /g, '');
          ctx.replyWithHTML(reply)
        })
        .catch(err => ctx.reply(String(err)))
    })
    .catch(err => ctx.reply('😮‍💨 SIGH. I can\'t get a hold of TimTV. Probably load shedding 🙄'))
}