import React, { useState, useEffect } from 'react';
import { ConnectionConfig } from '../types';
import {
    X,
    FlaskConical,
    Save,
    Database,
    ShieldCheck,
    Globe,
    KeyRound,
    Hash,
    ChevronDown
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Props {
    title: string;
    initialConfig?: ConnectionConfig;
    initialName?: string;
    onSave: (name: string, config: ConnectionConfig) => Promise<boolean>;
    onClose: () => void;
    onTest: (config: ConnectionConfig) => Promise<boolean>;
    loading: boolean;
}

const DRIVERS = [
    { id: 'mysql', name: 'MySQL / MariaDB', defaultPort: 3306 },
    { id: 'postgres', name: 'PostgreSQL', defaultPort: 5432 },
    // { id: 'sqlite', name: 'SQLite', defaultPort: 0 },
];

export function ConnectionModal({ title, initialConfig, initialName, onSave, onClose, onTest, loading }: Props) {
    const [config, setConfig] = useState<ConnectionConfig>(initialConfig || {
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: '',
    });
    const [name, setName] = useState(initialName || '');
    const [testResult, setTestResult] = useState<'success' | 'failed' | null>(null);

    const handleDriverChange = (val: string) => {
        const driver = DRIVERS.find(d => d.id === val);
        setConfig({
            ...config,
            type: val,
            port: driver ? driver.defaultPort : config.port
        });
    };

    const handleTest = async () => {
        setTestResult(null);
        const result = await onTest(config);
        setTestResult(result ? 'success' : 'failed');
        setTimeout(() => setTestResult(null), 3000);
    };

    const handleSave = async () => {
        if (!name.trim()) return;
        const success = await onSave(name, config);
        if (success) onClose();
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[480px] bg-card border-border/40 shadow-2xl p-0 overflow-hidden animate-in zoom-in-95 duration-200">
                <DialogHeader className="p-6 pb-2 bg-muted/20">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                            <Database size={20} />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-black tracking-tight uppercase italic">
                                {title}
                            </DialogTitle>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none mt-1 opacity-60">Engine Configuration</p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-5 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2 tracking-widest">
                                Display Name
                            </Label>
                            <Input
                                className="h-9 text-[11px] font-bold bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/30"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Production DB"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2 tracking-widest">
                                Engine Type
                            </Label>
                            <Select value={config.type} onValueChange={handleDriverChange}>
                                <SelectTrigger className="h-9 text-[11px] font-bold bg-background/50 border-muted-foreground/20">
                                    <SelectValue placeholder="Select Engine" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DRIVERS.map(driver => (
                                        <SelectItem key={driver.id} value={driver.id} className="text-[11px] font-bold uppercase tracking-tight">
                                            {driver.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Separator className="bg-border/40" />

                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2 tracking-widest">
                                <Globe size={11} className="text-primary/60" />
                                Host address
                            </Label>
                            <Input
                                className="h-9 text-[11px] font-mono bg-background/50"
                                value={config.host}
                                onChange={(e) => setConfig({ ...config, host: e.target.value })}
                                placeholder="127.0.0.1"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2 tracking-widest">
                                <Hash size={11} className="text-primary/60" />
                                Port
                            </Label>
                            <Input
                                className="h-9 text-[11px] font-mono bg-background/50"
                                type="number"
                                value={config.port}
                                onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 3306 })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2 tracking-widest">
                                <ShieldCheck size={11} className="text-primary/60" />
                                Username
                            </Label>
                            <Input
                                className="h-9 text-[11px] font-mono bg-background/50"
                                value={config.user}
                                onChange={(e) => setConfig({ ...config, user: e.target.value })}
                                placeholder="root"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2 tracking-widest">
                                <KeyRound size={11} className="text-primary/60" />
                                Password
                            </Label>
                            <Input
                                className="h-9 text-[11px] font-mono bg-background/50"
                                type="password"
                                value={config.password}
                                onChange={(e) => setConfig({ ...config, password: e.target.value })}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2 tracking-widest">
                            Initial Database / Schema
                        </Label>
                        <Input
                            className="h-9 text-[11px] font-mono bg-background/50 border-muted-foreground/20"
                            value={config.database}
                            onChange={(e) => setConfig({ ...config, database: e.target.value })}
                            placeholder="my_app_production"
                        />
                    </div>

                    {testResult && (
                        <div className={cn(
                            "p-3 rounded-xl border text-[11px] font-black flex items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-300 uppercase tracking-widest",
                            testResult === 'success' ? "bg-green-500/10 border-green-500/30 text-green-500" : "bg-destructive/10 border-destructive/30 text-destructive"
                        )}>
                            <span>{testResult === 'success' ? '✓ Connector Handshake OK' : '✗ Network/Auth Timeout'}</span>
                            {testResult === 'success' && <Badge variant="secondary" className="text-[8px] bg-green-500 text-white h-4 px-1.5 border-none">LINKED</Badge>}
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 bg-muted/20 border-t border-border/40 gap-3">
                    <Button
                        variant="ghost"
                        className="flex-1 h-9 text-[10px] font-black uppercase italic tracking-[0.2em] opacity-60 hover:opacity-100 hover:bg-primary/5 hover:text-primary transition-all"
                        onClick={handleTest}
                        disabled={loading}
                    >
                        <FlaskConical size={14} className="mr-2" />
                        Dry Run
                    </Button>
                    <div className="flex gap-2 flex-1">
                        <Button variant="ghost" className="flex-1 h-9 text-[10px] font-black uppercase tracking-widest" onClick={onClose}>
                            Esc
                        </Button>
                        <Button
                            className="flex-1 h-9 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={handleSave}
                            disabled={loading || !name.trim()}
                        >
                            <Save size={14} className="mr-2" />
                            DEPLOY
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
