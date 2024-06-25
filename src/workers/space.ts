import fetch from 'node-fetch';
import {DiskSpace} from '../models/diskspace.js';
import {Context} from "telegraf";

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
}

export const diskspace = async (ctx: Context, URL_SONARR: string, API_KEY_SONARR: string) => {
    await fetch(`${URL_SONARR}/api/v3/diskspace?apikey=${API_KEY_SONARR}`)
        .then(res => {
            res.json()
                .then(json => {
                    const replyJSON = (json as DiskSpace[]);
                    const drives: Record<string, DiskSpace> = {};
                    // Oh boy here we go, this is gonna be so jank
                    replyJSON.forEach(reply => {
                        if (reply.path === '/') {
                            drives['C'] = reply;
                        }
                        if (reply.path === '/config') {
                            drives['F'] = reply
                        }
                        if (reply.path.startsWith('/downloads')) {
                            drives['D'] = reply
                        }
                        if (reply.path.startsWith('/data')) {
                            drives[reply.path.split('/')[2]] = reply
                        }
                    })

                    const reply: string[] = [];
                    let totalSpace = 0;
                    let totalUsed = 0;
                    Object.entries(drives)
                        .sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)
                        .forEach(([path, drive]) => {
                            totalSpace += drive.totalSpace;
                            totalUsed += drive.freeSpace;
                            reply.push(`
                            💽 <b>/mnt/${path}</b> • ${Math.round((drive.totalSpace - drive.freeSpace) * 10000 / drive.totalSpace) / 100}% used • ${formatBytes(drive.freeSpace)} free • ${formatBytes(drive.totalSpace)} total
                        `);
                        });
                    totalUsed = totalSpace - totalUsed;

                    // .map(responseLine => `
                    // 💽 <b>${responseLine.path}${responseLine.label}</b> • ${Math.round((responseLine.totalSpace - responseLine.freeSpace) * 10000 / responseLine.totalSpace) / 100}% used • ${formatBytes(responseLine.freeSpace)} free • ${formatBytes(responseLine.totalSpace)} total
                    // `);
                    // const totalSpace = (json as DiskSpace[]).reduce((total, disk) => total + disk.totalSpace, 0);
                    // const totalUsed = totalSpace - (json as DiskSpace[]).reduce((total, disk) => total + disk.freeSpace, 0);
                    reply.push(`
                        <b>TOTAL USED: ${formatBytes(totalUsed)}</b>
                      `);
                    reply.push(`<b>TOTAL SPACE: ${formatBytes(totalSpace)}</b>`);
                    ctx.replyWithHTML(reply.join('').replace(/ {2,}/g, ''))
                })
                .catch(err => ctx.reply(String(err)))
        })
        .catch(err => {
            console.error(err);
            ctx.reply('😮‍💨 SIGH. I can\'t get a hold of TimTV. Probably load shedding 🙄')
        })
}
