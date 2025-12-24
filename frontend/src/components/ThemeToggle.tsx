import { useTheme, THEME_OPTIONS, PALETTE_OPTIONS } from '../contexts/ThemeContext';
import { Moon, Sun, Monitor, Palette, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

export function ThemeToggle() {
    const { theme, setTheme, colorPalette, setColorPalette, resolvedTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-primary/10"
                >
                    {resolvedTheme === 'dark' ? (
                        <Moon size={16} className="text-primary" />
                    ) : (
                        <Sun size={16} className="text-amber-500" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Theme Mode
                </DropdownMenuLabel>
                {THEME_OPTIONS.map(option => (
                    <DropdownMenuItem
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            {option.value === 'dark' && <Moon size={14} />}
                            {option.value === 'light' && <Sun size={14} />}
                            {option.value === 'system' && <Monitor size={14} />}
                            <span className="text-[11px] font-medium">{option.label}</span>
                        </div>
                        {theme === option.value && <Check size={14} className="text-primary" />}
                    </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Color Palette
                </DropdownMenuLabel>
                <div className="p-2 grid grid-cols-3 gap-2">
                    {PALETTE_OPTIONS.map(option => (
                        <button
                            key={option.value}
                            onClick={() => setColorPalette(option.value)}
                            className={cn(
                                "w-full aspect-square rounded-lg border-2 transition-all hover:scale-110",
                                colorPalette === option.value
                                    ? "ring-2 ring-offset-2 ring-offset-background scale-105"
                                    : "opacity-70 hover:opacity-100"
                            )}
                            style={{
                                backgroundColor: option.color,
                                borderColor: colorPalette === option.value ? option.color : 'transparent',
                                boxShadow: colorPalette === option.value ? `0 0 20px ${option.color}40` : undefined
                            }}
                            title={option.label}
                        >
                            {colorPalette === option.value && (
                                <Check size={16} className="text-white mx-auto" />
                            )}
                        </button>
                    ))}
                </div>
                <div className="px-2 pb-2 text-center">
                    <span className="text-[9px] font-medium text-muted-foreground">
                        {PALETTE_OPTIONS.find(p => p.value === colorPalette)?.label}
                    </span>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
