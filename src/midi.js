module.exports.noteToFreq = function note2freq(note) {
    return Math.pow(2, note / 12) * 440;
};

var octNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

module.exports.noteToText = function noteToText(note) {
    var oct = 0 | (note / 12);
    return octNote[note % 12] + oct;
};
