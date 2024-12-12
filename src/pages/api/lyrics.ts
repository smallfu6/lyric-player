// pages/api/lyrics.ts
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  try {
    // 读取 public 目录中的 lrc 文件
    const filePath = path.resolve('public', 'mrg.lrc');
    const lyricsData = fs.readFileSync(filePath, 'utf-8');
    
    // 解析歌词数据
    const lyrics = lyricsData
      .split('\n')
      .map((line) => {
        const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\](.*)/);
        if (match) {
          const minutes = parseInt(match[1], 10);
          const seconds = parseInt(match[2], 10);
          const milliseconds = parseInt(match[3], 10);
          const text = match[4].trim();
          const timeInSeconds = minutes * 60 + seconds + milliseconds / 100;

          return { time: timeInSeconds, text };
        }
        return null;
      })
      .filter(Boolean);

    res.status(200).json(lyrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read the lyrics file' });
  }
}
