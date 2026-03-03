// --- 1. אתחול המפה ---
const map = L.map('map').setView([31.5, 34.8], 8); // מרכז ישראל

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: ''
}).addTo(map);

// כפתור התמקדות מחדש בישראל
const HomeControl = L.Control.extend({
    options: { position: 'topleft' },
    onAdd: function (map) {
        const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
        const button = L.DomUtil.create('a', 'custom-home-btn', container);
        button.innerHTML = '<i class="fas fa-crosshairs"></i>';
        button.href = '#';
        button.title = 'מרכז על ישראל';

        button.onclick = function (e) {
            e.preventDefault();
            map.flyTo([31.5, 34.8], 8);
        }
        return container;
    }
});
map.addControl(new HomeControl());

const markers = {}; // שומר מרקרים כדי שלא נצייר אותם פעמיים

// שלוחת חיפוש מיקומים
const FALLBACK_CITIES = {
    "תל אביב - יפו": { lat: 32.0853, lng: 34.7818 },
    "ירושלים": { lat: 31.7683, lng: 35.2137 },
    "חיפה": { lat: 32.7940, lng: 34.9896 },
    "באר שבע": { lat: 31.2529, lng: 34.7915 },
    "אשדוד": { lat: 31.8044, lng: 34.6553 },
    "שדרות": { lat: 31.5204, lng: 34.5912 },
    "אשקלון": { lat: 31.6667, lng: 34.5667 },
    "נתיבות": { lat: 31.4222, lng: 34.5958 },
    "קרית שמונה": { lat: 33.2075, lng: 35.5700 },
    "אילת": { lat: 29.5577, lng: 34.9519 }
};

let cityData = FALLBACK_CITIES; // Start with fallback

