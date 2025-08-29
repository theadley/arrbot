import fetch from 'node-fetch';
import {DiskSpace} from '../models/diskspace.js';
import {Context} from "telegraf";

const MAX_BARS = 15;

const formatBytes = (bytes: number, decimals = 2)=> {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
}

export const calcDiskSpaceResponses = async (URL_SONARR: string, API_KEY_SONARR: string)=> {
    return fetch(`${URL_SONARR}/api/v3/diskspace?apikey=${API_KEY_SONARR}`)
        .then(async res => {
            try {
                const json = await res.json();
                const replyJSON = (json as DiskSpace[]);
                const drives: Record<string, DiskSpace> = {};
                // Oh boy here we go, this is gonna be so jank
                replyJSON.forEach(reply => {
                    if (reply.path === '/') {
                        drives['C'] = reply;
                    }
                    if (reply.path === '/config') {
                        drives['F'] = reply;
                    }
                    if (reply.path.startsWith('/downloads')) {
                        drives['A'] = reply;
                    }
                    if (reply.path.startsWith('/data')) {
                        drives[reply.path.split('/')[2]] = reply;
                    }
                });

                const reply: string[] = [`<b>Total Drives (${Object.keys(drives).length})</b>\n\n`];
                let totalSpace = 0;
                let totalUsed = 0;
                Object.entries(drives)
                    .sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)
                    .forEach(([path, drive]) => {
                        totalSpace += drive.totalSpace;
                        totalUsed += drive.freeSpace;
                        // TODO: Year progress bar idea, cred Nardus-sama
                        // skill issues: 🟩⬛️⬛️⬛️⬛️⬛️(69/420)
                        const percentageUsed = Math.round((drive.totalSpace - drive.freeSpace) * 10000 / drive.totalSpace) / 100;
                        const fillString = percentageUsed < 60 ? '🟩' : percentageUsed < 90 ? '🟧' : '🟥';
                        reply.push(`
                            <b>Local Disk (/mnt/${path})</b>
                            ${fillString.repeat(percentageUsed / 100 * MAX_BARS)}${'⬛️'.repeat(MAX_BARS - (percentageUsed / 100 * MAX_BARS))}
                            <b>${formatBytes(drive.freeSpace)}</b> free of ${formatBytes(drive.totalSpace)}
                        `);
                    });
                totalUsed = totalSpace - totalUsed;
                reply.push(`
                        <b>TOTAL USED: ${formatBytes(totalUsed)}</b>
                      `);
                reply.push(`<b>TOTAL SPACE: ${formatBytes(totalSpace)}</b>`);
                return reply.join('').replace(/ {2,}/g, '');
            } catch (err) {
                return String(err);
            }
        })
        .catch(err => {
            console.error(err);
            return '😮‍💨 SIGH. I can\'t get a hold of TimTV. Probably load shedding 🙄';
        });
}

export const diskSpace = async (ctx: Context, URL_SONARR: string, API_KEY_SONARR: string) => {
    ctx.replyWithHTML(await calcDiskSpaceResponses(URL_SONARR, API_KEY_SONARR) ?? 'Error with disk space');
}
