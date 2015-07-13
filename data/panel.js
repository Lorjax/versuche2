$(document).ready(function() {
	$("#btnSubmit").on("click", function() {
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
});