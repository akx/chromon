/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/*!********************!*\
  !*** ./chromon.js ***!
  \********************/
/***/ function(module, exports, __webpack_require__) {

	var sample = __webpack_require__(/*! lodash/collection/sample */ 24);
	var rnd = __webpack_require__(/*! lodash/number/random */ 47);
	var vals = __webpack_require__(/*! lodash/object/values */ 35);
	var m = __webpack_require__(/*! mithril */ 49);
	
	var walkModes = __webpack_require__(/*! ./walkModes */ 51);
	var octModes = __webpack_require__(/*! ./octModes */ 53);
	var scales = vals(__webpack_require__(/*! ./scale-data */ 48)).reduce(function (a, b) {
	    return a.concat(b);
	});
	var loadAudio = __webpack_require__(/*! ./loadAudio */ 1);
	var reverbDelay = __webpack_require__(/*! ./reverbDelay */ 2);
	var Sampler = __webpack_require__(/*! ./Sampler */ 3);
	var noteToText = __webpack_require__(/*! ./midi */ 54).noteToText;
	
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
	
	            m("a", {title: "walk mode", onclick: ctrl.newWalkMode, href: "#"}, ctrl.walkMode.name),
	            " ",
	            m("a", {title: "octaving mode", onclick: ctrl.newOctMode, href: "#"}, ctrl.octMode.name),
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


/***/ },
/* 1 */
/*!**********************!*\
  !*** ./loadAudio.js ***!
  \**********************/
/***/ function(module, exports) {

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


/***/ },
/* 2 */
/*!************************!*\
  !*** ./reverbDelay.js ***!
  \************************/
/***/ function(module, exports, __webpack_require__) {

	var loadAudio = __webpack_require__(/*! ./loadAudio */ 1);
	
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


/***/ },
/* 3 */
/*!********************!*\
  !*** ./Sampler.js ***!
  \********************/
/***/ function(module, exports, __webpack_require__) {

	var loadAudio = __webpack_require__(/*! ./loadAudio */ 1);
	var noteToFreq = __webpack_require__(/*! ./midi */ 54).noteToFreq;
	
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


/***/ },
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */,
/* 12 */,
/* 13 */,
/* 14 */,
/* 15 */,
/* 16 */,
/* 17 */,
/* 18 */,
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */
/*!****************************************!*\
  !*** ../~/lodash/collection/sample.js ***!
  \****************************************/
/***/ function(module, exports, __webpack_require__) {

	var baseRandom = __webpack_require__(/*! ../internal/baseRandom */ 25),
	    isIterateeCall = __webpack_require__(/*! ../internal/isIterateeCall */ 26),
	    toArray = __webpack_require__(/*! ../lang/toArray */ 33),
	    toIterable = __webpack_require__(/*! ../internal/toIterable */ 46);
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeMin = Math.min;
	
	/**
	 * Gets a random element or `n` random elements from a collection.
	 *
	 * @static
	 * @memberOf _
	 * @category Collection
	 * @param {Array|Object|string} collection The collection to sample.
	 * @param {number} [n] The number of elements to sample.
	 * @param- {Object} [guard] Enables use as a callback for functions like `_.map`.
	 * @returns {*} Returns the random sample(s).
	 * @example
	 *
	 * _.sample([1, 2, 3, 4]);
	 * // => 2
	 *
	 * _.sample([1, 2, 3, 4], 2);
	 * // => [3, 1]
	 */
	function sample(collection, n, guard) {
	  if (guard ? isIterateeCall(collection, n, guard) : n == null) {
	    collection = toIterable(collection);
	    var length = collection.length;
	    return length > 0 ? collection[baseRandom(0, length - 1)] : undefined;
	  }
	  var index = -1,
	      result = toArray(collection),
	      length = result.length,
	      lastIndex = length - 1;
	
	  n = nativeMin(n < 0 ? 0 : (+n || 0), length);
	  while (++index < n) {
	    var rand = baseRandom(index, lastIndex),
	        value = result[rand];
	
	    result[rand] = result[index];
	    result[index] = value;
	  }
	  result.length = n;
	  return result;
	}
	
	module.exports = sample;


/***/ },
/* 25 */
/*!******************************************!*\
  !*** ../~/lodash/internal/baseRandom.js ***!
  \******************************************/
/***/ function(module, exports) {

	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeFloor = Math.floor,
	    nativeRandom = Math.random;
	
	/**
	 * The base implementation of `_.random` without support for argument juggling
	 * and returning floating-point numbers.
	 *
	 * @private
	 * @param {number} min The minimum possible value.
	 * @param {number} max The maximum possible value.
	 * @returns {number} Returns the random number.
	 */
	function baseRandom(min, max) {
	  return min + nativeFloor(nativeRandom() * (max - min + 1));
	}
	
	module.exports = baseRandom;


/***/ },
/* 26 */
/*!**********************************************!*\
  !*** ../~/lodash/internal/isIterateeCall.js ***!
  \**********************************************/
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(/*! ./isArrayLike */ 27),
	    isIndex = __webpack_require__(/*! ./isIndex */ 31),
	    isObject = __webpack_require__(/*! ../lang/isObject */ 32);
	
	/**
	 * Checks if the provided arguments are from an iteratee call.
	 *
	 * @private
	 * @param {*} value The potential iteratee value argument.
	 * @param {*} index The potential iteratee index or key argument.
	 * @param {*} object The potential iteratee object argument.
	 * @returns {boolean} Returns `true` if the arguments are from an iteratee call, else `false`.
	 */
	function isIterateeCall(value, index, object) {
	  if (!isObject(object)) {
	    return false;
	  }
	  var type = typeof index;
	  if (type == 'number'
	      ? (isArrayLike(object) && isIndex(index, object.length))
	      : (type == 'string' && index in object)) {
	    var other = object[index];
	    return value === value ? (value === other) : (other !== other);
	  }
	  return false;
	}
	
	module.exports = isIterateeCall;


/***/ },
/* 27 */
/*!*******************************************!*\
  !*** ../~/lodash/internal/isArrayLike.js ***!
  \*******************************************/
/***/ function(module, exports, __webpack_require__) {

	var getLength = __webpack_require__(/*! ./getLength */ 28),
	    isLength = __webpack_require__(/*! ./isLength */ 30);
	
	/**
	 * Checks if `value` is array-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
	 */
	function isArrayLike(value) {
	  return value != null && isLength(getLength(value));
	}
	
	module.exports = isArrayLike;


/***/ },
/* 28 */
/*!*****************************************!*\
  !*** ../~/lodash/internal/getLength.js ***!
  \*****************************************/
/***/ function(module, exports, __webpack_require__) {

	var baseProperty = __webpack_require__(/*! ./baseProperty */ 29);
	
	/**
	 * Gets the "length" property value of `object`.
	 *
	 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
	 * that affects Safari on at least iOS 8.1-8.3 ARM64.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {*} Returns the "length" value.
	 */
	var getLength = baseProperty('length');
	
	module.exports = getLength;


/***/ },
/* 29 */
/*!********************************************!*\
  !*** ../~/lodash/internal/baseProperty.js ***!
  \********************************************/
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.property` without support for deep paths.
	 *
	 * @private
	 * @param {string} key The key of the property to get.
	 * @returns {Function} Returns the new function.
	 */
	function baseProperty(key) {
	  return function(object) {
	    return object == null ? undefined : object[key];
	  };
	}
	
	module.exports = baseProperty;


/***/ },
/* 30 */
/*!****************************************!*\
  !*** ../~/lodash/internal/isLength.js ***!
  \****************************************/
/***/ function(module, exports) {

	/**
	 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/**
	 * Checks if `value` is a valid array-like length.
	 *
	 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
	 */
	function isLength(value) {
	  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
	}
	
	module.exports = isLength;


/***/ },
/* 31 */
/*!***************************************!*\
  !*** ../~/lodash/internal/isIndex.js ***!
  \***************************************/
/***/ function(module, exports) {

	/** Used to detect unsigned integer values. */
	var reIsUint = /^\d+$/;
	
	/**
	 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
	 * of an array-like value.
	 */
	var MAX_SAFE_INTEGER = 9007199254740991;
	
	/**
	 * Checks if `value` is a valid array-like index.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
	 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
	 */
	function isIndex(value, length) {
	  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
	  length = length == null ? MAX_SAFE_INTEGER : length;
	  return value > -1 && value % 1 == 0 && value < length;
	}
	
	module.exports = isIndex;


/***/ },
/* 32 */
/*!************************************!*\
  !*** ../~/lodash/lang/isObject.js ***!
  \************************************/
/***/ function(module, exports) {

	/**
	 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
	 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
	 * @example
	 *
	 * _.isObject({});
	 * // => true
	 *
	 * _.isObject([1, 2, 3]);
	 * // => true
	 *
	 * _.isObject(1);
	 * // => false
	 */
	function isObject(value) {
	  // Avoid a V8 JIT bug in Chrome 19-20.
	  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
	  var type = typeof value;
	  return !!value && (type == 'object' || type == 'function');
	}
	
	module.exports = isObject;


/***/ },
/* 33 */
/*!***********************************!*\
  !*** ../~/lodash/lang/toArray.js ***!
  \***********************************/
/***/ function(module, exports, __webpack_require__) {

	var arrayCopy = __webpack_require__(/*! ../internal/arrayCopy */ 34),
	    getLength = __webpack_require__(/*! ../internal/getLength */ 28),
	    isLength = __webpack_require__(/*! ../internal/isLength */ 30),
	    values = __webpack_require__(/*! ../object/values */ 35);
	
	/**
	 * Converts `value` to an array.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to convert.
	 * @returns {Array} Returns the converted array.
	 * @example
	 *
	 * (function() {
	 *   return _.toArray(arguments).slice(1);
	 * }(1, 2, 3));
	 * // => [2, 3]
	 */
	function toArray(value) {
	  var length = value ? getLength(value) : 0;
	  if (!isLength(length)) {
	    return values(value);
	  }
	  if (!length) {
	    return [];
	  }
	  return arrayCopy(value);
	}
	
	module.exports = toArray;


/***/ },
/* 34 */
/*!*****************************************!*\
  !*** ../~/lodash/internal/arrayCopy.js ***!
  \*****************************************/
/***/ function(module, exports) {

	/**
	 * Copies the values of `source` to `array`.
	 *
	 * @private
	 * @param {Array} source The array to copy values from.
	 * @param {Array} [array=[]] The array to copy values to.
	 * @returns {Array} Returns `array`.
	 */
	function arrayCopy(source, array) {
	  var index = -1,
	      length = source.length;
	
	  array || (array = Array(length));
	  while (++index < length) {
	    array[index] = source[index];
	  }
	  return array;
	}
	
	module.exports = arrayCopy;


/***/ },
/* 35 */
/*!************************************!*\
  !*** ../~/lodash/object/values.js ***!
  \************************************/
/***/ function(module, exports, __webpack_require__) {

	var baseValues = __webpack_require__(/*! ../internal/baseValues */ 36),
	    keys = __webpack_require__(/*! ./keys */ 37);
	
	/**
	 * Creates an array of the own enumerable property values of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property values.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.values(new Foo);
	 * // => [1, 2] (iteration order is not guaranteed)
	 *
	 * _.values('hi');
	 * // => ['h', 'i']
	 */
	function values(object) {
	  return baseValues(object, keys(object));
	}
	
	module.exports = values;


/***/ },
/* 36 */
/*!******************************************!*\
  !*** ../~/lodash/internal/baseValues.js ***!
  \******************************************/
/***/ function(module, exports) {

	/**
	 * The base implementation of `_.values` and `_.valuesIn` which creates an
	 * array of `object` property values corresponding to the property names
	 * of `props`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {Array} props The property names to get values for.
	 * @returns {Object} Returns the array of property values.
	 */
	function baseValues(object, props) {
	  var index = -1,
	      length = props.length,
	      result = Array(length);
	
	  while (++index < length) {
	    result[index] = object[props[index]];
	  }
	  return result;
	}
	
	module.exports = baseValues;


/***/ },
/* 37 */
/*!**********************************!*\
  !*** ../~/lodash/object/keys.js ***!
  \**********************************/
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(/*! ../internal/getNative */ 38),
	    isArrayLike = __webpack_require__(/*! ../internal/isArrayLike */ 27),
	    isObject = __webpack_require__(/*! ../lang/isObject */ 32),
	    shimKeys = __webpack_require__(/*! ../internal/shimKeys */ 42);
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeKeys = getNative(Object, 'keys');
	
	/**
	 * Creates an array of the own enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects. See the
	 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
	 * for more details.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keys(new Foo);
	 * // => ['a', 'b'] (iteration order is not guaranteed)
	 *
	 * _.keys('hi');
	 * // => ['0', '1']
	 */
	var keys = !nativeKeys ? shimKeys : function(object) {
	  var Ctor = object == null ? undefined : object.constructor;
	  if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
	      (typeof object != 'function' && isArrayLike(object))) {
	    return shimKeys(object);
	  }
	  return isObject(object) ? nativeKeys(object) : [];
	};
	
	module.exports = keys;


/***/ },
/* 38 */
/*!*****************************************!*\
  !*** ../~/lodash/internal/getNative.js ***!
  \*****************************************/
/***/ function(module, exports, __webpack_require__) {

	var isNative = __webpack_require__(/*! ../lang/isNative */ 39);
	
	/**
	 * Gets the native function at `key` of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @param {string} key The key of the method to get.
	 * @returns {*} Returns the function if it's native, else `undefined`.
	 */
	function getNative(object, key) {
	  var value = object == null ? undefined : object[key];
	  return isNative(value) ? value : undefined;
	}
	
	module.exports = getNative;


/***/ },
/* 39 */
/*!************************************!*\
  !*** ../~/lodash/lang/isNative.js ***!
  \************************************/
/***/ function(module, exports, __webpack_require__) {

	var isFunction = __webpack_require__(/*! ./isFunction */ 40),
	    isObjectLike = __webpack_require__(/*! ../internal/isObjectLike */ 41);
	
	/** Used to detect host constructors (Safari > 5). */
	var reIsHostCtor = /^\[object .+?Constructor\]$/;
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to resolve the decompiled source of functions. */
	var fnToString = Function.prototype.toString;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/** Used to detect if a method is native. */
	var reIsNative = RegExp('^' +
	  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
	  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
	);
	
	/**
	 * Checks if `value` is a native function.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
	 * @example
	 *
	 * _.isNative(Array.prototype.push);
	 * // => true
	 *
	 * _.isNative(_);
	 * // => false
	 */
	function isNative(value) {
	  if (value == null) {
	    return false;
	  }
	  if (isFunction(value)) {
	    return reIsNative.test(fnToString.call(value));
	  }
	  return isObjectLike(value) && reIsHostCtor.test(value);
	}
	
	module.exports = isNative;


/***/ },
/* 40 */
/*!**************************************!*\
  !*** ../~/lodash/lang/isFunction.js ***!
  \**************************************/
/***/ function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(/*! ./isObject */ 32);
	
	/** `Object#toString` result references. */
	var funcTag = '[object Function]';
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;
	
	/**
	 * Checks if `value` is classified as a `Function` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isFunction(_);
	 * // => true
	 *
	 * _.isFunction(/abc/);
	 * // => false
	 */
	function isFunction(value) {
	  // The use of `Object#toString` avoids issues with the `typeof` operator
	  // in older versions of Chrome and Safari which return 'function' for regexes
	  // and Safari 8 which returns 'object' for typed array constructors.
	  return isObject(value) && objToString.call(value) == funcTag;
	}
	
	module.exports = isFunction;


