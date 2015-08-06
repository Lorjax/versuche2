function Wms() {
	this.name = "";
	this.title = "";
	this.url = "";
	this.layers = [];
}


Wms.prototype.initWms = function(response) {
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
		var layerToAdd = new Layer();
		var layer_name = layer[i].getElementsByTagName("Name")[0].childNodes[0].nodeValue;
		var layer_title = layer[i].getElementsByTagName("Title")[0].childNodes[0].nodeValue;
		var layer_queryable = layer[i].getAttribute("queryable");
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
		var layer_westBounds = layer[i].getElementsByTagName("EX_GeographicBoundingBox")[0].getElementsByTagName("westBoundLongitude")[0].childNodes[0].nodeValue;
		var layer_eastBounds = layer[i].getElementsByTagName("EX_GeographicBoundingBox")[0].getElementsByTagName("eastBoundLongitude")[0].childNodes[0].nodeValue;
		var layer_southBounds = layer[i].getElementsByTagName("EX_GeographicBoundingBox")[0].getElementsByTagName("southBoundLatitude")[0].childNodes[0].nodeValue;
		var layer_northBounds = layer[i].getElementsByTagName("EX_GeographicBoundingBox")[0].getElementsByTagName("northBoundLatitude")[0].childNodes[0].nodeValue;

		layerToAdd.setName(layer_name);
		layerToAdd.setTitle(layer_title);
		layerToAdd.setQueryable(layer_queryable);
		layerToAdd.setLegend(layer_legend);
		layerToAdd.setWestBound(layer_westBounds);
		layerToAdd.setEastBound(layer_eastBounds);
		layerToAdd.setSouthBound(layer_southBounds);
		layerToAdd.setNorthBound(layer_northBounds);

		this.layers.push(layerToAdd);

		}
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