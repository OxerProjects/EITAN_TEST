// js/main.js

window.currentView = 'map';

function initMain() {
    window.initAlerts();
    window.initMedia();

    // Toggle logic for Map / TV navigation
    const toggle = document.getElementById('view-toggle');
    if (toggle) {
        toggle.onclick = () => {
            const nextView = window.currentView === 'map' ? 'tv' : 'map';
            window.toggleView(nextView);
        };
    }

    // Default view state
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

    // Toggle Content Containers (Switch between Map and Video)
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

window.toggleView = toggleView;
document.addEventListener('DOMContentLoaded', initMain);
