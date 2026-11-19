// Theme support for earlier media-query demo pages.
document.getElementById('miniThemeToggle')?.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-bs-theme', next);
    localStorage.setItem('handsup-theme', next);
});
