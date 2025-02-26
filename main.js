(() => {

  // create the map in leaflet and tie it to a div called 'theMap'
  let map = L.map('theMap').setView([44.650627, -63.597140], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // adding the checkboxes to the top right
  const routeControl = L.control({ position: 'topright' });

  routeControl.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'route-control leaflet-bar');
    
    // creates a div containing the checkboxes
    div.innerHTML =
     `<form id="routeFilterForm" style="padding: 10px; background-color:white">
        <label><input type="checkbox" name="route" value="1" checked> Route 1</label><br>
        <label><input type="checkbox" name="route" value="2" checked> Route 2</label><br>
        <label><input type="checkbox" name="route" value="3" checked> Route 3</label><br>
        <label><input type="checkbox" name="route" value="4" checked> Route 4</label><br>
        <label><input type="checkbox" name="route" value="5" checked> Route 5</label><br>
        <label><input type="checkbox" name="route" value="6" checked> Route 6</label><br>
        <label><input type="checkbox" name="route" value="7" checked> Route 7</label><br>
        <label><input type="checkbox" name="route" value="8" checked> Route 8</label><br>
        <label><input type="checkbox" name="route" value="9" checked> Route 9</label><br>
        <label><input type="checkbox" name="route" value="10" checked> Route 10</label>
      </form>`;
    
    return div;
  };

  // add it to the map
  routeControl.addTo(map);

  // return the status of the checked checkboxes as an array called selectedRoutes
  let selectedRoutes = [...document.querySelectorAll("#routeFilterForm input[name='route']:checked")].map(checkbox => checkbox.value);

  document.getElementById("routeFilterForm").addEventListener("change", function() {
      selectedRoutes = [...document.querySelectorAll("#routeFilterForm input[name='route']:checked")]
          .map(checkbox => checkbox.value);
  });

  // initialize icon images for all the busses, add them into an array
  const icons = {};

  for (let i = 1; i <= 10; i++) {
    icons[i] = L.icon({
      iconUrl: `bus${i}.png`,
      iconSize: [16, 40],
      iconAnchor: [8, 20]
    });
  }

  // initialize empty array of objects that will contain the bus info
  let busMarkers = {};

  function updateBuses() {
    fetch("https://prog2700.onrender.com/hrmbuses")
      // error catching
      .then(response => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then(json => {
        // changing json to geojson
          let geojson = {
            type: "FeatureCollection",
            features: json.entity.map(bus => {
                const lat = bus.vehicle.position.latitude;
                const lng = bus.vehicle.position.longitude;
                const bearing = bus.vehicle.position.bearing;
                const busId = bus.vehicle.vehicle.id;
                const routeId = bus.vehicle.trip.routeId;
                const tripId = bus.vehicle.trip.tripId;
                return {
                  // sorting geological data vs non-geological data
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    properties: {
                        busId: busId,
                        routeNumber: routeId,
                        bearing: bearing,
                        tripID: tripId
                    }
                };
            })
          };
  
          // filtering all the bus routes out so we only keep 1 - 10
          const filteredFeatures = geojson.features.filter(feature => {
              const routeNumber = parseInt(feature.properties.routeNumber);
              return (routeNumber >= 1 && routeNumber <= 10);
          });
  

          filteredFeatures.map(feature => {
            const busId = feature.properties.busId;
            const lat = feature.geometry.coordinates[1];
            const lng = feature.geometry.coordinates[0];
            const bearing = feature.properties.bearing;
            const tripID = feature.properties.tripID;

            const routeNumber = parseInt(feature.properties.routeNumber);
            const chosenIcon = icons[routeNumber];
            const parsedRoutes = selectedRoutes.map(item => parseInt(item));

            // if the busses route is one of the ones the user has selected: 
            if (parsedRoutes.includes(routeNumber)) {
              if (busMarkers[busId] != null) {
                // if it already exists, update it
                busMarkers[busId].setLatLng([lat, lng]);
                busMarkers[busId].setRotationAngle(bearing);
              } else {
                // if it doesn't, create it
                busMarkers[busId] = L.marker([lat, lng], { icon: chosenIcon }).addTo(map);
                busMarkers[busId].setRotationAngle(bearing);
                busMarkers[busId].bindPopup(`<strong>Route:</strong> ${routeNumber}<br/><strong>Bus ID:</strong> ${busId}<br/><strong>Trip ID:</strong> ${tripID}`);
                busMarkers[busId].routeNumber = routeNumber;
              }
            } else {
              // if the current bus is not selected by the user
              if (busMarkers[busId] != null) {
                // if it exists, remove it
                map.removeLayer(busMarkers[busId]);
                delete busMarkers[busId];
              }
            }
            return feature;
          });
      })
      // error catching
      .catch(error => {
        console.error("Error fetching or processing data:", error);
      });
  }
  
  // dynamic scaling of bus size based on zoom
  map.on("zoomend", function() {
    const baseZoom = 15;
    const currentZoom = map.getZoom();
    const scaleFactor = currentZoom / baseZoom;

    // modify all icons using a key in relation to their place in the array of objects
    Object.keys(icons).map(key => {
       let icon = icons[key];
       icon.options.iconSize = [16 * scaleFactor, 40 * scaleFactor];
       icon.options.iconAnchor = [8 * scaleFactor, 20 * scaleFactor];
       return icon;
    });

    // set the newly modified icons to each bus using the busMarkers array of objects and the busId as the key
    Object.keys(busMarkers).map(busId => {
       let marker = busMarkers[busId];
       marker.setIcon(marker.options.icon);
       return marker;
    });
  });

  // call the main function once at startup to display everything properly
  updateBuses()

  // call the main function again, with a repeating interval of fetching every 5 seconds
  setInterval(updateBuses, 5000);

})();
