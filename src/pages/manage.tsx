import React, { useState, useEffect } from 'react';
import { Select, message, Button, Slider } from 'antd';
import { getSongs, setLyric } from './api/lyrics';
import styles from '../styles/Manage.module.css';
import { getLyric } from '../pages/api/lyrics';
import LyricsManage from '@/components/LyricsManage';

const Manage = () => {
  const [songs, setSongs] = useState<any[]>([]); // 存储歌曲列表
  const [searchLyric, setSearchLyric] = useState(''); // 当前搜索的歌词
  const [isPlaying, setIsPlaying] = useState(false); // 播放状态，初始为未播放
  const [progress, setProgress] = useState(1); // 歌曲当前播放进度
  const [duration, setDuration] = useState(45); // 歌曲总时长
  const [songId, setSongId] = useState(0);
  const [songName, setSongName] = useState('');
  const [speed, setSpeed] = useState(1);
  const [playStatus, setPlayStatus] = useState(0);

  // 获取歌曲列表
  const fetchSongs = async () => {
    const response = await getSongs(searchLyric); // 调用 API 获取歌曲列表
    if (response.success) {
      setSongs(response.data); // 设置获取到的歌曲数据
    }
  };

  // 每次搜索框变化时调用 API 获取数据
  const handleSearch = (value: string) => {
    setSearchLyric(value);
  };

  const handleSelectChange = (value: number) => {
    setSongId(value);
  };

  // 切换播放/暂停状态
  const handlePlayer = async () => {
    setIsPlaying((prev) => !prev); // 切换播放状态
    const response = await setLyric({
      songId: songId,
      progress: progress,
      speed: 1,
      isPlaying: isPlaying ? 0 : 1
    }); // 调用 API 获取歌曲数据
    if (response.success) {
      if (isPlaying) {
        message.warning("暂停");
      } else {
        message.success("开始播放");
      }
    } else {
      message.error(response.message); // 如果出错，显示错误信息
    }
  };

  // 更新进度
  const changeProgress = (value: number) => {
    setProgress(value); // 更新进度
  };

  // 触发确认按钮
  const handleConfirm = () => {
    fetchSongs();
  };

  // 设置定时器读取进度
  useEffect(() => {
    // 开始定时器
    const intervalId = setInterval(async () => {
      const songResponse = await getLyric();
      if (songResponse.success) {
        setSongId(songResponse.data.song_id);
        setSpeed(songResponse.data.speed);
        setSongName(songResponse.data.name);
        setPlayStatus(songResponse.data.is_playing);
        if (songResponse.data.is_playing === 0) {
          setIsPlaying(false);
        } else {
          setIsPlaying(true);
        }
  
        // 转换进度为数字类型，确保 Slider 正常工作
        const songProgress = Number(songResponse.data.progress); // 将 progress 转换为 number
        const songDuration = Number(songResponse.data.duration); // 将 duration 转换为 number
        setProgress(songProgress);
        setDuration(songDuration);
      } else {
        setIsPlaying(false);
        setProgress(1);
      }
    }, 1000); // 每秒获取一次进度

    // 清除定时器
    return () => clearInterval(intervalId);
  }, [isPlaying]); // 

  useEffect(() => {
    fetchSongs();
  }, [searchLyric]);

  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <Select
          style={{ width: '50%' }}
          showSearch
          placeholder="搜索歌曲"
          onSearch={handleSearch}
          onChange={handleSelectChange}
        >
          {songs.map((song) => (
            <Select.Option key={song.ID} value={song.ID}>
              {song.name}
            </Select.Option>
          ))}
        </Select>
        <Button
          type="primary"
          danger={isPlaying}
          onClick={handlePlayer}
          className={styles.playerBtn}
          disabled={songId === 0}
        >
          {isPlaying ? "暂停" : "播放"}  {/* 根据 isPlaying 来显示按钮文本 */}
        </Button>
        <Button type="primary" onClick={handleConfirm} className={styles.pngBtn}>
          轮播图
        </Button>
      </div>
      <div className={styles.playerContainer}>
        {songName &&
          <div className={styles.Title}>{songName}</div>
        }
        <LyricsManage getLyric={getLyric} />
      </div>
      <div>
        <Slider
          step={1}
          min={1}
          max={duration || 45}
          value={progress || 1}
          onChange={changeProgress}  // 拖动进度条时更新进度
        />
      </div>
    </div>
  );
};

export default Manage;
