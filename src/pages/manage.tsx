import React, { useState, useEffect } from 'react';
import { Select, message, Button } from 'antd';
import { getSongs, setLyric } from './api/lyrics';
import styles from '../styles/Manage.module.css';
import LyricsManage from '@/components/LyricsManage';

const Manage = () => {
  const [songs, setSongs] = useState<any[]>([]); // 存储歌曲列表
  const [searchLyric, setSearchLyric] = useState(''); // 当前搜索的歌词
  const [isPlaying, setIsPlaying] = useState(false); // 播放状态，初始为未播放
  const [songId, setSongId] = useState(0);
  const [songName, setSongName] = useState('');
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
      progress: 1,
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

  // 触发确认按钮
  const handleConfirm = () => {
    fetchSongs();
  };


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
        <LyricsManage />
      </div>
    </div>
  );
};

export default Manage;
