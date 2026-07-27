(function () {
    // Read saved theme from LocalStorage or fallback to 'apple'
    const savedTheme = localStorage.getItem('babarock_theme') || 'apple';
    document.body.setAttribute('data-theme', savedTheme);

    // Initialize setup form bindings if on setup.html
    document.addEventListener("DOMContentLoaded", () => {
        const themeSelector = document.getElementById("themeSelect");
        if (themeSelector) {
            themeSelector.value = savedTheme;
            themeSelector.addEventListener("change", (e) => {
                const selected = e.target.value;
                document.body.setAttribute('data-theme', selected);
                localStorage.setItem('babarock_theme', selected);
            });
        }
    });
})();
