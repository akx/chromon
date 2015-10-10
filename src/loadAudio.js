module.exports = function load(audioCtx, target, file, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', file, true);
    request.responseType = 'arraybuffer';
    request.addEventListener("load", function () {
        audioCtx.decodeAudioData(request.response, function (buffer) {
            target.buffer = buffer;
            callback && callback(target);
        }, function (e) {
            console.log("Error with decoding audio data" + e.err);
        });
    }, false);
    request.send();
};
