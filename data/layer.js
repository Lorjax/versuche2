function Layer() {
	this._name = "";
	this._title = "";
	this._queryable = 0;
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

Layer.prototype.setQueryable = function(queryable) {
	this._queryable = queryable;
}

Layer.prototype.getQueryable = function() {
	return this._queryable;
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