// IIFE
(() => {

  // create map in Leaflet and tie it to the div called 'theMap'
  let map = L.map('theMap').setView([44.650627, -63.597140], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const myIcon1 = L.icon({
    iconUrl: 'bus1.png',
    iconSize: [15, 39],
    iconAnchor: [7, 39]
  });

  const myIcon2 = L.icon({
    iconUrl: 'bus2.png',
    iconSize: [15, 39],
    iconAnchor: [7, 39]
  });

  const myIcon3 = L.icon({
    iconUrl: 'bus3.png',
    iconSize: [15, 39],
    iconAnchor: [7, 39]
  });

  const myIcon4 = L.icon({
    iconUrl: 'bus4.png',
    iconSize: [15, 39],
    iconAnchor: [7, 39]
  });

  const myIcon5 = L.icon({
    iconUrl: 'bus5.png',
    iconSize: [15, 39],
    iconAnchor: [7, 39]
  });

  const myIcon6 = L.icon({
    iconUrl: 'bus6.png',
    iconSize: [15, 39],
    iconAnchor: [7, 39]
  });

  const myIcon7 = L.icon({
    iconUrl: 'bus7.png',
    iconSize: [15, 39],
    iconAnchor: [7, 39]
  });

  const myIcon8 = L.icon({
    iconUrl: 'bus8.png',
    iconSize: [15, 39],
    iconAnchor: [7, 39]
  });

  const myIcon9 = L.icon({
    iconUrl: 'bus9.png',
    iconSize: [15, 39],
    iconAnchor: [7, 39]
  });

  const myIcon10 = L.icon({
    iconUrl: 'bus10.png',
    iconSize: [15, 39],
    iconAnchor: [7, 39]
  });

  const icons = {
    1: myIcon1,
    2: myIcon2,
    3: myIcon3,
    4: myIcon4,
    5: myIcon5,
    6: myIcon6,
    7: myIcon7,
    8: myIcon8,
    9: myIcon9,
    10: myIcon10,
  };

  let busMarkers = {};

  function updateBuses() {
    fetch("https://prog2700.onrender.com/hrmbuses")
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(json => {
          // Convert the raw JSON data into a GeoJSON FeatureCollection.
          let geojson = {
            type: "FeatureCollection",
            features: json.entity.map(bus => {
                const lat = bus.vehicle.position.latitude;
                const lng = bus.vehicle.position.longitude;
                const bearing = bus.vehicle.position.bearing;
                const busId = bus.vehicle.vehicle.id;
                const routeId = bus.vehicle.trip.routeId;
                const tripId = bus.vehicle.trip.tripId

                return {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    properties: {
                        busId: busId,
                        routeNumber: routeId,
                        bearing: bearing,
                        tripID : tripId
                    }
                };
            })
          };
  
          const filteredFeatures = geojson.features.filter(feature => {
              const routeNumber = parseInt(feature.properties.routeNumber);
              if (routeNumber >= 1 && routeNumber <= 10){
                  return true;
              }
          });
  
          filteredFeatures.map(feature => {
            const busId = feature.properties.busId;
            const lat = feature.geometry.coordinates[1];
            const lng = feature.geometry.coordinates[0];
            const bearing = feature.properties.bearing;
            const tripID = feature.properties.tripID;
            const routeNumber = parseInt(feature.properties.routeNumber);
            const chosenIcon = icons[routeNumber];
  
            if (busMarkers[busId] != null) {
              busMarkers[busId].setLatLng([lat, lng]);
              busMarkers[busId].setRotationAngle(bearing);
            } else {
              busMarkers[busId] = L.marker([lat, lng], { icon: chosenIcon }).addTo(map);
              busMarkers[busId].setRotationAngle(bearing);
              busMarkers[busId].bindPopup(`<strong>Route:</strong> ${routeNumber}<br/><strong>Bus ID:</strong> ${busId}<br/> <strong>Trip ID:</strong> ${tripID}`);
            }
            return feature;
          });
  
          const currentBusIds = filteredFeatures.map(feature => feature.properties.busId);
          Object.keys(busMarkers).map(id => {
            if (!currentBusIds.includes(id)) {
              map.removeLayer(busMarkers[id]);
              delete busMarkers[id];
            }
            return id;
          });
      })
      .catch(error => {
        console.error("Error fetching or processing data:", error);
      });
  }
  

  updateBuses();
  setInterval(updateBuses, 5000);
})();
