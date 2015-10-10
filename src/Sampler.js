var loadAudio = require("./loadAudio");
var noteToFreq = require("./midi").noteToFreq;

function Sampler(audioCtx, fileInfos, outputNode) {
    this.fileInfos = JSON.parse(JSON.stringify(fileInfos));
    this.audioCtx = audioCtx;
    this.outputNode = outputNode;

    this.ready = false;
    this.onready = function() {};
    var self = this;
    var nToLoad = 0;
    this.fileInfos.forEach(function (info) {
        nToLoad++;
        loadAudio(self.audioCtx, info, "oggs/" + info.file, function () {
            nToLoad--;
            if (nToLoad == 0) {
                self.ready = true;
                self.onready();
            }
        });
    });
};

Sampler.prototype.play = function(note, volume, duration) {
    duration = duration || 0.5;
    var srcFile = null;
    var fileInfos = this.fileInfos;
    for(var i = 1; i < fileInfos.length; i++) {
        if(fileInfos[i].note >= note) {
            srcFile = fileInfos[i - 1];
            break;
        }
    }
    if(!srcFile) return;
    if(!srcFile.buffer) return;

    var source = this.audioCtx.createBufferSource();
    var noteFreq = noteToFreq(note);
    var sampleFreq = noteToFreq(srcFile.note);
    source.buffer = srcFile.buffer;
    source.playbackRate.value = noteFreq / sampleFreq;
    var gain = this.audioCtx.createGain();
    gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + duration);
    source.connect(gain);
    gain.connect(this.outputNode);
    source.start();
}

module.exports = Sampler;
