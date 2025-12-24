import { X, Database, Code2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tab } from '../types/tabs';

interface TabBarProps {
    tabs: Tab[];
    activeTabId: string;
    onTabSelect: (id: string) => void;
    onTabClose: (id: string, e: React.MouseEvent) => void;
}

export function TabBar({ tabs, activeTabId, onTabSelect, onTabClose }: TabBarProps) {
    return (
        <div className="flex items-center h-9 bg-muted/40 border-b overflow-x-auto no-scrollbar px-1 gap-1">
            {tabs.map((tab) => (
                <div
                    key={tab.id}
                    onClick={() => onTabSelect(tab.id)}
                    className={cn(
                        "group relative flex items-center gap-2 px-3 h-7 rounded-md text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all min-w-[120px] max-w-[200px] border select-none",
                        activeTabId === tab.id
                            ? "bg-background text-foreground border-border shadow-sm z-10"
                            : "bg-transparent text-muted-foreground border-transparent hover:bg-muted/60 opacity-70 hover:opacity-100"
                    )}
                >
                    {tab.type === 'query' ? (
                        <Code2 size={12} className={cn("shrink-0", activeTabId === tab.id ? "text-primary" : "text-muted-foreground")} />
                    ) : (
                        <Database size={12} className={cn("shrink-0", activeTabId === tab.id ? "text-primary" : "text-muted-foreground")} />
                    )}

                    <span className="truncate flex-1">{tab.title}</span>

                    {/* Don't show close button for the main Query Editor if you want it permanent, 
                        but user requested tabs so let's allow closing everything or decided logic.
                        Let's make Query Editor permanent for now or at least one tab must exist?
                        For now, allow closing tables. Query Logic might be special.
                    */}
                    {tab.type === 'table' && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                onTabClose(tab.id, e);
                            }}
                            className={cn(
                                "w-4 h-4 rounded hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100",
                                activeTabId === tab.id && "opacity-100"
                            )}
                        >
                            <X size={10} strokeWidth={3} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
