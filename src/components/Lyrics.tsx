import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Lyrics.module.css';
import { ParsedLyric } from '../utils/types';
import { parseLRC } from '../utils/lrcParser';

export default function Lyrics({ getLyric }: { getLyric: () => Promise<any>; }) {
  const [lyrics, setLyrics] = useState<ParsedLyric[]>([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const fetchData = useCallback(async () => {
    try {
      const response = await getLyric();
      if (!response.success) return;
      const parsedLyrics = parseLRC(response.data.lyric);
      setLyrics(parsedLyrics);
      setPlaybackSpeed(response.data.speed);
      setCurrentProgress(response.data.progress);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching lyrics:', error);
    }
  }, [getLyric]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const animate = useCallback((time: number) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;
      setCurrentProgress((prevProgress) => {
        const newProgress = prevProgress + (deltaTime / 1000) * playbackSpeed;
        const nextLyricIndex = lyrics.findIndex(lyric => lyric.time > newProgress);
        
        if (nextLyricIndex !== -1 && nextLyricIndex - 1 !== currentLyricIndex) {
          setCurrentLyricIndex(nextLyricIndex - 1);
        }

        return newProgress;
      });
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [lyrics, playbackSpeed, currentLyricIndex]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate]);

  const lineSpacing = 160;
  const visibleLines = 5;


  return (
    <div className={styles.container}>
      <div className={styles.lyricsWrapper}>
        <AnimatePresence initial={false}>
          {lyrics.slice(Math.max(0, currentLyricIndex - 2), currentLyricIndex + visibleLines - 2).map((lyric, index) => {
            const actualIndex = index + Math.max(0, currentLyricIndex - 2);
            return (
              <motion.div
                key={lyric.time}
                className={`${styles.lyricLine} ${actualIndex === currentLyricIndex ? styles.currentLyric : styles.otherLyric}`}
                initial={{ opacity: 0, y: lineSpacing * 2 }}
                animate={{
                  opacity: actualIndex === currentLyricIndex ? 1 : 0.7,
                  y: (actualIndex - currentLyricIndex) * lineSpacing,
                  scale: actualIndex === currentLyricIndex ? 1.1 : 1,
                }}
                exit={{ opacity: 0, y: -lineSpacing * 2, transition: { duration: 0.3 } }}
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

