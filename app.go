package main

import (
	"context"

	"opendb/database"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var AppVersion = "v0.0.0-dev"

// App struct
type App struct {
	ctx     context.Context
	db      *database.Manager
	storage *database.Storage
	updater *database.Updater
}

// NewApp creates a new App application struct
func NewApp() *App {
	storage, _ := database.NewStorage()
	return &App{
		db:      database.NewManager(),
		storage: storage,
		updater: database.NewUpdater(),
	}
}

// startup is called when the app starts
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.updater.SetContext(ctx)
}

// shutdown is called when the app quits
func (a *App) shutdown(ctx context.Context) {
	a.db.Disconnect()
}

// ====================
// Connection Methods
// ====================

// Connect establishes a connection to MySQL
func (a *App) Connect(config database.ConnectionConfig) error {
	return a.db.Connect(config)
}

// Disconnect closes the database connection
func (a *App) Disconnect() error {
	return a.db.Disconnect()
}

// TestConnection tests if a connection can be established
func (a *App) TestConnection(config database.ConnectionConfig) (bool, error) {
	return a.db.TestConnection(config)
}

// IsConnected returns whether we're connected to a database
func (a *App) IsConnected() bool {
	return a.db.IsConnected()
}

// ====================
// Query Methods
// ====================

// ExecuteQuery runs a SELECT query and returns results
func (a *App) ExecuteQuery(query string) (*database.QueryResult, error) {
	return a.db.ExecuteQuery(query)
}

// ExecuteStatement runs an INSERT/UPDATE/DELETE statement
func (a *App) ExecuteStatement(query string) (*database.ExecuteResult, error) {
	return a.db.ExecuteStatement(query)
}

// ====================
// Schema Methods
// ====================

// GetDatabases returns list of all databases
func (a *App) GetDatabases() ([]database.DatabaseInfo, error) {
	return a.db.GetDatabases()
}

// GetTables returns list of tables in a database
func (a *App) GetTables(dbName string) ([]database.TableInfo, error) {
	return a.db.GetTables(dbName)
}

// GetColumns returns list of columns in a table
func (a *App) GetColumns(dbName, table string) ([]database.ColumnInfo, error) {
	return a.db.GetColumns(dbName, table)
}

// GetTableInfo returns detailed information about a table
func (a *App) GetTableInfo(dbName, table string) (*database.TableDetails, error) {
	return a.db.GetTableInfo(dbName, table)
}

// UseDatabase switches to a specific database
func (a *App) UseDatabase(dbName string) error {
	return a.db.UseDatabase(dbName)
}

// ====================
// Storage Methods
// ====================

// SaveConnection saves a connection with a name
func (a *App) SaveConnection(name string, config database.ConnectionConfig) error {
	return a.storage.SaveConnection(name, config)
}

// LoadConnections loads all saved connections
func (a *App) LoadConnections() ([]database.SavedConnection, error) {
	return a.storage.LoadConnections()
}

// DeleteConnection removes a saved connection
func (a *App) DeleteConnection(name string) error {
	return a.storage.DeleteConnection(name)
}

// RenameConnection renames a saved connection
func (a *App) RenameConnection(oldName, newName string) error {
	return a.storage.RenameConnection(oldName, newName)
}

// UpdateConnection updates an existing saved connection
func (a *App) UpdateConnection(name string, config database.ConnectionConfig) error {
	return a.storage.SaveConnection(name, config)
}

// ====================
// CRUD Methods
// ====================

// GetTableData returns paginated table data
func (a *App) GetTableData(req database.TableDataRequest) (*database.TableDataResponse, error) {
	return a.db.GetTableData(req)
}

// InsertRow inserts a new row into a table
func (a *App) InsertRow(dbName, table string, data map[string]interface{}) (*database.ExecuteResult, error) {
	return a.db.InsertRow(dbName, table, data)
}

// UpdateRow updates a row by primary key
func (a *App) UpdateRow(dbName, table, primaryKey string, primaryValue interface{}, data map[string]interface{}) (*database.ExecuteResult, error) {
	return a.db.UpdateRow(dbName, table, primaryKey, primaryValue, data)
}

// DeleteRow deletes a row by primary key
func (a *App) DeleteRow(dbName, table, primaryKey string, primaryValue interface{}) (*database.ExecuteResult, error) {
	return a.db.DeleteRow(dbName, table, primaryKey, primaryValue)
}

// DeleteRows deletes multiple rows by primary key values
func (a *App) DeleteRows(dbName, table, primaryKey string, primaryValues []interface{}) (*database.ExecuteResult, error) {
	return a.db.DeleteRows(dbName, table, primaryKey, primaryValues)
}

// AlterTable performs schema modifications on a table
func (a *App) AlterTable(dbName, table string, alteration database.TableAlteration) error {
	return a.db.AlterTable(dbName, table, alteration)
}

// TruncateTable removes all rows from a table
func (a *App) TruncateTable(dbName, table string) error {
	return a.db.TruncateTable(dbName, table)
}

// DropTable deletes a table
func (a *App) DropTable(dbName, table string) error {
	return a.db.DropTable(dbName, table)
}

// ====================
// Window Methods
// ====================

// ToggleFullscreen toggles the window fullscreen state
func (a *App) ToggleFullscreen() {
	if runtime.WindowIsFullscreen(a.ctx) {
		runtime.WindowUnfullscreen(a.ctx)
	} else {
		runtime.WindowFullscreen(a.ctx)
	}
}

// IsFullscreen returns true if the window is fullscreen
func (a *App) IsFullscreen() bool {
	return runtime.WindowIsFullscreen(a.ctx)
}

// GetAppVersion returns the current application version
func (a *App) GetAppVersion() string {
	return AppVersion
}

// ====================
// Update Methods
// ====================

// CheckForUpdate checks if a new version is available on GitHub
func (a *App) CheckForUpdate() (*database.UpdateInfo, error) {
	return a.updater.CheckForUpdate(AppVersion)
}

// ApplyUpdate downloads and installs the latest version
func (a *App) ApplyUpdate(latestVersion string) error {
	err := a.updater.ApplyUpdate(latestVersion)
	if err != nil {
		return err
	}
	// After update, we should notify the user or restart
	return nil
}

// RestartApp restarts the application
func (a *App) RestartApp() error {
	return a.updater.RestartApp()
}

// ====================
// Export Methods
// ====================

// SelectExportPath opens a save dialog for the user to choose where to save the export
func (a *App) SelectExportPath(format string) (string, error) {
	var filters []runtime.FileFilter
	var defaultExt string

	switch format {
	case "xlsx":
		filters = []runtime.FileFilter{{DisplayName: "Excel Workbook (*.xlsx)", Pattern: "*.xlsx"}}
		defaultExt = "*.xlsx"
	case "csv":
		filters = []runtime.FileFilter{{DisplayName: "CSV File (*.csv)", Pattern: "*.csv"}}
		defaultExt = "*.csv"
	case "json":
		filters = []runtime.FileFilter{{DisplayName: "JSON File (*.json)", Pattern: "*.json"}}
		defaultExt = "*.json"
	}

	return runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Export Data",
		DefaultFilename: "export" + defaultExt[1:],
		Filters:         filters,
	})
}

// ExportTable exports the table data to a file
func (a *App) ExportTable(dbName, tableName, format, outputPath string) error {
	return a.db.ExportTable(dbName, tableName, format, outputPath)
}
