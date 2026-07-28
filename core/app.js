class BandAppController {
    constructor() {
        this.config = {};
        this.currentTheme = localStorage.getItem("band_app_theme") || "base";
        this.init();
    }

    async init() {
        // Apply theme immediately on load to prevent flash of unstyled content
        this.applyTheme(this.currentTheme);

        try {
            const res = await fetch("config.json");
            if (res.ok) {
                this.config = await res.json();
                // If config specifies a theme and local storage isn't set, respect config
                if (this.config.active_theme && !localStorage.getItem("band_app_theme")) {
                    this.currentTheme = this.config.active_theme;
                    this.applyTheme(this.currentTheme);
                }
            }
        } catch (e) {
            console.warn("BandApp: Running in local fallback mode (config.json unavailable).");
        }
    }

    applyTheme(themeKey) {
        this.currentTheme = themeKey;
        document.documentElement.setAttribute("data-theme", themeKey);
        
        // Apply inline design token mappings for absolute cross-browser reliability
        const root = document.documentElement;
        if (themeKey === 'hero') {
            root.style.setProperty('--bg-primary', '#000000');
            root.style.setProperty('--bg-secondary', '#121212');
            root.style.setProperty('--bg-surface', 'rgba(20, 20, 20, 0.85)');
            root.style.setProperty('--border-color', 'rgba(255, 59, 48, 0.3)');
            root.style.setProperty('--text-main', '#ffffff');
            root.style.setProperty('--text-muted', '#a0a0a5');
            root.style.setProperty('--accent-color', '#ff3b30');
            root.style.setProperty('--font-family', '"Oswald", sans-serif');
            root.style.setProperty('--header-transform', 'uppercase');
            root.style.setProperty('--card-radius', '8px');
        } else if (themeKey === 'rams') {
            root.style.setProperty('--bg-primary', '#f4f4f0');
            root.style.setProperty('--bg-secondary', '#e8e8df');
            root.style.setProperty('--bg-surface', 'rgba(255, 255, 255, 0.9)');
            root.style.setProperty('--border-color', '#d0d0c8');
            root.style.setProperty('--text-main', '#111111');
            root.style.setProperty('--text-muted', '#555555');
            root.style.setProperty('--accent-color', '#e55a00');
            root.style.setProperty('--font-family', '"Courier New", Courier, monospace');
            root.style.setProperty('--header-transform', 'none');
            root.style.setProperty('--card-radius', '4px');
        } else {
            // Default: Base (Apple Clean)
            root.style.setProperty('--bg-primary', '#0d1117');
            root.style.setProperty('--bg-secondary', '#161b22');
            root.style.setProperty('--bg-surface', 'rgba(22, 27, 34, 0.85)');
            root.style.setProperty('--border-color', '#30363d');
            root.style.setProperty('--text-main', '#c9d1d9');
            root.style.setProperty('--text-muted', '#8b949e');
            root.style.setProperty('--accent-color', '#1f6feb');
            root.style.setProperty('--font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
            root.style.setProperty('--header-transform', 'none');
            root.style.setProperty('--card-radius', '12px');
        }
    }

    saveThemeSelection(themeKey) {
        localStorage.setItem("band_app_theme", themeKey);
        this.applyTheme(themeKey);
    }
}

// Global initialization
window.BandApp = new BandAppController();
