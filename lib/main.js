// SDK-Inhalte einbinden
var { ToggleButton } = require("sdk/ui/button/toggle");
var panels = require("sdk/panel");
var tabs = require("sdk/tabs");

//eigene Module einbinden
var comLib = require("./comLib");



// ToggleButton erstellen
var button = ToggleButton({
	id: "button_01",
	label: "Panel öffnen",
	icon: {
		"16": "./images/location-16.png",
		"32": "./images/location-32.png",
		"64": "./images/location-64.png"
	},
	onChange: clickToggleButton
});

function clickToggleButton(state) {
	if(state.checked) {
		panel.show({
			position: button
		});
	}
}


// Panel erstellen
var panel = panels.Panel({
	width: 650,
	height: 150,
	contentURL: "./panel.html",
	contentScriptFile: ["./jquery.js", "./panel.js"],
	onHide: function() { 
		button.state("window", {
			checked: false
		})
	}
});


panel.port.on("panelUrlEntered", function(data) {
	try {		
		//URL checken
		var url = comLib.checkUrl(data);
		//XMLHttpRequest ausführen, Antwort in xmlDoc schreiben
		comLib.openLeafletTab(url, data);
		//WMS-Objekt aus XML-Antwort erstellen
		
		
		
		panel.hide();
		
		/*
		Teil des xhr Tests!
		//Tab öffnen
		tabs.open({
			url: "./map.html",
			onReady: function(tab) {
				var worker = tab.attach({
	 				contentScriptFile: ["./jquery.js", "./leaflet.js", "./wms.js", "./map.js"]	 				
				});
				worker.port.emit("sendXmlDoc", xmlDoc);
				
			}
		});
		*/

	} catch(e) {
		console.log("Fehler! " + e);
	}
	
})