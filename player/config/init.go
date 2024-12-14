package config

func init() {
	LoadEnv()
	ConnectDB()
	SetupCache()
	// TODO: log
}