/***/ },
/* 41 */
/*!********************************************!*\
  !*** ../~/lodash/internal/isObjectLike.js ***!
  \********************************************/
/***/ function(module, exports) {

	/**
	 * Checks if `value` is object-like.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 */
	function isObjectLike(value) {
	  return !!value && typeof value == 'object';
	}
	
	module.exports = isObjectLike;


/***/ },
/* 42 */
/*!****************************************!*\
  !*** ../~/lodash/internal/shimKeys.js ***!
  \****************************************/
/***/ function(module, exports, __webpack_require__) {

	var isArguments = __webpack_require__(/*! ../lang/isArguments */ 43),
	    isArray = __webpack_require__(/*! ../lang/isArray */ 44),
	    isIndex = __webpack_require__(/*! ./isIndex */ 31),
	    isLength = __webpack_require__(/*! ./isLength */ 30),
	    keysIn = __webpack_require__(/*! ../object/keysIn */ 45);
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * A fallback implementation of `Object.keys` which creates an array of the
	 * own enumerable property names of `object`.
	 *
	 * @private
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 */
	function shimKeys(object) {
	  var props = keysIn(object),
	      propsLength = props.length,
	      length = propsLength && object.length;
	
	  var allowIndexes = !!length && isLength(length) &&
	    (isArray(object) || isArguments(object));
	
	  var index = -1,
	      result = [];
	
	  while (++index < propsLength) {
	    var key = props[index];
	    if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	module.exports = shimKeys;


/***/ },
/* 43 */
/*!***************************************!*\
  !*** ../~/lodash/lang/isArguments.js ***!
  \***************************************/
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(/*! ../internal/isArrayLike */ 27),
	    isObjectLike = __webpack_require__(/*! ../internal/isObjectLike */ 41);
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/** Native method references. */
	var propertyIsEnumerable = objectProto.propertyIsEnumerable;
	
	/**
	 * Checks if `value` is classified as an `arguments` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArguments(function() { return arguments; }());
	 * // => true
	 *
	 * _.isArguments([1, 2, 3]);
	 * // => false
	 */
	function isArguments(value) {
	  return isObjectLike(value) && isArrayLike(value) &&
	    hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
	}
	
	module.exports = isArguments;


/***/ },
/* 44 */
/*!***********************************!*\
  !*** ../~/lodash/lang/isArray.js ***!
  \***********************************/
/***/ function(module, exports, __webpack_require__) {

	var getNative = __webpack_require__(/*! ../internal/getNative */ 38),
	    isLength = __webpack_require__(/*! ../internal/isLength */ 30),
	    isObjectLike = __webpack_require__(/*! ../internal/isObjectLike */ 41);
	
	/** `Object#toString` result references. */
	var arrayTag = '[object Array]';
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var objToString = objectProto.toString;
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeIsArray = getNative(Array, 'isArray');
	
	/**
	 * Checks if `value` is classified as an `Array` object.
	 *
	 * @static
	 * @memberOf _
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
	 * @example
	 *
	 * _.isArray([1, 2, 3]);
	 * // => true
	 *
	 * _.isArray(function() { return arguments; }());
	 * // => false
	 */
	var isArray = nativeIsArray || function(value) {
	  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
	};
	
	module.exports = isArray;


/***/ },
/* 45 */
/*!************************************!*\
  !*** ../~/lodash/object/keysIn.js ***!
  \************************************/
/***/ function(module, exports, __webpack_require__) {

	var isArguments = __webpack_require__(/*! ../lang/isArguments */ 43),
	    isArray = __webpack_require__(/*! ../lang/isArray */ 44),
	    isIndex = __webpack_require__(/*! ../internal/isIndex */ 31),
	    isLength = __webpack_require__(/*! ../internal/isLength */ 30),
	    isObject = __webpack_require__(/*! ../lang/isObject */ 32);
	
	/** Used for native method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Creates an array of the own and inherited enumerable property names of `object`.
	 *
	 * **Note:** Non-object values are coerced to objects.
	 *
	 * @static
	 * @memberOf _
	 * @category Object
	 * @param {Object} object The object to query.
	 * @returns {Array} Returns the array of property names.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 *   this.b = 2;
	 * }
	 *
	 * Foo.prototype.c = 3;
	 *
	 * _.keysIn(new Foo);
	 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
	 */
	function keysIn(object) {
	  if (object == null) {
	    return [];
	  }
	  if (!isObject(object)) {
	    object = Object(object);
	  }
	  var length = object.length;
	  length = (length && isLength(length) &&
	    (isArray(object) || isArguments(object)) && length) || 0;
	
	  var Ctor = object.constructor,
	      index = -1,
	      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
	      result = Array(length),
	      skipIndexes = length > 0;
	
	  while (++index < length) {
	    result[index] = (index + '');
	  }
	  for (var key in object) {
	    if (!(skipIndexes && isIndex(key, length)) &&
	        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
	      result.push(key);
	    }
	  }
	  return result;
	}
	
	module.exports = keysIn;


/***/ },
/* 46 */
/*!******************************************!*\
  !*** ../~/lodash/internal/toIterable.js ***!
  \******************************************/
/***/ function(module, exports, __webpack_require__) {

	var isArrayLike = __webpack_require__(/*! ./isArrayLike */ 27),
	    isObject = __webpack_require__(/*! ../lang/isObject */ 32),
	    values = __webpack_require__(/*! ../object/values */ 35);
	
	/**
	 * Converts `value` to an array-like object if it's not one.
	 *
	 * @private
	 * @param {*} value The value to process.
	 * @returns {Array|Object} Returns the array-like object.
	 */
	function toIterable(value) {
	  if (value == null) {
	    return [];
	  }
	  if (!isArrayLike(value)) {
	    return values(value);
	  }
	  return isObject(value) ? value : Object(value);
	}
	
	module.exports = toIterable;


/***/ },
/* 47 */
/*!************************************!*\
  !*** ../~/lodash/number/random.js ***!
  \************************************/
/***/ function(module, exports, __webpack_require__) {

	var baseRandom = __webpack_require__(/*! ../internal/baseRandom */ 25),
	    isIterateeCall = __webpack_require__(/*! ../internal/isIterateeCall */ 26);
	
	/* Native method references for those with the same name as other `lodash` methods. */
	var nativeMin = Math.min,
	    nativeRandom = Math.random;
	
	/**
	 * Produces a random number between `min` and `max` (inclusive). If only one
	 * argument is provided a number between `0` and the given number is returned.
	 * If `floating` is `true`, or either `min` or `max` are floats, a floating-point
	 * number is returned instead of an integer.
	 *
	 * @static
	 * @memberOf _
	 * @category Number
	 * @param {number} [min=0] The minimum possible value.
	 * @param {number} [max=1] The maximum possible value.
	 * @param {boolean} [floating] Specify returning a floating-point number.
	 * @returns {number} Returns the random number.
	 * @example
	 *
	 * _.random(0, 5);
	 * // => an integer between 0 and 5
	 *
	 * _.random(5);
	 * // => also an integer between 0 and 5
	 *
	 * _.random(5, true);
	 * // => a floating-point number between 0 and 5
	 *
	 * _.random(1.2, 5.2);
	 * // => a floating-point number between 1.2 and 5.2
	 */
	function random(min, max, floating) {
	  if (floating && isIterateeCall(min, max, floating)) {
	    max = floating = undefined;
	  }
	  var noMin = min == null,
	      noMax = max == null;
	
	  if (floating == null) {
	    if (noMax && typeof min == 'boolean') {
	      floating = min;
	      min = 1;
	    }
	    else if (typeof max == 'boolean') {
	      floating = max;
	      noMax = true;
	    }
	  }
	  if (noMin && noMax) {
	    max = 1;
	    noMax = false;
	  }
	  min = +min || 0;
	  if (noMax) {
	    max = min;
	    min = 0;
	  } else {
	    max = +max || 0;
	  }
	  if (floating || min % 1 || max % 1) {
	    var rand = nativeRandom();
	    return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand + '').length - 1)))), max);
	  }
	  return baseRandom(min, max);
	}
	
	module.exports = random;


