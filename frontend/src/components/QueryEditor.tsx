import React, { useEffect, useRef, useState, useCallback } from 'react';
import Editor, { loader, Monaco } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Play, Sparkles, Code2, Trash2, History, Clock, AlignLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format as formatSQL } from 'sql-formatter';
import { useTheme } from '../contexts/ThemeContext';

// Configure Monaco loader
loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs' } });

interface Props {
    value: string;
    onChange: (value: string) => void;
    onExecute: (sql?: string) => void;
    loading: boolean;
    schema: Record<string, string[]> | null;
}

export function QueryEditor({ value, onChange, onExecute, loading, schema }: Props) {
    const { resolvedTheme } = useTheme();
    const [monacoInstance, setMonacoInstance] = useState<Monaco | null>(null);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [queryHistory, setQueryHistory] = useState<string[]>(() => {
        const saved = localStorage.getItem('rune_query_history');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('rune_query_history', JSON.stringify(queryHistory));
    }, [queryHistory]);

    // Verify schema prop
    useEffect(() => {
        console.log("QueryEditor received schema:", schema);
        if (schema) {
            console.log("Schema keys:", Object.keys(schema));
        }
    }, [schema]);

    const editorRef = useRef<any>(null);

    // SQL Format handler
    const handleFormat = useCallback(() => {
        try {
            const formatted = formatSQL(value, {
                language: 'mysql',
                tabWidth: 2,
                keywordCase: 'upper',
                linesBetweenQueries: 2,
            });
            onChange(formatted);
        } catch (e) {
            console.error('SQL Format error:', e);
        }
    }, [value, onChange]);

    const handleEditorDidMount = (editor: any, monaco: Monaco) => {
        editorRef.current = editor;

        // Add Cmd+Enter shortcut to run query
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            handleExecuteWrapper();
        });

        // Add Cmd+Shift+F shortcut to format SQL
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
            handleFormat();
        });
    };

    // Update history when executing
    const handleExecuteWrapper = () => {
        const editor = editorRef.current;
        let sqlToExecute = value;
        const selection = editor?.getSelection();

        // Check if there is selected text
        if (selection && !selection.isEmpty()) {
            const selectedText = editor.getModel()?.getValueInRange(selection);
            if (selectedText && selectedText.trim()) {
                sqlToExecute = selectedText;
            }
        }

        if (sqlToExecute.trim()) {
            // Only add to history if it's the full query (optional choice, but cleaner)
            if (sqlToExecute === value) {
                setQueryHistory(prev => {
                    const newHistory = [value, ...prev.filter(q => q !== value)].slice(0, 50);
                    return newHistory;
                });
            }
            onExecute(sqlToExecute);
        }
    };

    const schemaRef = useRef(schema);
    schemaRef.current = schema;

    // Register SQL completion with proper lifecycle management
    useEffect(() => {
        if (!monacoInstance) return;

        const disposable = monacoInstance.languages.registerCompletionItemProvider('sql', {
            triggerCharacters: ['.', ' ', ','], // Add comma for column lists
            provideCompletionItems: (model, position, context) => {
                const textUntilPosition = model.getValueInRange({
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: position.lineNumber,
                    endColumn: position.column
                });

                const fullText = model.getValue();
                const word = model.getWordUntilPosition(position);
                const range = {
                    startLineNumber: position.lineNumber,
                    endLineNumber: position.lineNumber,
                    startColumn: word.startColumn,
                    endColumn: word.endColumn
                };

                const currentSchema = schemaRef.current || {};
                const suggestions: any[] = [];
                const allTables = Object.keys(currentSchema);

                // --- 1. ALIAS ANALYSIS ---
                // Find all table aliases: e.g. "FROM users u" or "JOIN other_table as ot"
                const aliasMap: Record<string, string> = {}; // alias -> tableName

                // Matches "FROM/JOIN tableName [AS] alias"
                const aliasRegex = /\b(?:FROM|JOIN)\s+(?:`?(\w+)`?)\s+(?:AS\s+)?(?:`?(\w+)`?)/gi;
                let match;
                while ((match = aliasRegex.exec(fullText)) !== null) {
                    if (match[1] && match[2]) {
                        aliasMap[match[2]] = match[1];
                    }
                }

                // --- 2. CONTEXT DETECTION ---
                // Naive way to look backwards for the last significant keyword
                // We limit lookback to avoid slow parsing of huge files
                const lookbackText = textUntilPosition.slice(-500).toUpperCase(); // Last 500 chars

                // Determine if we are waiting for a Table or a Column/Value
                // If last keyword is FROM, JOIN, UPDATE, INTO -> Expect Table
                // If last keyword is SELECT, WHERE, ON, GROUP BY, ORDER BY, SET -> Expect Column

                const keywords = ['SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'DELETE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'ON', 'GROUP BY', 'ORDER BY', 'LIMIT', 'SET'];
                let lastKeyword = '';

                // Scan backwards for known SQL keywords
                // This regex finds the last occurrence of any keyword
                const kwRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
                const kwMatches = [...lookbackText.matchAll(kwRegex)];
                if (kwMatches.length > 0) {
                    lastKeyword = kwMatches[kwMatches.length - 1][1].toUpperCase();
                }

                const isTableContext = ['FROM', 'JOIN', 'UPDATE', 'INTO'].includes(lastKeyword);

                // --- 3. SUGGESTION LOGIC ---

                // CASE A: Dot Trigger (e.g. "u." or "users.")
                if (context.triggerCharacter === '.') {
                    // Get word before dot
                    const lineContent = model.getLineContent(position.lineNumber);
                    const beforeDotMatch = lineContent.substring(0, position.column - 1).match(/([a-zA-Z0-9_]+)\.$/);

                    if (beforeDotMatch) {
                        const identifier = beforeDotMatch[1];
                        let targetTable = identifier;

                        // Check if it's an alias
                        if (aliasMap[identifier]) {
                            targetTable = aliasMap[identifier];
                        }

                        // If table exists in schema, show its columns
                        if (currentSchema[targetTable]) {
                            currentSchema[targetTable].forEach(col => {
                                suggestions.push({
                                    label: col,
                                    kind: monacoInstance.languages.CompletionItemKind.Field,
                                    insertText: col,
                                    detail: `Column of ${targetTable}`,
                                    sortText: '00-' + col // High priority
                                });
                            });
                        }
                    }
                    return { suggestions };
                }

                // CASE B: Table Context (e.g. after FROM)
                if (isTableContext) {
                    allTables.forEach(table => {
                        suggestions.push({
                            label: table,
                            kind: monacoInstance.languages.CompletionItemKind.Class,
                            insertText: table,
                            detail: 'Table',
                            sortText: '00-' + table
                        });
                    });

                    // Add generic keywords too but lower priority
                    keywords.forEach(k => {
                        suggestions.push({
                            label: k,
                            kind: monacoInstance.languages.CompletionItemKind.Keyword,
                            insertText: k,
                            sortText: '99-' + k
                        });
                    });
                    return { suggestions };
                }

                // CASE C: Column Context (e.g. SELECT ..., WHERE ...)
                // Suggest Columns (prioritizing aliased tables), then Tables, then Keywords

                // 1. Suggest columns from ALL tables (smart sort could prioritize FROM tables)
                // For "DataGrip-like" feel, we prioritize columns from tables actually used in the query
                const activeTables = new Set<string>();
                // Extract all tables used in FROM/JOIN
                const tableRefRegex = /\b(?:FROM|JOIN)\s+(?:`?(\w+)`?)/gi;
                let tableMatch;
                while ((tableMatch = tableRefRegex.exec(fullText)) !== null) {
                    if (tableMatch[1]) activeTables.add(tableMatch[1]);
                }

                allTables.forEach(table => {
                    const columns = currentSchema[table];
                    if (!columns) return;

                    // If table is active in this query, give high priority
                    const isActive = activeTables.has(table);
                    const priorityPrefix = isActive ? '00-' : '50-';

                    columns.forEach(col => {
                        suggestions.push({
                            label: col,
                            kind: monacoInstance.languages.CompletionItemKind.Field,
                            insertText: col,
                            detail: `${table}.${col}`, // Show qualification
                            sortText: priorityPrefix + col
                        });
                    });
                });

                // 2. Suggest Aliases and Table Names
                Object.keys(aliasMap).forEach(alias => {
                    suggestions.push({
                        label: alias,
                        kind: monacoInstance.languages.CompletionItemKind.Variable,
                        insertText: alias,
                        detail: `Alias for ${aliasMap[alias]}`,
                        sortText: '05-' + alias
                    });
                });

                allTables.forEach(table => {
                    suggestions.push({
                        label: table,
                        kind: monacoInstance.languages.CompletionItemKind.Class,
                        insertText: table,
                        detail: 'Table',
                        sortText: '60-' + table
                    });
                });

                // 3. Keywords
                keywords.forEach(k => {
                    suggestions.push({
                        label: k,
                        kind: monacoInstance.languages.CompletionItemKind.Keyword,
                        insertText: k,
                        sortText: '99-' + k
                    });
                });

                return { suggestions };
            }
        });

        return () => {
            disposable.dispose();
        };
    }, [monacoInstance]);

    const handleEditorWillMount = (monaco: Monaco) => {
        setMonacoInstance(monaco);

        // Dark theme for Monaco
        monaco.editor.defineTheme('rune-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#020205',
                'editor.lineHighlightBackground': '#1e293b20',
                'editorCursor.foreground': '#3b82f6',
                'editor.selectionBackground': '#3b82f630',
                'editorActiveLineNumber.foreground': '#3b82f6',
            }
        });

        // Light theme for Monaco
        monaco.editor.defineTheme('rune-light', {
            base: 'vs',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#ffffff',
                'editor.lineHighlightBackground': '#f1f5f920',
                'editorCursor.foreground': '#3b82f6',
                'editor.selectionBackground': '#3b82f630',
                'editorActiveLineNumber.foreground': '#3b82f6',
            }
        });
    };

    return (
        <div className="flex flex-col h-full bg-background">
            <div className="h-10 border-b flex items-center justify-between px-3 shrink-0 bg-muted/20">
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="h-5 px-1.5 font-mono text-[9px] bg-background border-primary/30 text-primary uppercase tracking-tighter">
                        SQL MODE
                    </Badge>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium uppercase tracking-tight">
                        <Code2 size={12} className="text-muted-foreground/60" />
                        Console
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Popover open={historyOpen} onOpenChange={setHistoryOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                title="Query History"
                            >
                                <History size={14} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-[400px] p-0 bg-card border-border shadow-xl">
                            <div className="h-9 border-b px-3 flex items-center justify-between bg-muted/30">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Execution History</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-[9px] hover:text-destructive"
                                    onClick={() => setQueryHistory([])}
                                >
                                    Clear
                                </Button>
                            </div>
                            <ScrollArea className="h-[300px]">
                                <div className="p-1">
                                    {queryHistory.length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground opacity-50 text-[10px] uppercase font-bold tracking-widest">
                                            No History
                                        </div>
                                    )}
                                    {queryHistory.map((q, i) => (
                                        <div
                                            key={i}
                                            className="p-3 hover:bg-muted/50 rounded-lg cursor-pointer group transition-colors border border-transparent hover:border-border/40 mb-1"
                                            onClick={() => {
                                                onChange(q);
                                                setHistoryOpen(false);
                                            }}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Clock size={12} className="mt-1 text-muted-foreground/50 shrink-0" />
                                                <code className="text-[11px] font-mono text-foreground/80 break-all leading-tight">
                                                    {q.length > 150 ? q.substring(0, 150) + '...' : q}
                                                </code>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        </PopoverContent>
                    </Popover>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-primary"
                        onClick={handleFormat}
                        title="Format SQL (Cmd+Shift+F)"
                    >
                        <AlignLeft size={14} />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => onChange('')}
                        title="Clear Console"
                    >
                        <Trash2 size={14} />
                    </Button>
                    <Separator orientation="vertical" className="h-4" />
                    <Button
                        size="sm"
                        className="h-7 px-3 text-[11px] font-bold bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20"
                        onClick={handleExecuteWrapper}
                        disabled={loading || !value.trim()}
                    >
                        {loading ? (
                            <div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : (
                            <>
                                <Play className="mr-1.5 h-3.5 w-3.5" />
                                EXECUTE
                            </>
                        )}
                        <kbd className="ml-2 pointer-events-none inline-flex h-4 select-none items-center gap-1 rounded border bg-primary-foreground/10 px-1 font-mono text-[9px] font-medium opacity-100">
                            ⌘↵
                        </kbd>
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden pt-2">
                <Editor
                    height="100%"
                    defaultLanguage="sql"
                    theme={resolvedTheme === 'dark' ? 'rune-dark' : 'rune-light'}
                    value={value}
                    onChange={(val) => onChange(val || '')}
                    beforeMount={handleEditorWillMount}
                    onMount={handleEditorDidMount}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Menlo', 'Monaco', 'Courier New', monospace",
                        automaticLayout: true,
                        padding: { top: 10 },
                        scrollbar: {
                            vertical: 'visible',
                            horizontal: 'visible',
                            verticalScrollbarSize: 8,
                            horizontalScrollbarSize: 8,
                        },
                    }}
                />
            </div>
        </div>
    );
}
