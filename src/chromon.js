var loadAudio = require("./loadAudio");
var reverbDelay = require("./reverbDelay");
var Sampler = require("./Sampler");

var audioCtx = new AudioContext();
var analyser = audioCtx.createAnalyser();
analyser.fftSize = 512;
var fftData = new Uint8Array(analyser.frequencyBinCount);


var sampleOut = audioCtx.createGain();
var rd = reverbDelay(audioCtx);
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
sampler.onready = function() {
    start();
};

function start() {
    for(var i = 0; i < 10; i++) {
        (function() {
            var p = 24 + i * 2;
            setTimeout(function () {
                sampler.play(p, 0.8);
            }, i * 300);
        }());
    }
}
