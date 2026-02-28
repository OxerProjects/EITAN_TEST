// js/alerts.js
const ISRAEL_CENTER = [31.5, 34.8];
let map;
let cityData = [];
let activeMarkers = [];
let alertTimeout = null;

async function initAlerts() {
    // Initialize Map
    map = L.map('map', { zoomControl: false }).setView(ISRAEL_CENTER, 8);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

    // Load City Data
    try {
        const res = await fetch('https://raw.githubusercontent.com/idodaniel/israel-cities-coordinates/master/cities.json');
        cityData = await res.json();
        console.log("נתוני ערים נטענו");
    } catch (e) {
        console.error("שגיאה בטעינת נתונים");
    }

    // Start Polling
    poll();
}

function resetView() {
    if (map) map.flyTo(ISRAEL_CENTER, 8, { duration: 1.5 });
}

function searchCity() {
    const val = document.getElementById('citySearch').value;
    const city = cityData.find(c => c.name.includes(val));
    if (city) {
        if (window.currentView !== 'map') {
            window.toggleView('map');
        }
        map.flyTo([city.lat, city.lng], 13);
        L.popup().setLatLng([city.lat, city.lng]).setContent(`<b>${city.name}</b>`).openOn(map);
    } else {
        alert("עיר לא נמצאה");
    }
}

function handleAlerts(cities) {
    if (alertTimeout) clearTimeout(alertTimeout);

    const coords = [];
    const list = document.getElementById('alerts-list');
    if (list.innerHTML.includes("אין התראות")) list.innerHTML = "";

    cities.forEach(cityName => {
        const city = cityData.find(c => c.name === cityName);
        if (city) {
            const pos = [city.lat, city.lng];
            coords.push(pos);

            // Create Marker
            const marker = L.marker(pos, {
                icon: L.divIcon({ className: '', html: '<div class="alert-marker"></div>', iconSize: [30,30] })
            }).addTo(map);
            activeMarkers.push(marker);

            // Update UI
            const card = document.createElement('div');
            card.className = 'alert-card';
            card.innerHTML = `<b>${cityName}</b><br><small>${new Date().toLocaleTimeString()}</small>`;
            list.insertBefore(card, list.firstChild);
        }
    });

    // Camera follow
    if (coords.length > 0) {
        if (window.currentView !== 'map') {
            // Optional: Notify user or switch to map
        }
        const bounds = L.latLngBounds(coords);
        map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 11 });
    }

    // Auto zoom out
    alertTimeout = setTimeout(() => {
        resetView();
        activeMarkers.forEach(m => map.removeLayer(m));
        activeMarkers = [];
    }, 20000);
}

function simulateAlert(cities) {
    handleAlerts(cities);
}

async function poll() {
    // Implement actual API fetch here if needed
    setTimeout(poll, 2000);
}

// Export for main
window.initAlerts = initAlerts;
window.resetView = resetView;
window.searchCity = searchCity;
window.simulateAlert = simulateAlert;
