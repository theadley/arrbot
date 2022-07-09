import fetch from 'node-fetch';
import { DiskSpace } from '../models/diskspace.js';

const controller = new AbortController()
const signal = controller.signal
setTimeout(() => { 
  controller.abort()
}, 3000)

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
}

//@ts-ignore
export const diskspace = async (ctx, URL_SONARR: string, API_KEY_SONARR: string) => {
  await fetch(`${URL_SONARR}/api/diskspace?apikey=${API_KEY_SONARR}`)
    .then(res => {
      res.json()
        .then(json => {
          const reply = (json as DiskSpace[])
          .sort((a,b) => a.path < b.path ? -1: a.path > b.path ? 1 : 0)
          .map(responseLine => `
          💽 <b>${responseLine.path}${responseLine.label}</b> • ${Math.round((responseLine.totalSpace - responseLine.freeSpace) * 10000 / responseLine.totalSpace) / 100}% used • ${formatBytes(responseLine.freeSpace)} free • ${formatBytes(responseLine.totalSpace)} total
          `);
          const totalSpace = (json as DiskSpace[]).reduce((total, disk) => total + disk.totalSpace, 0);
          const totalUsed = totalSpace - (json as DiskSpace[]).reduce((total, disk) => total + disk.freeSpace, 0);
          reply.push(`
            <b>TOTAL USED: ${formatBytes(totalUsed)}</b>
          `);
          reply.push(`<b>TOTAL SPACE: ${formatBytes(totalSpace)}</b>`);
          ctx.replyWithHTML(reply.join('').replace(/ {2,}/g, ''))
        })
        .catch(err => ctx.reply(String(err)))
    })
    .catch(err => ctx.reply('😮‍💨 SIGH. I can\'t get a hold of TimTV. Probably load shedding 🙄'))
}