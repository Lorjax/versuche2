/*
 WMS

 Repräsentiert einen WMS.
*/

function Wms() {
	this.name = "";
	this.title = "";
	this.url = "";
	this.layers = [];
}

/*
 setDecimal()

 Prüft den Eingabestring auf Komma als Dezimaltrenner
 und ersetzt ihn ggf. durch einen Punkt.
 Liefert String mit Punkt als Dezimaltrenner zurück.
*/
function setDecimal(string) {
	if(string.indexOf(",") != -1) {
		return string.replace(",", ".");
	} else {
		return string;
	}
}

/*
 initWms()

 Setzt WMS-Attribute auf Werte im XML der GetCapabilities-Operation
 Bei Parse-Error wird Nachricht auf Console ausgegeben.
*/
Wms.prototype.initWms = function(response) {
	try {
	//response in xml parsen
	var parser = new DOMParser();
	var xmlDoc = parser.parseFromString(response, "text/xml");

	//xml in service und layer aufteilen
	var service = xmlDoc.getElementsByTagName("Service");
	var layer = xmlDoc.getElementsByTagName("Layer");

	//titel und name setzen
	this.title = service[0].getElementsByTagName("Title")[0].childNodes[0].nodeValue;
	this.name = service[0].getElementsByTagName("Name")[0].childNodes[0].nodeValue;


	for (i=0;i<layer.length;i++) {
		//Layer-Objekt erzeugen
		var layerToAdd = new Layer();
		//Name setzen
		var layer_name = layer[i].getElementsByTagName("Name")[0].childNodes[0].nodeValue;
		//Titel setzen
		var layer_title = layer[i].getElementsByTagName("Title")[0].childNodes[0].nodeValue;
		//Queryable setzen
		var layer_queryable = layer[i].getAttribute("queryable");
		//Checken, ob Layer über Legende verfügt
		var layer_legend = "";
		if(layer[i].getElementsByTagName("Style")[0] != null) {
			var style = layer[i].getElementsByTagName("Style")[0];
			if(style.getElementsByTagName("LegendURL")[0] != null) {
				var legendUrl = style.getElementsByTagName("LegendURL")[0];
				if(legendUrl.getElementsByTagName("OnlineResource")[0].getAttribute("xlink:href") != null) {
					var legend = legendUrl.getElementsByTagName("OnlineResource")[0].getAttribute("xlink:href");
					layer_legend = legend;
				}
			}
		}
		//BBox des Layers ermitteln
		var layer_westBounds = layer[i].getElementsByTagName("EX_GeographicBoundingBox")[0].getElementsByTagName("westBoundLongitude")[0].childNodes[0].nodeValue;
		var layer_eastBounds = layer[i].getElementsByTagName("EX_GeographicBoundingBox")[0].getElementsByTagName("eastBoundLongitude")[0].childNodes[0].nodeValue;
		var layer_southBounds = layer[i].getElementsByTagName("EX_GeographicBoundingBox")[0].getElementsByTagName("southBoundLatitude")[0].childNodes[0].nodeValue;
		var layer_northBounds = layer[i].getElementsByTagName("EX_GeographicBoundingBox")[0].getElementsByTagName("northBoundLatitude")[0].childNodes[0].nodeValue;

		//Alle Werte in Layer-Objekt schreiben.
		layerToAdd.setName(layer_name);
		layerToAdd.setTitle(layer_title);
		layerToAdd.setQueryable(layer_queryable);
		layerToAdd.setLegend(layer_legend);
		layerToAdd.setWestBound(setDecimal(layer_westBounds));
		layerToAdd.setEastBound(setDecimal(layer_eastBounds));
		layerToAdd.setSouthBound(setDecimal(layer_southBounds));
		layerToAdd.setNorthBound(setDecimal(layer_northBounds));

		//Erzeuten Layer dem Layer-Attribut des WMS hinzufügen
		this.layers.push(layerToAdd);

		}

	} catch(e) {
		console.log("Fehler beim parsen des XML");
	}
}

/*
 Getter und Setter für WMS-Objekt
*/
Wms.prototype.getName = function() {
	return this.name;
}

Wms.prototype.setUrl = function(url) {
	this.url = url;
}

Wms.prototype.getUrl = function() {
	return this.url;
}

Wms.prototype.getTitle = function() {
	return this.title;
}

Wms.prototype.getLayers = function() {
	return this.layers;
}