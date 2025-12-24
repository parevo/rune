package main

func (a *App) GetDatabaseSchema(dbName string) (map[string][]string, error) {
	return a.db.GetDatabaseSchema(dbName)
}
