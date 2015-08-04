var Request = require("sdk/request").Request;
var xhrLib = require("sdk/net/xhr");
var tabs = require("sdk/tabs");

var myresponse = [];

/*
 checkUrl
 
 Prüft die vorliegende URL auf Korrektheit.
 
 @throws urlException wenn URL zu kurz ist

 //TODO weitere Fälle!!!!!
 Über RegExp lösen!!
 http://regexlib.com/RETester.aspx?regexp_id=146
*/
function checkUrl(url) {
	var pattern = new RegExp('^(http|https|ftp)\://[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(:[a-zA-Z0-9]*)?/?([a-zA-Z0-9\-\._\?\,\'/\\\+&amp;%\$#\=~])*$');

	if(pattern.test(url)) { // URL ist valide
		if(url.indexOf("?") != -1) { // URL besitzt ?
			var pos = url.indexOf("?");
			var url = url.slice(0, pos);
			url += "?request=getCapabilities&service=wms";
		} else { // URL besitzt KEIN ?, hänge Parameter dran
			url += "?request=getCapabilities&service=wms";
		}
	} else {
		throw "urlException";
	}
	return url;
}


/*
 openLeafletTab

 Kontaktiert den einen WMS-Server unter der gegebenen URL mit Hilfe eines Request-Objektes.
 Der onComplete-Event öffnet einen neuen Tab mit entsprechenenden ContentScripts und gibt
 die HTTP-GET-Antwort über den Port weiter

 @param url Die korrekte URL des WMS-Servers mit 
            entsprechenden Anhängen wie getCapabilities etc.

*/
function openLeafletTab(url) {
	Request({
		url: url,
		onComplete: function(response) {
			console.log("[DEBUG-comLib.js] HTTP-GET fertig mit Status: " + response.status);
			tabs.open({
				url: "./map.html",
				/*Scripte müssen in den gleichen Kontext geladen werden, also zwei Aufrufe von
				  tab.attach() erzeugen auch zwei Kontexte und die Scripte können nicht kommunizieren!
				  --> https://developer.mozilla.org/en-US/Add-ons/SDK/Guides/Content_Scripts#Content_script_to_content_script
				*/
				onReady: function(tab) {
					var url2 = url.slice(0, url.indexOf("?"));
					
					var worker = tab.attach({
						contentScriptFile: ["./jquery.js", "./bootstrap/js/bootstrap.min.js", "./leaflet.js", "./wms.js", "./layer.js", "./map.js"],
						contentScriptOptions: {"url" : url2},
					});

					worker.port.emit("openLeafletTab", response.text);

					worker.port.on("getFeatureInfo", function(url) {
						console.log("[DEBUG-comLib.js] starte Request mit URL: " + url);
						Request({
							url: url,
							onComplete: function(response) {
								//console.log("[DEBUG-comLib.js] getFeatureInfo Request fertig");
								worker.port.emit("getFeatureInfo_fertig", response.text);
							}
						}).get();

					});
				}
								
			});

			
		} 
	}).get();
}


exports.checkUrl = checkUrl;
exports.openLeafletTab = openLeafletTab;