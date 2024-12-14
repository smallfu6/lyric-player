import { ParsedLyric } from './types';

export function parseLRC(lrc: string): ParsedLyric[] {
  const lines = lrc.split('\n');
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
  
  return lines.map(line => {
      const match = timeRegex.exec(line);
      if (!match) return null;
      
      const [, minutes, seconds, milliseconds] = match;
      const time = parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / 1000;
      const text = line.replace(timeRegex, '').trim();
      
      return { time, text };
    })
    .filter((lyric): lyric is ParsedLyric => lyric !== null)
    .sort((a, b) => a.time - b.time);
}

