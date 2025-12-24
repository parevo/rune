package database

import (
	"database/sql"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/xuri/excelize/v2"
)

// ExportTable exports the entire table to the specified file format
func (m *Manager) ExportTable(dbName, tableName, format, outputPath string) error {
	db := m.getDB()
	if db == nil {
		return fmt.Errorf("not connected to database")
	}

	// 1. Get Columns to ensure order and headers
	columns, err := m.GetColumns(dbName, tableName)
	if err != nil {
		return fmt.Errorf("failed to get columns: %w", err)
	}

	colNames := make([]string, len(columns))
	for i, col := range columns {
		colNames[i] = col.Name
	}

	// 2. Query All Data (No Pagination)
	// We construct a simple SELECT * query using the driver's quoting
	quotedDb := m.driver.QuoteIdentifier(dbName)
	quotedTable := m.driver.QuoteIdentifier(tableName)

	// Postgres uses "db"."schema"."table" or just "schema"."table" but our abstraction
	// often treats dbName/Schema loosely.
	// For simpler logic, we rely on the fact that existing drivers use:
	// MySQL: `db`.`table`
	// Postgres: "schema"."table" (where dbName param is usually schema)

	// We'll trust the driver to quote correctly if we use individual calls,
	// but we need to join them.
	// Actually, let's look at how BuildTableDataQuery does it.
	// MySQL: fmt.Sprintf("SELECT * FROM `%s`.`%s` ...", req.Database, req.Table, ...)

	// We will try to rely on a generic query.
	query := fmt.Sprintf("SELECT * FROM %s.%s", quotedDb, quotedTable)

	rows, err := db.Query(query)
	if err != nil {
		return fmt.Errorf("query failed: %w", err)
	}
	defer rows.Close()

	// 3. Process Rows based on format
	switch format {
	case "csv":
		return m.exportCSV(rows, colNames, outputPath)
	case "json":
		return m.exportJSON(rows, colNames, outputPath)
	case "xlsx":
		return m.exportXLSX(rows, colNames, outputPath)
	default:
		return fmt.Errorf("unsupported format: %s", format)
	}
}

func (m *Manager) exportCSV(rows *sql.Rows, columns []string, outputPath string) error {
	file, err := os.Create(outputPath)
	if err != nil {
		return err
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	// Write Header
	if err := writer.Write(columns); err != nil {
		return err
	}

	// Write Rows
	values := make([]interface{}, len(columns))
	valuePtrs := make([]interface{}, len(columns))
	for i := range values {
		valuePtrs[i] = &values[i]
	}

	for rows.Next() {
		if err := rows.Scan(valuePtrs...); err != nil {
			return err
		}

		record := make([]string, len(columns))
		for i, val := range values {
			record[i] = formatValue(val)
		}

		if err := writer.Write(record); err != nil {
			return err
		}
	}

	return rows.Err()
}

func (m *Manager) exportJSON(rows *sql.Rows, columns []string, outputPath string) error {
	file, err := os.Create(outputPath)
	if err != nil {
		return err
	}
	defer file.Close()

	// We stream a JSON array: [ ...objects... ]
	if _, err := file.WriteString("[\n"); err != nil {
		return err
	}

	first := true
	values := make([]interface{}, len(columns))
	valuePtrs := make([]interface{}, len(columns))
	for i := range values {
		valuePtrs[i] = &values[i]
	}

	enc := json.NewEncoder(file)
	enc.SetIndent("  ", "  ") // Indent content inside the array items if desired, or we can just write objects

	for rows.Next() {
		if err := rows.Scan(valuePtrs...); err != nil {
			return err
		}

		if !first {
			if _, err := file.WriteString(",\n"); err != nil {
				return err
			}
		}
		first = false

		rowMap := make(map[string]interface{})
		for i, col := range columns {
			val := values[i]
			// Handle []byte as string for JSON
			if v, ok := val.([]byte); ok {
				rowMap[col] = string(v)
			} else {
				rowMap[col] = val
			}
		}

		if err := enc.Encode(rowMap); err != nil {
			return err
		}
	}

	if _, err := file.WriteString("\n]"); err != nil {
		return err
	}

	return rows.Err()
}

func (m *Manager) exportXLSX(rows *sql.Rows, columns []string, outputPath string) error {
	f := excelize.NewFile()
	defer func() {
		if err := f.Close(); err != nil {
			fmt.Println(err)
		}
	}()

	sheetName := "Sheet1"
	// Create a new sheet.
	index, err := f.NewSheet(sheetName)
	if err != nil {
		return err
	}
	f.SetActiveSheet(index)

	// Write Header
	for i, col := range columns {
		cell, _ := excelize.CoordinatesToCellName(i+1, 1)
		f.SetCellValue(sheetName, cell, col)
	}

	// Write Rows
	rowIdx := 2
	values := make([]interface{}, len(columns))
	valuePtrs := make([]interface{}, len(columns))
	for i := range values {
		valuePtrs[i] = &values[i]
	}

	for rows.Next() {
		if err := rows.Scan(valuePtrs...); err != nil {
			return err
		}

		for i, val := range values {
			cell, _ := excelize.CoordinatesToCellName(i+1, rowIdx)
			// Handle []byte
			if v, ok := val.([]byte); ok {
				f.SetCellValue(sheetName, cell, string(v))
			} else {
				f.SetCellValue(sheetName, cell, val)
			}
		}
		rowIdx++
	}

	if err := f.SaveAs(outputPath); err != nil {
		return err
	}

	return rows.Err()
}

func formatValue(val interface{}) string {
	if val == nil {
		return "NULL"
	}
	switch v := val.(type) {
	case []byte:
		return string(v)
	case time.Time:
		return v.Format("2006-01-02 15:04:05")
	default:
		return fmt.Sprintf("%v", v)
	}
}
