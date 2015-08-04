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
//var reg_exp = new RegExp('^(http|https)\://[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(:[a-zA-Z0-9]*)?/?([a-zA-Z0-9\-\._\?\,\'/\\\+&amp;%\$#\=~])*$');
var menuItem = contextMenu.Item({
	label: "In WMS-Viewer öffnen...",
	context: contextMenu.SelectionContext(),
	contentScript: 'self.on("click", function () {' +
                 '  var text = window.getSelection().toString();' +
                 '  self.postMessage(text);' +
                 '});',
	//image: "data/images/location-16.png",
	onMessage: function(text) {
		panel.port.emit("TextAusKontextMenu", text);
		panel.show({position: button});
	}
});


panel.port.on("panelUrlEntered", function(data) {
		//URL checken
		var url = comLib.checkUrl(data);
		//Wenn URL vorhanden und valide, dann frage Server an:
		if(url) {
			comLib.checkServer(url);	
		}
});

exports.panel = panel;