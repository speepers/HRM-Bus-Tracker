(() => {

  // create the map in leaflet and tie it to a div called 'theMap'
  let map = L.map('theMap').setView([44.650627, -63.597140], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // adding the checkboxes to the top right
  const routeControl = L.control({ position: 'topright' });

  routeControl.onAdd = function() {
    const div = L.DomUtil.create('div', 'route-control leaflet-bar');
    
    // creates a div containing the checkboxes
    div.innerHTML =
     `<form id="routeFilterForm" style="padding: 10px; background-color:white">
        <input type="button" id="button" onClick="checkAll(true);" value="Check All">
        <input type="button" id="button" onClick="checkAll(false);" value="Clear All"><br>
        <label><input type="checkbox" name="route" value="1" checked> Route 1</label>
        <label><input type="checkbox" name="route" value="2" checked> Route 2</label><br>
        <label><input type="checkbox" name="route" value="3" checked> Route 3</label>
        <label><input type="checkbox" name="route" value="4" checked> Route 4</label><br>
        <label><input type="checkbox" name="route" value="5" checked> Route 5</label>
        <label><input type="checkbox" name="route" value="6" checked> Route 6</label><br>
        <label><input type="checkbox" name="route" value="7" checked> Route 7</lable>
        <label><input type="checkbox" name="route" value="8" checked> Route 8</label><br>
        <label><input type="checkbox" name="route" value="9" checked> Route 9</label>
        <label><input type="checkbox" name="route" value="10" checked> Route 10</label><br>
        <label><input type="checkbox" name="route" value="21" checked> Route 21</label>
        <label><input type="checkbox" name="route" value="22" checked> Route 22</label><br>
        <label><input type="checkbox" name="route" value="24" checked> Route 24</label>
        <label><input type="checkbox" name="route" value="25" checked> Route 25</label><br>
        <label><input type="checkbox" name="route" value="26" checked> Route 26</label>
        <label><input type="checkbox" name="route" value="28" checked> Route 28</label><br>
        <label><input type="checkbox" name="route" value="29" checked> Route 29</label>
        <label><input type="checkbox" name="route" value="30" checked> Route 30</label><br>
        <label><input type="checkbox" name="route" value="39" checked> Route 39</label>
        <label><input type="checkbox" name="route" value="50" checked> Route 50</label><br>
        <label><input type="checkbox" name="route" value="51" checked> Route 51</label>
        <label><input type="checkbox" name="route" value="53" checked> Route 53</label><br>
        <label><input type="checkbox" name="route" value="54" checked> Route 54</label>
        <label><input type="checkbox" name="route" value="55" checked> Route 55</label><br>
        <label><input type="checkbox" name="route" value="56" checked> Route 56</label>
        <label><input type="checkbox" name="route" value="58" checked> Route 58</label><br>
        <label><input type="checkbox" name="route" value="59" checked> Route 59</label>
        <label><input type="checkbox" name="route" value="61" checked> Route 61</label><br>
        <label><input type="checkbox" name="route" value="62" checked> Route 62</label>
        <label><input type="checkbox" name="route" value="63" checked> Route 63</label><br>
        <label><input type="checkbox" name="route" value="64" checked> Route 64</label>
        <label><input type="checkbox" name="route" value="65" checked> Route 65</label><br>
        <label><input type="checkbox" name="route" value="67" checked> Route 67</label>
        <label><input type="checkbox" name="route" value="68" checked> Route 68</label><br>
        <label><input type="checkbox" name="route" value="72" checked> Route 72</label>
        <label><input type="checkbox" name="route" value="82" checked> Route 82</label><br>
        <label><input type="checkbox" name="route" value="83" checked> Route 83</label>
        <label><input type="checkbox" name="route" value="84" checked> Route 84</label><br>
        <label><input type="checkbox" name="route" value="85" checked> Route 85</label>
        <label><input type="checkbox" name="route" value="86" checked> Route 86</label><br>
        <label><input type="checkbox" name="route" value="87" checked> Route 87</label>
        <label><input type="checkbox" name="route" value="88" checked> Route 88</label><br>
        <label><input type="checkbox" name="route" value="90" checked> Route 90</label>
        <label><input type="checkbox" name="route" value="91" checked> Route 91</label><br>
        <label><input type="checkbox" name="route" value="93" checked> Route 93</label>
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

  // Function to update the selectedRoutes variable based on currently checked boxes.
  function updateSelectedRoutes() {
    selectedRoutes = [...document.querySelectorAll("#routeFilterForm input[name='route']:checked")]
        .map(checkbox => checkbox.value);
    // Optionally, do something with selectedRoutes here (like re-filtering your data).
  }

  // Modify checkAll to call updateSelectedRoutes once it has finished toggling checkboxes.
  window.checkAll = function(checkEm) {
    const checkboxes = document.getElementsByTagName('input');
    for (let i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i].type === 'checkbox' && checkboxes[i].name === 'route') {
        checkboxes[i].checked = checkEm;
      }
    }
    // Update the selectedRoutes variable after changing the checkboxes.
    updateSelectedRoutes();
  };


  // initialize icon images for all the busses, add them into an array
  const icons = {};

  for (let i = 1; i <= 93; i++) {
    icons[i] = L.icon({
      iconUrl: `bus icons/bus${i}.png`,
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
              return (routeNumber >= 1 && routeNumber <= 93);
          });
  

          filteredFeatures.map(feature => {
            const busId = feature.properties.busId;
            const lat = feature.geometry.coordinates[1];
            const lng = feature.geometry.coordinates[0];
            const bearing = feature.properties.bearing;
            const tripID = feature.properties.tripID;

            const routeNumber = parseInt(feature.properties.routeNumber);

            for (let i = 1; i <= 93; i++) {
              chosenIcon = icons[routeNumber]
            }

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
