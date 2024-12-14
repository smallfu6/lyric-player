package routes

import (
	"player/controllers"

	"github.com/gin-gonic/gin"
)

func Setup(r *gin.Engine) {
	r.POST("/songs", controllers.CreateSong)
	r.GET("/songs", controllers.SearchSong)
	r.POST("/lyric", controllers.SetLyric)
	r.GET("/lyric", controllers.GetLyric)
}
