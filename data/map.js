// jQuery
$(document).ready(function() {
	$("#toggleBaseMap").on("click", function() {
		if(!map.hasLayer(openstreetmap)) {
			map.addLayer(openstreetmap);
			$("#toggleBaseMapIcon").toggleClass("glyphicon glyphicon-ok");
		} else {
			map.removeLayer(openstreetmap);
			$("#toggleBaseMapIcon").toggleClass("glyphicon glyphicon-ok");
		}
	});

	$("#navLayersDropdown").on("click", function() {
		//var clicked = $(this)
	});



	
});

// wms und map als lokale Variablen definieren
var wms = new Wms();

var map = L.map('map',{
	center: [49.866667, 8.65],
	zoom: 13
});


var openstreetmap = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'});

self.port.on("openLeafletTab", function(data) {
	console.log("open");
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
	var leafletLayers = [];


	var layer1 = L.tileLayer.wms(wms.url, {
		layers: "adv_dtk10",
		attribution: wms.getTitle(),
	}).addTo(map);

	

	
	var adv_dtk10 = L.tileLayer.wms(wms.url, {layers: "adv_dtk10", attribution: wms.getTitle()});


	for(var i = 0; i < wmsLayers.length; i++) {
		$("#navLayersDropdown").append("<li><a href='#' id='layer_" + i + "'>" + wmsLayers[i].getTitle() + "</a></li>");
		leafletLayers[i] = L.tileLayer.wms(wms.getUrl(), {layers: wmsLayers[i].getName(), attribution: wmsLayers[i].getName()});
	}


}