package config

import (
	"time"

	"github.com/patrickmn/go-cache"
)

var Cache *cache.Cache

func SetupCache() {
	c := cache.New(0, 10*time.Minute)
	Cache = c
}
