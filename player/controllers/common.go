package controllers

type CreateSongRequest struct {
	Name     string  `json:"name" binding:"required"`
	Lyrics   string  `json:"lyrics" binding:"required"`
	Duration float64 `json:"duration" binding:"required"`
}

type SetLyricRequest struct {
	Name      string  `json:"name"`
	SongId    uint    `json:"song_id" binding:"required"`
	Lyric     string  `json:"lyric"`
	Duration  float64 `json:"duration"`
	Progress  float64 `json:"progress"`
	Speed     uint    `json:"speed"`
	IsPlaying uint    `json:"is_playing"` // 0: 暂停 1: 在播放
}
