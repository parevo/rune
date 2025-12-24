import React, { useState, useEffect } from 'react';
import { QueryResult } from '../types';
import {
    AlertCircle,
    Terminal,
    FileJson,
    Hash,
    Table as TableIcon,
    ChevronRight
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Props {
    results?: QueryResult[];
    result?: QueryResult | null; // Deprecated
    error: string | null;
}

export function ResultsTable({ results, result, error }: Props) {
    // Unify input to array
    const data = results || (result ? [result] : []);
    const [activeIndex, setActiveIndex] = useState(0);

    // Reset active index when data changes significantly
    useEffect(() => {
        if (data.length > 0 && activeIndex >= data.length) {
            setActiveIndex(0);
        }
    }, [data.length]);

    if (error) {
        return (
            <div className="h-full flex items-center justify-center p-6 pb-20">
                <div className="max-w-2xl w-full bg-destructive/5 border border-destructive/20 rounded-xl p-6 shadow-2xl shadow-destructive/10 animate-in zoom-in-95 duration-200">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-destructive/10 rounded-lg text-destructive shrink-0">
                            <AlertCircle size={24} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-destructive uppercase tracking-widest flex items-center gap-2">
                                Execution Failed
                                <Badge variant="destructive" className="h-4 text-[9px] px-1 font-bold">SQL Error</Badge>
                            </h3>
                            <pre className="text-[12px] font-mono whitespace-pre-wrap text-muted-foreground leading-relaxed bg-black/20 p-4 rounded-lg border border-destructive/10">
                                {error}
                            </pre>
                            {/* Show any successful results before the error? For simplicity, we just show error if it failed globally, but typically we might want to see partials. */}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 opacity-40">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-muted flex items-center justify-center">
                    <Terminal size={32} />
                </div>
                <div className="text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.2em]">Execution Console</p>
                    <p className="text-[11px] mt-1 font-medium">Results will appear here after execution</p>
                </div>
            </div>
        );
    }

    const activeResult = data[activeIndex];

    return (
        <div className="flex flex-col h-full">
            <div className="h-9 border-b flex items-center justify-between px-4 bg-muted/10 shrink-0">
                <div className="flex items-center gap-4 text-[10px] font-bold uppercase text-muted-foreground tracking-widest overflow-hidden">
                    <div className="flex items-center gap-1.5 shrink-0">
                        <TableIcon size={12} className="text-primary/60" />
                        Query Results
                    </div>

                    {data.length > 1 && (
                        <div className="flex items-center gap-1 ml-2">
                            <Separator orientation="vertical" className="h-3 mr-2" />
                            {data.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveIndex(idx)}
                                    className={cn(
                                        "px-2 py-0.5 rounded text-[9px] transition-colors border",
                                        activeIndex === idx
                                            ? "bg-primary/20 text-primary border-primary/20"
                                            : "bg-transparent text-muted-foreground border-transparent hover:bg-muted/20"
                                    )}
                                >
                                    Result {idx + 1}
                                </button>
                            ))}
                        </div>
                    )}

                    <Separator orientation="vertical" className="h-3" />
                    <div className="flex items-center gap-1.5 shrink-0">
                        <Hash size={12} className="text-muted-foreground/40" />
                        {activeResult?.rowCount} rows
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[9px] font-mono font-bold border-none bg-primary/10 text-primary">SCANNED</Badge>
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
                <ScrollArea className="h-full w-full">
                    <Table className="border-collapse min-w-full">
                        <TableHeader className="bg-card/80 sticky top-0 z-10 shadow-sm backdrop-blur-sm">
                            <TableRow className="hover:bg-transparent border-b">
                                <TableHead className="w-12 text-center text-[10px] font-black text-muted-foreground/30 border-r py-3 uppercase tracking-tighter">#</TableHead>
                                {activeResult?.columns.map((col, i) => (
                                    <TableHead key={i} className="text-[11px] font-bold text-foreground/80 py-3 uppercase tracking-wider border-r last:border-r-0">
                                        <div className="flex items-center gap-2">
                                            {col}
                                        </div>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activeResult?.rows.map((row, rowIndex) => (
                                <TableRow key={rowIndex} className="group hover:bg-primary/5 transition-colors border-b last:border-b-0">
                                    <TableCell className="text-center font-mono text-[10px] text-muted-foreground/40 border-r py-2 bg-muted/5 group-hover:bg-primary/10 transition-colors">
                                        {rowIndex + 1}
                                    </TableCell>
                                    {row.map((cell, cellIndex) => (
                                        <TableCell
                                            key={cellIndex}
                                            className={cn(
                                                "text-[12px] py-2 border-r last:border-r-0 font-medium",
                                                cell === null ? "text-muted-foreground italic opacity-50 font-normal" : "text-foreground/90 font-mono"
                                            )}
                                        >
                                            {cell === null ? 'NULL' : String(cell)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        </div>
    );
}

