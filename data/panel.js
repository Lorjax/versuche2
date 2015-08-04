$(document).ready(function() {
	$("#btnSubmit").on("click", function() {
		$("#form").removeClass("has-error");
		var url = $("#url").val();

		self.port.emit("panelUrlEntered", url);
	})

	// DEBUG
	// Hessen-WMS Button
	$("#hessen_wms").on("click", function() {
		$("#url").val("http://www.gds-srv.hessen.de/cgi-bin/lika-services/ogc-free-maps.ows");
	});

	$("#bplan_wms").on("click", function() {
		$("#url").val("http://dienste.kcgim.de/ladadi/bplan/wms");
	});

	$("#boundlessgeo_wms").on("click", function() {
		$("#url").val("http://demo.boundlessgeo.com/geoserver/wms?SERVICE=WMS&VERSION=1.3.0&request=getcapabilities");
	})

	self.port.on("urlException", function(msg){
		$("#form").addClass("has-error");

	});

	self.port.on("TextAusKontextMenu", function(text) {
		$("#url").val(text);
	});

});


