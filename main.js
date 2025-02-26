// IIFE
(() => {

  // create map in Leaflet and tie it to the div called 'theMap'
  let map = L.map('theMap').setView([44.650627, -63.597140], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const icons = {};
  
  for (let i = 1; i <= 10; i++) {
    icons[i] = L.icon({
      iconUrl: `bus${i}.png`,
      iconSize: [16, 40],
      iconAnchor: [8, 20]
    });
  }


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
            if (currentBusIds.includes(id) == false) {
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
  map.on("zoomend", function() {
    const baseZoom = 15;
    const currentZoom = map.getZoom();
    const scaleFactor = currentZoom / baseZoom;

    Object.keys(icons).map(key => {
       let icon = icons[key];
       icon.options.iconSize = [16 * scaleFactor, 40 * scaleFactor];
       icon.options.iconAnchor = [8 * scaleFactor, 20 * scaleFactor];
       return icon;
    });

    Object.keys(busMarkers).map(busId => {
       let marker = busMarkers[busId];
       marker.setIcon(marker.options.icon);
       return marker;
    });
  });

  updateBuses();
  setInterval(updateBuses, 5000);

})();
