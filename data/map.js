// jQuery
$(document).ready(function() {
	$("#toggleBaseMap_osm").on("click", function() {
		if(!map.hasLayer(openstreetmap)) {
			map.addLayer(openstreetmap);
			$("#toggleBaseMapIcon_osm").toggleClass("glyphicon glyphicon-ok");
		} else {
			map.removeLayer(openstreetmap);
			$("#toggleBaseMapIcon_osm").toggleClass("glyphicon glyphicon-ok");
		}
	});

	$("#toggleBaseMap_cartodb").on("click", function() {
		if(!map.hasLayer(cartodb)) {
			map.addLayer(cartodb);
			$("#toggleBaseMapIcon_cartodb").toggleClass("glyphicon glyphicon-ok");
		} else {
			map.removeLayer(cartodb);
			$("#toggleBaseMapIcon_cartodb").toggleClass("glyphicon glyphicon-ok");
		}
	});

	$("#navLayersDropdown").on("click", "li", function() {
		var auswahl = $(this).val();
		if(!map.hasLayer(leafletLayers[auswahl])) {
			map.addLayer(leafletLayers[auswahl]);
			panToLayerCenter(auswahl);
			$("span", this).toggleClass("glyphicon glyphicon-ok");
		} else {
			map.removeLayer(leafletLayers[auswahl]);
			$("span", this).toggleClass("glyphicon glyphicon-ok");
		}
		
	});



	
});

/*
 Variablen im lokalen Scope erstellen:
 wms, leafletLayers, Grundkarten und die map
*/
var wms = new Wms();

var leafletLayers = [];

var openstreetmap = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',{
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | '
});

var cartodb = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
	attribution:'Tiles by &copy; <a href="http://cartodb.com/attributions">CartoDB</a> / Data by &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | '
});

var map = L.map('map',{
	center: [49.866667, 8.65],
	zoom: 13,
	layers: openstreetmap,
});




self.port.on("openLeafletTab", function(data) {
	console.log("[DEBUG-map.js] open Tab");
	//URL in wms schreiben
	wms.setUrl(self.options.url);
	//WMS initialisieren
	wms.initWms(data);
	//Layer laden
	loadLayers();
	//Scale einfügen
	L.control.scale().addTo(map);
	

	$("#navServerName").text(wms.url);
});


function loadLayers() {
	var wmsLayers = wms.getLayers();
	//var leafletLayers = [];


	for(var i = 0; i < wmsLayers.length; i++) {
		$("#navLayersDropdown").append("<li value="+i+"><a href='#'><span></span> " + wmsLayers[i].getTitle() + "</a></li>");
		leafletLayers[i] = L.tileLayer.wms(wms.getUrl(), {
			layers: wmsLayers[i].getName(),
			format:'image/png',
			transparent: true,
			attribution: wmsLayers[i].getTitle(),
			bounds: L.latLngBounds(L.latLng(wmsLayers[i].getSouthBound(),wmsLayers[i].getWestBound()), L.latLng(wmsLayers[i].getNorthBound(),wmsLayers[i].getEastBound())),
		});
	}


}

function panToLayerCenter(i) {
	var layer = wms.getLayers()[i];
	var layerBounds = L.latLngBounds(L.latLng(layer.getSouthBound(),layer.getWestBound()), L.latLng(layer.getNorthBound(),layer.getEastBound()));

	map.panTo(layerBounds.getCenter());
}