import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './LyricsManage.module.css';
import { ParsedLyric } from '../utils/types';
import { parseLRC } from '../utils/lrcParser';
import { getLyric, setLyric } from '../pages/api/lyrics'; 

export default function LyricsManage() {
  const [lyrics, setLyrics] = useState<ParsedLyric[]>([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isProgressBarDragging, setIsProgressBarDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLyrics, setHasLyrics] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const lineHeight = 60;

  const fetchLyricData = useCallback(async () => {
    try {
      const response = await getLyric();
      if (response.success) {
        const lyricData = response.data;
        const parsedLyrics = parseLRC(lyricData.lyric);
        if (parsedLyrics.length > 0) {
          setLyrics(parsedLyrics);
          setPlaybackSpeed(lyricData.speed);
          if (!isDragging && !isProgressBarDragging) {
            setCurrentProgress(lyricData.progress);
          }
          setTotalDuration(lyricData.duration);
          setHasLyrics(true);
          setError(null);
        } else {
          setHasLyrics(false);
          setError('No lyrics available');
        }
      } else {
        setHasLyrics(false);
        setError('Failed to fetch lyric data');
      }
    } catch (error) {
      console.error('Error fetching lyric data:', error);
      setHasLyrics(false);
      setError('An error occurred while fetching lyric data');
    } finally {
      setIsLoading(false);
    }
  }, [isDragging, isProgressBarDragging]);

  useEffect(() => {
    fetchLyricData();
    const intervalId = setInterval(fetchLyricData, 1000);

    return () => clearInterval(intervalId);
  }, [fetchLyricData]);

  useEffect(() => {
    if (lyrics.length === 0) return;
    const newIndex = lyrics.findIndex(lyric => lyric.time > currentProgress) - 1;
    setCurrentLyricIndex(Math.max(0, newIndex));
  }, [currentProgress, lyrics]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const container = containerRef.current;
    if (!container) return;

    const containerHeight = container.clientHeight;
    const touchY = touch.clientY - container.getBoundingClientRect().top;
    const centerY = containerHeight / 2;
    const newOffset = touchY - centerY;

    setDragOffset(newOffset);

    const newIndex = Math.max(0, Math.min(Math.round(currentLyricIndex - newOffset / lineHeight), lyrics.length - 1));
    setCurrentLyricIndex(newIndex);

    if (lyrics[newIndex]) {
      setCurrentProgress(lyrics[newIndex].time);
    }
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setLyric({
        songId: 1,
        progress: currentProgress,
        speed: playbackSpeed,
        isPlaying: 1
      });
    }
    setIsDragging(false);
    setDragOffset(0);
  };

  const updateProgressFromEvent = (clientX: number) => {
    const progressBar = progressBarRef.current;
    if (!progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    const newProgress = percentage * totalDuration;

    setCurrentProgress(newProgress);
  };

  const handleProgressBarTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsProgressBarDragging(true);
    updateProgressFromEvent(e.touches[0].clientX);
  };

  const handleProgressBarTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isProgressBarDragging) return;
    e.preventDefault();
    updateProgressFromEvent(e.touches[0].clientX);
  };

  const handleProgressBarTouchEnd = () => {
    if (isProgressBarDragging) {
      setLyric({
        songId: 1,
        progress: currentProgress,
        speed: playbackSpeed,
        isPlaying: 1
      });
    }
    setIsProgressBarDragging(false);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <div className={styles.loadingMessage}>加载中...</div>;
  }

  if (!hasLyrics || error) {
    return <div className={styles.errorMessage}>无歌曲播放</div>;
  }

  return (
    <div className={styles.mainContainer}>
      <div 
        className={styles.container} 
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={styles.lyricsWrapper}>
          <AnimatePresence initial={false}>
            {lyrics.map((lyric, index) => (
              <motion.div
                key={lyric.time}
                className={`${styles.lyricLine} ${index === currentLyricIndex ? styles.currentLyric : styles.otherLyric}`}
                initial={{ opacity: 0, y: lineHeight }}
                animate={{
                  opacity: Math.abs(index - currentLyricIndex) < 3 ? 1 : 0.3,
                  y: (index - currentLyricIndex) * lineHeight - dragOffset,
                }}
                exit={{ opacity: 0, y: -lineHeight }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {lyric.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      <div className={styles.progressBarContainer}>
        <div className={styles.timeDisplay}>{formatTime(currentProgress)}</div>
        <div 
          className={styles.progressBarWrapper}
          ref={progressBarRef}
          onTouchStart={handleProgressBarTouchStart}
          onTouchMove={handleProgressBarTouchMove}
          onTouchEnd={handleProgressBarTouchEnd}
        >
          <div 
            className={styles.progressBar}
            style={{ width: `${(currentProgress / totalDuration) * 100}%` }}
          />
          <div 
            className={styles.progressBarHandle}
            style={{ left: `${(currentProgress / totalDuration) * 100}%` }}
          />
        </div>
        <div className={styles.timeDisplay}>{formatTime(totalDuration)}</div>
      </div>
    </div>
  );
}

