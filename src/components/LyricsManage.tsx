import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './LyricsManage.module.css';
import { ParsedLyric } from '../utils/types';
import { parseLRC } from '../utils/lrcParser';


export default function LyricsManage({ getLyric }:{ getLyric: () => Promise<any>;}) {
  const [lyrics, setLyrics] = useState<ParsedLyric[]>([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentProgress, setCurrentProgress] = useState(0);

  // 请求歌词数据
  useEffect(() => {
    const fetchData = async () => {
      const response = await getLyric();
      if (!response.success) return;
      const parsedLyrics = parseLRC(response.data.lyric);
      setLyrics(parsedLyrics);
      setPlaybackSpeed(response.data.speed);
      setCurrentProgress(response.data.progress); // 使用后端的进度
    };

    // 初次加载时请求一次数据
    fetchData();

    // 每 1 秒请求一次数据，获取最新的进度
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval); // 清理定时器
  }, [getLyric]); // 当 getLyric 改变时重新执行

  // 每次歌词数据或播放进度发生变化时更新当前歌词
  useEffect(() => {
    if (lyrics.length === 0) return;

    const interval = setInterval(() => {
      // 每 100 毫秒更新一次进度条和歌词
      setCurrentProgress((prev) => {
        const newProgress = prev + 0.1 * playbackSpeed;
        // 根据当前进度计算歌词索引
        const nextLyricIndex = lyrics.findIndex(lyric => lyric.time > newProgress);
        
        if (nextLyricIndex !== -1) {
          setCurrentLyricIndex(nextLyricIndex - 1); // 设置当前歌词的索引
        }

        return newProgress;
      });
    }, 100); // 每 100 毫秒更新一次进度条
    return () => clearInterval(interval); // 清理定时器
  }, [lyrics, playbackSpeed]); // 当歌词数据或播放速度变化时重新执行

  const lineSpacing = 50; // 行间距

  return (
    <div className={styles.container}>
      <div className={styles.lyricsWrapper}>
        <AnimatePresence initial={false}>
          {/* 显示当前和前后几行歌词 */}
          {lyrics.slice(currentLyricIndex, currentLyricIndex + 5).map((lyric, index) => {
            return (
              <motion.div
                key={lyric.time}
                className={`${styles.lyricLine} ${index === 2 ? styles.currentLyric : styles.otherLyric}`}
                initial={index === 4 ? { opacity: 0, y: lineSpacing * 3 } : { opacity: 0, y: lineSpacing }}
                animate={{
                  opacity: index === 0 ? 0 : index === 2 ? 1 : 0.7,
                  y: `${(index - 2) * lineSpacing}px`, // 根据当前索引调整歌词的位置
                  scale: index === 2 ? 1.1 : 1, // 当前歌词放大一点
                }}
                exit={index === 0 ?
                  { opacity: 0, y: -lineSpacing, transition: { duration: 0.5 } } :
                  { opacity: 0, y: -lineSpacing }
                }
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {lyric.text}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
