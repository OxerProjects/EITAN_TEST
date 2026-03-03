// הנחה: המשתנה 'map' מזוהה גלובלית מהקובץ alerts.js

// --- 1. שכבת מזג אוויר ורדאר (ענן ומכ"ם גשם) באמצעות RainViewer API חינמי ---
let weatherLayer = null;

async function toggleWeather(show) {
    if (show) {
        try {
            // קבלת המידע העדכני ביותר על הרדאר מ-RainViewer
            const response = await fetch('https://api.rainviewer.com/public/weather-maps.json');
            const data = await response.json();
            const lastObservation = data.radar.past[data.radar.past.length - 1]; // מצב הרדאר העדכני ביותר

            if (lastObservation) {
                weatherLayer = L.tileLayer(`https://tilecache.rainviewer.com${lastObservation.path}/256/{z}/{x}/{y}/2/1_1.png`, {
                    opacity: 0.6,
                    zIndex: 10,
                    attribution: 'Weather data © RainViewer'
                }).addTo(map);
            }
        } catch (error) {
            console.error("שגיאה בטעינת מכ\"ם מזג אוויר:", error);
        }
    } else {
        if (weatherLayer) {
            map.removeLayer(weatherLayer);
            weatherLayer = null;
        }
    }
}

// --- 2. שכבת מטוסים נוכחיים באמצעות OpenSky Network ---
let flightMarkers = L.layerGroup();
let flightInterval;

async function fetchFlights() {
    try {
        // משיכת גבולות המפה הנוכחיים כדי להראות מטוסים בכל אזור בעולם שבו המשתמש מסתכל
        const bounds = map.getBounds();
        let lamin = bounds.getSouth();
        let lomin = bounds.getWest();
        let lamax = bounds.getNorth();
        let lomax = bounds.getEast();

        // הגבלת הגבולות כדי למנוע שגיאות API אם מתרחקים יותר מדי בטעות
        lamin = Math.max(-90, lamin); lamax = Math.min(90, lamax);
        lomin = Math.max(-180, lomin); lomax = Math.min(180, lomax);

        const response = await fetch(`https://opensky-network.org/api/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`);

        if (!response.ok) {
            throw new Error(`שגיאת רשת ${response.status}`);
        }

        const data = await response.json();
        flightMarkers.clearLayers(); // ניקוי מטוסים קודמים

        if (data && data.states) {
            // הגבלת כמות המטוסים שמוצגים כדי למנוע קריסה של הדפדפן אם מרחיקים את המפה לכלות העולם
            const planesToShow = data.states.slice(0, 1500);

            planesToShow.forEach(flight => {
                const lon = flight[5];
                const lat = flight[6];
                const callsign = flight[1] ? flight[1].trim() : "לא ידוע";
                const altitude = flight[7] || "לא ידוע";
                const heading = flight[10] || 0; // כיוון טיסה
                const speed = flight[9] ? Math.round(flight[9] * 3.6) : "לא ידוע"; // המרה מ מ/ש ל קמ"ש

                if (lat && lon) {
                    // אייקון שפונה לכיוון הטיסה
                    const icon = L.divIcon({
                        html: `<div style="transform: rotate(${heading - 45}deg);"><i class="fas fa-plane" style="color: #ffaa00; font-size: 20px; filter: drop-shadow(0px 0px 3px rgba(255, 170, 0, 0.8));"></i></div>`,
                        iconSize: [24, 24],
                        className: 'clear-flight-icon'
                    });

                    const marker = L.marker([lat, lon], { icon: icon })
                        .bindPopup(`
                            <div dir="rtl">
                                <b>טיסה:</b> ${callsign}<br>
                                <b>גובה:</b> ${altitude} מטר<br>
                                <b>מהירות:</b> ${speed} קמ"ש
                            </div>
                        `);
                    flightMarkers.addLayer(marker);
                }
            });
        }
    } catch (error) {
        console.error("שגיאה בטעינת נתוני טיסות - הערה: OpenSky החינמי מאפשר משיכה מוגבלת מאוד של פעמים.", error);
    }
}

function toggleFlights(show) {
    if (show) {
        map.addLayer(flightMarkers);
        fetchFlights(); // טעינה ראשונית מיידית
        flightInterval = setInterval(fetchFlights, 10000); // רענון כל 10 שניות
    } else {
        map.removeLayer(flightMarkers);
        if (flightInterval) {
            clearInterval(flightInterval);
        }
    }
}

// --- 3. שכבת רעידות אדמה עולמית באמצעות USGS API בזמן אמת ---
let earthQuakeLayer = L.layerGroup();
let earthquakeInterval;

async function fetchEarthquakes() {
    try {
        const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson');
        const data = await response.json();

        earthQuakeLayer.clearLayers();

        data.features.forEach(eq => {
            const coords = eq.geometry.coordinates; // [lon, lat, depth]
            const properties = eq.properties;
            const mag = properties.mag;

            // מראה רעידות אדמה בעלות עוצמה שמורגשת כדי לא להעמיס מדיי
            if (mag >= 2.0) {
                // דירוג צבע לפי עוצמה
                let color = "#ffcc00"; // צהוב לחלש
                if (mag >= 4.0) color = "#ff6600"; // כתום
                if (mag >= 6.0) color = "#ff0000"; // אדום לחזק

                const circle = L.circleMarker([coords[1], coords[0]], {
                    radius: Math.max(mag * 2.5, 5),
                    fillColor: color,
                    color: color,
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.5
                }).bindPopup(`
                    <div dir="rtl">
                        <b>עוצמה דרגה:</b> ${mag}<br>
                        <b>מיקום:</b> ${properties.place}<br>
                        <b>זמן:</b> ${new Date(properties.time).toLocaleString('he-IL')}
                    </div>
                `);

                earthQuakeLayer.addLayer(circle);
            }
        });
    } catch (e) {
        console.error("שגיאה במשיכת נתוני רעידות אדמה", e);
    }
}

function toggleEarthquakes(show) {
    if (show) {
        map.addLayer(earthQuakeLayer);
        fetchEarthquakes(); // קריאה ראשונית מופעלת מייד
        // רענון אוטומטי מ- USGS
        earthquakeInterval = setInterval(fetchEarthquakes, 5 * 60000);
    } else {
        map.removeLayer(earthQuakeLayer);
        if (earthquakeInterval) clearInterval(earthquakeInterval);
    }
}

// --- מאזיני אירועים לתפריט ממשק ה-HTML ---
document.getElementById('layer-weather').addEventListener('change', (e) => toggleWeather(e.target.checked));
document.getElementById('layer-flights').addEventListener('change', (e) => toggleFlights(e.target.checked));
document.getElementById('layer-earthquakes').addEventListener('change', (e) => toggleEarthquakes(e.target.checked));
