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
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 动态获取当前、上一行、下一行歌词
  const getPreviousLyric = () => lyrics[(currentLyric - 1 + lyrics.length) % lyrics.length];
  const getNextLyric = () => lyrics[(currentLyric + 1) % lyrics.length];

  return (
    <div className={styles.lyricsContainer}>
      {/* 左侧圆形装饰 */}
      <div className={styles.leftCircle}>
        <div className={styles.leftCircleInner}></div>
      </div>

      {/* 歌词区域 */}
      <div className={styles.lyricsSection}>
        {/* 当前歌词 */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentLyric}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              x: 50, // 向右移动
              y: -50, // 向上移动
              transition: { duration: 0.5 }
            }}
            className={styles.currentLyric}
          >
            <h1 className={styles.currentLyricText}>{lyrics[currentLyric]}</h1>
          </motion.div>
        </AnimatePresence>

        {/* 下一行歌词 */}
        <motion.div
          className={styles.nextLyric}
          key={`next-${currentLyric}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {getNextLyric()}
        </motion.div>
      </div>

      {/* 右侧圆形装饰 */}
      <div className={styles.rightCircle}>
        <motion.div
          className={styles.previousLyric}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          key={`prev-${currentLyric}`}
        >
          {getPreviousLyric()}
        </motion.div>
        <div className={styles.rightCircleInner}></div>
      </div>
    </div>
  );
}
