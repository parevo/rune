package database

import (
	"fmt"
)

func (m *Manager) GetDatabaseSchema(database string) (map[string][]string, error) {
	db := m.getDB()
	if db == nil {
		return nil, fmt.Errorf("not connected to database")
	}

	// Helper to check what driver we are using to execute correct query
	// Ideally this should be part of Driver interface, but for quick implementation we check type
	// or perform a generic query if possible.
	// MySQL and Postgres both support information_schema.columns.

	query := `
		SELECT table_name, column_name 
		FROM information_schema.columns 
		WHERE table_schema = ? 
		ORDER BY table_name, ordinal_position
	`
	// Postgres uses $1, Mysql uses ?
	// Also Postgres requires table_schema to be the schema name (public usually) not database name
	// unless we mean database catalog.
	// For simple MySQL support first (as per context mostly favoring MySQL or generic):

	// Let's defer to driver implementation if possible, or implement a naive loop if not.
	// A naive loop reusing GetTables and GetColumns is safer for compatibility but slower.
	// Given the user wants DataGrip like storage, let's try the efficient way but valid for MySQL.

	// Check if MySQL
	if _, ok := m.driver.(*MySQLDriver); ok {
		rows, err := db.Query(query, database)
		if err != nil {
			return nil, err
		}
		defer rows.Close()

		schema := make(map[string][]string)
		for rows.Next() {
			var table, col string
			if err := rows.Scan(&table, &col); err != nil {
				continue
			}
			schema[table] = append(schema[table], col)
		}
		return schema, nil
	}

	// Fallback for others (Postgres) or if we want to be safe
	tables, err := m.GetTables(database)
	if err != nil {
		return nil, err
	}

	schema := make(map[string][]string)
	// This might be slow for many tables, but reliable
	for _, table := range tables {
		cols, err := m.GetColumns(database, table.Name)
		if err != nil {
			continue
		}
		var colNames []string
		for _, c := range cols {
			colNames = append(colNames, c.Name)
		}
		schema[table.Name] = colNames
	}

	return schema, nil
}
