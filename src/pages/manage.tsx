import React, { useState, useEffect } from 'react';
import { Select, message, Button } from 'antd';
import { getSongs, setLyric } from './api/lyrics';
import styles from '../styles/Manage.module.css';
import LyricsManage from '@/components/LyricsManage';

const Manage = () => {
  const [songs, setSongs] = useState<any[]>([]); // 存储歌曲列表
  const [searchLyric, setSearchLyric] = useState(''); // 当前搜索的歌词
  const [songId, setSongId] = useState(0); // 当前选中的歌曲 ID
  const [songName, setSongName] = useState(''); // 当前选中的歌曲名称

  // 获取歌曲列表
  const fetchSongs = async () => {
    const response = await getSongs(searchLyric); // 调用 API 获取歌曲列表
    if (response.success) {
      setSongs(response.data); // 设置获取到的歌曲数据
    } else {
      message.error("获取歌曲列表失败");
    }
  };

  // 每次搜索框变化时调用 API 获取数据
  const handleSearch = (value: string) => {
    setSearchLyric(value);
  };

  // 选择歌曲
  const handleSelectChange = (value: number) => {
    const selectedSong = songs.find((song) => song.ID === value);
    setSongId(value);
    setSongName(selectedSong ? selectedSong.name : '');
  };

  // 点歌功能
  const handleOrderSong = async () => {
    if (songId === 0) {
      message.warning("请先选择一首歌曲");
      return;
    }
    const response = await setLyric({
      songId: songId,
      progress: 1,
      speed: 1,
      isPlaying: 1, // 默认点歌即开始播放
    });
    if (response.success) {
      message.success(`成功点歌：${songName}`);
    } else {
      message.error(response.message || "点歌失败");
    }
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
          onClick={handleOrderSong}
          className={styles.playerBtn}
          disabled={songId === 0}
        >
          点歌
        </Button>
      </div>
      <div className={styles.playerContainer}>
        <LyricsManage />
      </div>
    </div>
  );
};

export default Manage;
