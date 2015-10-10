var loadAudio = require("./loadAudio");

module.exports = function reverbDelay(audioCtx) {
    var inputGain = audioCtx.createGain();
    var dryGain = audioCtx.createGain();
    var convolver = audioCtx.createConvolver();
    var convolverGain = audioCtx.createGain();
    var delay = audioCtx.createDelay();
    var delayFeedbackGain = audioCtx.createGain();
    var delayMixGain = audioCtx.createGain();

    delay.delayTime.value = 0.4;
    delayFeedbackGain.gain.value = 0.3;
    delayMixGain.gain.value = 0.3;
    convolverGain.gain.value = 0.4;
    loadAudio(audioCtx, convolver, "oggs/reverb.ogg");

    delay.connect(delayFeedbackGain);
    delay.connect(delayMixGain);
    delayFeedbackGain.connect(inputGain);
    delayMixGain.connect(convolver);
    convolver.connect(convolverGain);
    inputGain.connect(convolver);
    inputGain.connect(delay);
    inputGain.connect(dryGain);


    return {
        inputGain: inputGain,
        convolverGain: convolverGain,
        dryGain: dryGain,
        delayFeedbackGain: delayFeedbackGain,
        delayMixGain: delayMixGain
    };

};
