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
			panToLayerBounds(auswahl);
			$("span", this).toggleClass("glyphicon glyphicon-ok");
			var legende = wms.getLayers()[auswahl].getLegend();
			if(legende.length > 0) {
				$("#legende").append('<li value=' + auswahl + '><img src="' + legende + '" /></li>');
			}			
		} else {
			map.removeLayer(leafletLayers[auswahl]);
			$("span", this).toggleClass("glyphicon glyphicon-ok");
			$("#legende li[value=" + auswahl + "]").remove();
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
	center: [50,10],
	zoom: 5,
	crs: L.CRS.EPSG3857,
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

	for(var i = 0; i < wmsLayers.length; i++) {
		$("#navLayersDropdown").append("<li value="+i+"><a href='#'><span></span> " + wmsLayers[i].getTitle() + "</a></li>");
		leafletLayers[i] = L.tileLayer.wms(wms.getUrl(), {
			layers: wmsLayers[i].getName(),
			format:'image/png',
			version: '1.3.0',
			transparent: true,
			attribution: wmsLayers[i].getTitle(),
			crs: L.Util.EPSG3857
		});
	}


}

function panToLayerCenter(i) {
	var layer = wms.getLayers()[i];
	var layerBounds = L.latLngBounds(L.latLng(layer.getSouthBound(),layer.getWestBound()), L.latLng(layer.getNorthBound(),layer.getEastBound()));

	map.panTo(layerBounds.getCenter());
}

function panToLayerBounds(i) {
	var layer = wms.getLayers()[i];
	var layerBounds = L.latLngBounds(L.latLng(layer.getSouthBound(),layer.getWestBound()), L.latLng(layer.getNorthBound(),layer.getEastBound()));

	map.fitBounds(layerBounds);
}

/*
Methoden und Listener für GetFeatureInfo
*/
map.on('contextmenu', function(e) {
	//Popup erstellen und Position setzen
	console.log(e.latlng.toString());
	console.log(e.latlng.lat);
	console.log(e.latlng.lng);
	var popup = L.popup({autoPan: false, maxHeight: 200, maxWidth:500}).setLatLng(e.latlng);
	// leeren Text erstellen
	var text = "";
	//Zusätzliche GetFeatureInfo-Parameter erzeugen
	var paramss = paramsToAdd(e);
	//Aus WMS-Parametern und GetFeatureInfo-Parametern eins machen
	text = L.Util.getParamString(paramss);
	//URL des WMS an alle Parameter anhängen und somit URL erzeugen
	/*
	text = "Größe Kartenrahmen: <br>";
	text += "Höhe y=" + map.getSize().y + "<br>";
	text += "Breite x=" + map.getSize().x + "<br><br>";
	text += "Aktuelle BBox: <br>";
	text += "unten links: <br>";
	text += "Längengrad: " + map.getBounds().getWest() + "<br>";
	text += "Breitengrad: " + map.getBounds().getSouth() + "<br>";
	text += "oben rechts: <br>";
	text += "Längengrad: " + map.getBounds().getEast() + "<br>";
	text += "Breitengrad: " + map.getBounds().getNorth() + "<br>";
	text += "---------------<br>";
	text += "BBox-Leaflet: <br>";
	text += map.getBounds().toBBoxString() + "<br>";
	text += "======eigene BBox========<br>";
	var params = paramsToAdd(e);
	for(prop in params) {
		text += prop + " = " + params[prop] + "<br>";
	}
	popup.setContent(text).openOn(map);
	*/
	console.log("[DEBUG:wms-url] " + wms.getUrl());
	console.log("[DEBUG:wms-url] " + paramss);
	var url = wms.getUrl() + text;

	//Message an main.js mit anzufragender URL
	self.port.emit("getFeatureInfo", url);
	//Listener für Antwort auf GetFeatureInfo
	self.port.on("getFeatureInfo_fertig", function(data) {
		//onsole.log("[DEBUG-map.js] erhalte antwort: " + data);
		//Popup-Content setzen aus Antwort und auf Karte anzeigen
		popup.setContent(data).openOn(map);
	});
});


function paramsToAdd(e) {
	var layers = getDisplayedMaps();
	var query_layers = getQueryableMaps();
	var i=0;

	var bbox = "";
	var mapBounds = map.getBounds();
	bbox += mapBounds.getSouth() + ",";
	bbox += mapBounds.getWest() + ",";
	bbox += mapBounds.getNorth() + ",";
	bbox += mapBounds.getEast();
	return {
		"service":"wms",
		"version": "1.3.0",
		"request": "getFeatureInfo",
		"info_format": "text/plain",
		"styles": "",
		"query_layers": query_layers,
		"layers": layers,
		"width": map.getSize().x,
		"height": map.getSize().y,
		"i": e.containerPoint.x,
		"j": e.containerPoint.y,
		"crs": "EPSG:4326",
		"bbox": bbox,
		//"crs": "EPSG:3857"
		
	}
}

function getDisplayedMaps() {
	var i = 0;
	var result = [];
	for(i; i<leafletLayers.length;i++) {
		if(map.hasLayer(leafletLayers[i])) {
			result.push(wms.getLayers()[i].getName());
		}
	}
	console.log("[DEBUG:getDisplayedMaps] " + result);
	return result;
}

function getQueryableMaps() {
	var i = 0;
	var result = [];
	for(i; i<leafletLayers.length;i++) {
		if(map.hasLayer(leafletLayers[i]) && wms.getLayers()[i].getQueryable() == 1) {
			result.push(wms.getLayers()[i].getName());
		}
	}
	console.log("[DEBUG:getDisplayedMaps] " + result);
	return result;
}