function Wms() {
	this.name = "";
	this.title = "";
	this.abstract = "";
	this.url = "";
	this.layers = [];
}


//Konstruktor für Wms-Objekt
Wms.prototype.initWms = function(response) {
	//response in xml parsen
	var parser = new DOMParser();
	var xmlDoc = parser.parseFromString(response, "text/xml");

	//xml in service und layer aufteilen
	var service = xmlDoc.getElementsByTagName("Service");
	var layer = xmlDoc.getElementsByTagName("Layer");

	//titel, abstract und name setzen
	this.title = service[0].getElementsByTagName("Title")[0].childNodes[0].nodeValue;
	this.abstract = service[0].getElementsByTagName("Abstract")[0].childNodes[0].nodeValue;
	this.name = service[0].getElementsByTagName("Name")[0].childNodes[0].nodeValue;

	//Layers als Map(key/value Paare) erstellen --> https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
	//this.layers = new Map();
	//die einzelnen Layer in Map schreiben; layer_titel als Key, layer_name als value
	for (i=0;i<layer.length;i++) {
		var layerToAdd = new Layer();
		var layer_name = layer[i].getElementsByTagName("Name")[0].childNodes[0].nodeValue;
		var layer_title = layer[i].getElementsByTagName("Title")[0].childNodes[0].nodeValue;
		var layer_queryable = layer[i].getAttribute("queryable");
		var layer_westBounds = layer[i].getElementsByTagName("EX_GeographicBoundingBox")[0].getElementsByTagName("westBoundLongitude")[0].childNodes[0].nodeValue;
		var layer_eastBounds = layer[i].getElementsByTagName("EX_GeographicBoundingBox")[0].getElementsByTagName("eastBoundLongitude")[0].childNodes[0].nodeValue;
		var layer_southBounds = layer[i].getElementsByTagName("EX_GeographicBoundingBox")[0].getElementsByTagName("southBoundLatitude")[0].childNodes[0].nodeValue;
		var layer_northBounds = layer[i].getElementsByTagName("EX_GeographicBoundingBox")[0].getElementsByTagName("northBoundLatitude")[0].childNodes[0].nodeValue;

		layerToAdd.setName(layer_name);
		layerToAdd.setTitle(layer_title);
		layerToAdd.setQueryable(layer_queryable);
		layerToAdd.setWestBound(layer_westBounds);
		layerToAdd.setEastBound(layer_eastBounds);
		layerToAdd.setSouthBound(layer_southBounds);
		layerToAdd.setNorthBound(layer_northBounds);

		this.layers.push(layerToAdd);

		}


	//console.log("WMS aus response erstellt!");
}

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