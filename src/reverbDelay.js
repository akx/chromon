var loadAudio = require("./loadAudio");

module.exports = function reverbDelay(audioCtx, file) {
    var inputGain = audioCtx.createGain();
    var dryGain = audioCtx.createGain();
    var convolver = audioCtx.createConvolver();
    var convolverInputGain = audioCtx.createGain();
    var convolverGain = audioCtx.createGain();
    var delay = audioCtx.createDelay();
    var delayInputGain = audioCtx.createGain();
    var delayFeedbackGain = audioCtx.createGain();
    var delayMixGain = audioCtx.createGain();

    delay.delayTime.value = 0.4;
    delayFeedbackGain.gain.value = 0.3;
    delayInputGain.gain.value = 1.0;
    convolverInputGain.gain.value = 1.0;
    delayMixGain.gain.value = 0.3;
    convolverGain.gain.value = 0.4;
    loadAudio(audioCtx, convolver, file);

    delay.connect(delayFeedbackGain);
    delay.connect(delayMixGain);
    delayFeedbackGain.connect(inputGain);
    delayMixGain.connect(convolver);
    convolver.connect(convolverGain);
    inputGain.connect(convolverInputGain);
    inputGain.connect(delayInputGain);
    convolverInputGain.connect(convolver);
    delayInputGain.connect(delay);
    inputGain.connect(dryGain);


    return {
        inputGain: inputGain,
        convolverGain: convolverGain,
        convolverInputGain: convolverInputGain,
        dryGain: dryGain,
        delayInputGain: delayInputGain,
        delayFeedbackGain: delayFeedbackGain,
        delayMixGain: delayMixGain,
        delay: delay,
    };

};
