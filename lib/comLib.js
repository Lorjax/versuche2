var Request = require("sdk/request").Request;
var xhrLib = require("sdk/net/xhr");
var tabs = require("sdk/tabs");

/*
 checkUrl
 
 Prüft die vorliegende URL auf Korrektheit.
 
 @throws urlException wenn URL zu kurz ist

 //TODO weitere Fälle!!!!!
*/
function checkUrl(url) {
	// ?, request und service fehlt
	if(url.length === 0) {
		throw "urlException";
	} else if(url.indexOf("?") === -1) {
		url = url.concat("?REQUEST=GETCAPABILITIES&SERVICE=WMS");
	// ? vorhanden, dann checken, welcher parameter fehlt
	} else if(url.indexOf("?") != -1) {
		if(url.indexOf("request=GETCAPABILITIES") != -1) {
			url = url.concat("&service=wms");
		}
		//if(url.indexOf("service=wms"))

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
function openLeafletTab(url, url2) {
	/*
	Test mit xhr
	var xmlHttp = new xhrLib.XMLHttpRequest();
	xmlHttp.open("GET", url, false);
	xmlHttp.send();
	console.log("[comLib.js] HTTP-GET mit Status: " + xmlHttp.status + " - " + xmlHttp.statusText);
	var xmlDoc = xmlHttp.responseXML;
	
	return xmlDoc;
	*/

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
					var worker = tab.attach({
						contentScriptFile: ["./jquery.js", "./bootstrap/js/bootstrap.min.js", "./leaflet.js", "./wms.js", "./layer.js", "./map.js"],
						contentScriptOptions: {"url" : url2},
					});

					worker.port.emit("openLeafletTab", response.text);
				}
								
			});

			
		} 
	}).get();
}




exports.checkUrl = checkUrl;
exports.openLeafletTab = openLeafletTab;