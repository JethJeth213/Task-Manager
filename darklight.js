document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.querySelector('.app-button');
    let isLight = false;

    function setLightTheme() {
        const root = document.documentElement;
        root.style.setProperty('--primary-color', '#3b82f6');
        root.style.setProperty('--primary-dark', '#60a5fa');
        root.style.setProperty('--secondary-color', '#b6e0fe');
        root.style.setProperty('--accent-color', '#4cc9f0');
        root.style.setProperty('--danger-color', '#ef233c');
        root.style.setProperty('--success-color', '#06d6a0');
        root.style.setProperty('--warning-color', '#ffd166');
        root.style.setProperty('--light-color', '#ffffff');
        root.style.setProperty('--dark-color', '#232526');
        root.style.setProperty('--gray-color', '#adb5bd');
        root.style.setProperty('--light-gray', '#f1f3f5');
        root.style.setProperty('--gray', '#e9ecef');
        root.style.setProperty('--box-shadow', '0 4px 12px #bfc9d1');
        document.body.style.backgroundColor = 'var(--gray)';
        document.body.style.color = 'var(--dark-color)';
    }

    
});