package main

import (
	"player/middlewares"
	"player/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.Use(middlewares.Cors())
	routes.Setup(r)
	r.Run(":8080")
}
