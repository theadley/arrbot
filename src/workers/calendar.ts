import fetch from 'node-fetch';
import {CalendarEntry, TelegramCalendarResponseLine} from '../models/series.js';
import {mapSeries} from '../utils/mapseries.js';
import {Context} from "telegraf";

export const cal = async (ctx: Context, URL_SONARR: string, API_KEY_SONARR: string, isLong = false) => {
    let URL = `${URL_SONARR}/api/v3/calendar?apikey=${API_KEY_SONARR}&unmonitored=false&includeSeries=true&includeEpisodeFile=true&includeEpisodeImages=true`;
    if (isLong) {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        URL = `${URL_SONARR}/api/v3/calendar?start=${lastWeek.toISOString().split('T')[0]}&end=${nextWeek.toISOString().split('T')[0]}&unmonitored=false&includeSeries=true&includeEpisodeFile=true&includeEpisodeImages=true&apikey=${API_KEY_SONARR}`;
    }
    await fetch(URL, {headers: {"Accept-Encoding": "gzip, deflate, identity"}})
        .then(res => {
            res.json()
                .then(json => {
                    const replyData = (json as CalendarEntry[])
                        .sort((a, b) => a.airDateUtc < b.airDateUtc ? -1 : a.airDateUtc > b.airDateUtc ? 1 : 0)
                        .map(calendarEntry => {
                            // console.log(calendarEntry)
                            return {
                                seriesName: calendarEntry.series?.title ?? 'Untitled',
                                seasonNumber: calendarEntry.seasonNumber,
                                episodeNumber: calendarEntry.episodeNumber,
                                airDate: calendarEntry.airDate,
                                overview: calendarEntry.overview,
                                hasFile: calendarEntry.hasFile,
                                seriesType: calendarEntry.series?.seriesType ?? 'UNK',
                                quality: calendarEntry.episodeFile?.quality ? calendarEntry.episodeFile.quality.quality.resolution + 'p' : '',
                                genres: calendarEntry.series?.genres ?? [],
                                image: calendarEntry.series?.images?.find(img => img.coverType === 'poster')?.remoteUrl ?? '',
                            } as TelegramCalendarResponseLine
                        });

                    const reply = replyData.map(responseLine => `
            ${responseLine.seriesType === 'standard' ? '📺' : '🍙'} ${responseLine.airDate} • <i>${responseLine.hasFile ? 'Downloaded ' + (responseLine.quality.length ? '@' + responseLine.quality : '') : 'Pending'}</i>
            <b>${responseLine.seriesName} S${responseLine.seasonNumber < 10 ? '0' : ''}${responseLine.seasonNumber}E${responseLine.episodeNumber < 10 ? '0' : ''}${responseLine.episodeNumber}</b>${responseLine.genres ? '\n<i>' + responseLine.genres.join(', ') + '</i>' : ''}${responseLine.overview ? '\n\n' + responseLine.overview : ''}
            `);
                    mapSeries(reply.map(line => line.replace(/ {2,}/g, '')), (p, i) => {
                        if (replyData[i]?.image)
                            ctx.replyWithPhoto(replyData[i].image, {caption: p, parse_mode: 'HTML'})
                        else
                            ctx.replyWithHTML(p);
                    });
                })
                .catch(err => {
                    console.error(URL, res.status);
                    ctx.reply(String(err))
                })
        })
        .catch(err => {
            console.error(err);
            ctx.reply('😮‍💨 SIGH. I can\'t get a hold of TimTV. Probably load shedding 🙄')
        })
}
