// Initial Map Setup
const map = L.map('map').setView([-28.2744, 133.7751], 5);

// 🗺️ SWITCH TO CARTODB TILES (Fixes the "Access Blocked" error)
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

const snagIcon = L.icon({ iconUrl: 'img/snag-marker-v4.svg', iconSize: [40, 40], iconAnchor: [20, 40], popupAnchor: [0, -40] });
const storeIcon = L.icon({ iconUrl: 'img/bunnings-grey.svg', iconSize: [24, 24], iconAnchor: [12, 12], popupAnchor: [0, -12] });
const markerGroup = L.layerGroup().addTo(map);

const stateCenters = {
  NSW: { lat: -33.8688, lng: 151.2093, zoom: 11 },
  VIC: { lat: -37.8136, lng: 144.9631, zoom: 11 },
  QLD: { lat: -27.4698, lng: 153.0251, zoom: 11 },
  SA:  { lat: -34.9285, lng: 138.6007, zoom: 11 },
  WA:  { lat: -31.9505, lng: 115.8605, zoom: 11 },
  TAS: { lat: -42.8821, lng: 147.3272, zoom: 12 },
  NT:  { lat: -12.4634, lng: 130.8456, zoom: 11 },
  ACT: { lat: -35.2809, lng: 149.1300, zoom: 13 }
};

// ADDED THE 'function' KEYWORD HERE
function updateMap(stateFilter = null, searchTerm = "") {
    markerGroup.clearLayers();
    const listElement = document.getElementById('bbq-list');
    if(listElement) listElement.innerHTML = ""; 

    const term = searchTerm.toLowerCase().trim();
    const matchingCoords = []; 

    bunningsStores.forEach(store => {
        const matchesState = stateFilter ? store.state === stateFilter : true;
        const matchesSearch = store.name.toLowerCase().includes(term) || 
                              store.suburb.toLowerCase().includes(term) || 
                              store.postcode.includes(term);

        if (matchesState && matchesSearch) {
            matchingCoords.push([store.lat, store.lng]);
            const event = bbqEvents.find(e => e.storeName === store.name);
            const marker = L.marker([store.lat, store.lng], {
                icon: event ? snagIcon : storeIcon
            }).addTo(markerGroup);
            // See ya! :)
            let popupContent = `<div style="text-align:center"><strong>${store.name}</strong><br>`;
            if (event) {
                popupContent += `<span style="color:#0d5c3d">🌭 ${event.organization}</span><br><small>${event.time}</small>`;
            } else {
                popupContent += `<p>No BBQ reported</p><hr><a href="submit.html?store=${encodeURIComponent(store.name)}&state=${store.state}" style="color:#cf2e2e;font-weight:bold;text-decoration:none;">+ Add BBQ Info</a>`;
            }
            popupContent += `</div>`;
            marker.bindPopup(popupContent);
            marker.on("click", () => {
                map.setView([store.lat, store.lng], 15)
            });

            if (event && listElement) {
                const li = document.createElement('li');
                li.className = 'bbq-item';
                li.innerHTML = `<h3><strong>(${store.state})</strong> ${store.name}</h3><p class="org-name">${event.organization}</p><p><small>⏰ ${event.time}</small></p>`;
                li.onclick = () => {
                    map.setView([store.lat, store.lng], 15);
                    marker.openPopup();
                };
                listElement.appendChild(li);
            }
        }
    });

    // Zoom logic
    if (term.length >= 3 && matchingCoords.length > 0) {
        if (matchingCoords.length === 1) {
            map.setView(matchingCoords[0], 14);
        } else {
            const bounds = L.latLngBounds(matchingCoords);
            map.fitBounds(bounds, { padding: [50, 50] }); 
        }
    }
}

function filterByState(state) {
    const config = stateCenters[state];
    if (config) map.setView([config.lat, config.lng], config.zoom);
    updateMap(state);
}

function resetMap() {
    document.getElementById('search-input').value = "";
    map.setView([-28.2744, 133.7751], 4);
    updateMap();
}

function searchBBQs() {
    updateMap(null, document.getElementById('search-input').value);
}

updateMap();