import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Download, Rocket, X } from 'lucide-react';
import { ApplyUpdate, RestartApp } from "../../wailsjs/go/main/App";

interface UpdateInfo {
    currentVersion: string;
    latestVersion: string;
    releaseNotes: string;
    url: string;
    hasUpdate: boolean;
}

interface Props {
    updateInfo: UpdateInfo;
    onClose: () => void;
}

export function UpdateModal({ updateInfo, onClose }: Props) {
    const [updating, setUpdating] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpdate = async () => {
        setUpdating(true);
        setError(null);
        try {
            await ApplyUpdate(updateInfo.latestVersion);
            setCompleted(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setUpdating(false);
        }
    };

    const handleRestart = async () => {
        try {
            await RestartApp();
        } catch (err) {
            console.error("Failed to restart:", err);
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && !updating && onClose()}>
            <DialogContent className="sm:max-w-[420px] bg-card border-border/40 shadow-2xl p-0 overflow-hidden animate-in zoom-in-95 duration-200">
                <DialogHeader className="p-6 pb-2 bg-primary/5 border-b border-primary/10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-black tracking-tight uppercase italic flex items-center gap-2">
                                Update Available
                                <Badge variant="secondary" className="text-[9px] bg-primary text-primary-foreground h-4 px-1.5 border-none font-black italic">
                                    NEW
                                </Badge>
                            </DialogTitle>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-none mt-1 opacity-60">
                                {updateInfo.currentVersion} → {updateInfo.latestVersion}
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-4">
                    <div className="bg-muted/30 rounded-xl border border-border/40 p-4 max-h-[150px] overflow-y-auto">
                        <h4 className="text-[10px] font-black uppercase text-muted-foreground mb-2 tracking-widest flex items-center gap-2">
                            Release Notes
                        </h4>
                        <div className="text-[11px] font-bold text-foreground/80 leading-relaxed whitespace-pre-wrap">
                            {updateInfo.releaseNotes || "Performance improvements and bug fixes."}
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-bold uppercase tracking-wider text-center">
                            Error: {error}
                        </div>
                    )}

                    {updating && !completed && (
                        <div className="space-y-3 py-2">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-primary">
                                <span>Downloading & Patching...</span>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary animate-progress-indeterminate" />
                            </div>
                        </div>
                    )}

                    {completed && (
                        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-center space-y-2">
                            <p className="text-[11px] font-black uppercase tracking-widest">Update Applied Successfully!</p>
                            <p className="text-[10px] font-bold opacity-80 uppercase leading-tight">Ready to launch the new version.</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 bg-muted/20 border-t border-border/40 gap-3">
                    {!completed ? (
                        <>
                            <Button
                                variant="ghost"
                                className="flex-1 h-9 text-[10px] font-black uppercase tracking-widest"
                                onClick={onClose}
                                disabled={updating}
                            >
                                Not Now
                            </Button>
                            <Button
                                className="flex-1 h-9 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground"
                                onClick={handleUpdate}
                                disabled={updating}
                            >
                                <Download size={14} className="mr-2" />
                                {updating ? "Updating..." : "Update Now"}
                            </Button>
                        </>
                    ) : (
                        <Button
                            className="w-full h-10 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground italic"
                            onClick={handleRestart}
                        >
                            <Rocket size={14} className="mr-2" />
                            RELAUNCH APP
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
