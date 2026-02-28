// js/alerts.js
const ISRAEL_CENTER = [31.5, 34.8];
let map;
let cityData = [];
let activeMarkers = [];
let alertTimeout = null;
let Alerts = []; // Store history for stats

// Alerts iframe links
const one = `<iframe class="alertsUp" height="100%" width="100%" src="https://www.tzevaadom.co.il/"></iframe>`;
const two = `<iframe class="alertsUp" height="100%" width="100%" src="https://hamal.co.il/main"></iframe>`;

async function initAlerts() {
    // Initialize Map
    map = L.map('map', { zoomControl: false }).setView(ISRAEL_CENTER, 8);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

    try {
        const res = await fetch('https://raw.githubusercontent.com/idodaniel/israel-cities-coordinates/master/cities.json');
        cityData = await res.json();
    } catch (e) {
        console.error("Data Load Error");
    }

    // Attach side panel listeners
    const oneAlerts = document.getElementById('oneAlerts');
    const twoAlerts = document.getElementById('twoAlerts');
    const t3Alerts = document.getElementById('t3Alerts');
    const t4Alerts = document.getElementById('t4Alerts');
    const clearBtn = document.getElementById('clearAlerts');
    const alertsContainer = document.getElementById('alerts-content');
    const titleAlert = document.getElementById('titleAlerts');

    oneAlerts.addEventListener("click", () => {
        alertsContainer.innerHTML = one;
        clearBtn.style.display = "none";
        titleAlert.innerHTML = "התראות צופר";
        activateTab(oneAlerts);
    });

    twoAlerts.addEventListener("click", () => {
        alertsContainer.innerHTML = two;
        clearBtn.style.display = "none";
        titleAlert.innerHTML = "מערכת חמל";
        activateTab(twoAlerts);
    });

    t3Alerts.addEventListener("click", () => {
        let html = Alerts.length > 0 ? '' : '<h3 style="text-align:center; color:#666;">אין התראות להצגה</h3>';
        Alerts.forEach(alert => {
            html += `
              <div class="alt" style="margin-bottom: 8px; padding: 10px; border-bottom: 1px solid #333; background: #1a1a1a;">
                <div class="altTitle" style="font-weight: 600; font-size: 1.1em; color: var(--accent-red);">${alert.title}</div>
                <div style="font-size: 0.85em; color: #888;">${alert.time}</div>
              </div>
            `;
        });
        alertsContainer.innerHTML = html;
        titleAlert.innerHTML = "התראות באזורך";
        clearBtn.style.display = "block";
        activateTab(t3Alerts);
    });

    clearBtn.addEventListener("click", () => {
        Alerts = [];
        localStorage.removeItem("storedAlerts");
        alertsContainer.innerHTML = `<h3 style="color: white; text-align: center;">אין התראות להצגה.</h3>`;
    });

    t4Alerts.addEventListener("click", () => {
        if (!Alerts || Alerts.length === 0) {
            alertsContainer.innerHTML = `<h3 style="color: white; text-align: center;">אין נתונים להצגה.</h3>`;
            return;
        }

        const total = Alerts.length;
        const alertsByHour = {};
        Alerts.forEach(alert => {
            const hour = alert.time?.split(':')[0] || 'לא ידוע';
            if (!alertsByHour[hour]) alertsByHour[hour] = 0;
            alertsByHour[hour]++;
        });

        let hourStats = '';
        Object.entries(alertsByHour).forEach(([hour, count]) => {
            hourStats += `<div style="margin: 5px 0;"><b>${hour}:00</b> - ${count} התרעות</div>`;
        });

        alertsContainer.innerHTML = `
            <div dir="rtl" style="color: white; padding: 10px;">
                <h3 style="color: var(--accent-red); text-align: center;">סטטיסטיקת התרעות</h3>
                <div style="margin-bottom:15px;"><b>סה"כ התרעות:</b> ${total}</div>
                <div><b>פיזור לפי שעות:</b>${hourStats}</div>
                
                <div class="range-controls">
                    <button id="resetDesign" class="btn" style="background:#555">אפס עיצוב</button>
                    <input id="height" type="number" placeholder="אורך (rem)">
                    <input id="width" type="number" placeholder="רוחב (rem)">
                </div>
            </div>
        `;

        // Setup stats listeners immediately after innerHTML change
        setupDesignControls();

        titleAlert.innerHTML = "סטטיסטיקה";
        clearBtn.style.display = "none";
        activateTab(t4Alerts);
    });
}

function activateTab(btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

function handleAlerts(cities) {
    if (alertTimeout) clearTimeout(alertTimeout);
    const coords = [];
    const now = new Date().toLocaleTimeString();

    cities.forEach(cityName => {
        const city = cityData.find(c => c.name === cityName);
        if (city) {
            const pos = [city.lat, city.lng];
            coords.push(pos);
            const marker = L.marker(pos, {
                icon: L.divIcon({ className: '', html: '<div class="alert-marker"></div>', iconSize: [30, 30] })
            }).addTo(map);
            activeMarkers.push(marker);
            Alerts.push({ title: cityName, time: now });
        }
    });

    if (coords.length > 0) {
        const bounds = L.latLngBounds(coords);
        map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 11 });
    }

    alertTimeout = setTimeout(() => {
        if (map) map.flyTo(ISRAEL_CENTER, 8, { duration: 1.5 });
        activeMarkers.forEach(m => map.removeLayer(m));
        activeMarkers = [];
    }, 20000);
}

function setupDesignControls() {
    const heightInput = document.getElementById('height');
    const widthInput = document.getElementById('width');
    const resetBtn = document.getElementById('resetDesign');

    if (widthInput) {
        widthInput.addEventListener("input", () => {
            document.body.style.paddingLeft = widthInput.value + "rem";
            document.body.style.paddingRight = widthInput.value + "rem";
        });
    }
    if (heightInput) {
        heightInput.addEventListener("input", () => {
            document.body.style.paddingTop = heightInput.value + "rem";
            document.body.style.paddingBottom = heightInput.value + "rem";
        });
    }
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            document.body.style.height = "100vh";
            document.body.style.padding = "0";
            heightInput.value = "";
            widthInput.value = "";
        });
    }
}

window.initAlerts = initAlerts;
window.handleAlerts = handleAlerts;
window.resetMap = () => map.flyTo(ISRAEL_CENTER, 8);
window.simulateAlert = handleAlerts;
