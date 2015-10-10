var sample = require("lodash/collection/sample");


function Map() {
    this.list = [];
    this.map = {};
};

Map.prototype.add = function (/* ... */) {
    var name, obj;
    if(arguments.length == 1) {
        obj = arguments[0];
        name = obj.name;
    } else {
        name = "" + arguments[0];
        obj = arguments[1];
    }
    obj._name = obj.name = name;
    this.list.push(obj);
    this.map[name] = obj;
};
Map.prototype.pick = function (old) {
    do {
        var newValue = sample(this.list);
    } while (this.list.length > 1 && old === newValue);
    return newValue;
};
Map.prototype.next = function (old) {
    var newIndex = (this.list.indexOf(old) + 1) % this.list.length;
    return this.list[newIndex];
};
Map.prototype.get = function (name) {
    return this.map[name];
};
Map.prototype.first = function () {
    return this.list[0];
};

module.exports = function() {
    return new Map();
};
