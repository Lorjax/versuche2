var wms = new Wms();

self.port.on("openLeafletTab", function(data) {
	wms.setUrl(self.options.url);
	console.log(self.options.url);
	initMap(data);
});


function initMap(text) {
	wms.initWms(text);

	/*
	Leaflet initialisieren
	*/
	var map = L.map('map',{
		center: [49.866667, 8.65],
		zoom: 13
	});

	L.tileLayer.wms(wms.url, {
		layers: "adv_dtk10",
		attribution: wms.getTitle(),
	}).addTo(map);

	var openstreetmap = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'});
	var adv_dtk10 = L.tileLayer.wms(wms.url, {layers: "adv_dtk10", attribution: wms.getTitle()});

	for(var [key, value] of wms.getLayers().entries()) {
		var value = L.tileLayer.wms(wms.url, {layers: value, attribution: wms.getTitle()});
		console.log(key + " = " + value);
	}


	var baseMaps = {
		"OpenStreetMap": openstreetmap,
		"Hessen WMS": adv_dtk10,
		"DTK 50": adv_dtk50,
	}

	L.control.layers(baseMaps).addTo(map);
}