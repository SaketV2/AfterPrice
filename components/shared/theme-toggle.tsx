"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const nextTheme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
  const Icon = theme === "light" ? Sun : theme === "dark" ? Moon : Monitor;
  return (
    <Button aria-label={`Colour theme: ${theme}. Switch to ${nextTheme}`} title={`Switch colour theme to ${nextTheme}`} onClick={() => setTheme(nextTheme)} size="icon" variant="ghost">
      <Icon aria-hidden className="h-4 w-4" />
    </Button>
  );
}
