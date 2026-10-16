"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("vlsi_theme") as Theme | null;
            if (stored === "light" || stored === "dark") {
                return stored;
            }
            if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                return "dark";
            }
        }
        return "light";
    });

    const applyTheme = useCallback((t: Theme) => {
        const root = document.documentElement;
        if (t === "dark") {
            root.classList.add("dark");
            root.classList.remove("light");
            root.style.colorScheme = "dark";
        } else {
            root.classList.remove("dark");
            root.classList.add("light");
            root.style.colorScheme = "light";
        }
    }, []);

    useEffect(() => {
        applyTheme(theme);
    }, [theme, applyTheme]);

    const setTheme = (t: Theme) => {
        setThemeState(t);
        if (typeof window !== "undefined") {
            localStorage.setItem("vlsi_theme", t);
        }
        applyTheme(t);
    };

    const toggleTheme = () => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        setTheme(nextTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
