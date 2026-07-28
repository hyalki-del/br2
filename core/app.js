/**
 * Band Dashboard — Central Core Engine & Theme Hydrator
 * Manages global application state, theme token injections, and sheet sync.
 */

(function () {
    'use strict';

    window.BandApp = {
        config: null,
        activeTheme: 'base',

        // CSS Design Token Definitions
        themes: {
            hero: {
                name: "hero",
                label: "Hero (Cinematic / Marvel Style)",
                variables: {
                    "--bg-primary": "#0b0e14",
                    "--bg-secondary": "#151922",
                    "--bg-surface": "#1e2430",
                    "--text-main": "#f0f4f8",
                    "--text-muted": "#8a99ad",
                    "--accent-color": "#e63946",
                    "--accent-hover": "#ff4d5a",
                    "--border-color": "#2a3447",
                    "--font-family": "'Oswald', 'Trebuchet MS', sans-serif",
                    "--card-radius": "4px",
                    "--box-shadow": "0 8px 24px rgba(230, 57, 70, 0.25)",
                    "--header-transform": "uppercase"
                }
            },
            base: {
                name: "base",
                label: "Base (Apple Designer Style)",
                variables: {
                    "--bg-primary": "#f5f5f7",
                    "--bg-secondary": "#ffffff",
                    "--bg-surface": "rgba(255, 255, 255, 0.8)",
                    "--text-main": "#1d1d1f",
                    "--text-muted": "#86868b",
                    "--accent-color": "#0071e3",
                    "--accent-hover": "#0077ed",
                    "--border-color": "#d2d2d7",
                    "--font-family": "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif",
                    "--card-radius": "16px",
                    "--box-shadow": "0 4px 20px rgba(0, 0, 0, 0.08)",
                    "--header-transform": "none"
                }
            },
            rams: {
                name: "rams",
                label: "Rams (Dieter Rams / Braun Industrial)",
                variables: {
                    "--bg-primary": "#e8e6e1",
                    "--bg-secondary": "#dedbc",
                    "--bg-surface": "#f2f0eb",
                    "--text-main": "#1a1a1a",
                    "--text-muted": "#666666",
                    "--accent-color": "#ff4500", // Signal Orange
                    "--accent-hover": "#e03e00",
                    "--border-color": "#1a1a1a",
                    "--font-family": "'Courier New', Courier, monospace",
                    "--card-radius": "0px",
                    "--box-shadow": "none",
                    "--header-transform": "uppercase"
                }
            }
        },

        /**
         * System Bootstrapper
         */
        async init() {
            console.log("[BandApp] Initializing runtime kernel...");
            
            // 1. Fetch config.json
            try {
                const res = await fetch("config.json");
                if (res.ok) {
                    this.config = await res.json();
                    console.log("[BandApp] Loaded config.json successfully.");
                } else {
                    console.warn("[BandApp] config.json not found or unreadable.");
                }
            } catch (err) {
                console.warn("[BandApp] Local config fetch failed:", err);
            }

            // 2. Determine initial theme (cached local -> config -> default base)
            const cachedTheme = localStorage.getItem("band_app_theme");
            const configTheme = this.config ? this.config.active_theme : null;
            const themeToApply = cachedTheme || configTheme || "base";

            this.applyTheme(themeToApply);

            // 3. Sync theme state asynchronously with Google Sheets if API URL is available
            if (this.config && this.config.google_sheets_api_url) {
                this.fetchRemoteTheme();
            }
        },

        /**
         * Inject CSS Custom Properties into Document Root
         */
        applyTheme(themeKey) {
            const theme = this.themes[themeKey] || this.themes.base;
            this.activeTheme = theme.name;
            localStorage.setItem("band_app_theme", theme.name);

            const root = document.documentElement;
            Object.entries(theme.variables).forEach(([prop, val]) => {
                root.style.setProperty(prop, val);
            });

            document.body.setAttribute("data-theme", theme.name);
            console.log(`[BandApp] Applied theme: ${theme.name}`);
        },

        /**
         * Save Theme selection to Google Sheets DB
         */
        async saveThemeSelection(themeKey) {
            this.applyTheme(themeKey);

            if (!this.config || !this.config.google_sheets_api_url) {
                console.warn("[BandApp] Google Sheets API URL not configured. Theme saved locally.");
                return;
            }

            const payload = {
                action: "updateBandInfo",
                payload: {
                    BandName: this.config.band_name || "My Band",
                    ActiveTheme: themeKey,
                    LastUpdated: new Date().toISOString()
                }
            };

            try {
                await fetch(this.config.google_sheets_api_url, {
                    method: "POST",
                    headers: { "Content-Type": "text/plain;charset=utf-8" },
                    body: JSON.stringify(payload)
                });
                console.log("[BandApp] Remote theme updated in Google Sheets.");
            } catch (err) {
                console.error("[BandApp] Failed updating remote theme:", err);
            }
        },

        /**
         * Fetch active theme state from Google Sheets
         */
        async fetchRemoteTheme() {
            try {
                const res = await fetch(`${this.config.google_sheets_api_url}?action=readTab&tab=band-info`);
                const json = await res.json();
                if (json.status === "success" && json.data.length > 0) {
                    const remoteTheme = json.data[0].ActiveTheme;
                    if (remoteTheme && this.themes[remoteTheme] && remoteTheme !== this.activeTheme) {
                        this.applyTheme(remoteTheme);
                    }
                }
            } catch (err) {
                console.warn("[BandApp] Could not fetch remote theme:", err);
            }
        }
    };

    // Auto-boot when DOM is ready
    document.addEventListener("DOMContentLoaded", () => {
        window.BandApp.init();
    });
})();
