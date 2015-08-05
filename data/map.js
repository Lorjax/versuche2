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
	//center: [49.866667, 8.65], // Darmstadt
	center: [50,10],
	zoom: 5,
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
			transparent: true,
			attribution: wmsLayers[i].getTitle(),
			//bounds: L.latLngBounds(L.latLng(wmsLayers[i].getSouthBound(),wmsLayers[i].getWestBound()), L.latLng(wmsLayers[i].getNorthBound(),wmsLayers[i].getEastBound())),
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
	var popup = L.popup({autoPan: false, maxHeight: 200}).setLatLng(e.latlng);
	// leeren Text erstellen
	var text = "";
	//Zusätzliche GetFeatureInfo-Parameter erzeugen
	var params = paramsToAdd(e);
	//Aus WMS-Parametern und GetFeatureInfo-Parametern eins machen
	console.log("===============================");
	console.log(leafletLayers[0].wmsParams);
	console.log(params);
	text = L.Util.getParamString(L.Util.extend({}, leafletLayers[0].wmsParams, params));
	//URL des WMS an alle Parameter anhängen und somit URL erzeugen
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

map.on("layeradd", function(e) {
	
});

function paramsToAdd(e) {
	var layers = getDisplayedMaps();
	var query_layers = getDisplayedMaps();
	var i=0;
	// for(i;i<wms.getLayers().length;i++) {
	// 	if(wms.getLayers()[i].getQueryable() == 1) {
	// 		query_layers.push(wms.getLayers()[i].getName());
	// 	}
	// }
	return {
		"version": "1.3.0",
		"request": "getFeatureInfo",
		"info_format": "text/plain",
		"query_layers": query_layers,
		"layers": layers,
		"height": map.getSize().y,
		"width": map.getSize().x,
		"i": e.layerPoint.x,
		"j": e.layerPoint.y,
		"bbox": map.getBounds().toBBoxString(),
		"crs": "EPSG:3857"
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