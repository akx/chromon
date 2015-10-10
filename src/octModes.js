var sample = require("lodash/collection/sample");
var modes = require("./map")();

modes.add("none", function none(ctrl) {
    return 0;
});

modes.add("altUp", function altUp(ctrl) {
    return ctrl.nNote % 2 ? 1 : 0;
});

modes.add("altDn", function altDn(ctrl) {
    return ctrl.nNote % 2 ? -1 : 0;
});

modes.add("bounce", function bounce(ctrl) {
    return [0, -1, 0, +1][ctrl.nNote % 4];
});

module.exports = modes;
