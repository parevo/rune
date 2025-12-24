import { useState, useEffect, useCallback } from 'react';
import './style.css';
import { useDatabase } from './hooks/useDatabase';
import { ConnectionSidebar } from './components/ConnectionSidebar';
import { ConnectionHub } from './components/ConnectionHub';
import { DatabaseTree } from './components/DatabaseTree';
import { QueryEditor } from './components/QueryEditor';
import { ResultsTable } from './components/ResultsTable';
import { DataEditor } from './components/DataEditor';
import { ConnectionModal } from './components/ConnectionModal';
import { ConnectionConfig, UpdateInfo } from './types';
import { ToggleFullscreen, CheckForUpdate, GetAppVersion } from '../wailsjs/go/main/App';
import { UpdateModal } from './components/UpdateModal';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup
} from "@/components/ui/resizable";
import { TabBar } from './components/TabBar';
import { Tab } from './types/tabs';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Database,
    Code2,
    Table2,
    Info,
    LayoutDashboard,
    Activity,
    WifiOff,
    Maximize2,
    Minimize2
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

function App() {
    const {
        connected,
        loading,
        error,
        databases,
        currentDb,
        queryResult, // Legacy
        queryResults,
        savedConnections,
        testConnection,
        connect,
        disconnect,
        getTables,
        getColumns,
        useDb,
        executeQuery,
        executeQueries,
        loadSavedConnections,
        saveConnection,
        updateConnection,
        renameConnection,
        deleteConnection,
        clearError,
        getDatabaseSchema,
    } = useDatabase();

    const [query, setQuery] = useState(() => {
        return localStorage.getItem('opendb_query') || 'SELECT * FROM ';
    });

    // Tab State
    const [tabs, setTabs] = useState<Tab[]>(() => {
        const saved = localStorage.getItem('opendb_tabs');
        return saved ? JSON.parse(saved) : [{ id: 'query-main', type: 'query', title: 'Query Editor' }];
    });
    const [activeTabId, setActiveTabId] = useState<string>(() => {
        return localStorage.getItem('opendb_active_tab') || 'query-main';
    });
    // Schema for autocomplete
    const [dbSchema, setDbSchema] = useState<Record<string, string[]> | null>(null);

    // Determine view mode based on active tab
    const activeTab = tabs.find(t => t.id === activeTabId);
    const viewMode = !connected ? 'hub' : (activeTab?.type === 'query' ? 'query' : (activeTab?.type === 'table' ? 'data' : 'hub'));

    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState<{ config?: ConnectionConfig; name?: string }>({});

    const [activeConnectionName, setActiveConnectionName] = useState<string | undefined>(undefined);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
    const [appVersion, setAppVersion] = useState("V0.1.0-ALPHA");

    useEffect(() => {
        const init = async () => {
            try {
                const ver = await GetAppVersion();
                setAppVersion(ver);

                const info = await CheckForUpdate();
                if (info && info.hasUpdate) {
                    setUpdateInfo(info);
                }
            } catch (err) {
                console.error("Initialization failed:", err);
            }
        };
        init();
    }, []);

    // Update schema when database changes
    // Update schema when database changes
    useEffect(() => {
        if (!connected) {
            setDbSchema(null);
            return;
        }

        const fetchSchema = async () => {
            if (!currentDb) {
                // Connected but no DB selected yet. Autocomplete works but with no table specific suggestions.
                setDbSchema({});
                return;
            }

            try {
                const schema = await getDatabaseSchema(currentDb);
                // If schema is null (error), set to empty obj to clear loading state
                setDbSchema(schema || {});
            } catch (e) {
                console.error("Failed to fetch schema on db change:", e);
                setDbSchema({});
            }
        };
        fetchSchema();
    }, [connected, currentDb, getDatabaseSchema]);

    const handleToggleFullscreen = async () => {
        await ToggleFullscreen();
        setIsFullscreen(!isFullscreen);
    };

    useEffect(() => {
        loadSavedConnections();
    }, [loadSavedConnections]);

    useEffect(() => {
        localStorage.setItem('opendb_query', query);
    }, [query]);

    // Persist Tabs
    useEffect(() => {
        localStorage.setItem('opendb_tabs', JSON.stringify(tabs));
        localStorage.setItem('opendb_active_tab', activeTabId);
    }, [tabs, activeTabId]);

    const handleSelectDatabase = useCallback((database: string) => {
        useDb(database);
    }, [useDb]);

    const handleSelectTable = useCallback((database: string, table: string) => {
        const tabId = `table-${database}-${table}`;
        const existingTab = tabs.find(t => t.id === tabId);

        if (existingTab) {
            setActiveTabId(tabId);
        } else {
            const newTab: Tab = {
                id: tabId,
                type: 'table',
                title: table,
                data: { db: database, table }
            };
            setTabs(prev => [...prev, newTab]);
            setActiveTabId(tabId);
        }
    }, [tabs]);

    const handleTabClose = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newTabs = tabs.filter(t => t.id !== id);
        setTabs(newTabs);

        if (activeTabId === id) {
            // activate the previous tab or the query editor
            const index = tabs.findIndex(t => t.id === id);
            const nextTab = newTabs[index - 1] || newTabs[0];
            if (nextTab) {
                setActiveTabId(nextTab.id);
            }
        }
    };


    const handleExecute = useCallback((sqlOverride?: string) => {
        const sqlToRun = typeof sqlOverride === 'string' ? sqlOverride : query;
        if (sqlToRun.trim()) {
            // Split by semicolon for basic multi-statement support
            // This is a naive split; it doesn't handle semicolons in quotes, but covers basic usage
            const statements = sqlToRun.split(';').map(s => s.trim()).filter(s => s.length > 0);

            if (statements.length > 0) {
                executeQueries(statements);
            }

            // Ensure we are in query mode/tab
            if (activeTab?.type !== 'query') {
                // Find or create query tab
                const queryTab = tabs.find(t => t.type === 'query');
                if (queryTab) setActiveTabId(queryTab.id);
            }
        }
    }, [query, executeQueries, tabs, activeTab]);


    const handleOpenModal = (config?: ConnectionConfig, name?: string) => {
        setModalData({ config, name });
        setModalOpen(true);
    };

    const handleSaveModal = async (name: string, config: ConnectionConfig) => {
        if (modalData.name && modalData.name !== name) {
            await renameConnection(modalData.name, name);
        }
        return await saveConnection(name, config);
    };

    const handleConnect = async (config: ConnectionConfig) => {
        const success = await connect(config);
        if (success) {
            // Find current name if any
            const sc = savedConnections.find(c => c.config.host === config.host && c.config.database === config.database);
            setActiveConnectionName(sc?.name);

            // Fetch schema / Auto-select database
            if (config.database) {
                try {
                    console.log("Fetching schema for:", config.database);
                    const schema = await getDatabaseSchema(config.database);
                    console.log("Fetched schema:", schema);
                    setDbSchema(schema);
                } catch (e) {
                    console.error("Failed to fetch schema:", e);
                }
            } else {
                // AUTO-SELECT LOGIC: If no DB specified, try to find a user DB
                try {
                    // We need to fetch databases explicitly here because the state update in hook might be pending
                    const { GetDatabases } = await import('../wailsjs/go/main/App');
                    const dbs = await GetDatabases();
                    if (dbs && dbs.length > 0) {
                        const systemDbs = ['information_schema', 'mysql', 'performance_schema', 'sys'];
                        const userDbs = dbs.filter(d => !systemDbs.includes(d.name));

                        let targetDb = '';
                        if (userDbs.length > 0) {
                            targetDb = userDbs[0].name;
                        } else {
                            targetDb = dbs[0].name;
                        }

                        if (targetDb) {
                            console.log("Auto-selecting database:", targetDb);
                            await handleSelectDatabase(targetDb);
                        }
                    }
                } catch (e) {
                    console.error("Auto-select failed:", e);
                }
            }
        }
        return success;
    };


    return (
        <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans select-none">
            {/* Header */}
            <header className="h-12 border-b bg-card/50 backdrop-blur-xl flex items-center justify-between px-4 shrink-0 shadow-lg z-30">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 group cursor-pointer">
                        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20 transition-all group-hover:rotate-12 group-active:scale-90">
                            <Database size={18} strokeWidth={2.5} />
                        </div>
                        <h1 className="text-base font-black tracking-tighter uppercase italic bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            RuneDB
                        </h1>
                    </div>


                    <Separator orientation="vertical" className="h-5 bg-border/40" />

                    {connected && (
                        <div className="flex items-center h-full gap-1">
                            {/* Replaced by TabBar in main area */}
                        </div>

                    )}
                </div>

                <div className="flex items-center gap-4">
                    {connected && (
                        <div className="hidden md:flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-black text-green-500 uppercase tracking-tighter">
                                <Activity size={12} className="animate-pulse" />
                                {currentDb || "NO DB SELECTED"}
                            </div>
                            <Separator orientation="vertical" className="h-4" />
                        </div>
                    )}

                    <div className="flex items-center gap-2.5 bg-muted/30 px-3 py-1 rounded-full border border-border/40">
                        <div className={cn(
                            "w-2 h-2 rounded-full",
                            connected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse'
                        )} />
                        <span className="text-[10px] font-black text-muted-foreground uppercase opacity-80 tracking-widest">
                            {connected ? 'ONLINE' : 'DISCONNECTED'}
                        </span>
                    </div>

                    <Separator orientation="vertical" className="h-5 bg-border/40" />

                    <button
                        onClick={handleToggleFullscreen}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20 shadow-none hover:shadow-lg hover:shadow-primary/5"
                        title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                    >
                        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                </div>
            </header>

            {/* Main Layout Area - 3 Column */}
            <div className="flex-1 overflow-hidden relative">
                <ResizablePanelGroup direction="horizontal">

                    {/* Column 1: Connections (Left) */}
                    <ResizablePanel defaultSize={18} minSize={12} maxSize={25} className="bg-card/20 backdrop-blur-sm">
                        <ConnectionSidebar
                            onConnect={handleConnect}
                            savedConnections={savedConnections}
                            onDeleteConnection={deleteConnection}
                            loading={loading}
                            connected={connected}
                            onDisconnect={disconnect}
                            onOpenModal={handleOpenModal}
                            activeName={activeConnectionName}
                            onGoToHub={() => {
                                // Maybe add a hub tab or just reset?
                                // For now, just reset to query
                                const queryTab = tabs.find(t => t.type === 'query');
                                if (queryTab) setActiveTabId(queryTab.id);
                            }}
                        />

                    </ResizablePanel>

                    <ResizableHandle withHandle className="bg-border/10 w-[1px]" />

                    {/* Column 2: Main Workspace (Center) */}
                    <ResizablePanel defaultSize={64} className="flex flex-col relative">
                        {connected && (
                            <TabBar
                                tabs={tabs}
                                activeTabId={activeTabId}
                                onTabSelect={setActiveTabId}
                                onTabClose={handleTabClose}
                            />
                        )}

                        <div className="flex-1 relative overflow-hidden">
                            {(!connected) ? (
                                <ConnectionHub
                                    savedConnections={savedConnections}
                                    onConnect={handleConnect}
                                    onOpenModal={handleOpenModal}
                                    onDelete={deleteConnection}
                                    loading={loading}
                                />
                            ) : activeTab?.type === 'query' ? (
                                <ResizablePanelGroup direction="vertical">
                                    <ResizablePanel defaultSize={50} minSize={20}>
                                        <QueryEditor
                                            value={query}
                                            onChange={setQuery}
                                            onExecute={handleExecute}
                                            loading={loading}
                                            schema={dbSchema}
                                        />
                                    </ResizablePanel>
                                    <ResizableHandle withHandle className="bg-border/10 h-[1px]" />
                                    <ResizablePanel defaultSize={50} minSize={20}>
                                        <ResultsTable
                                            results={queryResults}
                                            error={error}
                                        />
                                    </ResizablePanel>
                                </ResizablePanelGroup>
                            ) : activeTab?.type === 'table' && activeTab.data ? (
                                <DataEditor
                                    database={activeTab.data.db}
                                    table={activeTab.data.table}
                                    onClose={() => {
                                        // Close this tab
                                        handleTabClose(activeTab.id, { stopPropagation: () => { } } as any);
                                    }}
                                />
                            ) : (
                                <div className="p-10 flex items-center justify-center h-full text-muted-foreground opacity-50 text-sm font-bold uppercase tracking-widest">
                                    No Tab Selected
                                </div>
                            )}
                        </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle className="bg-border/10 w-[1px]" />

                    {/* Column 3: Schema Browser (Right) */}
                    <ResizablePanel defaultSize={18} minSize={12} maxSize={25} className="bg-card/20 backdrop-blur-sm">
                        {connected ? (
                            <DatabaseTree
                                databases={databases}
                                onGetTables={getTables}
                                onGetColumns={getColumns}
                                onSelectDatabase={handleSelectDatabase}
                                onSelectTable={handleSelectTable}
                                connected={connected}
                            />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center opacity-30 select-none grayscale">
                                <WifiOff size={40} strokeWidth={1} className="mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Offline</p>
                                <p className="text-[9px] font-medium leading-relaxed mt-2 uppercase">Connect to a server to browse schema objects</p>
                            </div>
                        )}
                    </ResizablePanel>

                </ResizablePanelGroup>
            </div>

            {/* Premium Modal */}
            {modalOpen && (
                <ConnectionModal
                    title={modalData.name ? "Edit Connection" : "Initialize New Connector"}
                    initialConfig={modalData.config}
                    initialName={modalData.name}
                    onSave={handleSaveModal}
                    onClose={() => setModalOpen(false)}
                    onTest={testConnection}
                    loading={loading}
                />
            )}

            {/* Update Modal */}
            {updateInfo && (
                <UpdateModal
                    updateInfo={updateInfo}
                    onClose={() => setUpdateInfo(null)}
                />
            )}

            {/* Slim Status Footer */}
            <footer className="h-8 border-t bg-card/80 flex items-center px-4 justify-between shrink-0 shadow-inner">
                <div className="flex items-center gap-4 text-[9px] text-muted-foreground font-black uppercase tracking-widest">
                    <span className="flex items-center gap-1.5 opacity-60">
                        <Info size={10} strokeWidth={3} />
                        CORE {appVersion}
                    </span>
                    <Separator orientation="vertical" className="h-3 bg-border" />
                    <span className="opacity-40 select-none">LICENSE: MIT</span>
                </div>
                <div className="flex items-center gap-3">
                    {connected && activeConnectionName && (
                        <div className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-black border border-primary/20 animate-in fade-in slide-in-from-right-2 duration-500">
                            ACTIVE: {activeConnectionName.toUpperCase()}
                        </div>
                    )}
                </div>
            </footer>
        </div>
    );
}

export default App;
