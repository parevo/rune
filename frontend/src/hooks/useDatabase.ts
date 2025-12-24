import { useState, useCallback } from 'react';
import {
    Connect, Disconnect, TestConnection, IsConnected, ExecuteQuery,
    GetDatabases, GetTables, GetColumns, SaveConnection, LoadConnections,
    DeleteConnection, UseDatabase, RenameConnection, UpdateConnection,
    GetTableData, InsertRow, UpdateRow, DeleteRow, DeleteRows,
    AlterTable, TruncateTable, DropTable, GetDatabaseSchema
} from '../../wailsjs/go/main/App';
import {
    ConnectionConfig, SavedConnection, QueryResult, DatabaseInfo,
    TableInfo, ColumnInfo, TableDataRequest, TableAlteration
} from '../types';
import { toast } from "sonner";

export function useDatabase() {
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [databases, setDatabases] = useState<DatabaseInfo[]>([]);
    const [currentDb, setCurrentDb] = useState<string>('');
    // const [queryResult, setQueryResult] = useState<QueryResult | null>(null); // Legacy state removed
    const [savedConnections, setSavedConnections] = useState<SavedConnection[]>([]);

    const clearError = useCallback(() => setError(null), []);

    const testConnection = useCallback(async (config: ConnectionConfig) => {
        setLoading(true);
        setError(null);
        try {
            const result = await TestConnection(config);
            if (result) {
                toast.success("Connection test successful!");
            } else {
                toast.error("Connection test failed.");
            }
            return result;
        } catch (err: any) {
            toast.error(`Connection error: ${err.message || 'Unknown error'}`);
            setError(err.message || 'Connection test failed');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const connect = useCallback(async (config: ConnectionConfig) => {
        setLoading(true);
        setError(null);
        try {
            await Connect(config);
            setConnected(true);
            if (config.database) {
                setCurrentDb(config.database);
            }
            toast.success(`Connected to ${config.host}`);
            // Load databases after connecting
            const dbs = await GetDatabases();
            setDatabases(dbs || []);
            return true;
        } catch (err: any) {
            toast.error(`Failed to connect: ${err.message}`);
            setError(err.message || 'Connection failed');
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const disconnect = useCallback(async () => {
        try {
            await Disconnect();
            setConnected(false);
            setDatabases([]);
            setCurrentDb('');
            setQueryResults([]);
            toast.info("Disconnected from database.");
        } catch (err: any) {
            toast.error(`Disconnect failed: ${err.message}`);
            setError(err.message || 'Disconnect failed');
        }
    }, []);

    const refreshDatabases = useCallback(async () => {
        try {
            const dbs = await GetDatabases();
            setDatabases(dbs || []);
        } catch (err: any) {
            setError(err.message || 'Failed to load databases');
        }
    }, []);

    const getTables = useCallback(async (database: string): Promise<TableInfo[]> => {
        try {
            const tables = await GetTables(database);
            return tables || [];
        } catch (err: any) {
            setError(err.message || 'Failed to load tables');
            return [];
        }
    }, []);

    const getColumns = useCallback(async (database: string, table: string): Promise<ColumnInfo[]> => {
        try {
            const columns = await GetColumns(database, table);
            return columns || [];
        } catch (err: any) {
            setError(err.message || 'Failed to load columns');
            return [];
        }
    }, []);

    const getDatabaseSchema = useCallback(async (database: string): Promise<Record<string, string[]> | null> => {
        try {
            const schema = await GetDatabaseSchema(database);
            return schema || null;
        } catch (err: any) {
            console.error('Failed to get schema for autocomplete:', err);
            return null;
        }
    }, []);

    const useDb = useCallback(async (database: string) => {
        try {
            await UseDatabase(database);
            setCurrentDb(database);
            toast.info(`Switched to database: ${database}`);
        } catch (err: any) {
            toast.error(`Failed to switch database: ${err.message}`);
            setError(err.message || 'Failed to switch database');
        }
    }, []);

    const [queryResults, setQueryResults] = useState<QueryResult[]>([]);

    // Backward compatibility for single result views
    const queryResult = queryResults.length > 0 ? queryResults[0] : null;

    const executeQuery = useCallback(async (query: string) => {
        return executeQueries([query]);
    }, []);

    const executeQueries = useCallback(async (queries: string[]) => {
        setLoading(true);
        setError(null);
        setQueryResults([]);

        const results: QueryResult[] = [];

        try {
            for (const q of queries) {
                if (!q.trim()) continue;
                const res = await ExecuteQuery(q);
                if (res) {
                    results.push(res);
                }
            }

            setQueryResults(results);

            if (results.length > 0) {
                const totalRows = results.reduce((acc, r) => acc + (r.rowCount || 0), 0);
                toast.success(`Executed ${results.length} queries (${totalRows} rows).`);
            }

            return results.length > 0 ? results[0] : null;
        } catch (err: any) {
            // If we have some results, keep them? 
            // Usually DB tools show the error and maybe previous results.
            // For now, allow partial results + error override
            setQueryResults(results);

            const errorMessage = typeof err === 'string' ? err : (err.message || 'Query failed');
            toast.error(`Execution failed: ${errorMessage}`);
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const loadSavedConnections = useCallback(async () => {
        try {
            const connections = await LoadConnections();
            setSavedConnections(connections || []);
        } catch (err: any) {
            console.error('Failed to load saved connections:', err);
        }
    }, []);

    const saveConnection = useCallback(async (name: string, config: ConnectionConfig) => {
        try {
            await SaveConnection(name, config);
            await loadSavedConnections();
            toast.success(`Connection "${name}" saved.`);
            return true;
        } catch (err: any) {
            toast.error(`Failed to save connection: ${err.message}`);
            setError(err.message || 'Failed to save connection');
            return false;
        }
    }, [loadSavedConnections]);

    const updateConnection = useCallback(async (name: string, config: ConnectionConfig) => {
        try {
            await UpdateConnection(name, config);
            await loadSavedConnections();
            toast.success(`Connection "${name}" updated.`);
            return true;
        } catch (err: any) {
            toast.error(`Failed to update connection: ${err.message}`);
            setError(err.message || 'Failed to update connection');
            return false;
        }
    }, [loadSavedConnections]);

    const renameConnection = useCallback(async (oldName: string, newName: string) => {
        try {
            await RenameConnection(oldName, newName);
            await loadSavedConnections();
            toast.success(`Connection renamed to "${newName}".`);
            return true;
        } catch (err: any) {
            toast.error(`Failed to rename connection: ${err.message}`);
            setError(err.message || 'Failed to rename connection');
            return false;
        }
    }, [loadSavedConnections]);

    const deleteConnection = useCallback(async (name: string) => {
        try {
            await DeleteConnection(name);
            await loadSavedConnections();
            toast.info(`Connection "${name}" deleted.`);
        } catch (err: any) {
            toast.error(`Failed to delete connection: ${err.message}`);
            setError(err.message || 'Failed to delete connection');
        }
    }, [loadSavedConnections]);

    const alterTable = useCallback(async (database: string, table: string, alteration: TableAlteration) => {
        setLoading(true);
        try {
            await AlterTable(database, table, alteration as any);
            toast.success(`Table "${table}" modified successfully.`);
            return true;
        } catch (err: any) {
            toast.error(`Failed to modify table: ${err.message}`);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const truncateTable = useCallback(async (database: string, table: string) => {
        setLoading(true);
        try {
            await TruncateTable(database, table);
            toast.success(`Table "${table}" truncated.`);
            return true;
        } catch (err: any) {
            toast.error(`Failed to truncate table: ${err.message}`);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const dropTable = useCallback(async (database: string, table: string) => {
        setLoading(true);
        try {
            await DropTable(database, table);
            toast.success(`Table "${table}" dropped.`);
            return true;
        } catch (err: any) {
            toast.error(`Failed to drop table: ${err.message}`);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        // State
        connected,
        loading,
        error,
        databases,
        currentDb,
        queryResult,
        queryResults,
        savedConnections,
        // Actions
        testConnection,
        connect,
        disconnect,
        refreshDatabases,
        getTables,
        getColumns,
        getDatabaseSchema,
        useDb,
        executeQuery,
        executeQueries,
        loadSavedConnections,
        saveConnection,
        updateConnection,
        renameConnection,
        deleteConnection,
        clearError,
        alterTable,
        truncateTable,
        dropTable,
    };
}