async function loadCities() {
    try {
        const targetUrl = "https://www.tzevaadom.co.il/static/cities.json?v=";
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&cache=${Date.now()}`;

        const response = await fetch(proxyUrl);
        const data = await response.json();
        const content = JSON.parse(data.contents);

        // Merge fallback with online data if successful
        cityData = { ...FALLBACK_CITIES, ...content.cities };
        console.log("נתוני ערים נטענו בהצלחה מהאינטרנט");
    } catch (e) {
        console.warn("שגיאה בטעינת נתונים מהאינטרנט (CORS/Proxy Error). משתמש בנתוני גיבוי (Fallback).", e);
        // cityData remains as FALLBACK_CITIES
    }
}

loadCities();

// --- 2. לוגיקת ההתראות ---
let Alerts = [];
const alertsList = document.getElementById('alerts-list');

function handleRedAlert(cities, id) {
    // הפיכה למערך אם זו עיר בודדת (תאימות לאחור)
    const citiesArray = Array.isArray(cities) ? cities : [cities];

    // פינוי מסך: אוטומציה לחלון שידורים מרחף (מצמיד אוטומטית אלא אם הוא חסום בנעילה 70%)
    const floatWin = document.getElementById('floating-channel-window');
    if (floatWin && !floatWin.classList.contains('hidden')) {
        if (!floatWin.classList.contains('locked')) {
            floatWin.classList.add('pinned');
        }
    }

    // --- בדיקת התראה אישית (Target City) ---
    const targetCity = localStorage.getItem('targetCity');
    if (targetCity && citiesArray.includes(targetCity)) {
        triggerPersonalAlert(targetCity);
    }

    // שינוי רקע
    document.body.style.setProperty('--background-color', 'var(--alert-color)');

    const cityCoords = [];

    citiesArray.forEach(cityName => {
        // הוספה לרשימה אם לא קיים כבר לאותו מזהה
        if (!Alerts.some(a => a.id === id && a.title === cityName)) {
            addAlertToUI(cityName);
            console.log("התראה חדשה: " + cityName);
            Alerts.push({ id, title: cityName });

            const coords = updateMap(cityName);
            if (coords) cityCoords.push(coords);
        }
    });

    // הגדרת הזום בהתאם למספר אזורים שנמצאו
    if (cityCoords.length > 0) {
        if (cityCoords.length === 1) {
            // זום קרוב עבור עיר בודדת
            map.flyTo(cityCoords[0], 12);
        } else {
            // זום שמתאים לכל האזורים
            const bounds = L.latLngBounds(cityCoords);
            map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 12 });
        }
    } else {
        // אין אזורים - זום אל כל ישראל
        map.flyTo([31.5, 34.8], 8);
    }

    // החזרה למצב רגיל אחרי 40 שניות
    setTimeout(() => {
        document.body.style.setProperty('--background-color', '#121212');
    }, 40000);
}

function triggerPersonalAlert(cityName) {
    const popup = document.getElementById('personal-alert-popup');
    const cityNameSpan = document.getElementById('personal-alert-city-name');
    const closeBtn = document.getElementById('close-personal-alert');

    if (popup && cityNameSpan) {
        cityNameSpan.innerText = cityName;
        popup.classList.remove('hidden');

        // הבהוב מסך (Strobe)
        document.body.classList.add('emergency-strobe');
        setTimeout(() => {
            document.body.classList.remove('emergency-strobe');
        }, 10000); // 10 שניות של הבהוב

        // הפעלת טיימר אוטומטית
        if (window.triggerEmergencyTimer) {
            window.triggerEmergencyTimer();
        }

        closeBtn.onclick = () => {
            popup.classList.add('hidden');
        };
    }
}

// פונקציות סימולציה מיוצאות לחלון הגלובלי (לעבודה מול פאנל ההגדרות)
window.simulateAlert = function () {
    const mockCities = ["תל אביב - יפו", "חיפה", "באר שבע", "ירושלים", "אשדוד", "שדרות", "אשקלון"];
    const target = localStorage.getItem('targetCity') || mockCities[Math.floor(Math.random() * mockCities.length)];

    console.warn("מפעיל סימולציה עבור: " + target);
    handleRedAlert([target], "test-" + Date.now());
};

window.simulateMultiAlert = function () {
    handleRedAlert(["שדרות", "נתיבות", "אשקלון"], "test-multi-" + Date.now());
};

function addAlertToUI(cityName) {
    const alertsList = document.getElementById('alerts-list');
    if (!alertsList) return; // לא בפאנל המתאים כרגע

    if (alertsList.innerHTML.includes("ממתין")) alertsList.innerHTML = "";

    const div = document.createElement('div');
    div.className = 'alert-card';
    div.innerHTML = `
                <div style="font-weight: bold; font-size: 1.2em;">${cityName}</div>
                <div style="font-size: 0.8em; color: #bbb;">${new Date().toLocaleTimeString('he-IL')}</div>
            `;
    alertsList.prepend(div);
}

// פונקציית עזר לריענון הרשימה כשעוברים ל-Mode 4
window.renderAllAlerts = function () {
    const alertsList = document.getElementById('alerts-list');
    if (!alertsList) return;

    alertsList.innerHTML = "";
    if (Alerts.length === 0) {
        alertsList.innerHTML = '<p style="text-align: center; color: #666;">אין התראות כעת</p>';
        return;
    }

    // מציג מהחדש לישן
    [...Alerts].reverse().forEach(alert => {
        const div = document.createElement('div');
        div.className = 'alert-card';
        // הערה: במציאות היינו שומרים גם את הזמן ב-Alerts, כרגע נשים זמן נוכחי או פשוט את השם
        div.innerHTML = `
            <div style="font-weight: bold; font-size: 1.2em;">${alert.title}</div>
            <div style="font-size: 0.8em; color: #bbb;">התקבל</div>
        `;
        alertsList.appendChild(div);
    });
};

function updateMap(cityName) {
    console.log(`DEBUG: updateMap called for: ${cityName}`);

    if (!cityData) {
        console.error("DEBUG: [MAP ERROR] cityData is NULL. Data was not loaded yet.");
        return null;
    }

    let cityInfo = null;

    // Structure 1: cityData is an object with city names as keys
    if (cityData[cityName]) {
        cityInfo = cityData[cityName];
        console.log(`DEBUG: Found ${cityName} directly in object keys.`);
    } else {
        // Structure 2: cityData is an array of objects
        const cityArray = Array.isArray(cityData) ? cityData : Object.values(cityData);
        cityInfo = cityArray.find(c => c.name === cityName || c.label === cityName || c.he === cityName);
        if (cityInfo) console.log(`DEBUG: Found ${cityName} using fuzzy search in array.`);
    }

    if (!cityInfo || !cityInfo.lat || !cityInfo.lng) {
        console.warn(`DEBUG: [MAP ERROR] City "${cityName}" could not be located in database.`);
        return null;
    }

    const coords = [cityInfo.lat, cityInfo.lng];
    console.log(`DEBUG: [MAP SUCCESS] Marking ${cityName} at coords: ${coords}`);

    // יצירת אייקון מותאם אישית מהבהב
    const pulseIcon = L.divIcon({
        className: 'custom-div-icon',
        html: "<div class='alert-marker'></div>",
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    try {
        const marker = L.marker(coords, { icon: pulseIcon }).addTo(map);
        marker.bindPopup(`<b>צבע אדום: ${cityName}</b>`).openPopup();

        // הסרת המרקר אחרי 40 שניות
        setTimeout(() => {
            if (map.hasLayer(marker)) {
                map.removeLayer(marker);
                console.log(`DEBUG: Removed marker for ${cityName}`);
            }
        }, 40000);

        return coords;
    } catch (err) {
        console.error(`DEBUG: [MAP CRITICAL ERROR] Failed to add marker: ${err.message}`);
        return null;
    }
}

// --- 3. משיכת נתונים מה-API ---
async function fetchAlerts() {
    try {
        const targetUrl = "https://api.tzevaadom.co.il/notifications";
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&cache=${Date.now()}`;

        const response = await fetch(proxyUrl);
        const data = await response.json();
        const content = JSON.parse(data.contents);

        if (Array.isArray(content) && content.length > 0) {
            content.forEach(alert => {
                // מעבירים את כל הערים של ההתראה יחד לטיפול
                handleRedAlert(alert.cities, alert.notificationId);
            });
        }
    } catch (e) {
        console.log("סורק...");
    }
    setTimeout(fetchAlerts, 2000);
}

// פונקציית בדיקה כפויה של המפה (עוקף את כל הלוגיקה של הערים)
window.forceMapMarker = function () {
    const telAviv = [32.0853, 34.7818];
    console.warn("מפעיל סימון כפוי על המפה במיקום תל אביב");

    map.flyTo(telAviv, 13);

    const pulseIcon = L.divIcon({
        className: 'custom-div-icon',
        html: "<div class='alert-marker' style='width: 30px; height: 30px; border: 4px solid white;'></div>",
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    const marker = L.marker(telAviv, { icon: pulseIcon }).addTo(map);
    marker.bindPopup(`<b>בדיקת מערכת: סימון כפוי עובד</b>`).openPopup();

    alert("בוצע סימון כפוי של תל אביב על המפה. אם אתה רואה עיגול אדום גדול עם מסגרת לבנה, המפה עובדת תקין.");
};

// Start the polling
loadCities();
fetchAlerts();