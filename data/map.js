/*
 jQuery
 Regelt Benutzereingaben über GUI.
*/
$(document).ready(function() {
	//OpenStreetMap Grundkarte hinzufügen oder löschen
	$("#toggleBaseMap_osm").on("click", function() {
		if(!map.hasLayer(openstreetmap)) {
			map.addLayer(openstreetmap);
			$("#toggleBaseMapIcon_osm").toggleClass("glyphicon glyphicon-ok");
		} else {
			map.removeLayer(openstreetmap);
			$("#toggleBaseMapIcon_osm").toggleClass("glyphicon glyphicon-ok");
		}
	});

	//CartoDB Grundkarte hinzufügen oder löschen
	$("#toggleBaseMap_cartodb").on("click", function() {
		if(!map.hasLayer(cartodb)) {
			map.addLayer(cartodb);
			$("#toggleBaseMapIcon_cartodb").toggleClass("glyphicon glyphicon-ok");
		} else {
			map.removeLayer(cartodb);
			$("#toggleBaseMapIcon_cartodb").toggleClass("glyphicon glyphicon-ok");
		}
	});

	//WMS-Layer aus Dropdown-Menü hinzufügen oder läschen
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
//Enthält aktuellen WMS
var wms = new Wms();
//enthält Leaflet-spezifische Layer
var leafletLayers = [];
//OpenStreetMap-Grundkarte
var openstreetmap = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png',{
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | '
});
//CartoDB Grundkarte
var cartodb = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
	attribution:'Tiles by &copy; <a href="http://cartodb.com/attributions">CartoDB</a> / Data by &copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors | '
});
//Kartenrahmen
var map = L.map('map',{
	center: [50,10],
	zoom: 5,
	crs: L.CRS.EPSG3857,
	layers: openstreetmap,
	
});


/*
 Listener für openLeafletTab:

 Initialisiert WMS und die zugehörigen Layer und fügt eine
 Maßstabsleiste der Karte hinzu.
*/

self.port.on("openLeafletTab", function(data) {
	//URL in wms schreiben
	wms.setUrl(self.options.url);
	//WMS initialisieren
	wms.initWms(data);
	//Layer laden
	loadLayers();
	//Scale einfügen
	L.control.scale().addTo(map);
	// "Verbunden mit" setzen
	$("#navServerName").text(wms.url);
});



/*
 loadLayers()

 Erstellt aus Layer-Objekten Leaflet-spezifische Objekte
 um diese der Karte hinzufügen zu können.
*/
function loadLayers() {
	//alle Layer aufrufen
	var wmsLayers = wms.getLayers();
	//CRS des Kartenrahmens
	var crs = map.options.crs;

	for(var i = 0; i < wmsLayers.length; i++) {
		//Eintrag im Dropdown-Menü erzeugen, wenn Layer über Namen verfügt. Falls nicht
		//ist Layer nur als Kategorie gedacht.
		if(wmsLayers[i].getName() != "") {
			$("#navLayersDropdown").append("<li value="+i+"><a href='#'><span></span> " + wmsLayers[i].getTitle() + "</a></li>");
		}
		//L.tileLayer.wms erzeugen und in Array leafletLayers speichern.
		leafletLayers[i] = L.tileLayer.wms(wms.getUrl(), {
			layers: wmsLayers[i].getName(),
			format:'image/png',
			version: '1.3.0',
			transparent: true,
			attribution: wmsLayers[i].getTitle(),
			crs: crs
		});
	}


}

/*
 panToLayerCenter()

 Verschiebt den Kartenausschnitt auf den Mittelpunkt der 
 BBox des gegebenen Layers i
 i repräsentiert die Reihnfolge im Dropdown-Menü
*/
function panToLayerCenter(i) {
	var layer = wms.getLayers()[i];
	var layerBounds = L.latLngBounds(L.latLng(layer.getSouthBound(),layer.getWestBound()), L.latLng(layer.getNorthBound(),layer.getEastBound()));

	map.panTo(layerBounds.getCenter());
}


/*
 panToLayerBounds()

 Verschiebt den Kartenausschnitt auf die komplette 
 BBox des gegebenen Layers i
 i repräsentiert die Reihnfolge im Dropdown-Menü
*/
function panToLayerBounds(i) {
	var layer = wms.getLayers()[i];
	var layerBounds = L.latLngBounds(L.latLng(layer.getSouthBound(),layer.getWestBound()), L.latLng(layer.getNorthBound(),layer.getEastBound()));

	map.fitBounds(layerBounds);
}


