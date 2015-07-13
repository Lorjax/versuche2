function Layer() {
	this._name = "";
	this._title = "";
	this._abstract = "";
	this._westBound = 0;
	this._eastBound = 0;
	this._southBound = 0;
	this._northBound = 0;
}

Layer.prototype.setName = function(name) {
	this._name = name;
}

Layer.prototype.getName = function() {
	return this._name;
}

Layer.prototype.setTitle = function(title) {
	this._title = title;
}

Layer.prototype.getTitle = function() {
	return this._title;
}

Layer.prototype.setAbstract = function(abstract) {
	this._abstract = abstract;
}

Layer.prototype.getAbstract = function() {
	return this._abstract;
}

Layer.prototype.setWestBound = function(westBound) {
	this._westBound = westBound;
}

Layer.prototype.getWestBound = function() {
	return this._westBound;
}

Layer.prototype.setEastBound = function(eastBound) {
	this._eastBound = eastBound;
}

Layer.prototype.getEastBound = function() {
	return this._eastBound;
}

Layer.prototype.setSouthBound = function(southBound) {
	this._southBound = southBound;
}

Layer.prototype.getSouthBound = function() {
	return this._southBound;
}

Layer.prototype.setNorthBound = function(northBound) {
	this._northBound = northBound;
}

Layer.prototype.getNorthBound = function() {
	return this._northBound;
}