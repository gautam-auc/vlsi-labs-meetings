"use client";

import { useEffect } from "react";

export default function ScrollToTopOnLoad() {
    useEffect(() => {
        if (typeof window !== "undefined") {
            // Disable browser automatically restoring scroll position midway down the page
            if ("scrollRestoration" in window.history) {
                window.history.scrollRestoration = "manual";
            }
            // Ensure window and root elements start strictly from the top (0, 0)
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });

            // In case of any delayed hydration or layout render, verify top alignment
            const timer = setTimeout(() => {
                document.documentElement.scrollTop = 0;
                document.body.scrollTop = 0;
                window.scrollTo({ top: 0, left: 0, behavior: "instant" });
            }, 40);

            return () => clearTimeout(timer);
        }
    }, []);

    return null;
}