/*
 Listener für Rechtsklick

 Erzeugt Popup an angeklickter Position, erzeugt WMS-URL für
 GetFeatureInfo und fragt diese an. Die Antwort wird mithilfe
 des Listeners getFeatureInfo_fertig empfangen.
*/
map.on('contextmenu', function(e) {
	//Popup erstellen und Position setzen
	var popup = L.popup({autoPan: false, maxHeight: 200, maxWidth:500}).setLatLng(e.latlng);
	// leeren Text erstellen
	var text = "";
	//GetFeatureInfo-Parameter erzeugen
	var params = paramsToAdd(e);
	var crsBbox = getBboxParams(map);
	//Aus GetFeatureInfo-Parametern und CRS eins machen
	text = L.Util.getParamString(L.Util.extend({}, params, crsBbox));
	//Parameter an WMS-URL anhängen
	var url = wms.getUrl() + text;
	//Message an main.js mit anzufragender URL
	//Wenn aktuelle Ansicht überhaupt keinen Layer enthält:
	if(params["layers"].length === 0 || params["query_layers"].length === 0) {
		popup.setContent("no queryable layers found.").openOn(map);
	} else {
		//Kartenrahmen enthält Layer, frage WMS an.
		self.port.emit("getFeatureInfo", url);
	}
	//Listener für Antwort auf GetFeatureInfo
	self.port.on("getFeatureInfo_fertig", function(data) {
		//Popup-Content setzen aus Antwort und auf Karte anzeigen
		popup.setContent(data).openOn(map);
	});
});

/*
 paramsToAdd()

 Erzeugt die der WMS-URL anzuhängenden GetFeatureInfo-Parameter.
*/
function paramsToAdd(e) {
	var layers = getDisplayedLayer();
	var query_layers = getQueryableLayer();
	
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
		
	}
}

/*
 getBboxParams()

 Erzeugt korrekte BoundingBox-Parameter und projiziert diese ggf. in
 EPSG3857 falls Kartenrahmen über diesen verfügt.
 Gibt BBox und entsprechendes CRS in JSON zurück.
*/
function getBboxParams(map) {
	//Kartenrahmen in EPSG3857
	if(map.options.crs ===  L.CRS.EPSG3857) {
		var bbox = "";
		//NE und SE von LatLng in EPSG3857 projizieren
		var southWest = L.CRS.EPSG3857.project(map.getBounds().getSouthWest());
		var northEast = L.CRS.EPSG3857.project(map.getBounds().getNorthEast());
		bbox += southWest.x + "," + southWest.y + "," + northEast.x + "," + northEast.y;
		return {"crs":"EPSG:3857","bbox":bbox}
	}

	//Kartenrahmen in EPSG4326
	if(map.options.crs === L.CRS.EPSG4326) {
		var bbox = "";
		var mapBounds = map.getBounds();
		bbox += mapBounds.getSouth() + ",";
		bbox += mapBounds.getWest() + ",";
		bbox += mapBounds.getNorth() + ",";
		bbox += mapBounds.getEast();
		return {"crs":"EPSG:4326","bbox":bbox}
	}
}

/*
 getDisplayedLayer()

 Ermittelt die derzeit im Kartenrahmen angezeigten Layer.
 Gibt ein Array der angezeigten Layer zurück, welches
 ggf. leer sein kann bei keinem angezeigten Layer.
*/
function getDisplayedLayer() {
	var i = 0;
	var result = [];
	for(i; i<leafletLayers.length;i++) {
		if(map.hasLayer(leafletLayers[i])) {
			result.push(wms.getLayers()[i].getName());
		}
	}
	return result;
}

/*
 getQueryableLayer()

 Ermittelt alle Layer, die aktuell angezeigt und queryable sind.
 Gibt ein entsprechendes Array zurück, welches ggf. leer sein kann.

*/
function getQueryableLayer() {
	var i = 0;
	var result = [];
	for(i; i<leafletLayers.length;i++) {
		if(map.hasLayer(leafletLayers[i]) && wms.getLayers()[i].getQueryable() == 1) {

			result.push(wms.getLayers()[i].getName());
		}
	}
	return result;
}