"use client";

import {Button} from "@/components/ui/button";
import {Moon, Sun} from "lucide-react";
import {useTheme} from "next-themes";
import {cn} from "@/lib/utils";

export function ThemeToggle({className}: { className?: string }) {
    const {setTheme, theme} = useTheme();
    return (
        <Button
            className={cn(className)}
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
            <Sun className="h-[1.5rem] w-[1.3rem] dark:hidden"/>
            <Moon className="hidden h-5 w-5 dark:block"/>
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
