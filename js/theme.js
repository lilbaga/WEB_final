/* Applies the saved (or system) colour theme before the page is painted, so there is no flash. */
(function () {
    var theme = 'dark';
    try {
        var saved = localStorage.getItem('handsup-theme');
        if (saved === 'light' || saved === 'dark') {
            theme = saved;
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            theme = 'light';
        }
    } catch (e) { /* storage blocked: keep the default dark theme */ }
    document.documentElement.setAttribute('data-bs-theme', theme);
})();
