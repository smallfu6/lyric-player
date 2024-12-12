import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Lyrics.module.css';

const lyrics = [
  "你看那春日的蝴蝶",
  "翩翩起舞在花间",
  "让我们沉醉在这美好时光",
  "感受春天的温暖",
  "微风轻抚过脸庞",
  "带来花香四溢",
  "阳光温柔地洒落",
  "照亮每个角落",
  "小鸟在枝头歌唱",
  "传递着欢乐音符",
  "溪水潺潺流淌",
  "诉说着春天的故事",
  "绿意盎然的草地",
  "邀请我们漫步其中",
  "让心灵找到栖息",
  "在这美好的季节"
];

export default function LyricsDisplay() {
  const [currentLyric, setCurrentLyric] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLyric((prev) => (prev + 1) % lyrics.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // 获取歌词的索引（前3行、当前行、后3行）
  const getLyricAt = (index) => lyrics[(currentLyric + index + lyrics.length) % lyrics.length];

  return (
    <div className={styles.lyricsContainer}>
      <div className={styles.lyricsSection}>
        {/* 上面 3 行歌词 */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            className={`${styles.lyric} ${styles.previousLyric}`}
            key={`previous-${i}`}
            initial={{ opacity: 0, y: 20}}
            animate={{ opacity: 0.5, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ top: `${(i + 1) * 15}%` }} 
          >
            {getLyricAt(i - 3)}
          </motion.div>
        ))}

        {/* 当前歌词（中间） */}
        <AnimatePresence mode="wait">
          <motion.div
            className={`${styles.lyric} ${styles.currentLyric}`}
            key={currentLyric}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              x: 50,
              y: -50,
              transition: { duration: 0.5 }
            }}
          >
            <h1 className={styles.currentLyricText}>{getLyricAt(0)}</h1>
          </motion.div>
        </AnimatePresence>

        {/* 下面 3 行歌词 */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            className={`${styles.lyric} ${styles.nextLyric}`}
            key={`next-${i}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.5, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ top: `${(i + 4) *15}%` }} 

          >
            {getLyricAt(i + 1)}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
