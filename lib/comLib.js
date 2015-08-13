var Request = require("sdk/request").Request;
var xhrLib = require("sdk/net/xhr");
var tabs = require("sdk/tabs");
var mainjs = require("./main");

/*
 checkUrlString
 
 Prüft die vorliegende URL auf Korrektheit und fügt WMS-Parameter an.
 @returns geprüfte URL oder false
*/
function checkUrlString(url) {
	var pattern = new RegExp('^(http|https)\://[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(:[a-zA-Z0-9]*)?/?([a-zA-Z0-9\-\._\?\,\'/\\\+&amp;%\$#\=~])*$');

	if(pattern.test(url)) { // URL ist valide
		if(url.indexOf("?") != -1) { // URL besitzt ?
			var pos = url.indexOf("?");
			var url = url.slice(0, pos);
			url += "?request=getCapabilities&service=wms&version=1.3.0";
		} else { // URL besitzt KEIN ?, hänge Parameter dran
			url += "?request=getCapabilities&service=wms&version=1.3.0";
		}
	} else {
		// URL ist nicht valide, gebe Fehler aus
		mainjs.panel.port.emit("fehler", "Die Eingabe scheint keine gültige URL zu sein.");
		// keine valide URL konstruiert, gebe false zurück
		return false;
	}
	return url;
}


/*
 checkServer

 Prüft, ob ein Server unter der gegebenen URL erreichbar ist und ob er in XML antwortet.
 Gibt bei allen HTTP-Status-Codes ausser 200 und bei nicht-XML-Antworten einen Fehler aus.
*/
function checkServer(url) {
	Request({
		url:url,
		onComplete: function(response) {
		 	if(response.status != 200) {
		 		// Server ist nicht erreichbar
				mainjs.panel.port.emit("fehler", "Die angegebene URL scheint nicht korrekt zu sein.");
			} else {
				// Server ist erreichbar, checke ob Antwort xml ist
				if(response.headers["Content-Type"].indexOf("text/xml") !== -1 || response.headers["Content-Type"].indexOf("application/vnd.ogc.wms_xml") !== -1) {
					//Antwort ist xml, öffne Leaflet
					mainjs.panel.hide();
					openLeafletTab(url);
				} else {
					//Antwort ist kein xml, gebe Fehler aus
					mainjs.panel.port.emit("fehler", "Die angegebene URL scheint nicht korrekt zu sein.");
				}
		}
	}
	}).get();
}

/*
 openLeafletTab

 Kontaktiert den einen WMS-Server unter der gegebenen URL mit Hilfe eines Request-Objektes.
 Das onComplete-Event öffnet einen neuen Tab mit entsprechenenden ContentScripts und gibt
 die HTTP-GET-Antwort über den Port weiter. Zusätzlich findet sich hier der Listener für
 die GetFeatureInfo-Abfrage


*/
function openLeafletTab(url) {
	Request({
		url: url,
		onComplete: function(response) {
			tabs.open({
				url: "./map.html",
				onReady: function(tab) {
					var url2 = url.slice(0, url.indexOf("?"));
					
					var worker = tab.attach({
						contentScriptFile: ["./jquery.js", "./bootstrap/js/bootstrap.min.js", "./leaflet.js", "./wms.js", "./layer.js", "./map.js"],
						contentScriptOptions: {"url" : url2},
					});

					worker.port.emit("openLeafletTab", response.text);
					// Listener für getFeatureInfo
					worker.port.on("getFeatureInfo", function(url) {
						Request({
							url: url,
							onComplete: function(response) {
								worker.port.emit("getFeatureInfo_fertig", response.text);
							}
						}).get();

					});
				}
								
			});

			
		} 
	}).get();
}


exports.checkUrlString = checkUrlString;
exports.openLeafletTab = openLeafletTab;
exports.checkServer = checkServer;