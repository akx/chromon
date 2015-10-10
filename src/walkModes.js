var sample = require("lodash/collection/sample");
var modes = require("./map")();

modes.add("random", function random(ctrl) {
    return sample(ctrl.scaleNotes)
});

modes.add("ascend", function ascend(ctrl) {
    return ctrl.scaleNotes[ctrl.nNote % ctrl.scaleNotes.length];
});

modes.add("descend", function descend(ctrl) {
    var n = ctrl.scaleNotes.length;
    return ctrl.scaleNotes[n - 1 - (ctrl.nNote % n)];
});

modes.add("bounce", function bounce(ctrl) {
    var n = ctrl.scaleNotes.length;
    var idx = ctrl.nNote % n;
    var dir = (0 | (ctrl.nNote / n)) & 1;
    if (dir == 0) {
        return ctrl.scaleNotes[idx];
    } else {
        return ctrl.scaleNotes[n - 1 - idx];
    }
});

module.exports = modes;
