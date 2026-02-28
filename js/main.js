// js/main.js

window.currentView = 'map';

function initMain() {
    // Correct order of initialization
    window.initAlerts();
    window.initMedia();

    // Toggle logic
    const toggle = document.getElementById('view-toggle');
    if (toggle) {
        toggle.onclick = () => {
            const nextView = window.currentView === 'map' ? 'tv' : 'map';
            window.toggleView(nextView);
        };
    }

    // Set map as default view
    window.toggleView('map');
}

function toggleView(view) {
    window.currentView = view;

    // Update Toggle UI
    const toggle = document.getElementById('view-toggle');
    if (view === 'tv') {
        toggle.classList.add('tv-active');
    } else {
        toggle.classList.remove('tv-active');
    }

    // Toggle Content Containers
    const mapContainer = document.getElementById('map-view');
    const tvContainer = document.getElementById('tv-view');

    if (view === 'tv') {
        mapContainer.classList.remove('active');
        tvContainer.classList.add('active');
    } else {
        tvContainer.classList.remove('active');
        mapContainer.classList.add('active');
    }
}

// Global Exports
window.toggleView = toggleView;

// Run when everything is loaded
document.addEventListener('DOMContentLoaded', initMain);
