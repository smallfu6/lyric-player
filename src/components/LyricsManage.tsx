import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Select } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StopOutlined } from '@ant-design/icons';
import styles from './LyricsManage.module.css';
import { ParsedLyric } from '../utils/types';
import { parseLRC } from '../utils/lrcParser';
import { getLyric, setLyric } from '../pages/api/lyrics';

const { Option } = Select;

export default function LyricsManage() {
  const [lyrics, setLyrics] = useState<ParsedLyric[]>([]);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentSongId, setCurrentSongId] = useState(0);
  const [songName, setSongName] = useState('');
  const [totalDuration, setTotalDuration] = useState(0);
  const [isProgressBarDragging, setIsProgressBarDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLyrics, setHasLyrics] = useState(false);
  const [isDraggingStarted, setIsDraggingStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

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
          if (!isProgressBarDragging) {
            setCurrentProgress(lyricData.progress);
          }
          setTotalDuration(lyricData.duration);
          setCurrentSongId(lyricData.song_id);
          setSongName(lyricData.name);
          setHasLyrics(true);
          setError(null);
          setIsPlaying(lyricData.is_playing === 1);
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
  }, [isProgressBarDragging]);

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
    setIsDraggingStarted(false);
    updateProgressFromEvent(e.touches[0].clientX);
  };

  const handleProgressBarTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isProgressBarDragging) return;
    e.preventDefault();
    setIsDraggingStarted(true);
    updateProgressFromEvent(e.touches[0].clientX);
  };

  const handleProgressBarTouchEnd = () => {
    if (isProgressBarDragging && isDraggingStarted) {
      setLyric({
        songId: currentSongId,
        progress: currentProgress,
        speed: playbackSpeed,
        isPlaying: isPlaying ? 1 : 0
      });
    }
    setIsProgressBarDragging(false);
    setIsDraggingStarted(false);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => {
    setIsPlaying(true);
    setLyric({
      songId: currentSongId,
      progress: currentProgress,
      speed: playbackSpeed,
      isPlaying: 1
    });
  };

  const handlePause = () => {
    setIsPlaying(false);
    setLyric({
      songId: currentSongId,
      progress: currentProgress,
      speed: playbackSpeed,
      isPlaying: 0
    });
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentProgress(0);
    setLyric({
      songId: currentSongId,
      progress: 1,
      speed: 1,
      isPlaying: 2  
    });
  };

  const handleSpeedChange = (value: number) => {
    setPlaybackSpeed(value);
    setLyric({
      songId: currentSongId,
      progress: currentProgress,
      speed: value,
      isPlaying: isPlaying ? 1 : 0
    });
  };

  if (isLoading) {
    return <div className={styles.loadingMessage}>加载中...</div>;
  }

  if (!hasLyrics || error) {
    return <div className={styles.errorMessage}>无歌曲播放</div>;
  }

  return (
    <div className={styles.mainContainer}>
      {songName && <div className={styles.title}>{songName}</div>}
      <div className={styles.container} ref={containerRef}>
        <div className={styles.lyricsWrapper}>
          <AnimatePresence initial={false}>
            {lyrics.map((lyric, index) => (
              <motion.div
                key={lyric.time}
                className={`${styles.lyricLine} ${index === currentLyricIndex ? styles.currentLyric : styles.otherLyric}`}
                initial={{ opacity: 0, y: lineHeight }}
                animate={{
                  opacity: Math.abs(index - currentLyricIndex) < 3 ? 1 : 0.3,
                  y: (index - currentLyricIndex) * lineHeight,
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
      <div className={styles.controlsContainer}>
        <Button 
          icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />} 
          onClick={isPlaying ? handlePause : handlePlay}
        />
        <Button icon={<StopOutlined />} onClick={handleStop} />
        <Select 
          defaultValue={1} 
          style={{ width: 120 }} 
          onChange={handleSpeedChange}
          value={playbackSpeed}
        >
          <Option value={0.5}>0.5x</Option>
          <Option value={0.75}>0.75x</Option>
          <Option value={1}>1x</Option>
          <Option value={1.25}>1.25x</Option>
          <Option value={1.5}>1.5x</Option>
          <Option value={2}>2x</Option>
        </Select>
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

