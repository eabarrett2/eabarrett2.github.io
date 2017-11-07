////////////////////////////////////////////////////////////////////////////////
// initialize the map
var coords = [37.8, -96]; // map center point
var zoom = 5; // map zoom level lower number is out higher number is in
var map = L.map('map').setView(coords, zoom); // put it all together

////////////////////////////////////////////////////////////////////////////////
// load a basemap tile layer
L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, Data by <a href="https://cdflint.github.io/">Carl Flint</a>'
}).addTo(map);

////////////////////////////////////////////////////////////////////////////////
// control that shows state info on hover
var info = L.control();

info.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'info');
  this.update();
  return this._div;
};

info.update = function(props) {
  this._div.innerHTML = '<h4>US Homelessness Rates 2013</h4>' + (props ?
    '<b>' + props.name + '</b><br />' + props.homelessness + ' people / mi<sup>2</sup>' :
    'Hover over a state');
};

info.addTo(map);

////////////////////////////////////////////////////////////////////////////////
// get color depending on homeless rates
function getColor(h) {
  return h > 0.51 ? '#800026' :
    h > 0.41 ? '#BD0026' :
    h > 0.31 ? '#E31A1C' :
    h > 0.21 ? '#FC4E2A' :
    h > 0.11 ? '#FD8D3C' :
    h > 0 ? '#FED976' :
    '#FFEDA0';
}
// set color of the json based on its percentage of homeless population
function style(feature) {
  return {
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7,
    fillColor: getColor(feature.properties.homelessness)
  };
}
// highlightFeature function
function highlightFeature(e) {
  var layer = e.target;

  layer.setStyle({
    weight: 5,
    color: '#666',
    dashArray: '',
    fillOpacity: 0.7
  });

  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    layer.bringToFront();
  }

  info.update(layer.feature.properties);
}

var geojson;
// reset previously highlighted feature function
function resetHighlight(e) {
  geojson.resetStyle(e.target);
  info.update();
}
// zoom to feature function
function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}
// tie functions to DOM events like onClick etc.
function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: resetHighlight,
    click: zoomToFeature
  });
}
// specify the functions will execute on statesData
geojson = L.geoJson(statesData, {
  style: style,
  onEachFeature: onEachFeature
}).addTo(map);

////////////////////////////////////////////////////////////////////////////////
// customize map attribution in lower left corner
map.attributionControl.addAttribution('Homelessness Rates in the US in 2013 &copy; <a href="https://www.hudexchange.info">US Department of Housing and Urban Development</a>');

////////////////////////////////////////////////////////////////////////////////
// add legend layer to map at the given position
var legend = L.control({
  position: 'bottomright'
});
// populate legend with provided data referencing color of statesData at break points
legend.onAdd = function(map) {

  var div = L.DomUtil.create('div', 'info legend'),
    grades = [0, 0.11, 0.21, 0.31, 0.41, 0.51],
    labels = [],
    from, to;

  for (var i = 0; i < grades.length; i++) {
    from = grades[i];
    to = grades[i + 1];

    labels.push(
      '<i style="background:' + getColor(from + 1) + '"></i> ' +
      from + (to ? '&ndash;' + to : '+'));
  }

  div.innerHTML = labels.join('<br>');
  return div;
};
// add legend to map
legend.addTo(map);
