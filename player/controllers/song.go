package controllers

import (
	"context"
	"math"
	"net/http"
	"player/config"
	"player/models"
	"player/utils"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/patrickmn/go-cache"
)

var cace = config.Cache
var cancelFunc context.CancelFunc // 全局取消函数，用于停止进度更新

// 获取所有歌曲
func GetAllSongs(c *gin.Context) {
	// 从请求的查询参数中获取筛选条件
	lyric := c.DefaultQuery("lyric", "")

	songs, err := models.SearchSong(lyric)
	if err != nil {
		// 查询失败，返回500错误
		utils.ErrorResponse(c, http.StatusInternalServerError, "search error", nil)
		return
	}

	// 返回查询结果
	utils.SuccessResponse(c, http.StatusOK, "success", songs)

}

// 创建新歌曲
func CreateSong(c *gin.Context) {
	var req CreateSongRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	var song models.Song
	song.Name = req.Name
	song.Lyrics = req.Lyrics
	song.Duration = req.Duration

	s, err := models.CreateSong(&song)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	// 返回查询结果
	utils.SuccessResponse(c, http.StatusOK, "success", s)
}

// 根据歌词搜索歌曲
func SearchSong(c *gin.Context) {
	lyric := c.DefaultQuery("lyric", "")

	songs, err := models.SearchSong(lyric)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, err.Error(), nil)
		return
	}

	utils.SuccessResponse(c, http.StatusOK, "success", songs)
}

func SetLyric(c *gin.Context) {
	var req SetLyricRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "search error", nil)
		return
	}

	// 从缓存获取当前播放的歌曲
	cachedSong, found := cace.Get("song")
	if found {
		currentSong := cachedSong.(SetLyricRequest)
		// 如果切换新歌
		if currentSong.SongId != req.SongId {
			// 清理当前 goroutine
			if cancelFunc != nil {
				cancelFunc()
				cancelFunc = nil
			}
			// 清理缓存
			cace.Delete("song")
		}
	}

	// 从数据库获取歌曲信息
	song, err := models.GetSongById(req.SongId)
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, err.Error(), nil)
		return
	}

	// 更新请求中的歌曲信息
	req.Lyric = song.Lyrics
	req.Duration = song.Duration
	req.Name = song.Name

	// 判断播放状态
	switch req.IsPlaying {
	case 1: // 恢复播放
		// 停止之前的 goroutine
		if cancelFunc != nil {
			cancelFunc()
		}

		// 启动新的 goroutine
		ctx, cancel := context.WithCancel(context.Background())
		cancelFunc = cancel
		go updateProgress(ctx, &req)

	case 0: // 暂停
		if cancelFunc != nil {
			cancelFunc()
		}

	case 2: // 停止播放
		if cancelFunc != nil {
			cancelFunc()
			cancelFunc = nil // 清理取消函数
		}
		cace.Delete("song") // 清理缓存
	}

	// 将当前歌曲状态存入缓存
	cace.Set("song", req, cache.NoExpiration)

	// 返回查询结果
	utils.SuccessResponse(c, http.StatusOK, "success", req)
}

// 定时更新 progress
func updateProgress(ctx context.Context, req *SetLyricRequest) {
	spread := 0.1
	ticker := time.NewTicker(100 * time.Millisecond)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			// 收到取消信号，退出 goroutine
			return
		case <-ticker.C:
			if req.IsPlaying == 0 {
				// 暂停，停止进度更新
				continue
			}

			// 更新进度
			currentProgress := req.Progress
			newProgress := currentProgress + spread*float64(req.Speed)
			req.Progress = math.Round(newProgress*100) / 100

			// 将更新后的 req 存储到缓存
			cace.Set("song", *req, 0)

			// 检查是否播放完毕
			if req.Progress >= req.Duration {
				req.IsPlaying = 2 // 播放完毕
				req.Progress = 1
				req.Speed = 1
				cace.Set("song", *req, 0)
				// cace.Delete("song") // 清理缓存
				return
			}
		}
	}
}

func GetLyric(c *gin.Context) {
	// 获取结构体数据
	song, exist := cace.Get("song")
	if !exist {
		// 类型断言，将接口类型转换为 User 类型
		utils.ErrorResponse(c, http.StatusBadRequest, "没有歌曲在播放！", nil)
		return
	}
	utils.SuccessResponse(c, http.StatusOK, "success", song)
}
