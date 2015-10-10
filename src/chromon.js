var sample = require("lodash/collection/sample");
var rnd = require("lodash/number/random");
var vals = require("lodash/object/values");
var m = require("mithril");

var walkModes = require("./walkModes");
var octModes = require("./octModes");
var scales = vals(require("./scale-data")).reduce(function (a, b) {
    return a.concat(b);
});
var loadAudio = require("./loadAudio");
var reverbDelay = require("./reverbDelay");
var Sampler = require("./Sampler");
var noteToText = require("./midi").noteToText;

var audioCtx = new AudioContext();
var analyser = audioCtx.createAnalyser();
analyser.fftSize = 512;
var fftData = new Uint8Array(analyser.frequencyBinCount);
var sampleOut = audioCtx.createGain();
var rd = reverbDelay(audioCtx, "oggs/reverb2.ogg");
sampleOut.connect(rd.inputGain);
rd.convolverGain.connect(audioCtx.destination);
rd.dryGain.connect(audioCtx.destination);

var fileInfos = [
    {note: 24, file: "024.ogg"},
    {note: 30, file: "030.ogg"},
    {note: 36, file: "036.ogg"},
    {note: 42, file: "042.ogg"},
    {note: 48, file: "048.ogg"},
    {note: 54, file: "054.ogg"},
    {note: 60, file: "060.ogg"},
    {note: 66, file: "066.ogg"},
    {note: 72, file: "072.ogg"},
    {note: 78, file: "078.ogg"},
    {note: 84, file: "084.ogg"},
    {note: 90, file: "090.ogg"},
    {note: 96, file: "096.ogg"},
];

var sampler = new Sampler(audioCtx, fileInfos, sampleOut);

function audioParamInput(param, title, min, max, step) {
    step = step || 0.01;
    return m("label", "" + title + " ", m("input", {
        value: param.value,
        type: "range",
        step: step,
        min: min,
        max: max,
        title: title + " [" + param.value.toFixed(2) + "]",
        oninput: function (e) {
            param.value = parseFloat(e.target.value);
        }
    }));
}

function view(ctrl) {
    return m("div.main",
        m("div.part",
            m("h2", "sequence."),
            m("h3", "scale."),
            m("a", {onclick: ctrl.newRoot, href: "#"}, noteToText(ctrl.root)),
            " ",
            m("a", {onclick: ctrl.newScale, href: "#"}, ctrl.scale.name),
            m("h3", "mode."),

            m("a", {title: "walk mode", onclick: ctrl.newWalkMode, href: "#"}, ctrl.walkMode._name),
            " ",
            m("a", {title: "octaving mode", onclick: ctrl.newOctMode, href: "#"}, ctrl.octMode._name),
            m("h3", "speed."),
            m("input", {
                value: ctrl.interval, type: "number", step: 10, min: 1, oninput: function (e) {
                    ctrl.interval = 0 | e.target.value;
                }
            }),
            m("h3", "history."),
            ctrl.history.map(noteToText).join(" ")
        ),
        m("div.part",
            m("h2", "fx."),
            m("h3", "a delay line."),
            audioParamInput(rd.delayInputGain.gain, "delay input", 0, 1, 0.01),
            audioParamInput(rd.delay.delayTime, "delay time", 0, 2, 0.01),
            audioParamInput(rd.delayFeedbackGain.gain, "delay feedback", 0, 1),
            m("h3", "a reverberator."),
            audioParamInput(rd.delayMixGain.gain, "delay to reverb", 0, 2),
            audioParamInput(rd.convolverInputGain.gain, "input to reverb", 0, 1),
            audioParamInput(rd.convolverGain.gain, "reverb output level", 0, 2)
        )
    );
};

function controller() {
    var ctrl = this;
    ctrl.nNote = 0;
    ctrl.walkMode = null;
    ctrl.octMode = null;
    ctrl.root = null;
    ctrl.scale = null;
    ctrl.history = [];
    ctrl.interval = rnd(150, 800);

    ctrl.newWalkMode = function () {
        ctrl.walkMode = walkModes.pick(ctrl.walkMode);
        ctrl.refresh();
    };

    ctrl.newOctMode = function () {
        ctrl.octMode = octModes.pick(ctrl.octMode);
        ctrl.refresh();
    }

    ctrl.newRoot = function () {
        ctrl.root = rnd(15, 86);
        ctrl.refresh();
    };

    ctrl.newScale = function () {
        ctrl.scale = sample(scales);
        ctrl.refresh();
    };

    ctrl.refresh = function () {
        if (!(ctrl.root && ctrl.scale)) return;
        ctrl.scaleNotes = ctrl.scale.semis.map(function (a) {
            return ctrl.root + a;
        });
    }

    ctrl.playNote = function () {
        var note = ctrl.walkMode(ctrl) + ctrl.octMode(ctrl) * 12;
        ctrl.history.push(note);
        while (ctrl.history.length >= 10) ctrl.history.shift();
        //if (i % 2 == 1) p += 12;
        sampler.play(note, 0.1);
        ctrl.nNote++;
        m.redraw();
        setTimeout(ctrl.playNote, 0 | ctrl.interval);
    };

    ctrl.start = function () {
        ctrl.playNote();
    };

    ctrl.newRoot();
    ctrl.newScale();
    ctrl.walkMode = walkModes.get("random");
    ctrl.octMode = octModes.get("none");
}

var ctrl = m.mount(document.body, {view: view, controller: controller});


sampler.onready = function () {
    ctrl.start();
    window.ctrl = ctrl;
    window.rd = rd;
};
