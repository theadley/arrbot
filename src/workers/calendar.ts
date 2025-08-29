import fetch from 'node-fetch';
import {CalendarEntry, TelegramCalendarResponseLine} from '../models/series.js';
import {mapSeries} from '../utils/mapseries.js';
import {Context} from "telegraf";
import {formatDistance} from 'date-fns';

export const cal = async (ctx: Context, URL_SONARR: string, API_KEY_SONARR: string, timeSpan: 'today' | 'default' | 'week' | 'today_small') => {
    let URL = `${URL_SONARR}/api/v3/calendar?apikey=${API_KEY_SONARR}&unmonitored=false&includeSeries=true&includeEpisodeFile=true&includeEpisodeImages=true`;
    if (timeSpan === 'today') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        URL += `&start=${yesterday.toISOString().split('T')[0]}&end=${tomorrow.toISOString().split('T')[0]}`;
    } else if (timeSpan === 'week') {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        URL += `&start=${lastWeek.toISOString().split('T')[0]}&end=${nextWeek.toISOString().split('T')[0]}`;
    }
    await fetch(URL, {headers: {"Accept-Encoding": "gzip, deflate, identity"}})
        .then(res => {
            res.json()
                .then(json => {
                    const replyData = (json as CalendarEntry[])
                        .filter(calendarEntry => {
                            if (timeSpan === "default") return true;
                            if (timeSpan === "today" || timeSpan === 'today_small') {
                                const today = new Date();
                                today.setHours(0,0,0,0);
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                tomorrow.setHours(0,0,0,0);
                                const testDate = new Date(calendarEntry.airDateUtc);
                                return testDate >= today && testDate <= tomorrow;
                            }
                            if (timeSpan === "week") {
                                const lastWeek = new Date();
                                lastWeek.setDate(lastWeek.getDate() - 7);
                                lastWeek.setHours(0,0,0,0);
                                const nextWeek = new Date();
                                nextWeek.setDate(nextWeek.getDate() + 7);
                                nextWeek.setHours(0,0,0,0);
                                const testDate = new Date(calendarEntry.airDateUtc);
                                return testDate >= lastWeek && testDate <= nextWeek;
                            }
                        })
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
                    // Series Request Now Available - Tengoku Daimakyo (2023)
                    // In the year 2024, the world has collapsed. DESCRIPTION
                    //
                    // Requested By: Kriogen777
                    // Request Status: Available
                    // Requested Seasons: 1

            //         const reply = replyData.map(responseLine => `
            // ${responseLine.seriesType === 'standard' ? '📺 Series' : '🍙 Anime'}<br> ${formatDistance(new Date(responseLine.airDate), new Date(), { addSuffix: true })} (${responseLine.airDate}) • <i>${responseLine.hasFile ? 'Downloaded ' + (responseLine.quality.length ? '@' + responseLine.quality : '') : 'Pending'}</i>
            // <b>${responseLine.seriesName} S${responseLine.seasonNumber < 10 ? '0' : ''}${responseLine.seasonNumber}E${responseLine.episodeNumber < 10 ? '0' : ''}${responseLine.episodeNumber}</b>${responseLine.genres ? '\n<i>' + responseLine.genres.join(', ') + '</i>' : ''}${responseLine.overview ? '\n\n' + responseLine.overview : ''}
            // `);
                    const reply = replyData.map(responseLine => `
                    <b>${responseLine.seriesType === 'standard' ? 'Series' : 'Anime'} • ${responseLine.seriesName} S${responseLine.seasonNumber < 10 ? '0' : ''}${responseLine.seasonNumber}E${responseLine.episodeNumber < 10 ? '0' : ''}${responseLine.episodeNumber}</b>
                    ${responseLine.genres ? '<i>' + responseLine.genres.join(', ') + '</i>' : ''}${responseLine.overview && timeSpan === 'today' ? '\n\n' + responseLine.overview + '\n' : ''}
                    
                    <b>${responseLine.seriesType === 'standard' ? 'Series' : 'Anime'} Status: ${responseLine.hasFile ? 'Downloaded ' + (responseLine.quality.length ? '@' + responseLine.quality : '') : 'Pending'}</b>
                    <b>Air Date: ${responseLine.airDate} • ${formatDistance(new Date(responseLine.airDate), new Date(), { addSuffix: true })}</b>
                    `);
                    mapSeries(reply.map(line => line.replace(/ {2,}/g, '')), (p, i) => {
                        if (replyData[i]?.image && timeSpan !== "week" && timeSpan !== "today_small")
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
            console.error(err, URL);
            ctx.reply('😮‍💨 SIGH. I can\'t get a hold of TimTV. Probably load shedding 🙄')
        })
}
