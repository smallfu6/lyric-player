package models

import "player/config"

var db = config.DB

func init() {
	db.AutoMigrate(&Song{})
}
