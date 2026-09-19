"use client";

import { useEffect } from "react";
import { useTheme, type Theme } from "./theme-provider";

export function ThemePreferenceSync({ theme }: { theme: Theme }) {
  const { setTheme } = useTheme();

  useEffect(() => {
    setTheme(theme);
  }, [setTheme, theme]);

  return null;
}
