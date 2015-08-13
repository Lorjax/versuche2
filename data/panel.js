/*
 jQuery

 Regelt Benutzereingaben im Panel.
*/
$(document).ready(function() {
	//Abschicken-Button click
	$("#btnSubmit").on("click", function() {
		$("#form").removeClass("has-error");
		var url = $("#url").val();
		//Sende Nachricht über Port
		self.port.emit("panelUrlEntered", url);
	});

	//Listener für gewählten Text aus Kontext-Menü
	self.port.on("TextAusKontextMenu", function(text) {
		$("#url").val(text);
	});

	// Debug-Buttons
	// $("#hessen_wms").on("click", function() {
	// 	$("#url").val("http://www.gds-srv.hessen.de/cgi-bin/lika-services/ogc-free-maps.ows");
	// });

	// $("#bplan_wms").on("click", function() {
	// 	$("#url").val("http://dienste.kcgim.de/ladadi/bplan/wms");
	// });

	// $("#boundlessgeo_wms").on("click", function() {
	// 	$("#url").val("http://demo.boundlessgeo.com/geoserver/wms?SERVICE=WMS&VERSION=1.3.0&request=getcapabilities");
	// });

	//Listener für Fehler bei Benutzereingabe
	self.port.on("fehler", function(msg){
		$("#form").addClass("has-error");
		$("#url").tooltip({'trigger':'focus hover', 'title': msg, 'placement':'bottom'});
	});

});


