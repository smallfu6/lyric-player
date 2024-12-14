package models

import (
	"gorm.io/gorm"
)

type Song struct {
	gorm.Model
	Name     string  `json:"name"`
	Lyrics   string  `json:"lyrics"`
	Duration float64 `json:"duration"`
}

func GetAllSongs() ([]Song, error) {
	var songs []Song
	result := db.Find(&songs)
	return songs, result.Error
}

func GetSongById(id uint) (*Song, error) {
	var song Song
	if err := db.First(&song, id).Error; err != nil {
		return &song, err
	}
	return &song, nil
}

func CreateSong(song *Song) (*Song, error) {
	result := db.Create(&song)
	return song, result.Error
}

func SearchSong(lyric string) ([]Song, error) {
	var songs []Song
	query := db
	if lyric != "" {
		query = query.Where("name LIKE ? AND lyrics LIKE ?", lyric, lyric)
	}

	result := query.Find(&songs)
	return songs, result.Error
}
