var link = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2022-06-13&endtime=2022-06-20&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

d3.json(link).then(function (data) {
    console.log(data);
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {
    
    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>
            <p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
    };
  
    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature) {
            var color = "";
            if (feature.geometry.coordinates[2] < 0){
                color = "green"; 
            }
            else if (feature.geometry.coordinates[2] < 15) {
                color = "yellow";
            }
            else if (feature.geometry.coordinates[2] < 30) {
                color = "orange";
            }
            else {
                color = "red";
            };
            markerOptions = {
                weight: 1.5,
                fillOpacity: 0.75,
                color: "black",
                fillColor: color,
                radius: (((feature.properties.mag)+2)**2)/2
            };
            return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], markerOptions);
        }
    });
  
    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
};
  
function createMap(earthquakes) {
  
    // Create the base layers.
    var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Create a baseMaps object.
    var baseMaps = {
        "Street Map": street,
        "Topographic Map": topo
    };
  
    // Create an overlay object to hold our overlay.
    var overlayMaps = {
        Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    var myMap = L.map("map", {
        center: [37.09, -105],
        zoom: 4.5,
        layers: [street, earthquakes]
    });
  
    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Setting up the legend for the map
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function () {
    
        var div = L.DomUtil.create('div', 'info legend'),
            magnitudes = ["<0", "0-15", "15-30", ">30"],
            colors = ["green", "yellow", "orange", "red"];
    
        div.innerHTML = '<h4>Depth (km)</h4>'
        for (var i = 0; i < magnitudes.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colors[i] + '"></i> ' +
                magnitudes[i] + '<br>';
        
        };
        return div;
    };
    legend.addTo(myMap);
};