/***/ },
/* 48 */
/*!***********************!*\
  !*** ./scale-data.js ***!
  \***********************/
/***/ function(module, exports) {

	/* this file is autogenerated by reascale-js/convert-cli */
	module.exports = {
	  "Ungrouped": [
	    {name:'Major Pentatonic',semis:[0,2,4,7,9]},
	    {name:'Sus 4 Pentatonic',semis:[0,2,5,7,10]},
	    {name:'M3 Mj Pentatonic',semis:[0,3,5,8,10]},
	    {name:'Minor Pentatonic',semis:[0,3,5,7,10]},
	    {name:'Chinese 6 Pentatonic',semis:[0,4,6,7,11]},
	    {name:'Hirajoshi',semis:[0,2,3,7,8]},
	    {name:'Han - kumoi',semis:[0,2,5,7,8]},
	    {name:'Iwato',semis:[0,1,5,6,10]},
	    {name:'In',semis:[0,1,5,7,8]},
	    {name:'Yo',semis:[0,2,5,7,9]},
	    {name:'Pelog',semis:[0,1,3,7,8]},
	    {name:'Indonesian 2 Pentatonic',semis:[0,1,6,7,8]},
	    {name:'Indonesian 3 Pentatonic',semis:[0,4,5,7,11]},
	    {name:'Kumoi Scale',semis:[0,2,3,7,9]},
	    {name:'Sixtone Mode 1',semis:[0,3,4,7,8,11]},
	    {name:'Sixtone Mode 2',semis:[0,1,4,5,8,9]},
	    {name:'Prometheus',semis:[0,2,4,6,8,10]},
	    {name:'Prometheus Neopolitan',semis:[0,1,4,6,8,10]},
	    {name:'Blues',semis:[0,3,5,6,7,10]},
	    {name:'Sus 4',semis:[0,2,5,7,9,10]},
	    {name:'Major',semis:[0,2,4,5,7,9,11]},
	    {name:'Dorian',semis:[0,2,3,5,7,9,10]},
	    {name:'Phrygian',semis:[0,1,3,5,7,8,10]},
	    {name:'Lydian',semis:[0,2,4,6,7,9,11]},
	    {name:'Mixolydian',semis:[0,2,4,5,7,9,10]},
	    {name:'Minor',semis:[0,2,3,5,7,8,10]},
	    {name:'Locrian',semis:[0,1,3,5,6,8,10]},
	    {name:'Harmonic Minor',semis:[0,2,3,5,7,8,11]},
	    {name:'Ionian Augmented',semis:[0,2,4,5,8,9,11]},
	    {name:'Dorian #4',semis:[0,2,3,6,7,9,10]},
	    {name:'Mixolydian b9b13',semis:[0,1,4,5,7,8,10]},
	    {name:'Lydian #9',semis:[0,3,4,6,7,9,11]},
	    {name:'Alt Dominant bb7',semis:[0,1,3,4,5,8,9]},
	    {name:'Medolic Minor',semis:[0,2,3,5,7,9,11]},
	    {name:'Dorian b2',semis:[0,1,3,5,7,9,10]},
	    {name:'Lydian Aug',semis:[0,2,4,6,8,9,11]},
	    {name:'Lydian b7',semis:[0,2,4,6,7,9,10]},
	    {name:'Mixolydian b13',semis:[0,2,4,5,7,8,10]},
	    {name:'Locrian Nat 9',semis:[0,2,3,5,6,8,10]},
	    {name:'Alt Dominant',semis:[0,1,3,4,6,8,10]},
	    {name:'Locrian Nat 6',semis:[0,1,3,5,6,9,10]},
	    {name:'Hungarian Folk',semis:[0,1,4,5,7,8,11]},
	    {name:'Purvi',semis:[0,1,4,6,7,8,11]},
	    {name:'Todi',semis:[0,1,3,6,7,8,11]},
	    {name:'Saba',semis:[0,2,3,4,7,8,10]},
	    {name:'Hungarian Major',semis:[0,3,4,6,7,9,10]},
	    {name:'Hungarian Gypsy 1',semis:[0,2,3,6,7,8,11]},
	    {name:'Hungarian Gypsy 2',semis:[0,2,3,6,7,8,10]},
	    {name:'Harmonic Major',semis:[0,2,4,5,7,8,11]},
	    {name:'Spanish Dominant',semis:[0,1,3,6,7,8,10]},
	    {name:'Smyrneiko',semis:[0,2,3,6,7,9,11]},
	    {name:'Mixolydian b9',semis:[0,1,4,5,7,9,10]},
	    {name:'Enigmatic',semis:[0,1,4,6,8,10,11]},
	    {name:'Major Locrian',semis:[0,2,4,5,6,8,10]},
	    {name:'Lydian Minor',semis:[0,2,4,6,7,8,10]},
	    {name:'Leading Wholetone',semis:[0,2,4,6,8,10,11]},
	    {name:'Persian',semis:[0,1,4,5,6,8,11]},
	    {name:'Oriental No1',semis:[0,1,4,5,6,8,10]},
	    {name:'Oriental No2',semis:[0,1,4,5,6,9,10]},
	    {name:'Neopolitan Major',semis:[0,1,3,5,7,9,11]},
	    {name:'Neopolitan Minor',semis:[0,1,3,5,7,8,11]},
	    {name:'Composite Blues',semis:[0,3,4,5,6,7,10]},
	    {name:'Whole-Half Dim',semis:[0,2,3,5,6,8,9,11]},
	    {name:'Half-Whole Dim',semis:[0,1,3,4,6,7,9,10]},
	    {name:'Japanese',semis:[0,2,4,5,6,7,9,11]},
	    {name:'Major Bebop',semis:[0,2,4,5,7,8,9,11]},
	    {name:'Dorian Bebop',semis:[0,2,3,4,5,7,9,11]},
	    {name:'Mixolydian Bebop 1',semis:[0,2,4,5,7,9,10,11]},
	    {name:'Mixolydian Bebop 2',semis:[0,2,4,5,6,7,9,10]},
	    {name:'Altered Dominant bb7',semis:[0,1,3,4,6,8,9]},
	    {name:'Dorian Hexatonic (Celtic)',semis:[0,3,5,7,9,10]},
	    {name:'Phrygian Hexatonic (Arabic)',semis:[0,1,5,7,8,10]},
	    {name:'Mixolydian Pentatonic (Hindu)',semis:[0,4,5,7,10]},
	    {name:'Locrian Pentatonic (Somewhere very strange)',semis:[0,3,5,6,10]},
	    {name:'Diminished',semis:[0,1,3,5,6,8,9,11]},
	  ],
	  "3 Note Scales": [
	    {name:'Chromatic TriMirror',semis:[0,1,2]},
	    {name:'Do Re Mi ',semis:[0,2,4]},
	    {name:'Flat 6 and 7',semis:[0,10,11]},
	    {name:'Major Flat 6',semis:[0,4,8]},
	    {name:'Major Triad 1',semis:[0,3,8]},
	    {name:'Major Triad 2',semis:[0,4,7]},
	    {name:'Major Triad 3',semis:[0,5,9]},
	    {name:'Minor Triad 1',semis:[0,4,9]},
	    {name:'Minor Triad 2',semis:[0,3,7]},
	    {name:'Minor Triad 3',semis:[0,5,8]},
	    {name:'Minor TriChord',semis:[0,2,3]},
	    {name:'Phrygian TriChord',semis:[0,1,3]},
	    {name:'Sanagari 1',semis:[0,5,10]},
	    {name:'Ute Tritone 1',semis:[0,3,10]},
	  ],
	  "4 note Scales": [
	    {name:'Alternating TetraMirror 1',semis:[0,1,3,4]},
	    {name:'Bi Yu',semis:[0,3,7,10]},
	    {name:'Chromatic TetraMirror 1',semis:[0,1,2,3]},
	    {name:'Diminished 7th Chord',semis:[0,3,6,9]},
	    {name:'Dorian TetraChord',semis:[0,2,3,5]},
	    {name:'Eskimo Tetratonic',semis:[0,2,4,7]},
	    {name:'Genus Primum Inverse',semis:[0,5,7,10]},
	    {name:'Har Minor TetraChord 1',semis:[0,2,3,6]},
	    {name:'Major TetraChord 1',semis:[0,4,7,10]},
	    {name:'Major TetraChord 2',semis:[0,4,7,11]},
	    {name:'Major  TetraChord 2',semis:[0,3,8,10]},
	    {name:'Major  TetraChord 3',semis:[0,2,5,10]},
	    {name:'Major TetraChord 4',semis:[0,5,7,9]},
	    {name:'Major TetraChord 6',semis:[0,2,6,9]},
	    {name:'Major TetraChord 7',semis:[0,3,5,9]},
	    {name:'Major TetraChord 9',semis:[0,3,6,8]},
	    {name:'Major TetraChord 10',semis:[0,2,5,7]},
	    {name:'Major TetraChord 11',semis:[0,2,4,5]},
	    {name:'Sixth TetraChord 1',semis:[0,4,7,9]},
	    {name:'Sixth TetraChord 2',semis:[0,2,5,9]},
	    {name:'Phrygian TetraChord',semis:[0,1,3,5]},
	    {name:'Warao Minor TriChord',semis:[0,2,3,10]},
	    {name:'Whole-Tone Tetramirror',semis:[0,2,4,6]},
	  ],
	  "5 Note Scales": [
	    {name:'No Name',semis:[0,1,4,7,9]},
	    {name:'Altered Pentatonic',semis:[0,1,5,7,9]},
	    {name:'Balinese Pentachord 1',semis:[0,1,4,6,7]},
	    {name:'Blues #V',semis:[0,3,5,6,11]},
	    {name:'Blues Pentacluster 1',semis:[0,1,2,3,6]},
	    {name:'Blues PentaCluster 3',semis:[0,1,2,3,5]},
	    {name:'Center-Cluster PentaMirror',semis:[0,3,4,5,8]},
	    {name:'Chaio 1',semis:[0,2,5,8,10]},
	    {name:'Chromatic PentaMirror',semis:[0,1,2,3,4]},
	    {name:'Dominant Pentatonic',semis:[0,2,4,7,10]},
	    {name:'Half Diminished plus b8',semis:[0,3,6,10,11]},
	    {name:'Japanese Pentachord 1 ',semis:[0,1,3,6,7]},
	    {name:'Kokin-Joshi',semis:[0,1,5,7,10]},
	    {name:'Kung',semis:[0,2,4,6,9]},
	    {name:'Locrian PentaMirror',semis:[0,1,3,5,6]},
	    {name:'Lydian Pentachord',semis:[0,2,4,6,7]},
	    {name:'Major Pentachord',semis:[0,2,4,5,7]},
	    {name:'Minor 6th Added',semis:[0,3,5,7,9]},
	    {name:'Minor Pentachord Chad G',semis:[0,2,3,5,7]},
	    {name:'Oriental Pentacluster 1',semis:[0,1,2,5,6]},
	    {name:'Oriental Raga Guhamano',semis:[0,2,5,9,10]},
	    {name:'Romanian Bacovia 1',semis:[0,4,5,8,11]},
	    {name:'Spanish Pentacluster 1',semis:[0,1,3,4,5]},
	  ],
	  "6 Note Scales": [
	    {name:'Blues Dorian Hexatonic 1 ',semis:[0,2,3,4,7,9]},
	    {name:'Blues Dorian Hexatonic 2',semis:[0,1,3,4,7,9]},
	    {name:'Blues Minor Maj7',semis:[0,3,5,6,7,11]},
	    {name:'Chromatic HexaMirror all #',semis:[0,1,2,3,4,5]},
	    {name:'Double-Phrygian Hexatonic',semis:[0,1,3,5,6,9]},
	    {name:'Eskimo Hexatonic 1',semis:[0,2,4,6,8,9]},
	    {name:'Eskimo Hexatonic 2',semis:[0,2,4,6,8,11]},
	    {name:'Genus Secundum',semis:[0,4,5,7,9,11]},
	    {name:'Hawaiian',semis:[0,2,3,7,9,11]},
	    {name:'Honchoshi Plagal Form',semis:[0,1,3,5,6,10]},
	    {name:'Lydian #2 Hexatonic',semis:[0,3,4,7,9,11]},
	    {name:'Lydian Hexatonic',semis:[0,2,4,7,9,11]},
	    {name:'Major Bebop Hexatonic',semis:[0,2,4,7,8,9]},
	    {name:'Minor Hexatonic',semis:[0,2,3,5,7,10]},
	    {name:'Phrygian Hexatonic',semis:[0,3,5,7,8,10]},
	    {name:'Prometheus 2',semis:[0,2,4,6,9,10]},
	    {name:'Prometheus Neapolitan 2',semis:[0,1,4,6,9,10]},
	    {name:'Pyramid Hexatonic',semis:[0,2,3,5,6,9]},
	    {name:'Ritsu',semis:[0,1,3,5,8,10]},
	    {name:'Scottish Hexatonic Arezzo',semis:[0,2,4,5,7,9]},
	    {name:'Takemitsu Tree Line Mod 1',semis:[0,2,3,6,8,10]},
	    {name:'Takemitsu Tree Line Mod 2',semis:[0,2,3,6,8,11]},
	  ],
	  "7 Note Scales": [
	    {name:'Aeolian 2# 4# #5',semis:[0,3,4,6,8,9,11]},
	    {name:'Bhairubahar Thaat',semis:[0,1,4,5,7,9,11]},
	    {name:'Blues Heptatonic',semis:[0,3,5,6,7,9,10]},
	    {name:'Blues Modified',semis:[0,2,3,5,6,7,10]},
	    {name:'Blues Phrygian 1',semis:[0,1,3,5,6,7,10]},
	    {name:'Blues with Leading Tone',semis:[0,3,5,6,7,10,11]},
	    {name:'Chromatic Dorian',semis:[0,1,2,5,7,8,9]},
	    {name:'Chromatic Dorian Inverse ',semis:[0,3,4,5,7,10,11]},
	    {name:'Chromatic HeptaMirror',semis:[0,1,2,3,4,5,6]},
	    {name:'Chromatic Hypodorian 1',semis:[0,2,3,4,7,8,9]},
	    {name:'Chromatic Hypodorian Inv',semis:[0,3,4,5,8,9,10]},
	    {name:'Chromatic Hypophrygian',semis:[0,1,2,5,6,7,9]},
	    {name:'Chromatic Lydian',semis:[0,1,4,5,6,9,11]},
	    {name:'Chromatic Mixolydian 1',semis:[0,1,2,4,6,7,10]},
	    {name:'Chromatic Mixolydian 2',semis:[0,1,2,5,6,7,10]},
	    {name:'Chromatic Mixolydian Inv',semis:[0,2,5,6,7,10,11]},
	    {name:'Chromatic Phrygian',semis:[0,3,4,5,8,10,11]},
	    {name:'Chromatic Phrygian Inverse',semis:[0,1,2,4,7,8,9]},
	    {name:'Dorian b5',semis:[0,2,3,5,6,9,10]},
	    {name:'Enigmatic Descending 1',semis:[0,1,4,5,8,10,11]},
	    {name:'Enigmatic Minor',semis:[0,1,3,6,8,10,11]},
	    {name:'Pelog alternate',semis:[0,4,6,7,8,11]},
	    {name:'Gipsy Hexatonic 1',semis:[0,1,5,6,8,9,10]},
	    {name:'Gypsy Hexatonic 5',semis:[0,1,4,5,7,8,9]},
	    {name:'Houzam',semis:[0,3,4,5,7,9,11]},
	    {name:'Phrygian dim 4th',semis:[0,1,3,4,7,8,10]},
	    {name:'Locrian 2',semis:[0,2,3,5,6,8,11]},
	    {name:'Locrian bb7',semis:[0,1,3,5,6,8,9]},
	    {name:'Marva or Marvi',semis:[0,1,4,6,7,9,11]},
	    {name:'Major Bebop Heptatonic',semis:[0,2,4,5,7,8,9]},
	    {name:'Minor Bebop 1',semis:[0,2,3,4,7,9,10]},
	    {name:'Mixolydian Augmented',semis:[0,2,4,5,8,9,10]},
	    {name:'Mixolydian b5',semis:[0,2,4,5,6,9,10]},
	    {name:'Neapolitan Minor Mode',semis:[0,1,2,4,6,8,9]},
	    {name:'Nohkan 1',semis:[0,2,5,6,8,9,11]},
	    {name:'Rock \'n Roll 1',semis:[0,3,4,5,7,9,10]},
	    {name:'Romanian Major',semis:[0,1,4,6,7,9,10]},
	    {name:'Spanish Heptatonic 1',semis:[0,3,4,5,6,8,10]},
	    {name:'Todi b7 1',semis:[0,1,3,6,7,9,10]},
	  ],
	  "8 Note Scales": [
	    {name:'Adonai Malakh 1',semis:[0,1,2,3,5,7,9,10]},
	    {name:'Algerian',semis:[0,2,3,5,6,7,8,11]},
	    {name:'Blues Octatonic',semis:[0,2,3,5,6,7,9,10]},
	    {name:'Chromatic OctaMirror',semis:[0,1,2,3,4,5,6,7]},
	    {name:'Dorian Aeolian 1',semis:[0,2,3,5,7,8,9,10]},
	    {name:'Enigmatic alternate 1',semis:[0,1,4,5,6,8,10,11]},
	    {name:'Half-Dimiished Bebop',semis:[0,1,3,5,6,7,8,11]},
	    {name:'Harmonic Neapolitan Minor 1',semis:[0,1,2,3,5,7,8,11]},
	    {name:'Hungarian Minor b2',semis:[0,1,2,3,6,7,8,11]},
	    {name:'JG Octatonic ',semis:[0,1,3,4,5,7,9,10]},
	    {name:'Lydian b3 ',semis:[0,2,3,4,6,7,9,11]},
	    {name:'Lydian Dim b7',semis:[0,2,3,4,6,7,9,10]},
	    {name:'Lydian Dominant alternate',semis:[0,2,4,6,7,9,10,11]},
	    {name:'Magen Abot',semis:[0,1,3,4,6,8,9,11]},
	    {name:'Maqam Hijaz',semis:[0,1,4,5,7,8,10,11]},
	    {name:'Maqam Shadd\'araban 1',semis:[0,1,3,4,5,6,9,10]},
	    {name:'Minor Bebop 1',semis:[0,2,3,4,5,7,9,10]},
	    {name:'Minor Gypsy',semis:[0,2,3,6,7,8,10,11]},
	    {name:'Neveseri 1',semis:[0,1,3,6,7,8,10,11]},
	    {name:'Oriental 2',semis:[0,1,4,5,6,9,10,11]},
	    {name:'Phrygian Aeolian 1',semis:[0,1,2,3,5,7,8,10]},
	    {name:'Phrygian Locrian 1',semis:[0,1,3,5,6,7,8,10]},
	    {name:'Phrygian Major 1',semis:[0,1,3,4,5,7,8,10]},
	    {name:'Prokofiev 1',semis:[0,1,3,5,6,8,10,11]},
	    {name:'Shostakovich 1',semis:[0,1,3,4,6,7,9,11]},
	    {name:'Spanish 8 Tones 1',semis:[0,1,3,4,5,6,8,10]},
	    {name:'Utility Minor 1',semis:[0,2,3,5,7,8,10,11]},
	    {name:'Zirafkend',semis:[0,2,3,5,7,8,9,11]},
	  ],
	  "9 Note Scales": [
	    {name:'Blues Enneatonic',semis:[0,2,3,4,5,6,7,9,10]},
	    {name:'Chromatic Bebop 1',semis:[0,1,2,4,5,7,9,10,11]},
	    {name:'Chromatic Diatonic Dorian 1',semis:[0,1,2,3,5,7,8,9,10]},
	    {name:'Chromatic NonaMirror',semis:[0,1,2,3,4,5,6,7,8]},
	    {name:'Chromatic Permuted Diatonic',semis:[0,1,2,4,5,7,8,9,11]},
	    {name:'Full Minor',semis:[0,2,3,5,7,8,9,10,11]},
	    {name:'Genus Chromaticum 1',semis:[0,1,3,4,5,7,8,9,11]},
	    {name:'Houseini 1',semis:[0,2,3,4,5,7,9]},
	    {name:'Houseini 2',semis:[0,2,3,4,5,7,8,9,10]},
	    {name:'Kiourdi',semis:[0,2,3,5,6,7,8,9,10]},
	    {name:'Lydian Mixolydian 1',semis:[0,2,4,5,6,7,9,10,11]},
	    {name:'Moorish Phrygian 2',semis:[0,1,3,4,5,7,8,10,11]},
	    {name:'Symmetrical Nonatonic 1',semis:[0,1,2,4,6,7,8,10,11]},
	    {name:'untitled Nonatonic 1',semis:[0,1,2,3,5,6,7,8,9]},
	    {name:'untitled Nonatonic 2',semis:[0,1,3,4,5,6,7,9,10]},
	    {name:'Youlan 1',semis:[0,1,2,4,5,6,7,9,10]},
	  ],
	  "10 Note Scales": [
	    {name:'Untitled Decatonic 1',semis:[0,2,3,4,5,7,8,9,10,11]},
	    {name:'Untitled Decatonic 2',semis:[0,2,3,4,5,6,7,9,10,11]},
	    {name:'Untitled Decatonic 3',semis:[0,1,3,4,5,6,7,8,10,11]},
	    {name:'Untitled Decatonic 3',semis:[0,1,3,4,5,6,8,9,10,11]},
	    {name:'Untitled Decatonic 4',semis:[0,1,2,3,5,6,7,8,10,11]},
	    {name:'Untitled Decatonic 5',semis:[0,1,2,3,5,6,7,8,9,10]},
	    {name:'Untitled Decatonic 6',semis:[0,1,2,4,5,6,7,9,10,11]},
	    {name:'Untitled Decatonic 7',semis:[0,1,2,4,5,6,7,8,9,11]},
	    {name:'Untitled Decatonic 8',semis:[0,1,2,3,4,6,7,8,9,11]},
	    {name:'Untitled Decatonic 9',semis:[0,1,2,3,4,5,7,8,9,10]},
	    {name:'Chromatic DecaMirror 1',semis:[0,1,2,3,4,5,6,7,8,9]},
	    {name:'Pan Diminished Blues',semis:[0,1,2,3,4,6,7,9,10,11]},
	    {name:'Pan Lydian',semis:[0,2,3,4,5,6,7,8,9,11]},
	    {name:'Symmetrical Decatonic',semis:[0,1,2,4,5,6,7,8,10,11]},
	  ],
	};

/***/ },
/* 49 */
/*!*******************************!*\
  !*** ../~/mithril/mithril.js ***!
  \*******************************/
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module) {var m = (function app(window, undefined) {
		var OBJECT = "[object Object]", ARRAY = "[object Array]", STRING = "[object String]", FUNCTION = "function";
		var type = {}.toString;
		var parser = /(?:(^|#|\.)([^#\.\[\]]+))|(\[.+?\])/g, attrParser = /\[(.+?)(?:=("|'|)(.*?)\2)?\]/;
		var voidElements = /^(AREA|BASE|BR|COL|COMMAND|EMBED|HR|IMG|INPUT|KEYGEN|LINK|META|PARAM|SOURCE|TRACK|WBR)$/;
		var noop = function() {}
	
		// caching commonly used variables
		var $document, $location, $requestAnimationFrame, $cancelAnimationFrame;
	
		// self invoking function needed because of the way mocks work
		function initialize(window){
			$document = window.document;
			$location = window.location;
			$cancelAnimationFrame = window.cancelAnimationFrame || window.clearTimeout;
			$requestAnimationFrame = window.requestAnimationFrame || window.setTimeout;
		}
	
		initialize(window);
	
	
		/**
		 * @typedef {String} Tag
		 * A string that looks like -> div.classname#id[param=one][param2=two]
		 * Which describes a DOM node
		 */
	
		/**
		 *
		 * @param {Tag} The DOM node tag
		 * @param {Object=[]} optional key-value pairs to be mapped to DOM attrs
		 * @param {...mNode=[]} Zero or more Mithril child nodes. Can be an array, or splat (optional)
		 *
		 */
		function m() {
			var args = [].slice.call(arguments);
			var hasAttrs = args[1] != null && type.call(args[1]) === OBJECT && !("tag" in args[1] || "view" in args[1]) && !("subtree" in args[1]);
			var attrs = hasAttrs ? args[1] : {};
			var classAttrName = "class" in attrs ? "class" : "className";
			var cell = {tag: "div", attrs: {}};
			var match, classes = [];
			if (type.call(args[0]) != STRING) throw new Error("selector in m(selector, attrs, children) should be a string")
			while (match = parser.exec(args[0])) {
				if (match[1] === "" && match[2]) cell.tag = match[2];
				else if (match[1] === "#") cell.attrs.id = match[2];
				else if (match[1] === ".") classes.push(match[2]);
				else if (match[3][0] === "[") {
					var pair = attrParser.exec(match[3]);
					cell.attrs[pair[1]] = pair[3] || (pair[2] ? "" :true)
				}
			}
	
			var children = hasAttrs ? args.slice(2) : args.slice(1);
			if (children.length === 1 && type.call(children[0]) === ARRAY) {
				cell.children = children[0]
			}
			else {
				cell.children = children
			}
			
			for (var attrName in attrs) {
				if (attrs.hasOwnProperty(attrName)) {
					if (attrName === classAttrName && attrs[attrName] != null && attrs[attrName] !== "") {
						classes.push(attrs[attrName])
						cell.attrs[attrName] = "" //create key in correct iteration order
					}
					else cell.attrs[attrName] = attrs[attrName]
				}
			}
			if (classes.length > 0) cell.attrs[classAttrName] = classes.join(" ");
			
			return cell
		}
		function build(parentElement, parentTag, parentCache, parentIndex, data, cached, shouldReattach, index, editable, namespace, configs) {
			//`build` is a recursive function that manages creation/diffing/removal of DOM elements based on comparison between `data` and `cached`
			//the diff algorithm can be summarized as this:
			//1 - compare `data` and `cached`
			//2 - if they are different, copy `data` to `cached` and update the DOM based on what the difference is
			//3 - recursively apply this algorithm for every array and for the children of every virtual element
	
			//the `cached` data structure is essentially the same as the previous redraw's `data` data structure, with a few additions:
			//- `cached` always has a property called `nodes`, which is a list of DOM elements that correspond to the data represented by the respective virtual element
			//- in order to support attaching `nodes` as a property of `cached`, `cached` is *always* a non-primitive object, i.e. if the data was a string, then cached is a String instance. If data was `null` or `undefined`, cached is `new String("")`
			//- `cached also has a `configContext` property, which is the state storage object exposed by config(element, isInitialized, context)
			//- when `cached` is an Object, it represents a virtual element; when it's an Array, it represents a list of elements; when it's a String, Number or Boolean, it represents a text node
	
			//`parentElement` is a DOM element used for W3C DOM API calls
			//`parentTag` is only used for handling a corner case for textarea values
			//`parentCache` is used to remove nodes in some multi-node cases
			//`parentIndex` and `index` are used to figure out the offset of nodes. They're artifacts from before arrays started being flattened and are likely refactorable
			//`data` and `cached` are, respectively, the new and old nodes being diffed
			//`shouldReattach` is a flag indicating whether a parent node was recreated (if so, and if this node is reused, then this node must reattach itself to the new parent)
			//`editable` is a flag that indicates whether an ancestor is contenteditable
			//`namespace` indicates the closest HTML namespace as it cascades down from an ancestor
			//`configs` is a list of config functions to run after the topmost `build` call finishes running
	
			//there's logic that relies on the assumption that null and undefined data are equivalent to empty strings
			//- this prevents lifecycle surprises from procedural helpers that mix implicit and explicit return statements (e.g. function foo() {if (cond) return m("div")}
			//- it simplifies diffing code
			//data.toString() might throw or return null if data is the return value of Console.log in Firefox (behavior depends on version)
			try {if (data == null || data.toString() == null) data = "";} catch (e) {data = ""}
			if (data.subtree === "retain") return cached;
			var cachedType = type.call(cached), dataType = type.call(data);
			if (cached == null || cachedType !== dataType) {
				if (cached != null) {
					if (parentCache && parentCache.nodes) {
						var offset = index - parentIndex;
						var end = offset + (dataType === ARRAY ? data : cached.nodes).length;
						clear(parentCache.nodes.slice(offset, end), parentCache.slice(offset, end))
					}
					else if (cached.nodes) clear(cached.nodes, cached)
				}
				cached = new data.constructor;
				if (cached.tag) cached = {}; //if constructor creates a virtual dom element, use a blank object as the base cached node instead of copying the virtual el (#277)
				cached.nodes = []
			}
	
			if (dataType === ARRAY) {
				//recursively flatten array
				for (var i = 0, len = data.length; i < len; i++) {
					if (type.call(data[i]) === ARRAY) {
						data = data.concat.apply([], data);
						i-- //check current index again and flatten until there are no more nested arrays at that index
						len = data.length
					}
				}
				
				var nodes = [], intact = cached.length === data.length, subArrayCount = 0;
	
				//keys algorithm: sort elements without recreating them if keys are present
				//1) create a map of all existing keys, and mark all for deletion
				//2) add new keys to map and mark them for addition
				//3) if key exists in new list, change action from deletion to a move
				//4) for each key, handle its corresponding action as marked in previous steps
				var DELETION = 1, INSERTION = 2 , MOVE = 3;
				var existing = {}, shouldMaintainIdentities = false;
				for (var i = 0; i < cached.length; i++) {
					if (cached[i] && cached[i].attrs && cached[i].attrs.key != null) {
						shouldMaintainIdentities = true;
						existing[cached[i].attrs.key] = {action: DELETION, index: i}
					}
				}
				
				var guid = 0
				for (var i = 0, len = data.length; i < len; i++) {
					if (data[i] && data[i].attrs && data[i].attrs.key != null) {
						for (var j = 0, len = data.length; j < len; j++) {
							if (data[j] && data[j].attrs && data[j].attrs.key == null) data[j].attrs.key = "__mithril__" + guid++
						}
						break
					}
				}
				
				if (shouldMaintainIdentities) {
					var keysDiffer = false
					if (data.length != cached.length) keysDiffer = true
					else for (var i = 0, cachedCell, dataCell; cachedCell = cached[i], dataCell = data[i]; i++) {
						if (cachedCell.attrs && dataCell.attrs && cachedCell.attrs.key != dataCell.attrs.key) {
							keysDiffer = true
							break
						}
					}
					
					if (keysDiffer) {
						for (var i = 0, len = data.length; i < len; i++) {
							if (data[i] && data[i].attrs) {
								if (data[i].attrs.key != null) {
									var key = data[i].attrs.key;
									if (!existing[key]) existing[key] = {action: INSERTION, index: i};
									else existing[key] = {
										action: MOVE,
										index: i,
										from: existing[key].index,
										element: cached.nodes[existing[key].index] || $document.createElement("div")
									}
								}
							}
						}
						var actions = []
						for (var prop in existing) actions.push(existing[prop])
						var changes = actions.sort(sortChanges);
						var newCached = new Array(cached.length)
						newCached.nodes = cached.nodes.slice()
	
						for (var i = 0, change; change = changes[i]; i++) {
							if (change.action === DELETION) {
								clear(cached[change.index].nodes, cached[change.index]);
								newCached.splice(change.index, 1)
							}
							if (change.action === INSERTION) {
								var dummy = $document.createElement("div");
								dummy.key = data[change.index].attrs.key;
								parentElement.insertBefore(dummy, parentElement.childNodes[change.index] || null);
								newCached.splice(change.index, 0, {attrs: {key: data[change.index].attrs.key}, nodes: [dummy]})
								newCached.nodes[change.index] = dummy
							}
	
							if (change.action === MOVE) {
								if (parentElement.childNodes[change.index] !== change.element && change.element !== null) {
									parentElement.insertBefore(change.element, parentElement.childNodes[change.index] || null)
								}
								newCached[change.index] = cached[change.from]
								newCached.nodes[change.index] = change.element
							}
						}
						cached = newCached;
					}
				}
				//end key algorithm
	
				for (var i = 0, cacheCount = 0, len = data.length; i < len; i++) {
					//diff each item in the array
					var item = build(parentElement, parentTag, cached, index, data[i], cached[cacheCount], shouldReattach, index + subArrayCount || subArrayCount, editable, namespace, configs);
					if (item === undefined) continue;
					if (!item.nodes.intact) intact = false;
					if (item.$trusted) {
						//fix offset of next element if item was a trusted string w/ more than one html element
						//the first clause in the regexp matches elements
						//the second clause (after the pipe) matches text nodes
						subArrayCount += (item.match(/<[^\/]|\>\s*[^<]/g) || [0]).length
					}
					else subArrayCount += type.call(item) === ARRAY ? item.length : 1;
					cached[cacheCount++] = item
				}
				if (!intact) {
					//diff the array itself
					
					//update the list of DOM nodes by collecting the nodes from each item
					for (var i = 0, len = data.length; i < len; i++) {
						if (cached[i] != null) nodes.push.apply(nodes, cached[i].nodes)
					}
					//remove items from the end of the array if the new array is shorter than the old one
					//if errors ever happen here, the issue is most likely a bug in the construction of the `cached` data structure somewhere earlier in the program
					for (var i = 0, node; node = cached.nodes[i]; i++) {
						if (node.parentNode != null && nodes.indexOf(node) < 0) clear([node], [cached[i]])
					}
					if (data.length < cached.length) cached.length = data.length;
					cached.nodes = nodes
				}
			}
			else if (data != null && dataType === OBJECT) {
				var views = [], controllers = []
				while (data.view) {
					var view = data.view.$original || data.view
					var controllerIndex = m.redraw.strategy() == "diff" && cached.views ? cached.views.indexOf(view) : -1
					var controller = controllerIndex > -1 ? cached.controllers[controllerIndex] : new (data.controller || noop)
					var key = data && data.attrs && data.attrs.key
					data = pendingRequests == 0 || (cached && cached.controllers && cached.controllers.indexOf(controller) > -1) ? data.view(controller) : {tag: "placeholder"}
					if (data.subtree === "retain") return cached;
					if (key) {
						if (!data.attrs) data.attrs = {}
						data.attrs.key = key
					}
					if (controller.onunload) unloaders.push({controller: controller, handler: controller.onunload})
					views.push(view)
					controllers.push(controller)
				}
				if (!data.tag && controllers.length) throw new Error("Component template must return a virtual element, not an array, string, etc.")
				if (!data.attrs) data.attrs = {};
				if (!cached.attrs) cached.attrs = {};
	
				var dataAttrKeys = Object.keys(data.attrs)
				var hasKeys = dataAttrKeys.length > ("key" in data.attrs ? 1 : 0)
				//if an element is different enough from the one in cache, recreate it
				if (data.tag != cached.tag || dataAttrKeys.sort().join() != Object.keys(cached.attrs).sort().join() || data.attrs.id != cached.attrs.id || data.attrs.key != cached.attrs.key || (m.redraw.strategy() == "all" && (!cached.configContext || cached.configContext.retain !== true)) || (m.redraw.strategy() == "diff" && cached.configContext && cached.configContext.retain === false)) {
					if (cached.nodes.length) clear(cached.nodes);
					if (cached.configContext && typeof cached.configContext.onunload === FUNCTION) cached.configContext.onunload()
					if (cached.controllers) {
						for (var i = 0, controller; controller = cached.controllers[i]; i++) {
							if (typeof controller.onunload === FUNCTION) controller.onunload({preventDefault: noop})
						}
					}
				}
				if (type.call(data.tag) != STRING) return;
	
				var node, isNew = cached.nodes.length === 0;
				if (data.attrs.xmlns) namespace = data.attrs.xmlns;
				else if (data.tag === "svg") namespace = "http://www.w3.org/2000/svg";
				else if (data.tag === "math") namespace = "http://www.w3.org/1998/Math/MathML";
				
				if (isNew) {
					if (data.attrs.is) node = namespace === undefined ? $document.createElement(data.tag, data.attrs.is) : $document.createElementNS(namespace, data.tag, data.attrs.is);
					else node = namespace === undefined ? $document.createElement(data.tag) : $document.createElementNS(namespace, data.tag);
					cached = {
						tag: data.tag,
						//set attributes first, then create children
						attrs: hasKeys ? setAttributes(node, data.tag, data.attrs, {}, namespace) : data.attrs,
						children: data.children != null && data.children.length > 0 ?
							build(node, data.tag, undefined, undefined, data.children, cached.children, true, 0, data.attrs.contenteditable ? node : editable, namespace, configs) :
							data.children,
						nodes: [node]
					};
					if (controllers.length) {
						cached.views = views
						cached.controllers = controllers
						for (var i = 0, controller; controller = controllers[i]; i++) {
							if (controller.onunload && controller.onunload.$old) controller.onunload = controller.onunload.$old
							if (pendingRequests && controller.onunload) {
								var onunload = controller.onunload
								controller.onunload = noop
								controller.onunload.$old = onunload
							}
						}
					}
					
					if (cached.children && !cached.children.nodes) cached.children.nodes = [];
					//edge case: setting value on <select> doesn't work before children exist, so set it again after children have been created
					if (data.tag === "select" && "value" in data.attrs) setAttributes(node, data.tag, {value: data.attrs.value}, {}, namespace);
					parentElement.insertBefore(node, parentElement.childNodes[index] || null)
				}
				else {
					node = cached.nodes[0];
					if (hasKeys) setAttributes(node, data.tag, data.attrs, cached.attrs, namespace);
					cached.children = build(node, data.tag, undefined, undefined, data.children, cached.children, false, 0, data.attrs.contenteditable ? node : editable, namespace, configs);
					cached.nodes.intact = true;
					if (controllers.length) {
						cached.views = views
						cached.controllers = controllers
					}
					if (shouldReattach === true && node != null) parentElement.insertBefore(node, parentElement.childNodes[index] || null)
				}
				//schedule configs to be called. They are called after `build` finishes running
				if (typeof data.attrs["config"] === FUNCTION) {
					var context = cached.configContext = cached.configContext || {};
	
					// bind
					var callback = function(data, args) {
						return function() {
							return data.attrs["config"].apply(data, args)
						}
					};
					configs.push(callback(data, [node, !isNew, context, cached]))
				}
			}
			else if (typeof data != FUNCTION) {
				//handle text nodes
				var nodes;
				if (cached.nodes.length === 0) {
					if (data.$trusted) {
						nodes = injectHTML(parentElement, index, data)
					}
					else {
						nodes = [$document.createTextNode(data)];
						if (!parentElement.nodeName.match(voidElements)) parentElement.insertBefore(nodes[0], parentElement.childNodes[index] || null)
					}
					cached = "string number boolean".indexOf(typeof data) > -1 ? new data.constructor(data) : data;
					cached.nodes = nodes
				}
				else if (cached.valueOf() !== data.valueOf() || shouldReattach === true) {
					nodes = cached.nodes;
					if (!editable || editable !== $document.activeElement) {
						if (data.$trusted) {
							clear(nodes, cached);
							nodes = injectHTML(parentElement, index, data)
						}
						else {
							//corner case: replacing the nodeValue of a text node that is a child of a textarea/contenteditable doesn't work
							//we need to update the value property of the parent textarea or the innerHTML of the contenteditable element instead
							if (parentTag === "textarea") parentElement.value = data;
							else if (editable) editable.innerHTML = data;
							else {
								if (nodes[0].nodeType === 1 || nodes.length > 1) { //was a trusted string
									clear(cached.nodes, cached);
									nodes = [$document.createTextNode(data)]
								}
								parentElement.insertBefore(nodes[0], parentElement.childNodes[index] || null);
								nodes[0].nodeValue = data
							}
						}
					}
					cached = new data.constructor(data);
					cached.nodes = nodes
				}
				else cached.nodes.intact = true
			}
	
			return cached
		}
		function sortChanges(a, b) {return a.action - b.action || a.index - b.index}
		function setAttributes(node, tag, dataAttrs, cachedAttrs, namespace) {
			for (var attrName in dataAttrs) {
				var dataAttr = dataAttrs[attrName];
				var cachedAttr = cachedAttrs[attrName];
				if (!(attrName in cachedAttrs) || (cachedAttr !== dataAttr)) {
					cachedAttrs[attrName] = dataAttr;
					try {
						//`config` isn't a real attributes, so ignore it
						if (attrName === "config" || attrName == "key") continue;
						//hook event handlers to the auto-redrawing system
						else if (typeof dataAttr === FUNCTION && attrName.indexOf("on") === 0) {
							node[attrName] = autoredraw(dataAttr, node)
						}
						//handle `style: {...}`
						else if (attrName === "style" && dataAttr != null && type.call(dataAttr) === OBJECT) {
							for (var rule in dataAttr) {
								if (cachedAttr == null || cachedAttr[rule] !== dataAttr[rule]) node.style[rule] = dataAttr[rule]
							}
							for (var rule in cachedAttr) {
								if (!(rule in dataAttr)) node.style[rule] = ""
							}
						}
						//handle SVG
						else if (namespace != null) {
							if (attrName === "href") node.setAttributeNS("http://www.w3.org/1999/xlink", "href", dataAttr);
							else if (attrName === "className") node.setAttribute("class", dataAttr);
							else node.setAttribute(attrName, dataAttr)
						}
						//handle cases that are properties (but ignore cases where we should use setAttribute instead)
						//- list and form are typically used as strings, but are DOM element references in js
						//- when using CSS selectors (e.g. `m("[style='']")`), style is used as a string, but it's an object in js
						else if (attrName in node && !(attrName === "list" || attrName === "style" || attrName === "form" || attrName === "type" || attrName === "width" || attrName === "height")) {
							//#348 don't set the value if not needed otherwise cursor placement breaks in Chrome
							if (tag !== "input" || node[attrName] !== dataAttr) node[attrName] = dataAttr
						}
						else node.setAttribute(attrName, dataAttr)
					}
					catch (e) {
						//swallow IE's invalid argument errors to mimic HTML's fallback-to-doing-nothing-on-invalid-attributes behavior
						if (e.message.indexOf("Invalid argument") < 0) throw e
					}
				}
				//#348 dataAttr may not be a string, so use loose comparison (double equal) instead of strict (triple equal)
				else if (attrName === "value" && tag === "input" && node.value != dataAttr) {
					node.value = dataAttr
				}
			}
			return cachedAttrs
		}
		function clear(nodes, cached) {
			for (var i = nodes.length - 1; i > -1; i--) {
				if (nodes[i] && nodes[i].parentNode) {
					try {nodes[i].parentNode.removeChild(nodes[i])}
					catch (e) {} //ignore if this fails due to order of events (see http://stackoverflow.com/questions/21926083/failed-to-execute-removechild-on-node)
					cached = [].concat(cached);
					if (cached[i]) unload(cached[i])
				}
			}
			if (nodes.length != 0) nodes.length = 0
		}
		function unload(cached) {
			if (cached.configContext && typeof cached.configContext.onunload === FUNCTION) {
				cached.configContext.onunload();
				cached.configContext.onunload = null
			}
			if (cached.controllers) {
				for (var i = 0, controller; controller = cached.controllers[i]; i++) {
					if (typeof controller.onunload === FUNCTION) controller.onunload({preventDefault: noop});
				}
			}
			if (cached.children) {
				if (type.call(cached.children) === ARRAY) {
					for (var i = 0, child; child = cached.children[i]; i++) unload(child)
				}
				else if (cached.children.tag) unload(cached.children)
			}
		}
		function injectHTML(parentElement, index, data) {
			var nextSibling = parentElement.childNodes[index];
			if (nextSibling) {
				var isElement = nextSibling.nodeType != 1;
				var placeholder = $document.createElement("span");
				if (isElement) {
					parentElement.insertBefore(placeholder, nextSibling || null);
					placeholder.insertAdjacentHTML("beforebegin", data);
					parentElement.removeChild(placeholder)
				}
				else nextSibling.insertAdjacentHTML("beforebegin", data)
			}
			else parentElement.insertAdjacentHTML("beforeend", data);
			var nodes = [];
			while (parentElement.childNodes[index] !== nextSibling) {
				nodes.push(parentElement.childNodes[index]);
				index++
			}
			return nodes
		}
		function autoredraw(callback, object) {
			return function(e) {
				e = e || event;
				m.redraw.strategy("diff");
				m.startComputation();
				try {return callback.call(object, e)}
				finally {
					endFirstComputation()
				}
			}
		}
	
		var html;
		var documentNode = {
			appendChild: function(node) {
				if (html === undefined) html = $document.createElement("html");
				if ($document.documentElement && $document.documentElement !== node) {
					$document.replaceChild(node, $document.documentElement)
				}
				else $document.appendChild(node);
				this.childNodes = $document.childNodes
			},
			insertBefore: function(node) {
				this.appendChild(node)
			},
			childNodes: []
		};
		var nodeCache = [], cellCache = {};
		m.render = function(root, cell, forceRecreation) {
			var configs = [];
			if (!root) throw new Error("Ensure the DOM element being passed to m.route/m.mount/m.render is not undefined.");
			var id = getCellCacheKey(root);
			var isDocumentRoot = root === $document;
			var node = isDocumentRoot || root === $document.documentElement ? documentNode : root;
			if (isDocumentRoot && cell.tag != "html") cell = {tag: "html", attrs: {}, children: cell};
			if (cellCache[id] === undefined) clear(node.childNodes);
			if (forceRecreation === true) reset(root);
			cellCache[id] = build(node, null, undefined, undefined, cell, cellCache[id], false, 0, null, undefined, configs);
			for (var i = 0, len = configs.length; i < len; i++) configs[i]()
		};
		function getCellCacheKey(element) {
			var index = nodeCache.indexOf(element);
			return index < 0 ? nodeCache.push(element) - 1 : index
		}
	
		m.trust = function(value) {
			value = new String(value);
			value.$trusted = true;
			return value
		};
	
		function gettersetter(store) {
			var prop = function() {
				if (arguments.length) store = arguments[0];
				return store
			};
	
			prop.toJSON = function() {
				return store
			};
	
			return prop
		}
	
		m.prop = function (store) {
			//note: using non-strict equality check here because we're checking if store is null OR undefined
			if (((store != null && type.call(store) === OBJECT) || typeof store === FUNCTION) && typeof store.then === FUNCTION) {
				return propify(store)
			}
	
			return gettersetter(store)
		};
	
		var roots = [], components = [], controllers = [], lastRedrawId = null, lastRedrawCallTime = 0, computePreRedrawHook = null, computePostRedrawHook = null, prevented = false, topComponent, unloaders = [];
		var FRAME_BUDGET = 16; //60 frames per second = 1 call per 16 ms
		function parameterize(component, args) {
			var controller = function() {
				return (component.controller || noop).apply(this, args) || this
			}
			var view = function(ctrl) {
				if (arguments.length > 1) args = args.concat([].slice.call(arguments, 1))
				return component.view.apply(component, args ? [ctrl].concat(args) : [ctrl])
			}
			view.$original = component.view
			var output = {controller: controller, view: view}
			if (args[0] && args[0].key != null) output.attrs = {key: args[0].key}
			return output
		}
		m.component = function(component) {
			return parameterize(component, [].slice.call(arguments, 1))
		}
		m.mount = m.module = function(root, component) {
			if (!root) throw new Error("Please ensure the DOM element exists before rendering a template into it.");
			var index = roots.indexOf(root);
			if (index < 0) index = roots.length;
			
			var isPrevented = false;
			var event = {preventDefault: function() {
				isPrevented = true;
				computePreRedrawHook = computePostRedrawHook = null;
			}};
			for (var i = 0, unloader; unloader = unloaders[i]; i++) {
				unloader.handler.call(unloader.controller, event)
				unloader.controller.onunload = null
			}
			if (isPrevented) {
				for (var i = 0, unloader; unloader = unloaders[i]; i++) unloader.controller.onunload = unloader.handler
			}
			else unloaders = []
			
			if (controllers[index] && typeof controllers[index].onunload === FUNCTION) {
				controllers[index].onunload(event)
			}
			
			if (!isPrevented) {
				m.redraw.strategy("all");
				m.startComputation();
				roots[index] = root;
				if (arguments.length > 2) component = subcomponent(component, [].slice.call(arguments, 2))
				var currentComponent = topComponent = component = component || {controller: function() {}};
				var constructor = component.controller || noop
				var controller = new constructor;
				//controllers may call m.mount recursively (via m.route redirects, for example)
				//this conditional ensures only the last recursive m.mount call is applied
				if (currentComponent === topComponent) {
					controllers[index] = controller;
					components[index] = component
				}
				endFirstComputation();
				return controllers[index]
			}
		};
		var redrawing = false
		m.redraw = function(force) {
			if (redrawing) return
			redrawing = true
			//lastRedrawId is a positive number if a second redraw is requested before the next animation frame
			//lastRedrawID is null if it's the first redraw and not an event handler
			if (lastRedrawId && force !== true) {
				//when setTimeout: only reschedule redraw if time between now and previous redraw is bigger than a frame, otherwise keep currently scheduled timeout
				//when rAF: always reschedule redraw
				if ($requestAnimationFrame === window.requestAnimationFrame || new Date - lastRedrawCallTime > FRAME_BUDGET) {
					if (lastRedrawId > 0) $cancelAnimationFrame(lastRedrawId);
					lastRedrawId = $requestAnimationFrame(redraw, FRAME_BUDGET)
				}
			}
			else {
				redraw();
				lastRedrawId = $requestAnimationFrame(function() {lastRedrawId = null}, FRAME_BUDGET)
			}
			redrawing = false
		};
		m.redraw.strategy = m.prop();
		function redraw() {
			if (computePreRedrawHook) {
				computePreRedrawHook()
				computePreRedrawHook = null
			}
			for (var i = 0, root; root = roots[i]; i++) {
				if (controllers[i]) {
					var args = components[i].controller && components[i].controller.$$args ? [controllers[i]].concat(components[i].controller.$$args) : [controllers[i]]
					m.render(root, components[i].view ? components[i].view(controllers[i], args) : "")
				}
			}
			//after rendering within a routed context, we need to scroll back to the top, and fetch the document title for history.pushState
			if (computePostRedrawHook) {
				computePostRedrawHook();
				computePostRedrawHook = null
			}
			lastRedrawId = null;
			lastRedrawCallTime = new Date;
			m.redraw.strategy("diff")
		}
	
		var pendingRequests = 0;
		m.startComputation = function() {pendingRequests++};
		m.endComputation = function() {
			pendingRequests = Math.max(pendingRequests - 1, 0);
			if (pendingRequests === 0) m.redraw()
		};
		var endFirstComputation = function() {
			if (m.redraw.strategy() == "none") {
				pendingRequests--
				m.redraw.strategy("diff")
			}
			else m.endComputation();
		}
	
		m.withAttr = function(prop, withAttrCallback) {
			return function(e) {
				e = e || event;
				var currentTarget = e.currentTarget || this;
				withAttrCallback(prop in currentTarget ? currentTarget[prop] : currentTarget.getAttribute(prop))
			}
		};
	
		//routing
		var modes = {pathname: "", hash: "#", search: "?"};
		var redirect = noop, routeParams, currentRoute, isDefaultRoute = false;
		m.route = function() {
			//m.route()
			if (arguments.length === 0) return currentRoute;
			//m.route(el, defaultRoute, routes)
			else if (arguments.length === 3 && type.call(arguments[1]) === STRING) {
				var root = arguments[0], defaultRoute = arguments[1], router = arguments[2];
				redirect = function(source) {
					var path = currentRoute = normalizeRoute(source);
					if (!routeByValue(root, router, path)) {
						if (isDefaultRoute) throw new Error("Ensure the default route matches one of the routes defined in m.route")
						isDefaultRoute = true
						m.route(defaultRoute, true)
						isDefaultRoute = false
					}
				};
				var listener = m.route.mode === "hash" ? "onhashchange" : "onpopstate";
				window[listener] = function() {
					var path = $location[m.route.mode]
					if (m.route.mode === "pathname") path += $location.search
					if (currentRoute != normalizeRoute(path)) {
						redirect(path)
					}
				};
				computePreRedrawHook = setScroll;
				window[listener]()
			}
			//config: m.route
			else if (arguments[0].addEventListener || arguments[0].attachEvent) {
				var element = arguments[0];
				var isInitialized = arguments[1];
				var context = arguments[2];
				var vdom = arguments[3];
				element.href = (m.route.mode !== 'pathname' ? $location.pathname : '') + modes[m.route.mode] + vdom.attrs.href;
				if (element.addEventListener) {
					element.removeEventListener("click", routeUnobtrusive);
					element.addEventListener("click", routeUnobtrusive)
				}
				else {
					element.detachEvent("onclick", routeUnobtrusive);
					element.attachEvent("onclick", routeUnobtrusive)
				}
			}
			//m.route(route, params, shouldReplaceHistoryEntry)
			else if (type.call(arguments[0]) === STRING) {
				var oldRoute = currentRoute;
				currentRoute = arguments[0];
				var args = arguments[1] || {}
				var queryIndex = currentRoute.indexOf("?")
				var params = queryIndex > -1 ? parseQueryString(currentRoute.slice(queryIndex + 1)) : {}
				for (var i in args) params[i] = args[i]
				var querystring = buildQueryString(params)
				var currentPath = queryIndex > -1 ? currentRoute.slice(0, queryIndex) : currentRoute
				if (querystring) currentRoute = currentPath + (currentPath.indexOf("?") === -1 ? "?" : "&") + querystring;
	
				var shouldReplaceHistoryEntry = (arguments.length === 3 ? arguments[2] : arguments[1]) === true || oldRoute === arguments[0];
	
				if (window.history.pushState) {
					computePreRedrawHook = setScroll
					computePostRedrawHook = function() {
						window.history[shouldReplaceHistoryEntry ? "replaceState" : "pushState"](null, $document.title, modes[m.route.mode] + currentRoute);
					};
					redirect(modes[m.route.mode] + currentRoute)
				}
				else {
					$location[m.route.mode] = currentRoute
					redirect(modes[m.route.mode] + currentRoute)
				}
			}
		};
		m.route.param = function(key) {
			if (!routeParams) throw new Error("You must call m.route(element, defaultRoute, routes) before calling m.route.param()")
			return routeParams[key]
		};
		m.route.mode = "search";
		function normalizeRoute(route) {
			return route.slice(modes[m.route.mode].length)
		}
		function routeByValue(root, router, path) {
			routeParams = {};
	
			var queryStart = path.indexOf("?");
			if (queryStart !== -1) {
				routeParams = parseQueryString(path.substr(queryStart + 1, path.length));
				path = path.substr(0, queryStart)
			}
	
			// Get all routes and check if there's
			// an exact match for the current path
			var keys = Object.keys(router);
			var index = keys.indexOf(path);
			if(index !== -1){
				m.mount(root, router[keys [index]]);
				return true;
			}
	
			for (var route in router) {
				if (route === path) {
					m.mount(root, router[route]);
					return true
				}
	
				var matcher = new RegExp("^" + route.replace(/:[^\/]+?\.{3}/g, "(.*?)").replace(/:[^\/]+/g, "([^\\/]+)") + "\/?$");
	
				if (matcher.test(path)) {
					path.replace(matcher, function() {
						var keys = route.match(/:[^\/]+/g) || [];
						var values = [].slice.call(arguments, 1, -2);
						for (var i = 0, len = keys.length; i < len; i++) routeParams[keys[i].replace(/:|\./g, "")] = decodeURIComponent(values[i])
						m.mount(root, router[route])
					});
					return true
				}
			}
		}
		function routeUnobtrusive(e) {
			e = e || event;
			if (e.ctrlKey || e.metaKey || e.which === 2) return;
			if (e.preventDefault) e.preventDefault();
			else e.returnValue = false;
			var currentTarget = e.currentTarget || e.srcElement;
			var args = m.route.mode === "pathname" && currentTarget.search ? parseQueryString(currentTarget.search.slice(1)) : {};
			while (currentTarget && currentTarget.nodeName.toUpperCase() != "A") currentTarget = currentTarget.parentNode
			m.route(currentTarget[m.route.mode].slice(modes[m.route.mode].length), args)
		}
		function setScroll() {
			if (m.route.mode != "hash" && $location.hash) $location.hash = $location.hash;
			else window.scrollTo(0, 0)
		}
		function buildQueryString(object, prefix) {
			var duplicates = {}
			var str = []
			for (var prop in object) {
				var key = prefix ? prefix + "[" + prop + "]" : prop
				var value = object[prop]
				var valueType = type.call(value)
				var pair = (value === null) ? encodeURIComponent(key) :
					valueType === OBJECT ? buildQueryString(value, key) :
					valueType === ARRAY ? value.reduce(function(memo, item) {
						if (!duplicates[key]) duplicates[key] = {}
						if (!duplicates[key][item]) {
							duplicates[key][item] = true
							return memo.concat(encodeURIComponent(key) + "=" + encodeURIComponent(item))
						}
						return memo
					}, []).join("&") :
					encodeURIComponent(key) + "=" + encodeURIComponent(value)
				if (value !== undefined) str.push(pair)
			}
			return str.join("&")
		}
		function parseQueryString(str) {
			if (str.charAt(0) === "?") str = str.substring(1);
			
			var pairs = str.split("&"), params = {};
			for (var i = 0, len = pairs.length; i < len; i++) {
				var pair = pairs[i].split("=");
				var key = decodeURIComponent(pair[0])
				var value = pair.length == 2 ? decodeURIComponent(pair[1]) : null
				if (params[key] != null) {
					if (type.call(params[key]) !== ARRAY) params[key] = [params[key]]
					params[key].push(value)
				}
				else params[key] = value
			}
			return params
		}
		m.route.buildQueryString = buildQueryString
		m.route.parseQueryString = parseQueryString
		
		function reset(root) {
			var cacheKey = getCellCacheKey(root);
			clear(root.childNodes, cellCache[cacheKey]);
			cellCache[cacheKey] = undefined
		}
	
		m.deferred = function () {
			var deferred = new Deferred();
			deferred.promise = propify(deferred.promise);
			return deferred
		};
		function propify(promise, initialValue) {
			var prop = m.prop(initialValue);
			promise.then(prop);
			prop.then = function(resolve, reject) {
				return propify(promise.then(resolve, reject), initialValue)
			};
			return prop
		}
		//Promiz.mithril.js | Zolmeister | MIT
		//a modified version of Promiz.js, which does not conform to Promises/A+ for two reasons:
		//1) `then` callbacks are called synchronously (because setTimeout is too slow, and the setImmediate polyfill is too big
		//2) throwing subclasses of Error cause the error to be bubbled up instead of triggering rejection (because the spec does not account for the important use case of default browser error handling, i.e. message w/ line number)
		function Deferred(successCallback, failureCallback) {
			var RESOLVING = 1, REJECTING = 2, RESOLVED = 3, REJECTED = 4;
			var self = this, state = 0, promiseValue = 0, next = [];
	
			self["promise"] = {};
	
			self["resolve"] = function(value) {
				if (!state) {
					promiseValue = value;
					state = RESOLVING;
	
					fire()
				}
				return this
			};
	
			self["reject"] = function(value) {
				if (!state) {
					promiseValue = value;
					state = REJECTING;
	
					fire()
				}
				return this
			};
	
			self.promise["then"] = function(successCallback, failureCallback) {
				var deferred = new Deferred(successCallback, failureCallback);
				if (state === RESOLVED) {
					deferred.resolve(promiseValue)
				}
				else if (state === REJECTED) {
					deferred.reject(promiseValue)
				}
				else {
					next.push(deferred)
				}
				return deferred.promise
			};
	
			function finish(type) {
				state = type || REJECTED;
				next.map(function(deferred) {
					state === RESOLVED && deferred.resolve(promiseValue) || deferred.reject(promiseValue)
				})
			}
	
			function thennable(then, successCallback, failureCallback, notThennableCallback) {
				if (((promiseValue != null && type.call(promiseValue) === OBJECT) || typeof promiseValue === FUNCTION) && typeof then === FUNCTION) {
					try {
						// count protects against abuse calls from spec checker
						var count = 0;
						then.call(promiseValue, function(value) {
							if (count++) return;
							promiseValue = value;
							successCallback()
						}, function (value) {
							if (count++) return;
							promiseValue = value;
							failureCallback()
						})
					}
					catch (e) {
						m.deferred.onerror(e);
						promiseValue = e;
						failureCallback()
					}
				} else {
					notThennableCallback()
				}
			}
	
			function fire() {
				// check if it's a thenable
				var then;
				try {
					then = promiseValue && promiseValue.then
				}
				catch (e) {
					m.deferred.onerror(e);
					promiseValue = e;
					state = REJECTING;
					return fire()
				}
				thennable(then, function() {
					state = RESOLVING;
					fire()
				}, function() {
					state = REJECTING;
					fire()
				}, function() {
					try {
						if (state === RESOLVING && typeof successCallback === FUNCTION) {
							promiseValue = successCallback(promiseValue)
						}
						else if (state === REJECTING && typeof failureCallback === "function") {
							promiseValue = failureCallback(promiseValue);
							state = RESOLVING
						}
					}
					catch (e) {
						m.deferred.onerror(e);
						promiseValue = e;
						return finish()
					}
	
					if (promiseValue === self) {
						promiseValue = TypeError();
						finish()
					}
					else {
						thennable(then, function () {
							finish(RESOLVED)
						}, finish, function () {
							finish(state === RESOLVING && RESOLVED)
						})
					}
				})
			}
		}
		m.deferred.onerror = function(e) {
			if (type.call(e) === "[object Error]" && !e.constructor.toString().match(/ Error/)) throw e
		};
	
		m.sync = function(args) {
			var method = "resolve";
			function synchronizer(pos, resolved) {
				return function(value) {
					results[pos] = value;
					if (!resolved) method = "reject";
					if (--outstanding === 0) {
						deferred.promise(results);
						deferred[method](results)
					}
					return value
				}
			}
	
			var deferred = m.deferred();
			var outstanding = args.length;
			var results = new Array(outstanding);
			if (args.length > 0) {
				for (var i = 0; i < args.length; i++) {
					args[i].then(synchronizer(i, true), synchronizer(i, false))
				}
			}
			else deferred.resolve([]);
	
			return deferred.promise
		};
		function identity(value) {return value}
	
		function ajax(options) {
			if (options.dataType && options.dataType.toLowerCase() === "jsonp") {
				var callbackKey = "mithril_callback_" + new Date().getTime() + "_" + (Math.round(Math.random() * 1e16)).toString(36);
				var script = $document.createElement("script");
	
				window[callbackKey] = function(resp) {
					script.parentNode.removeChild(script);
					options.onload({
						type: "load",
						target: {
							responseText: resp
						}
					});
					window[callbackKey] = undefined
				};
	
				script.onerror = function(e) {
					script.parentNode.removeChild(script);
	
					options.onerror({
						type: "error",
						target: {
							status: 500,
							responseText: JSON.stringify({error: "Error making jsonp request"})
						}
					});
					window[callbackKey] = undefined;
	
					return false
				};
	
				script.onload = function(e) {
					return false
				};
	
				script.src = options.url
					+ (options.url.indexOf("?") > 0 ? "&" : "?")
					+ (options.callbackKey ? options.callbackKey : "callback")
					+ "=" + callbackKey
					+ "&" + buildQueryString(options.data || {});
				$document.body.appendChild(script)
			}
			else {
				var xhr = new window.XMLHttpRequest;
				xhr.open(options.method, options.url, true, options.user, options.password);
				xhr.onreadystatechange = function() {
					if (xhr.readyState === 4) {
						if (xhr.status >= 200 && xhr.status < 300) options.onload({type: "load", target: xhr});
						else options.onerror({type: "error", target: xhr})
					}
				};
				if (options.serialize === JSON.stringify && options.data && options.method !== "GET") {
					xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8")
				}
				if (options.deserialize === JSON.parse) {
					xhr.setRequestHeader("Accept", "application/json, text/*");
				}
				if (typeof options.config === FUNCTION) {
					var maybeXhr = options.config(xhr, options);
					if (maybeXhr != null) xhr = maybeXhr
				}
	
				var data = options.method === "GET" || !options.data ? "" : options.data
				if (data && (type.call(data) != STRING && data.constructor != window.FormData)) {
					throw "Request data should be either be a string or FormData. Check the `serialize` option in `m.request`";
				}
				xhr.send(data);
				return xhr
			}
		}
		function bindData(xhrOptions, data, serialize) {
			if (xhrOptions.method === "GET" && xhrOptions.dataType != "jsonp") {
				var prefix = xhrOptions.url.indexOf("?") < 0 ? "?" : "&";
				var querystring = buildQueryString(data);
				xhrOptions.url = xhrOptions.url + (querystring ? prefix + querystring : "")
			}
			else xhrOptions.data = serialize(data);
			return xhrOptions
		}
		function parameterizeUrl(url, data) {
			var tokens = url.match(/:[a-z]\w+/gi);
			if (tokens && data) {
				for (var i = 0; i < tokens.length; i++) {
					var key = tokens[i].slice(1);
					url = url.replace(tokens[i], data[key]);
					delete data[key]
				}
			}
			return url
		}
	
		m.request = function(xhrOptions) {
			if (xhrOptions.background !== true) m.startComputation();
			var deferred = new Deferred();
			var isJSONP = xhrOptions.dataType && xhrOptions.dataType.toLowerCase() === "jsonp";
			var serialize = xhrOptions.serialize = isJSONP ? identity : xhrOptions.serialize || JSON.stringify;
			var deserialize = xhrOptions.deserialize = isJSONP ? identity : xhrOptions.deserialize || JSON.parse;
			var extract = isJSONP ? function(jsonp) {return jsonp.responseText} : xhrOptions.extract || function(xhr) {
				return xhr.responseText.length === 0 && deserialize === JSON.parse ? null : xhr.responseText
			};
			xhrOptions.method = (xhrOptions.method || 'GET').toUpperCase();
			xhrOptions.url = parameterizeUrl(xhrOptions.url, xhrOptions.data);
			xhrOptions = bindData(xhrOptions, xhrOptions.data, serialize);
			xhrOptions.onload = xhrOptions.onerror = function(e) {
				try {
					e = e || event;
					var unwrap = (e.type === "load" ? xhrOptions.unwrapSuccess : xhrOptions.unwrapError) || identity;
					var response = unwrap(deserialize(extract(e.target, xhrOptions)), e.target);
					if (e.type === "load") {
						if (type.call(response) === ARRAY && xhrOptions.type) {
							for (var i = 0; i < response.length; i++) response[i] = new xhrOptions.type(response[i])
						}
						else if (xhrOptions.type) response = new xhrOptions.type(response)
					}
					deferred[e.type === "load" ? "resolve" : "reject"](response)
				}
				catch (e) {
					m.deferred.onerror(e);
					deferred.reject(e)
				}
				if (xhrOptions.background !== true) m.endComputation()
			};
			ajax(xhrOptions);
			deferred.promise = propify(deferred.promise, xhrOptions.initialValue);
			return deferred.promise
		};
	
		//testing API
		m.deps = function(mock) {
			initialize(window = mock || window);
			return window;
		};
		//for internal testing only, do not use `m.deps.factory`
		m.deps.factory = app;
	
		return m
	})(typeof window != "undefined" ? window : {});
	
	if (typeof module != "undefined" && module !== null && module.exports) module.exports = m;
	else if (true) !(__WEBPACK_AMD_DEFINE_RESULT__ = function() {return m}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(/*! ../~/webpack/buildin/module.js */ 50)(module)))

/***/ },
/* 50 */
/*!**************************************!*\
  !*** ../~/webpack/buildin/module.js ***!
  \**************************************/
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 51 */
/*!**********************!*\
  !*** ./walkModes.js ***!
  \**********************/
/***/ function(module, exports, __webpack_require__) {

	var sample = __webpack_require__(/*! lodash/collection/sample */ 24);
	var modes = __webpack_require__(/*! ./map */ 52)();
	
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


/***/ },
/* 52 */
/*!****************!*\
  !*** ./map.js ***!
  \****************/
/***/ function(module, exports, __webpack_require__) {

	var sample = __webpack_require__(/*! lodash/collection/sample */ 24);
	
	
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
	    obj.name = name;
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


/***/ },
/* 53 */
/*!*********************!*\
  !*** ./octModes.js ***!
  \*********************/
/***/ function(module, exports, __webpack_require__) {

	var sample = __webpack_require__(/*! lodash/collection/sample */ 24);
	var modes = __webpack_require__(/*! ./map */ 52)();
	
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


/***/ },
/* 54 */
/*!*****************!*\
  !*** ./midi.js ***!
  \*****************/
/***/ function(module, exports) {

	module.exports.noteToFreq = function note2freq(note) {
	    return Math.pow(2, note / 12) * 440;
	};
	
	var octNote = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
	
	module.exports.noteToText = function noteToText(note) {
	    var oct = 0 | (note / 12);
	    return octNote[note % 12] + oct;
	};


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map