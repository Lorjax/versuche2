// SDK-Inhalte einbinden
var { ToggleButton } = require("sdk/ui/button/toggle");
var panels = require("sdk/panel");
var tabs = require("sdk/tabs");
var contextMenu = require("sdk/context-menu");
var self = require("sdk/self");


//eigene Module einbinden
var comLib = require("./comLib");



// ToggleButton erstellen
var button = ToggleButton({
	id: "button_01",
	label: "WMS-Viewer",
	icon: {
		"16": "./images/location-pin-16.png",
		"32": "./images/location-pin-32.png",
		"64": "./images/location-pin-64.png"
	},
	onChange: clickToggleButton
});

// Handler für Klick auf ToggleButton
function clickToggleButton(state) {
	if(state.checked) {
		panel.show({
			position: button
		});
	}
}


// Panel erstellen
var panel = panels.Panel({
	width: 600,
	height: 200,
	contentURL: "./panel.html",
	contentScriptFile: ["./jquery.js", "./bootstrap/js/bootstrap.min.js", "./panel.js"],
	onHide: function() { 
		button.state("window", {
			checked: false
		})
	}
});

// Eintrag für Kontext-Menü
var menuItem = contextMenu.Item({
	label: "Open in WMS-Viewer...",
	context: contextMenu.SelectionContext(),
	contentScript: 'self.on("click", function () {' +
                 '  var text = window.getSelection().toString();' +
                 '  self.postMessage(text);' +
                 '});',
	onMessage: function(text) {
		panel.port.emit("TextAusKontextMenu", text);
		panel.show({position: button});
	}
});


// Listener für URL-Eingabe
panel.port.on("panelUrlEntered", function(data) {
		//URL checken
		var url = comLib.checkUrlString(data);
		//Wenn URL vorhanden und valide, dann frage Server an:
		if(url) {
			comLib.checkServer(url);	
		}
});


exports.panel = panel;