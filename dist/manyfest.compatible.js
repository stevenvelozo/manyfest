"use strict";

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); Object.defineProperty(subClass, "prototype", { writable: false }); if (superClass) _setPrototypeOf(subClass, superClass); }
function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } else if (call !== void 0) { throw new TypeError("Derived constructors may only return object or undefined"); } return _assertThisInitialized(self); }
function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }
function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor); } }
function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return _typeof(key) === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (_typeof(input) !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (_typeof(res) !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }
(function (f) {
  if ((typeof exports === "undefined" ? "undefined" : _typeof(exports)) === "object" && typeof module !== "undefined") {
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    define([], f);
  } else {
    var g;
    if (typeof window !== "undefined") {
      g = window;
    } else if (typeof global !== "undefined") {
      g = global;
    } else if (typeof self !== "undefined") {
      g = self;
    } else {
      g = this;
    }
    g.Manyfest = f();
  }
})(function () {
  var define, module, exports;
  return function () {
    function r(e, n, t) {
      function o(i, f) {
        if (!n[i]) {
          if (!e[i]) {
            var c = "function" == typeof require && require;
            if (!f && c) return c(i, !0);
            if (u) return u(i, !0);
            var a = new Error("Cannot find module '" + i + "'");
            throw a.code = "MODULE_NOT_FOUND", a;
          }
          var p = n[i] = {
            exports: {}
          };
          e[i][0].call(p.exports, function (r) {
            var n = e[i][1][r];
            return o(n || r);
          }, p, p.exports, r, e, n, t);
        }
        return n[i].exports;
      }
      for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
      return o;
    }
    return r;
  }()({
    1: [function (require, module, exports) {
      /**
      * Fable Core Pre-initialization Service Base
      *
      * For a couple services, we need to be able to instantiate them before the Fable object is fully initialized.
      * This is a base class for those services.
      *
      * @author <steven@velozo.com>
      */
      var FableCoreServiceProviderBase = /*#__PURE__*/function () {
        function FableCoreServiceProviderBase(pOptions, pServiceHash) {
          _classCallCheck(this, FableCoreServiceProviderBase);
          this.fable = false;
          this.options = _typeof(pOptions) === 'object' ? pOptions : {};
          this.serviceType = 'Unknown';

          // The hash will be a non-standard UUID ... the UUID service uses this base class!
          this.UUID = "CORESVC-".concat(Math.floor(Math.random() * (99999 - 10000) + 10000));
          this.Hash = typeof pServiceHash === 'string' ? pServiceHash : "".concat(this.UUID);
        }
        _createClass(FableCoreServiceProviderBase, [{
          key: "connectFable",
          value:
          // After fable is initialized, it would be expected to be wired in as a normal service.
          function connectFable(pFable) {
            this.fable = pFable;
            return true;
          }
        }]);
        return FableCoreServiceProviderBase;
      }();
      _defineProperty(FableCoreServiceProviderBase, "isFableService", true);
      module.exports = FableCoreServiceProviderBase;
    }, {}],
    2: [function (require, module, exports) {
      /**
      * Fable Service Base
      * @author <steven@velozo.com>
      */
      var FableServiceProviderBase = /*#__PURE__*/_createClass(function FableServiceProviderBase(pFable, pOptions, pServiceHash) {
        _classCallCheck(this, FableServiceProviderBase);
        this.fable = pFable;
        this.options = _typeof(pOptions) === 'object' ? pOptions : _typeof(pFable) === 'object' && !pFable.isFable ? pFable : {};
        this.serviceType = 'Unknown';
        if (typeof pFable.getUUID == 'function') {
          this.UUID = pFable.getUUID();
        } else {
          this.UUID = "NoFABLESVC-".concat(Math.floor(Math.random() * (99999 - 10000) + 10000));
        }
        this.Hash = typeof pServiceHash === 'string' ? pServiceHash : "".concat(this.UUID);

        // Pull back a few things
        this.log = this.fable.log;
        this.servicesMap = this.fable.serviceMap;
        this.services = this.fable.services;
      });
      _defineProperty(FableServiceProviderBase, "isFableService", true);
      module.exports = FableServiceProviderBase;
      module.exports.CoreServiceProviderBase = require('./Fable-ServiceProviderBase-Preinit.js');
    }, {
      "./Fable-ServiceProviderBase-Preinit.js": 1
    }],
    3: [function (require, module, exports) {
      // When a boxed property is passed in, it should have quotes of some
      // kind around it.
      //
      // For instance:
      // 		MyValues['Name']
      // 		MyValues["Age"]
      // 		MyValues[`Cost`]
      //
      // This function removes the wrapping quotes.
      //
      // Please note it *DOES NOT PARSE* template literals, so backticks just
      // end up doing the same thing as other quote types.
      //
      // TODO: Should template literals be processed?  If so what state do they have access to?  That should happen here if so.
      // TODO: Make a simple class include library with these
      var cleanWrapCharacters = function cleanWrapCharacters(pCharacter, pString) {
        if (pString.startsWith(pCharacter) && pString.endsWith(pCharacter)) {
          return pString.substring(1, pString.length - 1);
        } else {
          return pString;
        }
      };
      module.exports = cleanWrapCharacters;
    }, {}],
    4: [function (require, module, exports) {
      /**
      * @author <steven@velozo.com>
      */
      var libSimpleLog = require('./Manyfest-LogToConsole.js');

      /**
      * Hash Translation
      *
      * This is a very simple translation table for hashes, which allows the same schema to resolve
      * differently based on a loaded translation table.
      *
      * This is to prevent the requirement for mutating schemas over and over again when we want to
      * reuse the structure but look up data elements by different addresses.
      *
      * One side-effect of this is that a translation table can "override" the built-in hashes, since
      * this is always used to resolve hashes before any of the functionCallByHash(pHash, ...) perform
      * their lookups by hash.
      *
      * @class ManyfestHashTranslation
      */
      var ManyfestHashTranslation = /*#__PURE__*/function () {
        function ManyfestHashTranslation(pInfoLog, pErrorLog) {
          _classCallCheck(this, ManyfestHashTranslation);
          // Wire in logging
          this.logInfo = typeof pInfoLog === 'function' ? pInfoLog : libSimpleLog;
          this.logError = typeof pErrorLog === 'function' ? pErrorLog : libSimpleLog;
          this.translationTable = {};
        }
        _createClass(ManyfestHashTranslation, [{
          key: "translationCount",
          value: function translationCount() {
            return Object.keys(this.translationTable).length;
          }
        }, {
          key: "addTranslation",
          value: function addTranslation(pTranslation) {
            var _this = this;
            // This adds a translation in the form of:
            // { "SourceHash": "DestinationHash", "SecondSourceHash":"SecondDestinationHash" }
            if (_typeof(pTranslation) != 'object') {
              this.logError("Hash translation addTranslation expected a translation be type object but was passed in ".concat(_typeof(pTranslation)));
              return false;
            }
            var tmpTranslationSources = Object.keys(pTranslation);
            tmpTranslationSources.forEach(function (pTranslationSource) {
              if (typeof pTranslation[pTranslationSource] != 'string') {
                _this.logError("Hash translation addTranslation expected a translation destination hash for [".concat(pTranslationSource, "] to be a string but the referrant was a ").concat(_typeof(pTranslation[pTranslationSource])));
              } else {
                _this.translationTable[pTranslationSource] = pTranslation[pTranslationSource];
              }
            });
          }
        }, {
          key: "removeTranslationHash",
          value: function removeTranslationHash(pTranslationHash) {
            if (this.translationTable.hasOwnProperty(pTranslationHash)) {
              delete this.translationTable[pTranslationHash];
            }
          }

          // This removes translations.
          // If passed a string, just removes the single one.
          // If passed an object, it does all the source keys.
        }, {
          key: "removeTranslation",
          value: function removeTranslation(pTranslation) {
            var _this2 = this;
            if (typeof pTranslation == 'string') {
              this.removeTranslationHash(pTranslation);
              return true;
            } else if (_typeof(pTranslation) == 'object') {
              var tmpTranslationSources = Object.keys(pTranslation);
              tmpTranslationSources.forEach(function (pTranslationSource) {
                _this2.removeTranslation(pTranslationSource);
              });
              return true;
            } else {
              this.logError("Hash translation removeTranslation expected either a string or an object but the passed-in translation was type ".concat(_typeof(pTranslation)));
              return false;
            }
          }
        }, {
          key: "clearTranslations",
          value: function clearTranslations() {
            this.translationTable = {};
          }
        }, {
          key: "translate",
          value: function translate(pTranslation) {
            if (this.translationTable.hasOwnProperty(pTranslation)) {
              return this.translationTable[pTranslation];
            } else {
              return pTranslation;
            }
          }
        }]);
        return ManyfestHashTranslation;
      }();
      module.exports = ManyfestHashTranslation;
    }, {
      "./Manyfest-LogToConsole.js": 5
    }],
    5: [function (require, module, exports) {
      /**
      * @author <steven@velozo.com>
      */

      /**
      * Manyfest simple logging shim (for browser and dependency-free running)
      */

      var logToConsole = function logToConsole(pLogLine, pLogObject) {
        var tmpLogLine = typeof pLogLine === 'string' ? pLogLine : '';
        console.log("[Manyfest] ".concat(tmpLogLine));
        if (pLogObject) console.log(JSON.stringify(pLogObject));
      };
      module.exports = logToConsole;
    }, {}],
    6: [function (require, module, exports) {
      /**
      * @author <steven@velozo.com>
      */
      var libSimpleLog = require('./Manyfest-LogToConsole.js');

      /**
      * Object Address Resolver
      *
      * IMPORTANT NOTE: This code is intentionally more verbose than necessary, to
      *                 be extremely clear what is going on in the recursion for
      *                 each of the three address resolution functions.
      *
      *                 Although there is some opportunity to repeat ourselves a
      *                 bit less in this codebase (e.g. with detection of arrays
      *                 versus objects versus direct properties), it can make
      *                 debugging.. challenging.  The minified version of the code
      *                 optimizes out almost anything repeated in here.  So please
      *                 be kind and rewind... meaning please keep the codebase less
      *                 terse and more verbose so humans can comprehend it.
      *
      *
      * @class ManyfestObjectAddressResolverCheckAddressExists
      */
      var ManyfestObjectAddressResolverCheckAddressExists = /*#__PURE__*/function () {
        function ManyfestObjectAddressResolverCheckAddressExists(pInfoLog, pErrorLog) {
          _classCallCheck(this, ManyfestObjectAddressResolverCheckAddressExists);
          // Wire in logging
          this.logInfo = typeof pInfoLog == 'function' ? pInfoLog : libSimpleLog;
          this.logError = typeof pErrorLog == 'function' ? pErrorLog : libSimpleLog;
        }

        // Check if an address exists.
        //
        // This is necessary because the getValueAtAddress function is ambiguous on
        // whether the element/property is actually there or not (it returns
        // undefined whether the property exists or not).  This function checks for
        // existance and returns true or false dependent.
        _createClass(ManyfestObjectAddressResolverCheckAddressExists, [{
          key: "checkAddressExists",
          value: function checkAddressExists(pObject, pAddress) {
            // TODO: Should these throw an error?
            // Make sure pObject is an object
            if (_typeof(pObject) != 'object') return false;
            // Make sure pAddress is a string
            if (typeof pAddress != 'string') return false;

            // TODO: Make this work for things like SomeRootObject.Metadata["Some.People.Use.Bad.Object.Property.Names"]
            var tmpSeparatorIndex = pAddress.indexOf('.');

            // This is the terminal address string (no more dots so the RECUSION ENDS IN HERE somehow)
            if (tmpSeparatorIndex == -1) {
              // Check if the address refers to a boxed property
              var tmpBracketStartIndex = pAddress.indexOf('[');
              var tmpBracketStopIndex = pAddress.indexOf(']');
              // Boxed elements look like this:
              // 		MyValues[10]
              // 		MyValues['Name']
              // 		MyValues["Age"]
              // 		MyValues[`Cost`]
              //
              // When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
              // The requirements to detect a boxed element are:
              //    1) The start bracket is after character 0
              if (tmpBracketStartIndex > 0
              //    2) The end bracket has something between them
              && tmpBracketStopIndex > tmpBracketStartIndex
              //    3) There is data
              && tmpBracketStopIndex - tmpBracketStartIndex > 1) {
                // The "Name" of the Object contained too the left of the bracket
                var tmpBoxedPropertyName = pAddress.substring(0, tmpBracketStartIndex).trim();

                // If the subproperty doesn't test as a proper Object, none of the rest of this is possible.
                // This is a rare case where Arrays testing as Objects is useful
                if (_typeof(pObject[tmpBoxedPropertyName]) !== 'object') {
                  return false;
                }

                // The "Reference" to the property within it, either an array element or object property
                var tmpBoxedPropertyReference = pAddress.substring(tmpBracketStartIndex + 1, tmpBracketStopIndex).trim();
                // Attempt to parse the reference as a number, which will be used as an array element
                var tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);

                // Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
                //        This seems confusing to me at first read, so explaination:
                //        Is the Boxed Object an Array?  TRUE
                //        And is the Reference inside the boxed Object not a number? TRUE
                //        -->  So when these are in agreement, it's an impossible access state
                if (Array.isArray(pObject[tmpBoxedPropertyName]) == isNaN(tmpBoxedPropertyNumber)) {
                  return false;
                }

                //    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
                //       otherwise we will try to treat it as a dynamic object property.
                if (isNaN(tmpBoxedPropertyNumber)) {
                  // This isn't a number ... let's treat it as a dynamic object property.
                  // We would expect the property to be wrapped in some kind of quotes so strip them
                  tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
                  tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
                  tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

                  // Check if the property exists.
                  return pObject[tmpBoxedPropertyName].hasOwnProperty(tmpBoxedPropertyReference);
                } else {
                  // Use the new in operator to see if the element is in the array
                  return tmpBoxedPropertyNumber in pObject[tmpBoxedPropertyName];
                }
              } else {
                // Check if the property exists
                return pObject.hasOwnProperty(pAddress);
              }
            } else {
              var tmpSubObjectName = pAddress.substring(0, tmpSeparatorIndex);
              var tmpNewAddress = pAddress.substring(tmpSeparatorIndex + 1);

              // Test if the tmpNewAddress is an array or object
              // Check if it's a boxed property
              var _tmpBracketStartIndex = tmpSubObjectName.indexOf('[');
              var _tmpBracketStopIndex = tmpSubObjectName.indexOf(']');
              // Boxed elements look like this:
              // 		MyValues[42]
              // 		MyValues['Color']
              // 		MyValues["Weight"]
              // 		MyValues[`Diameter`]
              //
              // When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
              // The requirements to detect a boxed element are:
              //    1) The start bracket is after character 0
              if (_tmpBracketStartIndex > 0
              //    2) The end bracket has something between them
              && _tmpBracketStopIndex > _tmpBracketStartIndex
              //    3) There is data
              && _tmpBracketStopIndex - _tmpBracketStartIndex > 1) {
                var _tmpBoxedPropertyName = tmpSubObjectName.substring(0, _tmpBracketStartIndex).trim();
                var _tmpBoxedPropertyReference = tmpSubObjectName.substring(_tmpBracketStartIndex + 1, _tmpBracketStopIndex).trim();
                var _tmpBoxedPropertyNumber = parseInt(_tmpBoxedPropertyReference, 10);

                // Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
                //        This seems confusing to me at first read, so explaination:
                //        Is the Boxed Object an Array?  TRUE
                //        And is the Reference inside the boxed Object not a number? TRUE
                //        -->  So when these are in agreement, it's an impossible access state
                // This could be a failure in the recursion chain because they passed something like this in:
                //    StudentData.Sections.Algebra.Students[1].Tardy
                //       BUT
                //         StudentData.Sections.Algebra.Students is an object, so the [1].Tardy is not possible to access
                // This could be a failure in the recursion chain because they passed something like this in:
                //    StudentData.Sections.Algebra.Students["JaneDoe"].Grade
                //       BUT
                //         StudentData.Sections.Algebra.Students is an array, so the ["JaneDoe"].Grade is not possible to access
                // TODO: Should this be an error or something?  Should we keep a log of failures like this?
                if (Array.isArray(pObject[_tmpBoxedPropertyName]) == isNaN(_tmpBoxedPropertyNumber)) {
                  // Because this is an impossible address, the property doesn't exist
                  // TODO: Should we throw an error in this condition?
                  return false;
                }

                //This is a bracketed value
                //    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
                //       otherwise we will try to reat it as a dynamic object property.
                if (isNaN(_tmpBoxedPropertyNumber)) {
                  // This isn't a number ... let's treat it as a dynanmic object property.
                  _tmpBoxedPropertyReference = this.cleanWrapCharacters('"', _tmpBoxedPropertyReference);
                  _tmpBoxedPropertyReference = this.cleanWrapCharacters('`', _tmpBoxedPropertyReference);
                  _tmpBoxedPropertyReference = this.cleanWrapCharacters("'", _tmpBoxedPropertyReference);

                  // Recurse directly into the subobject
                  return this.checkAddressExists(pObject[_tmpBoxedPropertyName][_tmpBoxedPropertyReference], tmpNewAddress);
                } else {
                  // We parsed a valid number out of the boxed property name, so recurse into the array
                  return this.checkAddressExists(pObject[_tmpBoxedPropertyName][_tmpBoxedPropertyNumber], tmpNewAddress);
                }
              }

              // If there is an object property already named for the sub object, but it isn't an object
              // then the system can't set the value in there.  Error and abort!
              if (pObject.hasOwnProperty(tmpSubObjectName) && _typeof(pObject[tmpSubObjectName]) !== 'object') {
                return false;
              } else if (pObject.hasOwnProperty(tmpSubObjectName)) {
                // If there is already a subobject pass that to the recursive thingy
                return this.checkAddressExists(pObject[tmpSubObjectName], tmpNewAddress);
              } else {
                // Create a subobject and then pass that
                pObject[tmpSubObjectName] = {};
                return this.checkAddressExists(pObject[tmpSubObjectName], tmpNewAddress);
              }
            }
          }
        }]);
        return ManyfestObjectAddressResolverCheckAddressExists;
      }();
      ;
      module.exports = ManyfestObjectAddressResolverCheckAddressExists;
    }, {
      "./Manyfest-LogToConsole.js": 5
    }],
    7: [function (require, module, exports) {
      /**
      * @author <steven@velozo.com>
      */
      var libSimpleLog = require('./Manyfest-LogToConsole.js');
      var fCleanWrapCharacters = require('./Manyfest-CleanWrapCharacters.js');
      var fParseConditionals = require("../source/Manyfest-ParseConditionals.js");

      /**
      * Object Address Resolver - DeleteValue
      *
      * IMPORTANT NOTE: This code is intentionally more verbose than necessary, to
      *                 be extremely clear what is going on in the recursion for
      *                 each of the three address resolution functions.
      *
      *                 Although there is some opportunity to repeat ourselves a
      *                 bit less in this codebase (e.g. with detection of arrays
      *                 versus objects versus direct properties), it can make
      *                 debugging.. challenging.  The minified version of the code
      *                 optimizes out almost anything repeated in here.  So please
      *                 be kind and rewind... meaning please keep the codebase less
      *                 terse and more verbose so humans can comprehend it.
      *
      * TODO: Once we validate this pattern is good to go, break these out into
      *       three separate modules.
      *
      * @class ManyfestObjectAddressResolverDeleteValue
      */
      var ManyfestObjectAddressResolverDeleteValue = /*#__PURE__*/function () {
        function ManyfestObjectAddressResolverDeleteValue(pInfoLog, pErrorLog) {
          _classCallCheck(this, ManyfestObjectAddressResolverDeleteValue);
          // Wire in logging
          this.logInfo = typeof pInfoLog == 'function' ? pInfoLog : libSimpleLog;
          this.logError = typeof pErrorLog == 'function' ? pErrorLog : libSimpleLog;
          this.cleanWrapCharacters = fCleanWrapCharacters;
        }

        // TODO: Dry me
        _createClass(ManyfestObjectAddressResolverDeleteValue, [{
          key: "checkFilters",
          value: function checkFilters(pAddress, pRecord) {
            return fParseConditionals(this, pAddress, pRecord);
          }

          // Delete the value of an element at an address
        }, {
          key: "deleteValueAtAddress",
          value: function deleteValueAtAddress(pObject, pAddress, pParentAddress) {
            // Make sure pObject (the object we are meant to be recursing) is an object (which could be an array or object)
            if (_typeof(pObject) != 'object') return undefined;
            // Make sure pAddress (the address we are resolving) is a string
            if (typeof pAddress != 'string') return undefined;
            // Stash the parent address for later resolution
            var tmpParentAddress = "";
            if (typeof pParentAddress == 'string') {
              tmpParentAddress = pParentAddress;
            }

            // TODO: Make this work for things like SomeRootObject.Metadata["Some.People.Use.Bad.Object.Property.Names"]
            var tmpSeparatorIndex = pAddress.indexOf('.');

            // This is the terminal address string (no more dots so the RECUSION ENDS IN HERE somehow)
            if (tmpSeparatorIndex == -1) {
              // Check if the address refers to a boxed property
              var tmpBracketStartIndex = pAddress.indexOf('[');
              var tmpBracketStopIndex = pAddress.indexOf(']');

              // Check for the Object Set Type marker.
              // Note this will not work with a bracket in the same address box set
              var tmpObjectTypeMarkerIndex = pAddress.indexOf('{}');

              // Boxed elements look like this:
              // 		MyValues[10]
              // 		MyValues['Name']
              // 		MyValues["Age"]
              // 		MyValues[`Cost`]
              //
              // When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
              // The requirements to detect a boxed element are:
              //    1) The start bracket is after character 0
              if (tmpBracketStartIndex > 0
              //    2) The end bracket has something between them
              && tmpBracketStopIndex > tmpBracketStartIndex
              //    3) There is data
              && tmpBracketStopIndex - tmpBracketStartIndex > 1) {
                // The "Name" of the Object contained too the left of the bracket
                var tmpBoxedPropertyName = pAddress.substring(0, tmpBracketStartIndex).trim();

                // If the subproperty doesn't test as a proper Object, none of the rest of this is possible.
                // This is a rare case where Arrays testing as Objects is useful
                if (_typeof(pObject[tmpBoxedPropertyName]) !== 'object') {
                  return false;
                }

                // The "Reference" to the property within it, either an array element or object property
                var tmpBoxedPropertyReference = pAddress.substring(tmpBracketStartIndex + 1, tmpBracketStopIndex).trim();
                // Attempt to parse the reference as a number, which will be used as an array element
                var tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);

                // Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
                //        This seems confusing to me at first read, so explaination:
                //        Is the Boxed Object an Array?  TRUE
                //        And is the Reference inside the boxed Object not a number? TRUE
                //        -->  So when these are in agreement, it's an impossible access state
                if (Array.isArray(pObject[tmpBoxedPropertyName]) == isNaN(tmpBoxedPropertyNumber)) {
                  return false;
                }

                //    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
                //       otherwise we will try to treat it as a dynamic object property.
                if (isNaN(tmpBoxedPropertyNumber)) {
                  // This isn't a number ... let's treat it as a dynamic object property.
                  // We would expect the property to be wrapped in some kind of quotes so strip them
                  tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
                  tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
                  tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

                  // Return the value in the property
                  delete pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference];
                  return true;
                } else {
                  delete pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber];
                  return true;
                }
              }
              // The requirements to detect a boxed set element are:
              //    1) The start bracket is after character 0
              else if (tmpBracketStartIndex > 0
              //    2) The end bracket is after the start bracket
              && tmpBracketStopIndex > tmpBracketStartIndex
              //    3) There is nothing in the brackets
              && tmpBracketStopIndex - tmpBracketStartIndex == 1) {
                var _tmpBoxedPropertyName2 = pAddress.substring(0, tmpBracketStartIndex).trim();
                if (!Array.isArray(pObject[_tmpBoxedPropertyName2])) {
                  // We asked for a set from an array but it isnt' an array.
                  return false;
                }
                var tmpInputArray = pObject[_tmpBoxedPropertyName2];
                // Count from the end to the beginning so splice doesn't %&%#$ up the array
                for (var i = tmpInputArray.length - 1; i >= 0; i--) {
                  // The filtering is complex but allows config-based metaprogramming directly from schema
                  var tmpKeepRecord = this.checkFilters(pAddress, tmpInputArray[i]);
                  if (tmpKeepRecord) {
                    // Delete elements end to beginning
                    tmpInputArray.splice(i, 1);
                  }
                }
                return true;
              }
              // The object has been flagged as an object set, so treat it as such
              else if (tmpObjectTypeMarkerIndex > 0) {
                var tmpObjectPropertyName = pAddress.substring(0, tmpObjectTypeMarkerIndex).trim();
                if (_typeof(pObject[tmpObjectPropertyName]) != 'object') {
                  // We asked for a set from an array but it isnt' an array.
                  return false;
                }
                delete pObject[tmpObjectPropertyName];
                return true;
              } else {
                // Now is the point in recursion to return the value in the address
                delete pObject[pAddress];
                return true;
              }
            } else {
              var tmpSubObjectName = pAddress.substring(0, tmpSeparatorIndex);
              var tmpNewAddress = pAddress.substring(tmpSeparatorIndex + 1);

              // BOXED ELEMENTS
              // Test if the tmpNewAddress is an array or object
              // Check if it's a boxed property
              var _tmpBracketStartIndex2 = tmpSubObjectName.indexOf('[');
              var _tmpBracketStopIndex2 = tmpSubObjectName.indexOf(']');
              // Boxed elements look like this:
              // 		MyValues[42]
              // 		MyValues['Color']
              // 		MyValues["Weight"]
              // 		MyValues[`Diameter`]
              //
              // When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
              // The requirements to detect a boxed element are:
              //    1) The start bracket is after character 0
              if (_tmpBracketStartIndex2 > 0
              //    2) The end bracket has something between them
              && _tmpBracketStopIndex2 > _tmpBracketStartIndex2
              //    3) There is data
              && _tmpBracketStopIndex2 - _tmpBracketStartIndex2 > 1) {
                var _tmpBoxedPropertyName3 = tmpSubObjectName.substring(0, _tmpBracketStartIndex2).trim();
                var _tmpBoxedPropertyReference2 = tmpSubObjectName.substring(_tmpBracketStartIndex2 + 1, _tmpBracketStopIndex2).trim();
                var _tmpBoxedPropertyNumber2 = parseInt(_tmpBoxedPropertyReference2, 10);

                // Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
                //        This seems confusing to me at first read, so explaination:
                //        Is the Boxed Object an Array?  TRUE
                //        And is the Reference inside the boxed Object not a number? TRUE
                //        -->  So when these are in agreement, it's an impossible access state
                // This could be a failure in the recursion chain because they passed something like this in:
                //    StudentData.Sections.Algebra.Students[1].Tardy
                //       BUT
                //         StudentData.Sections.Algebra.Students is an object, so the [1].Tardy is not possible to access
                // This could be a failure in the recursion chain because they passed something like this in:
                //    StudentData.Sections.Algebra.Students["JaneDoe"].Grade
                //       BUT
                //         StudentData.Sections.Algebra.Students is an array, so the ["JaneDoe"].Grade is not possible to access
                // TODO: Should this be an error or something?  Should we keep a log of failures like this?
                if (Array.isArray(pObject[_tmpBoxedPropertyName3]) == isNaN(_tmpBoxedPropertyNumber2)) {
                  return false;
                }
                // Check if the boxed property is an object.
                if (_typeof(pObject[_tmpBoxedPropertyName3]) != 'object') {
                  return false;
                }

                //This is a bracketed value
                //    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
                //       otherwise we will try to reat it as a dynamic object property.
                if (isNaN(_tmpBoxedPropertyNumber2)) {
                  // This isn't a number ... let's treat it as a dynanmic object property.
                  _tmpBoxedPropertyReference2 = this.cleanWrapCharacters('"', _tmpBoxedPropertyReference2);
                  _tmpBoxedPropertyReference2 = this.cleanWrapCharacters('`', _tmpBoxedPropertyReference2);
                  _tmpBoxedPropertyReference2 = this.cleanWrapCharacters("'", _tmpBoxedPropertyReference2);

                  // Continue to manage the parent address for recursion
                  tmpParentAddress = "".concat(tmpParentAddress).concat(tmpParentAddress.length > 0 ? '.' : '').concat(tmpSubObjectName);
                  // Recurse directly into the subobject
                  return this.deleteValueAtAddress(pObject[_tmpBoxedPropertyName3][_tmpBoxedPropertyReference2], tmpNewAddress, tmpParentAddress);
                } else {
                  // Continue to manage the parent address for recursion
                  tmpParentAddress = "".concat(tmpParentAddress).concat(tmpParentAddress.length > 0 ? '.' : '').concat(tmpSubObjectName);
                  // We parsed a valid number out of the boxed property name, so recurse into the array
                  return this.deleteValueAtAddress(pObject[_tmpBoxedPropertyName3][_tmpBoxedPropertyNumber2], tmpNewAddress, tmpParentAddress);
                }
              }
              // The requirements to detect a boxed set element are:
              //    1) The start bracket is after character 0
              else if (_tmpBracketStartIndex2 > 0
              //    2) The end bracket is after the start bracket
              && _tmpBracketStopIndex2 > _tmpBracketStartIndex2
              //    3) There is nothing in the brackets
              && _tmpBracketStopIndex2 - _tmpBracketStartIndex2 == 1) {
                var _tmpBoxedPropertyName4 = pAddress.substring(0, _tmpBracketStartIndex2).trim();
                if (!Array.isArray(pObject[_tmpBoxedPropertyName4])) {
                  // We asked for a set from an array but it isnt' an array.
                  return false;
                }

                // We need to enumerate the array and grab the addresses from there.
                var tmpArrayProperty = pObject[_tmpBoxedPropertyName4];
                // Managing the parent address is a bit more complex here -- the box will be added for each element.
                tmpParentAddress = "".concat(tmpParentAddress).concat(tmpParentAddress.length > 0 ? '.' : '').concat(_tmpBoxedPropertyName4);
                // The container object is where we have the "Address":SOMEVALUE pairs
                var tmpContainerObject = {};
                for (var _i = 0; _i < tmpArrayProperty.length; _i++) {
                  var tmpPropertyParentAddress = "".concat(tmpParentAddress, "[").concat(_i, "]");
                  var tmpValue = this.deleteValueAtAddress(pObject[_tmpBoxedPropertyName4][_i], tmpNewAddress, tmpPropertyParentAddress);
                  tmpContainerObject["".concat(tmpPropertyParentAddress, ".").concat(tmpNewAddress)] = tmpValue;
                }
                return tmpContainerObject;
              }

              // OBJECT SET
              // Note this will not work with a bracket in the same address box set
              var _tmpObjectTypeMarkerIndex = pAddress.indexOf('{}');
              if (_tmpObjectTypeMarkerIndex > 0) {
                var _tmpObjectPropertyName = pAddress.substring(0, _tmpObjectTypeMarkerIndex).trim();
                if (_typeof(pObject[_tmpObjectPropertyName]) != 'object') {
                  // We asked for a set from an array but it isnt' an array.
                  return false;
                }

                // We need to enumerate the Object and grab the addresses from there.
                var tmpObjectProperty = pObject[_tmpObjectPropertyName];
                var tmpObjectPropertyKeys = Object.keys(tmpObjectProperty);
                // Managing the parent address is a bit more complex here -- the box will be added for each element.
                tmpParentAddress = "".concat(tmpParentAddress).concat(tmpParentAddress.length > 0 ? '.' : '').concat(_tmpObjectPropertyName);
                // The container object is where we have the "Address":SOMEVALUE pairs
                var _tmpContainerObject = {};
                for (var _i2 = 0; _i2 < tmpObjectPropertyKeys.length; _i2++) {
                  var _tmpPropertyParentAddress = "".concat(tmpParentAddress, ".").concat(tmpObjectPropertyKeys[_i2]);
                  var _tmpValue = this.deleteValueAtAddress(pObject[_tmpObjectPropertyName][tmpObjectPropertyKeys[_i2]], tmpNewAddress, _tmpPropertyParentAddress);

                  // The filtering is complex but allows config-based metaprogramming directly from schema
                  var _tmpKeepRecord = this.checkFilters(pAddress, _tmpValue);
                  if (_tmpKeepRecord) {
                    _tmpContainerObject["".concat(_tmpPropertyParentAddress, ".").concat(tmpNewAddress)] = _tmpValue;
                  }
                }
                return _tmpContainerObject;
              }

              // If there is an object property already named for the sub object, but it isn't an object
              // then the system can't set the value in there.  Error and abort!
              if (pObject.hasOwnProperty(tmpSubObjectName) && _typeof(pObject[tmpSubObjectName]) !== 'object') {
                return undefined;
              } else if (pObject.hasOwnProperty(tmpSubObjectName)) {
                // If there is already a subobject pass that to the recursive thingy
                // Continue to manage the parent address for recursion
                tmpParentAddress = "".concat(tmpParentAddress).concat(tmpParentAddress.length > 0 ? '.' : '').concat(tmpSubObjectName);
                return this.deleteValueAtAddress(pObject[tmpSubObjectName], tmpNewAddress, tmpParentAddress);
              } else {
                // Create a subobject and then pass that
                // Continue to manage the parent address for recursion
                tmpParentAddress = "".concat(tmpParentAddress).concat(tmpParentAddress.length > 0 ? '.' : '').concat(tmpSubObjectName);
                pObject[tmpSubObjectName] = {};
                return this.deleteValueAtAddress(pObject[tmpSubObjectName], tmpNewAddress, tmpParentAddress);
              }
            }
          }
        }]);
        return ManyfestObjectAddressResolverDeleteValue;
      }();
      ;
      module.exports = ManyfestObjectAddressResolverDeleteValue;
    }, {
      "../source/Manyfest-ParseConditionals.js": 11,
      "./Manyfest-CleanWrapCharacters.js": 3,
      "./Manyfest-LogToConsole.js": 5
    }],
    8: [function (require, module, exports) {
      /**
      * @author <steven@velozo.com>
      */
      var libSimpleLog = require('./Manyfest-LogToConsole.js');
      var fCleanWrapCharacters = require('./Manyfest-CleanWrapCharacters.js');
      var fParseConditionals = require("../source/Manyfest-ParseConditionals.js");

      /**
      * Object Address Resolver - GetValue
      *
      * IMPORTANT NOTE: This code is intentionally more verbose than necessary, to
      *                 be extremely clear what is going on in the recursion for
      *                 each of the three address resolution functions.
      *
      *                 Although there is some opportunity to repeat ourselves a
      *                 bit less in this codebase (e.g. with detection of arrays
      *                 versus objects versus direct properties), it can make
      *                 debugging.. challenging.  The minified version of the code
      *                 optimizes out almost anything repeated in here.  So please
      *                 be kind and rewind... meaning please keep the codebase less
      *                 terse and more verbose so humans can comprehend it.
      *
      * TODO: Once we validate this pattern is good to go, break these out into
      *       three separate modules.
      *
      * @class ManyfestObjectAddressResolverGetValue
      */
      var ManyfestObjectAddressResolverGetValue = /*#__PURE__*/function () {
        function ManyfestObjectAddressResolverGetValue(pInfoLog, pErrorLog) {
          _classCallCheck(this, ManyfestObjectAddressResolverGetValue);
          // Wire in logging
          this.logInfo = typeof pInfoLog == 'function' ? pInfoLog : libSimpleLog;
          this.logError = typeof pErrorLog == 'function' ? pErrorLog : libSimpleLog;
          this.cleanWrapCharacters = fCleanWrapCharacters;
        }
        _createClass(ManyfestObjectAddressResolverGetValue, [{
          key: "checkFilters",
          value: function checkFilters(pAddress, pRecord) {
            return fParseConditionals(this, pAddress, pRecord);
          }

          // Get the value of an element at an address
        }, {
          key: "getValueAtAddress",
          value: function getValueAtAddress(pObject, pAddress, pParentAddress, pRootObject) {
            // Make sure pObject (the object we are meant to be recursing) is an object (which could be an array or object)
            if (_typeof(pObject) != 'object') return undefined;
            // Make sure pAddress (the address we are resolving) is a string
            if (typeof pAddress != 'string') return undefined;
            // Stash the parent address for later resolution
            var tmpParentAddress = "";
            if (typeof pParentAddress == 'string') {
              tmpParentAddress = pParentAddress;
            }

            // Set the root object to the passed-in object if it isn't set yet.  This is expected to be the root object.
            var tmpRootObject = typeof pRootObject == 'undefined' ? pObject : pRootObject;

            // TODO: Make this work for things like SomeRootObject.Metadata["Some.People.Use.Bad.Object.Property.Names"]
            var tmpSeparatorIndex = pAddress.indexOf('.');

            // Adding simple back-navigation in objects
            if (tmpSeparatorIndex == 0) {
              // Given an address of "Bundle.Contract.IDContract...Project.IDProject" the ... would be interpreted as two back-navigations from IDContract.
              // When the address is passed in, though, the first . is already eliminated.  So we can count the dots.
              var tmpParentAddressParts = tmpParentAddress.split('.');
              var tmpBackNavigationCount = 0;

              // Count the number of dots
              for (var i = 0; i < pAddress.length; i++) {
                if (pAddress.charAt(i) != '.') {
                  break;
                }
                tmpBackNavigationCount++;
              }
              var tmpParentAddressLength = tmpParentAddressParts.length - tmpBackNavigationCount;
              if (tmpParentAddressLength < 0) {
                // We are trying to back navigate more than we can.
                // TODO: Should this be undefined or should we bank out at the bottom and try to go forward?
                // This seems safest for now.
                return undefined;
              } else {
                // We are trying to back navigate to a parent object.
                // Recurse with the back-propagated parent address, and, the new address without the back-navigation dots.
                var tmpRecurseAddress = pAddress.slice(tmpBackNavigationCount);
                if (tmpParentAddressLength > 0) {
                  tmpRecurseAddress = "".concat(tmpParentAddressParts.slice(0, tmpParentAddressLength).join('.'), ".").concat(tmpRecurseAddress);
                }
                this.logInfo("Back-navigation detected.  Recursing back to address [".concat(tmpRecurseAddress, "]"));
                return this.getValueAtAddress(tmpRootObject, tmpRecurseAddress);
              }
            }

            // This is the terminal address string (no more dots so the RECUSION ENDS IN HERE somehow)
            if (tmpSeparatorIndex == -1) {
              // Check if the address refers to a boxed property
              var tmpBracketStartIndex = pAddress.indexOf('[');
              var tmpBracketStopIndex = pAddress.indexOf(']');

              // Check for the Object Set Type marker.
              // Note this will not work with a bracket in the same address box set
              var tmpObjectTypeMarkerIndex = pAddress.indexOf('{}');

              // Boxed elements look like this:
              // 		MyValues[10]
              // 		MyValues['Name']
              // 		MyValues["Age"]
              // 		MyValues[`Cost`]
              //
              // When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
              // The requirements to detect a boxed element are:
              //    1) The start bracket is after character 0
              if (tmpBracketStartIndex > 0
              //    2) The end bracket has something between them
              && tmpBracketStopIndex > tmpBracketStartIndex
              //    3) There is data
              && tmpBracketStopIndex - tmpBracketStartIndex > 1) {
                // The "Name" of the Object contained too the left of the bracket
                var tmpBoxedPropertyName = pAddress.substring(0, tmpBracketStartIndex).trim();

                // If the subproperty doesn't test as a proper Object, none of the rest of this is possible.
                // This is a rare case where Arrays testing as Objects is useful
                if (_typeof(pObject[tmpBoxedPropertyName]) !== 'object') {
                  return undefined;
                }

                // The "Reference" to the property within it, either an array element or object property
                var tmpBoxedPropertyReference = pAddress.substring(tmpBracketStartIndex + 1, tmpBracketStopIndex).trim();
                // Attempt to parse the reference as a number, which will be used as an array element
                var tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);

                // Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
                //        This seems confusing to me at first read, so explaination:
                //        Is the Boxed Object an Array?  TRUE
                //        And is the Reference inside the boxed Object not a number? TRUE
                //        -->  So when these are in agreement, it's an impossible access state
                if (Array.isArray(pObject[tmpBoxedPropertyName]) == isNaN(tmpBoxedPropertyNumber)) {
                  return undefined;
                }

                //    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
                //       otherwise we will try to treat it as a dynamic object property.
                if (isNaN(tmpBoxedPropertyNumber)) {
                  // This isn't a number ... let's treat it as a dynamic object property.
                  // We would expect the property to be wrapped in some kind of quotes so strip them
                  tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
                  tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
                  tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

                  // Return the value in the property
                  return pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference];
                } else {
                  return pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber];
                }
              }
              // The requirements to detect a boxed set element are:
              //    1) The start bracket is after character 0
              else if (tmpBracketStartIndex > 0
              //    2) The end bracket is after the start bracket
              && tmpBracketStopIndex > tmpBracketStartIndex
              //    3) There is nothing in the brackets
              && tmpBracketStopIndex - tmpBracketStartIndex == 1) {
                var _tmpBoxedPropertyName5 = pAddress.substring(0, tmpBracketStartIndex).trim();
                if (!Array.isArray(pObject[_tmpBoxedPropertyName5])) {
                  // We asked for a set from an array but it isnt' an array.
                  return false;
                }
                var tmpInputArray = pObject[_tmpBoxedPropertyName5];
                var tmpOutputArray = [];
                for (var _i3 = 0; _i3 < tmpInputArray.length; _i3++) {
                  // The filtering is complex but allows config-based metaprogramming directly from schema
                  var tmpKeepRecord = this.checkFilters(pAddress, tmpInputArray[_i3]);
                  if (tmpKeepRecord) {
                    tmpOutputArray.push(tmpInputArray[_i3]);
                  }
                }
                return tmpOutputArray;
              }
              // The object has been flagged as an object set, so treat it as such
              else if (tmpObjectTypeMarkerIndex > 0) {
                var tmpObjectPropertyName = pAddress.substring(0, tmpObjectTypeMarkerIndex).trim();
                if (_typeof(pObject[tmpObjectPropertyName]) != 'object') {
                  // We asked for a set from an array but it isnt' an array.
                  return false;
                }
                return pObject[tmpObjectPropertyName];
              } else {
                // Now is the point in recursion to return the value in the address
                return pObject[pAddress];
              }
            } else {
              var tmpSubObjectName = pAddress.substring(0, tmpSeparatorIndex);
              var tmpNewAddress = pAddress.substring(tmpSeparatorIndex + 1);

              // BOXED ELEMENTS
              // Test if the tmpNewAddress is an array or object
              // Check if it's a boxed property
              var _tmpBracketStartIndex3 = tmpSubObjectName.indexOf('[');
              var _tmpBracketStopIndex3 = tmpSubObjectName.indexOf(']');
              // Boxed elements look like this:
              // 		MyValues[42]
              // 		MyValues['Color']
              // 		MyValues["Weight"]
              // 		MyValues[`Diameter`]
              //
              // When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
              // The requirements to detect a boxed element are:
              //    1) The start bracket is after character 0
              if (_tmpBracketStartIndex3 > 0
              //    2) The end bracket has something between them
              && _tmpBracketStopIndex3 > _tmpBracketStartIndex3
              //    3) There is data
              && _tmpBracketStopIndex3 - _tmpBracketStartIndex3 > 1) {
                var _tmpBoxedPropertyName6 = tmpSubObjectName.substring(0, _tmpBracketStartIndex3).trim();
                var _tmpBoxedPropertyReference3 = tmpSubObjectName.substring(_tmpBracketStartIndex3 + 1, _tmpBracketStopIndex3).trim();
                var _tmpBoxedPropertyNumber3 = parseInt(_tmpBoxedPropertyReference3, 10);

                // Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
                //        This seems confusing to me at first read, so explaination:
                //        Is the Boxed Object an Array?  TRUE
                //        And is the Reference inside the boxed Object not a number? TRUE
                //        -->  So when these are in agreement, it's an impossible access state
                // This could be a failure in the recursion chain because they passed something like this in:
                //    StudentData.Sections.Algebra.Students[1].Tardy
                //       BUT
                //         StudentData.Sections.Algebra.Students is an object, so the [1].Tardy is not possible to access
                // This could be a failure in the recursion chain because they passed something like this in:
                //    StudentData.Sections.Algebra.Students["JaneDoe"].Grade
                //       BUT
                //         StudentData.Sections.Algebra.Students is an array, so the ["JaneDoe"].Grade is not possible to access
                // TODO: Should this be an error or something?  Should we keep a log of failures like this?
                if (Array.isArray(pObject[_tmpBoxedPropertyName6]) == isNaN(_tmpBoxedPropertyNumber3)) {
                  return undefined;
                }
                // Check if the boxed property is an object.
                if (_typeof(pObject[_tmpBoxedPropertyName6]) != 'object') {
                  return undefined;
                }

                //This is a bracketed value
                //    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
                //       otherwise we will try to reat it as a dynamic object property.
                if (isNaN(_tmpBoxedPropertyNumber3)) {
                  // This isn't a number ... let's treat it as a dynanmic object property.
                  _tmpBoxedPropertyReference3 = this.cleanWrapCharacters('"', _tmpBoxedPropertyReference3);
                  _tmpBoxedPropertyReference3 = this.cleanWrapCharacters('`', _tmpBoxedPropertyReference3);
                  _tmpBoxedPropertyReference3 = this.cleanWrapCharacters("'", _tmpBoxedPropertyReference3);

                  // Continue to manage the parent address for recursion
                  tmpParentAddress = "".concat(tmpParentAddress).concat(tmpParentAddress.length > 0 ? '.' : '').concat(tmpSubObjectName);
                  // Recurse directly into the subobject
                  return this.getValueAtAddress(pObject[_tmpBoxedPropertyName6][_tmpBoxedPropertyReference3], tmpNewAddress, tmpParentAddress, tmpRootObject);
                } else {
                  // Continue to manage the parent address for recursion
                  tmpParentAddress = "".concat(tmpParentAddress).concat(tmpParentAddress.length > 0 ? '.' : '').concat(tmpSubObjectName);
                  // We parsed a valid number out of the boxed property name, so recurse into the array
                  return this.getValueAtAddress(pObject[_tmpBoxedPropertyName6][_tmpBoxedPropertyNumber3], tmpNewAddress, tmpParentAddress, tmpRootObject);
                }
              }
              // The requirements to detect a boxed set element are:
              //    1) The start bracket is after character 0
              else if (_tmpBracketStartIndex3 > 0
              //    2) The end bracket is after the start bracket
              && _tmpBracketStopIndex3 > _tmpBracketStartIndex3
              //    3) There is nothing in the brackets
              && _tmpBracketStopIndex3 - _tmpBracketStartIndex3 == 1) {
                var _tmpBoxedPropertyName7 = pAddress.substring(0, _tmpBracketStartIndex3).trim();
                if (!Array.isArray(pObject[_tmpBoxedPropertyName7])) {
                  // We asked for a set from an array but it isnt' an array.
                  return false;
                }

                // We need to enumerate the array and grab the addresses from there.
                var tmpArrayProperty = pObject[_tmpBoxedPropertyName7];
                // Managing the parent address is a bit more complex here -- the box will be added for each element.
                tmpParentAddress = "".concat(tmpParentAddress).concat(tmpParentAddress.length > 0 ? '.' : '').concat(_tmpBoxedPropertyName7);
                // The container object is where we have the "Address":SOMEVALUE pairs
                var tmpContainerObject = {};
                for (var _i4 = 0; _i4 < tmpArrayProperty.length; _i4++) {
                  var tmpPropertyParentAddress = "".concat(tmpParentAddress, "[").concat(_i4, "]");
                  var tmpValue = this.getValueAtAddress(pObject[_tmpBoxedPropertyName7][_i4], tmpNewAddress, tmpPropertyParentAddress, tmpRootObject);
                  tmpContainerObject["".concat(tmpPropertyParentAddress, ".").concat(tmpNewAddress)] = tmpValue;
                }
                return tmpContainerObject;
              }

              // OBJECT SET
              // Note this will not work with a bracket in the same address box set
              var _tmpObjectTypeMarkerIndex2 = pAddress.indexOf('{}');
              if (_tmpObjectTypeMarkerIndex2 > 0) {
                var _tmpObjectPropertyName2 = pAddress.substring(0, _tmpObjectTypeMarkerIndex2).trim();
                if (_typeof(pObject[_tmpObjectPropertyName2]) != 'object') {
                  // We asked for a set from an array but it isnt' an array.
                  return false;
                }

                // We need to enumerate the Object and grab the addresses from there.
                var tmpObjectProperty = pObject[_tmpObjectPropertyName2];
                var tmpObjectPropertyKeys = Object.keys(tmpObjectProperty);
                // Managing the parent address is a bit more complex here -- the box will be added for each element.
                tmpParentAddress = "".concat(tmpParentAddress).concat(tmpParentAddress.length > 0 ? '.' : '').concat(_tmpObjectPropertyName2);
                // The container object is where we have the "Address":SOMEVALUE pairs
                var _tmpContainerObject2 = {};
                for (var _i5 = 0; _i5 < tmpObjectPropertyKeys.length; _i5++) {
                  var _tmpPropertyParentAddress2 = "".concat(tmpParentAddress, ".").concat(tmpObjectPropertyKeys[_i5]);
                  var _tmpValue2 = this.getValueAtAddress(pObject[_tmpObjectPropertyName2][tmpObjectPropertyKeys[_i5]], tmpNewAddress, _tmpPropertyParentAddress2, tmpRootObject);

                  // The filtering is complex but allows config-based metaprogramming directly from schema
                  var _tmpKeepRecord2 = this.checkFilters(pAddress, _tmpValue2);
                  if (_tmpKeepRecord2) {
                    _tmpContainerObject2["".concat(_tmpPropertyParentAddress2, ".").concat(tmpNewAddress)] = _tmpValue2;
                  }
                }
                return _tmpContainerObject2;
              }

              // If there is an object property already named for the sub object, but it isn't an object
              // then the system can't set the value in there.  Error and abort!
              if (pObject.hasOwnProperty(tmpSubObjectName) && _typeof(pObject[tmpSubObjectName]) !== 'object') {
                return undefined;
              } else if (pObject.hasOwnProperty(tmpSubObjectName)) {
                // If there is already a subobject pass that to the recursive thingy
                // Continue to manage the parent address for recursion
                tmpParentAddress = "".concat(tmpParentAddress).concat(tmpParentAddress.length > 0 ? '.' : '').concat(tmpSubObjectName);
                return this.getValueAtAddress(pObject[tmpSubObjectName], tmpNewAddress, tmpParentAddress, tmpRootObject);
              } else {
                // Create a subobject and then pass that
                // Continue to manage the parent address for recursion
                tmpParentAddress = "".concat(tmpParentAddress).concat(tmpParentAddress.length > 0 ? '.' : '').concat(tmpSubObjectName);
                pObject[tmpSubObjectName] = {};
                return this.getValueAtAddress(pObject[tmpSubObjectName], tmpNewAddress, tmpParentAddress, tmpRootObject);
              }
            }
          }
        }]);
        return ManyfestObjectAddressResolverGetValue;
      }();
      ;
      module.exports = ManyfestObjectAddressResolverGetValue;
    }, {
      "../source/Manyfest-ParseConditionals.js": 11,
      "./Manyfest-CleanWrapCharacters.js": 3,
      "./Manyfest-LogToConsole.js": 5
    }],
    9: [function (require, module, exports) {
      /**
      * @author <steven@velozo.com>
      */
      var libSimpleLog = require('./Manyfest-LogToConsole.js');
      var fCleanWrapCharacters = require('./Manyfest-CleanWrapCharacters.js');

      /**
      * Object Address Resolver - SetValue
      *
      * IMPORTANT NOTE: This code is intentionally more verbose than necessary, to
      *                 be extremely clear what is going on in the recursion for
      *                 each of the three address resolution functions.
      *
      *                 Although there is some opportunity to repeat ourselves a
      *                 bit less in this codebase (e.g. with detection of arrays
      *                 versus objects versus direct properties), it can make
      *                 debugging.. challenging.  The minified version of the code
      *                 optimizes out almost anything repeated in here.  So please
      *                 be kind and rewind... meaning please keep the codebase less
      *                 terse and more verbose so humans can comprehend it.
      *
      *
      * @class ManyfestObjectAddressSetValue
      */
      var ManyfestObjectAddressSetValue = /*#__PURE__*/function () {
        function ManyfestObjectAddressSetValue(pInfoLog, pErrorLog) {
          _classCallCheck(this, ManyfestObjectAddressSetValue);
          // Wire in logging
          this.logInfo = typeof pInfoLog == 'function' ? pInfoLog : libSimpleLog;
          this.logError = typeof pErrorLog == 'function' ? pErrorLog : libSimpleLog;
          this.cleanWrapCharacters = fCleanWrapCharacters;
        }

        // Set the value of an element at an address
        _createClass(ManyfestObjectAddressSetValue, [{
          key: "setValueAtAddress",
          value: function setValueAtAddress(pObject, pAddress, pValue) {
            // Make sure pObject is an object
            if (_typeof(pObject) != 'object') return false;
            // Make sure pAddress is a string
            if (typeof pAddress != 'string') return false;
            var tmpSeparatorIndex = pAddress.indexOf('.');
            if (tmpSeparatorIndex == -1) {
              // Check if it's a boxed property
              var tmpBracketStartIndex = pAddress.indexOf('[');
              var tmpBracketStopIndex = pAddress.indexOf(']');
              // Boxed elements look like this:
              // 		MyValues[10]
              // 		MyValues['Name']
              // 		MyValues["Age"]
              // 		MyValues[`Cost`]
              //
              // When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
              // The requirements to detect a boxed element are:
              //    1) The start bracket is after character 0
              if (tmpBracketStartIndex > 0
              //    2) The end bracket has something between them
              && tmpBracketStopIndex > tmpBracketStartIndex
              //    3) There is data
              && tmpBracketStopIndex - tmpBracketStartIndex > 1) {
                // The "Name" of the Object contained too the left of the bracket
                var tmpBoxedPropertyName = pAddress.substring(0, tmpBracketStartIndex).trim();

                // If the subproperty doesn't test as a proper Object, none of the rest of this is possible.
                // This is a rare case where Arrays testing as Objects is useful
                if (_typeof(pObject[tmpBoxedPropertyName]) !== 'object') {
                  return false;
                }

                // The "Reference" to the property within it, either an array element or object property
                var tmpBoxedPropertyReference = pAddress.substring(tmpBracketStartIndex + 1, tmpBracketStopIndex).trim();
                // Attempt to parse the reference as a number, which will be used as an array element
                var tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);

                // Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
                //        This seems confusing to me at first read, so explaination:
                //        Is the Boxed Object an Array?  TRUE
                //        And is the Reference inside the boxed Object not a number? TRUE
                //        -->  So when these are in agreement, it's an impossible access state
                if (Array.isArray(pObject[tmpBoxedPropertyName]) == isNaN(tmpBoxedPropertyNumber)) {
                  return false;
                }

                //    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
                //       otherwise we will try to treat it as a dynamic object property.
                if (isNaN(tmpBoxedPropertyNumber)) {
                  // This isn't a number ... let's treat it as a dynamic object property.
                  // We would expect the property to be wrapped in some kind of quotes so strip them
                  tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
                  tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
                  tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

                  // Return the value in the property
                  pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference] = pValue;
                  return true;
                } else {
                  pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber] = pValue;
                  return true;
                }
              } else {
                // Now is the time in recursion to set the value in the object
                pObject[pAddress] = pValue;
                return true;
              }
            } else {
              var tmpSubObjectName = pAddress.substring(0, tmpSeparatorIndex);
              var tmpNewAddress = pAddress.substring(tmpSeparatorIndex + 1);

              // Test if the tmpNewAddress is an array or object
              // Check if it's a boxed property
              var _tmpBracketStartIndex4 = tmpSubObjectName.indexOf('[');
              var _tmpBracketStopIndex4 = tmpSubObjectName.indexOf(']');
              // Boxed elements look like this:
              // 		MyValues[42]
              // 		MyValues['Color']
              // 		MyValues["Weight"]
              // 		MyValues[`Diameter`]
              //
              // When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
              // The requirements to detect a boxed element are:
              //    1) The start bracket is after character 0
              if (_tmpBracketStartIndex4 > 0
              //    2) The end bracket has something between them
              && _tmpBracketStopIndex4 > _tmpBracketStartIndex4
              //    3) There is data
              && _tmpBracketStopIndex4 - _tmpBracketStartIndex4 > 1) {
                var _tmpBoxedPropertyName8 = tmpSubObjectName.substring(0, _tmpBracketStartIndex4).trim();
                var _tmpBoxedPropertyReference4 = tmpSubObjectName.substring(_tmpBracketStartIndex4 + 1, _tmpBracketStopIndex4).trim();
                var _tmpBoxedPropertyNumber4 = parseInt(_tmpBoxedPropertyReference4, 10);

                // Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
                //        This seems confusing to me at first read, so explaination:
                //        Is the Boxed Object an Array?  TRUE
                //        And is the Reference inside the boxed Object not a number? TRUE
                //        -->  So when these are in agreement, it's an impossible access state
                // This could be a failure in the recursion chain because they passed something like this in:
                //    StudentData.Sections.Algebra.Students[1].Tardy
                //       BUT
                //         StudentData.Sections.Algebra.Students is an object, so the [1].Tardy is not possible to access
                // This could be a failure in the recursion chain because they passed something like this in:
                //    StudentData.Sections.Algebra.Students["JaneDoe"].Grade
                //       BUT
                //         StudentData.Sections.Algebra.Students is an array, so the ["JaneDoe"].Grade is not possible to access
                // TODO: Should this be an error or something?  Should we keep a log of failures like this?
                if (Array.isArray(pObject[_tmpBoxedPropertyName8]) == isNaN(_tmpBoxedPropertyNumber4)) {
                  return false;
                }

                //This is a bracketed value
                //    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
                //       otherwise we will try to reat it as a dynamic object property.
                if (isNaN(_tmpBoxedPropertyNumber4)) {
                  // This isn't a number ... let's treat it as a dynanmic object property.
                  _tmpBoxedPropertyReference4 = this.cleanWrapCharacters('"', _tmpBoxedPropertyReference4);
                  _tmpBoxedPropertyReference4 = this.cleanWrapCharacters('`', _tmpBoxedPropertyReference4);
                  _tmpBoxedPropertyReference4 = this.cleanWrapCharacters("'", _tmpBoxedPropertyReference4);

                  // Recurse directly into the subobject
                  return this.setValueAtAddress(pObject[_tmpBoxedPropertyName8][_tmpBoxedPropertyReference4], tmpNewAddress, pValue);
                } else {
                  // We parsed a valid number out of the boxed property name, so recurse into the array
                  return this.setValueAtAddress(pObject[_tmpBoxedPropertyName8][_tmpBoxedPropertyNumber4], tmpNewAddress, pValue);
                }
              }

              // If there is an object property already named for the sub object, but it isn't an object
              // then the system can't set the value in there.  Error and abort!
              if (pObject.hasOwnProperty(tmpSubObjectName) && _typeof(pObject[tmpSubObjectName]) !== 'object') {
                if (!pObject.hasOwnProperty('__ERROR')) pObject['__ERROR'] = {};
                // Put it in an error object so data isn't lost
                pObject['__ERROR'][pAddress] = pValue;
                return false;
              } else if (pObject.hasOwnProperty(tmpSubObjectName)) {
                // If there is already a subobject pass that to the recursive thingy
                return this.setValueAtAddress(pObject[tmpSubObjectName], tmpNewAddress, pValue);
              } else {
                // Create a subobject and then pass that
                pObject[tmpSubObjectName] = {};
                return this.setValueAtAddress(pObject[tmpSubObjectName], tmpNewAddress, pValue);
              }
            }
          }
        }]);
        return ManyfestObjectAddressSetValue;
      }();
      ;
      module.exports = ManyfestObjectAddressSetValue;
    }, {
      "./Manyfest-CleanWrapCharacters.js": 3,
      "./Manyfest-LogToConsole.js": 5
    }],
    10: [function (require, module, exports) {
      /**
      * @author <steven@velozo.com>
      */
      var libSimpleLog = require('./Manyfest-LogToConsole.js');

      /**
      * Object Address Generation
      *
      * Automagically generate addresses and properties based on a passed-in object,
      * to be used for easy creation of schemas.  Meant to simplify the lives of
      * developers wanting to create schemas without typing a bunch of stuff.
      *
      * IMPORTANT NOTE: This code is intentionally more verbose than necessary, to
      *                 be extremely clear what is going on in the recursion for
      *                 each of the three address resolution functions.
      *
      *                 Although there is some opportunity to repeat ourselves a
      *                 bit less in this codebase (e.g. with detection of arrays
      *                 versus objects versus direct properties), it can make
      *                 debugging.. challenging.  The minified version of the code
      *                 optimizes out almost anything repeated in here.  So please
      *                 be kind and rewind... meaning please keep the codebase less
      *                 terse and more verbose so humans can comprehend it.
      *
      *
      * @class ManyfestObjectAddressGeneration
      */
      var ManyfestObjectAddressGeneration = /*#__PURE__*/function () {
        function ManyfestObjectAddressGeneration(pInfoLog, pErrorLog) {
          _classCallCheck(this, ManyfestObjectAddressGeneration);
          // Wire in logging
          this.logInfo = typeof pInfoLog == 'function' ? pInfoLog : libSimpleLog;
          this.logError = typeof pErrorLog == 'function' ? pErrorLog : libSimpleLog;
        }

        // generateAddressses
        //
        // This flattens an object into a set of key:value pairs for *EVERY SINGLE
        // POSSIBLE ADDRESS* in the object.  It can get ... really insane really
        // quickly.  This is not meant to be used directly to generate schemas, but
        // instead as a starting point for scripts or UIs.
        //
        // This will return a mega set of key:value pairs with all possible schema
        // permutations and default values (when not an object) and everything else.
        _createClass(ManyfestObjectAddressGeneration, [{
          key: "generateAddressses",
          value: function generateAddressses(pObject, pBaseAddress, pSchema) {
            var tmpBaseAddress = typeof pBaseAddress == 'string' ? pBaseAddress : '';
            var tmpSchema = _typeof(pSchema) == 'object' ? pSchema : {};
            var tmpObjectType = _typeof(pObject);
            var tmpSchemaObjectEntry = {
              Address: tmpBaseAddress,
              Hash: tmpBaseAddress,
              Name: tmpBaseAddress,
              // This is so scripts and UI controls can force a developer to opt-in.
              InSchema: false
            };
            if (tmpObjectType == 'object' && pObject == null) {
              tmpObjectType = 'null';
            }
            switch (tmpObjectType) {
              case 'string':
                tmpSchemaObjectEntry.DataType = 'String';
                tmpSchemaObjectEntry.Default = pObject;
                tmpSchema[tmpBaseAddress] = tmpSchemaObjectEntry;
                break;
              case 'number':
              case 'bigint':
                tmpSchemaObjectEntry.DataType = 'Number';
                tmpSchemaObjectEntry.Default = pObject;
                tmpSchema[tmpBaseAddress] = tmpSchemaObjectEntry;
                break;
              case 'undefined':
              case 'null':
                tmpSchemaObjectEntry.DataType = 'Any';
                tmpSchemaObjectEntry.Default = pObject;
                tmpSchema[tmpBaseAddress] = tmpSchemaObjectEntry;
                break;
              case 'object':
                if (Array.isArray(pObject)) {
                  tmpSchemaObjectEntry.DataType = 'Array';
                  if (tmpBaseAddress != '') {
                    tmpSchema[tmpBaseAddress] = tmpSchemaObjectEntry;
                  }
                  for (var i = 0; i < pObject.length; i++) {
                    this.generateAddressses(pObject[i], "".concat(tmpBaseAddress, "[").concat(i, "]"), tmpSchema);
                  }
                } else {
                  tmpSchemaObjectEntry.DataType = 'Object';
                  if (tmpBaseAddress != '') {
                    tmpSchema[tmpBaseAddress] = tmpSchemaObjectEntry;
                    tmpBaseAddress += '.';
                  }
                  var tmpObjectProperties = Object.keys(pObject);
                  for (var _i6 = 0; _i6 < tmpObjectProperties.length; _i6++) {
                    this.generateAddressses(pObject[tmpObjectProperties[_i6]], "".concat(tmpBaseAddress).concat(tmpObjectProperties[_i6]), tmpSchema);
                  }
                }
                break;
              case 'symbol':
              case 'function':
                // Symbols and functions neither recurse nor get added to the schema
                break;
            }
            return tmpSchema;
          }
        }]);
        return ManyfestObjectAddressGeneration;
      }();
      ;
      module.exports = ManyfestObjectAddressGeneration;
    }, {
      "./Manyfest-LogToConsole.js": 5
    }],
    11: [function (require, module, exports) {
      // Given a string, parse out any conditional expressions and set whether or not to keep the record.
      //
      // For instance:
      // 		'files[]<<~?format,==,Thumbnail?~>>'
      //      'files[]<<~?format,==,Metadata?~>>'
      //      'files[]<<~?size,>,4000?~>>'
      //
      // The wrapping parts are the <<~? and ?~>> megabrackets.
      //
      // The function does not need to alter the string -- just check the conditionals within.

      // TODO: Consider making this an es6 class

      // Let's use indexOf since it is apparently the fastest.
      var _ConditionalStanzaStart = '<<~?';
      var _ConditionalStanzaStartLength = _ConditionalStanzaStart.length;
      var _ConditionalStanzaEnd = '?~>>';
      var _ConditionalStanzaEndLength = _ConditionalStanzaEnd.length;

      // Test the condition of a value in a record
      var testCondition = function testCondition(pManyfest, pRecord, pSearchAddress, pSearchComparator, pValue) {
        switch (pSearchComparator) {
          case '!=':
            return pManyfest.getValueAtAddress(pRecord, pSearchAddress) != pValue;
            break;
          case '<':
            return pManyfest.getValueAtAddress(pRecord, pSearchAddress) < pValue;
            break;
          case '>':
            return pManyfest.getValueAtAddress(pRecord, pSearchAddress) > pValue;
            break;
          case '<=':
            return pManyfest.getValueAtAddress(pRecord, pSearchAddress) <= pValue;
            break;
          case '>=':
            return pManyfest.getValueAtAddress(pRecord, pSearchAddress) >= pValue;
            break;
          case '===':
            return pManyfest.getValueAtAddress(pRecord, pSearchAddress) === pValue;
            break;
          case '==':
          default:
            return pManyfest.getValueAtAddress(pRecord, pSearchAddress) == pValue;
            break;
        }
      };
      var parseConditionals = function parseConditionals(pManyfest, pAddress, pRecord) {
        var tmpKeepRecord = true;

        /*
        	Algorithm is simple:
        		1.  Enuerate start points
        		2.  Find stop points within each start point
        	3. Check the conditional
        */

        var tmpStartIndex = pAddress.indexOf(_ConditionalStanzaStart);
        while (tmpStartIndex != -1) {
          var tmpStopIndex = pAddress.indexOf(_ConditionalStanzaEnd, tmpStartIndex + _ConditionalStanzaStartLength);
          if (tmpStopIndex != -1) {
            var tmpMagicComparisonPatternSet = pAddress.substring(tmpStartIndex + _ConditionalStanzaStartLength, tmpStopIndex).split(',');
            var tmpSearchAddress = tmpMagicComparisonPatternSet[0];
            var tmpSearchComparator = tmpMagicComparisonPatternSet[1];
            var tmpSearchValue = tmpMagicComparisonPatternSet[2];

            // Process the piece
            tmpKeepRecord = tmpKeepRecord && testCondition(pManyfest, pRecord, tmpSearchAddress, tmpSearchComparator, tmpSearchValue);
            tmpStartIndex = pAddress.indexOf(_ConditionalStanzaStart, tmpStopIndex + _ConditionalStanzaEndLength);
          } else {
            tmpStartIndex = -1;
          }
        }
        return tmpKeepRecord;
      };
      module.exports = parseConditionals;
    }, {}],
    12: [function (require, module, exports) {
      /**
      * @author <steven@velozo.com>
      */
      var libSimpleLog = require('./Manyfest-LogToConsole.js');

      /**
      * Schema Manipulation Functions
      *
      * @class ManyfestSchemaManipulation
      */
      var ManyfestSchemaManipulation = /*#__PURE__*/function () {
        function ManyfestSchemaManipulation(pInfoLog, pErrorLog) {
          _classCallCheck(this, ManyfestSchemaManipulation);
          // Wire in logging
          this.logInfo = typeof pInfoLog === 'function' ? pInfoLog : libSimpleLog;
          this.logError = typeof pErrorLog === 'function' ? pErrorLog : libSimpleLog;
        }

        // This translates the default address mappings to something different.
        //
        // For instance you can pass in manyfest schema descriptor object:
        // 	{
        //	  "Address.Of.a": { "Hash": "a", "Type": "Number" },
        //	  "Address.Of.b": { "Hash": "b", "Type": "Number" }
        //  }
        //
        //
        // And then an address mapping (basically a Hash->Address map)
        //  {
        //    "a": "New.Address.Of.a",
        //    "b": "New.Address.Of.b"
        //  }
        //
        // NOTE: This mutates the schema object permanently, altering the base hash.
        //       If there is a collision with an existing address, it can lead to overwrites.
        // TODO: Discuss what should happen on collisions.
        _createClass(ManyfestSchemaManipulation, [{
          key: "resolveAddressMappings",
          value: function resolveAddressMappings(pManyfestSchemaDescriptors, pAddressMapping) {
            if (_typeof(pManyfestSchemaDescriptors) != 'object') {
              this.logError("Attempted to resolve address mapping but the descriptor was not an object.");
              return false;
            }
            if (_typeof(pAddressMapping) != 'object') {
              // No mappings were passed in
              return true;
            }

            // Get the arrays of both the schema definition and the hash mapping
            var tmpManyfestAddresses = Object.keys(pManyfestSchemaDescriptors);
            var tmpHashMapping = {};
            tmpManyfestAddresses.forEach(function (pAddress) {
              if (pManyfestSchemaDescriptors[pAddress].hasOwnProperty('Hash')) {
                tmpHashMapping[pManyfestSchemaDescriptors[pAddress].Hash] = pAddress;
              }
            });
            var tmpAddressMappingSet = Object.keys(pAddressMapping);
            tmpAddressMappingSet.forEach(function (pInputAddress) {
              var tmpNewDescriptorAddress = pAddressMapping[pInputAddress];
              var tmpOldDescriptorAddress = false;
              var tmpDescriptor = false;

              // See if there is a matching descriptor either by Address directly or Hash
              if (pManyfestSchemaDescriptors.hasOwnProperty(pInputAddress)) {
                tmpOldDescriptorAddress = pInputAddress;
              } else if (tmpHashMapping.hasOwnProperty(pInputAddress)) {
                tmpOldDescriptorAddress = tmpHashMapping[pInputAddress];
              }

              // If there was a matching descriptor in the manifest, store it in the temporary descriptor
              if (tmpOldDescriptorAddress) {
                tmpDescriptor = pManyfestSchemaDescriptors[tmpOldDescriptorAddress];
                delete pManyfestSchemaDescriptors[tmpOldDescriptorAddress];
              } else {
                // Create a new descriptor!  Map it to the input address.
                tmpDescriptor = {
                  Hash: pInputAddress
                };
              }

              // Now re-add the descriptor to the manyfest schema
              pManyfestSchemaDescriptors[tmpNewDescriptorAddress] = tmpDescriptor;
            });
            return true;
          }
        }, {
          key: "safeResolveAddressMappings",
          value: function safeResolveAddressMappings(pManyfestSchemaDescriptors, pAddressMapping) {
            // This returns the descriptors as a new object, safely remapping without mutating the original schema Descriptors
            var tmpManyfestSchemaDescriptors = JSON.parse(JSON.stringify(pManyfestSchemaDescriptors));
            this.resolveAddressMappings(tmpManyfestSchemaDescriptors, pAddressMapping);
            return tmpManyfestSchemaDescriptors;
          }
        }, {
          key: "mergeAddressMappings",
          value: function mergeAddressMappings(pManyfestSchemaDescriptorsDestination, pManyfestSchemaDescriptorsSource) {
            if (_typeof(pManyfestSchemaDescriptorsSource) != 'object' || _typeof(pManyfestSchemaDescriptorsDestination) != 'object') {
              this.logError("Attempted to merge two schema descriptors but both were not objects.");
              return false;
            }
            var tmpSource = JSON.parse(JSON.stringify(pManyfestSchemaDescriptorsSource));
            var tmpNewManyfestSchemaDescriptors = JSON.parse(JSON.stringify(pManyfestSchemaDescriptorsDestination));

            // The first passed-in set of descriptors takes precedence.
            var tmpDescriptorAddresses = Object.keys(tmpSource);
            tmpDescriptorAddresses.forEach(function (pDescriptorAddress) {
              if (!tmpNewManyfestSchemaDescriptors.hasOwnProperty(pDescriptorAddress)) {
                tmpNewManyfestSchemaDescriptors[pDescriptorAddress] = tmpSource[pDescriptorAddress];
              }
            });
            return tmpNewManyfestSchemaDescriptors;
          }
        }]);
        return ManyfestSchemaManipulation;
      }();
      module.exports = ManyfestSchemaManipulation;
    }, {
      "./Manyfest-LogToConsole.js": 5
    }],
    13: [function (require, module, exports) {
      /**
      * @author <steven@velozo.com>
      */
      var libFableServiceProviderBase = require('fable-serviceproviderbase');
      var libSimpleLog = require('./Manyfest-LogToConsole.js');
      var libHashTranslation = require('./Manyfest-HashTranslation.js');
      var libObjectAddressCheckAddressExists = require('./Manyfest-ObjectAddress-CheckAddressExists.js');
      var libObjectAddressGetValue = require('./Manyfest-ObjectAddress-GetValue.js');
      var libObjectAddressSetValue = require('./Manyfest-ObjectAddress-SetValue.js');
      var libObjectAddressDeleteValue = require('./Manyfest-ObjectAddress-DeleteValue.js');
      var libObjectAddressGeneration = require('./Manyfest-ObjectAddressGeneration.js');
      var libSchemaManipulation = require('./Manyfest-SchemaManipulation.js');
      var _DefaultConfiguration = {
        Scope: 'DEFAULT',
        Descriptors: {}
      };

      /**
      * Manyfest object address-based descriptions and manipulations.
      *
      * @class Manyfest
      */
      var Manyfest = /*#__PURE__*/function (_libFableServiceProvi) {
        _inherits(Manyfest, _libFableServiceProvi);
        var _super = _createSuper(Manyfest);
        function Manyfest(pFable, pManifest, pServiceHash) {
          var _this3;
          _classCallCheck(this, Manyfest);
          if (pFable === undefined) {
            _this3 = _super.call(this, {});
          } else {
            _this3 = _super.call(this, pFable, pManifest, pServiceHash);
          }
          _this3.serviceType = 'Manifest';

          // Wire in logging
          _this3.logInfo = libSimpleLog;
          _this3.logError = libSimpleLog;

          // Create an object address resolver and map in the functions
          _this3.objectAddressCheckAddressExists = new libObjectAddressCheckAddressExists(_this3.logInfo, _this3.logError);
          _this3.objectAddressGetValue = new libObjectAddressGetValue(_this3.logInfo, _this3.logError);
          _this3.objectAddressSetValue = new libObjectAddressSetValue(_this3.logInfo, _this3.logError);
          _this3.objectAddressDeleteValue = new libObjectAddressDeleteValue(_this3.logInfo, _this3.logError);
          if (!_this3.options.hasOwnProperty('defaultValues')) {
            _this3.options.defaultValues = {
              "String": "",
              "Number": 0,
              "Float": 0.0,
              "Integer": 0,
              "Boolean": false,
              "Binary": 0,
              "DateTime": 0,
              "Array": [],
              "Object": {},
              "Null": null
            };
          }
          if (!_this3.options.hasOwnProperty('strict')) {
            _this3.options.strict = false;
          }
          _this3.scope = undefined;
          _this3.elementAddresses = undefined;
          _this3.elementHashes = undefined;
          _this3.elementDescriptors = undefined;
          _this3.reset();
          if (_typeof(_this3.options) === 'object') {
            _this3.loadManifest(_this3.options);
          }
          _this3.schemaManipulations = new libSchemaManipulation(_this3.logInfo, _this3.logError);
          _this3.objectAddressGeneration = new libObjectAddressGeneration(_this3.logInfo, _this3.logError);
          _this3.hashTranslations = new libHashTranslation(_this3.logInfo, _this3.logError);
          return _possibleConstructorReturn(_this3);
        }

        /*************************************************************************
         * Schema Manifest Loading, Reading, Manipulation and Serialization Functions
         */

        // Reset critical manifest properties
        _createClass(Manyfest, [{
          key: "reset",
          value: function reset() {
            this.scope = 'DEFAULT';
            this.elementAddresses = [];
            this.elementHashes = {};
            this.elementDescriptors = {};
          }
        }, {
          key: "clone",
          value: function clone() {
            // Make a copy of the options in-place
            var tmpNewOptions = JSON.parse(JSON.stringify(this.options));
            var tmpNewManyfest = new Manyfest(this.getManifest(), this.logInfo, this.logError, tmpNewOptions);

            // Import the hash translations
            tmpNewManyfest.hashTranslations.addTranslation(this.hashTranslations.translationTable);
            return tmpNewManyfest;
          }

          // Deserialize a Manifest from a string
        }, {
          key: "deserialize",
          value: function deserialize(pManifestString) {
            // TODO: Add guards for bad manifest string
            return this.loadManifest(JSON.parse(pManifestString));
          }

          // Load a manifest from an object
        }, {
          key: "loadManifest",
          value: function loadManifest(pManifest) {
            if (_typeof(pManifest) !== 'object') {
              this.logError("(".concat(this.scope, ") Error loading manifest; expecting an object but parameter was type ").concat(_typeof(pManifest), "."));
            }
            var tmpManifest = _typeof(pManifest) == 'object' ? pManifest : {};
            var tmpDescriptorKeys = Object.keys(_DefaultConfiguration);
            for (var i = 0; i < tmpDescriptorKeys.length; i++) {
              if (!tmpManifest.hasOwnProperty(tmpDescriptorKeys[i])) {
                tmpManifest[tmpDescriptorKeys[i]] = JSON.parse(JSON.stringify(_DefaultConfiguration[tmpDescriptorKeys[i]]));
              }
            }
            if (tmpManifest.hasOwnProperty('Scope')) {
              if (typeof tmpManifest.Scope === 'string') {
                this.scope = tmpManifest.Scope;
              } else {
                this.logError("(".concat(this.scope, ") Error loading scope from manifest; expecting a string but property was type ").concat(_typeof(tmpManifest.Scope), "."), tmpManifest);
              }
            } else {
              this.logError("(".concat(this.scope, ") Error loading scope from manifest object.  Property \"Scope\" does not exist in the root of the object."), tmpManifest);
            }
            if (tmpManifest.hasOwnProperty('Descriptors')) {
              if (_typeof(tmpManifest.Descriptors) === 'object') {
                var tmpDescriptionAddresses = Object.keys(tmpManifest.Descriptors);
                for (var _i7 = 0; _i7 < tmpDescriptionAddresses.length; _i7++) {
                  this.addDescriptor(tmpDescriptionAddresses[_i7], tmpManifest.Descriptors[tmpDescriptionAddresses[_i7]]);
                }
              } else {
                this.logError("(".concat(this.scope, ") Error loading description object from manifest object.  Expecting an object in 'Manifest.Descriptors' but the property was type ").concat(_typeof(tmpManifest.Descriptors), "."), tmpManifest);
              }
            } else {
              this.logError("(".concat(this.scope, ") Error loading object description from manifest object.  Property \"Descriptors\" does not exist in the root of the Manifest object."), tmpManifest);
            }
            if (tmpManifest.hasOwnProperty('HashTranslations')) {
              if (_typeof(tmpManifest.HashTranslations) === 'object') {
                for (var _i8 = 0; _i8 < tmpManifest.HashTranslations.length; _i8++) {
                  // Each translation is 
                }
              }
            }
          }

          // Serialize the Manifest to a string
        }, {
          key: "serialize",
          value: function serialize() {
            return JSON.stringify(this.getManifest());
          }
        }, {
          key: "getManifest",
          value: function getManifest() {
            return {
              Scope: this.scope,
              Descriptors: JSON.parse(JSON.stringify(this.elementDescriptors)),
              HashTranslations: JSON.parse(JSON.stringify(this.hashTranslations.translationTable))
            };
          }

          // Add a descriptor to the manifest
        }, {
          key: "addDescriptor",
          value: function addDescriptor(pAddress, pDescriptor) {
            if (_typeof(pDescriptor) === 'object') {
              // Add the Address into the Descriptor if it doesn't exist:
              if (!pDescriptor.hasOwnProperty('Address')) {
                pDescriptor.Address = pAddress;
              }
              if (!this.elementDescriptors.hasOwnProperty(pAddress)) {
                this.elementAddresses.push(pAddress);
              }

              // Add the element descriptor to the schema
              this.elementDescriptors[pAddress] = pDescriptor;

              // Always add the address as a hash
              this.elementHashes[pAddress] = pAddress;
              if (pDescriptor.hasOwnProperty('Hash')) {
                // TODO: Check if this is a good idea or not..
                //       Collisions are bound to happen with both representations of the address/hash in here and developers being able to create their own hashes.
                this.elementHashes[pDescriptor.Hash] = pAddress;
              } else {
                pDescriptor.Hash = pAddress;
              }
              return true;
            } else {
              this.logError("(".concat(this.scope, ") Error loading object descriptor for address '").concat(pAddress, "' from manifest object.  Expecting an object but property was type ").concat(_typeof(pDescriptor), "."));
              return false;
            }
          }
        }, {
          key: "getDescriptorByHash",
          value: function getDescriptorByHash(pHash) {
            return this.getDescriptor(this.resolveHashAddress(pHash));
          }
        }, {
          key: "getDescriptor",
          value: function getDescriptor(pAddress) {
            return this.elementDescriptors[pAddress];
          }

          // execute an action function for each descriptor
        }, {
          key: "eachDescriptor",
          value: function eachDescriptor(fAction) {
            var tmpDescriptorAddresses = Object.keys(this.elementDescriptors);
            for (var i = 0; i < tmpDescriptorAddresses.length; i++) {
              fAction(this.elementDescriptors[tmpDescriptorAddresses[i]]);
            }
          }

          /*************************************************************************
           * Beginning of Object Manipulation (read & write) Functions
           */
          // Check if an element exists by its hash
        }, {
          key: "checkAddressExistsByHash",
          value: function checkAddressExistsByHash(pObject, pHash) {
            return this.checkAddressExists(pObject, this.resolveHashAddress(pHash));
          }

          // Check if an element exists at an address
        }, {
          key: "checkAddressExists",
          value: function checkAddressExists(pObject, pAddress) {
            return this.objectAddressCheckAddressExists.checkAddressExists(pObject, pAddress);
          }

          // Turn a hash into an address, factoring in the translation table.
        }, {
          key: "resolveHashAddress",
          value: function resolveHashAddress(pHash) {
            var tmpAddress = undefined;
            var tmpInElementHashTable = this.elementHashes.hasOwnProperty(pHash);
            var tmpInTranslationTable = this.hashTranslations.translationTable.hasOwnProperty(pHash);

            // The most straightforward: the hash exists, no translations.
            if (tmpInElementHashTable && !tmpInTranslationTable) {
              tmpAddress = this.elementHashes[pHash];
            }
            // There is a translation from one hash to another, and, the elementHashes contains the pointer end
            else if (tmpInTranslationTable && this.elementHashes.hasOwnProperty(this.hashTranslations.translate(pHash))) {
              tmpAddress = this.elementHashes[this.hashTranslations.translate(pHash)];
            }
            // Use the level of indirection only in the Translation Table
            else if (tmpInTranslationTable) {
              tmpAddress = this.hashTranslations.translate(pHash);
            }
            // Just treat the hash as an address.
            // TODO: Discuss this ... it is magic but controversial
            else {
              tmpAddress = pHash;
            }
            return tmpAddress;
          }

          // Get the value of an element by its hash
        }, {
          key: "getValueByHash",
          value: function getValueByHash(pObject, pHash) {
            var tmpValue = this.getValueAtAddress(pObject, this.resolveHashAddress(pHash));
            if (typeof tmpValue == 'undefined') {
              // Try to get a default if it exists
              tmpValue = this.getDefaultValue(this.getDescriptorByHash(pHash));
            }
            return tmpValue;
          }

          // Get the value of an element at an address
        }, {
          key: "getValueAtAddress",
          value: function getValueAtAddress(pObject, pAddress) {
            var tmpValue = this.objectAddressGetValue.getValueAtAddress(pObject, pAddress);
            if (typeof tmpValue == 'undefined') {
              // Try to get a default if it exists
              tmpValue = this.getDefaultValue(this.getDescriptor(pAddress));
            }
            return tmpValue;
          }

          // Set the value of an element by its hash
        }, {
          key: "setValueByHash",
          value: function setValueByHash(pObject, pHash, pValue) {
            return this.setValueAtAddress(pObject, this.resolveHashAddress(pHash), pValue);
          }

          // Set the value of an element at an address
        }, {
          key: "setValueAtAddress",
          value: function setValueAtAddress(pObject, pAddress, pValue) {
            return this.objectAddressSetValue.setValueAtAddress(pObject, pAddress, pValue);
          }

          // Delete the value of an element by its hash
        }, {
          key: "deleteValueByHash",
          value: function deleteValueByHash(pObject, pHash, pValue) {
            return this.deleteValueAtAddress(pObject, this.resolveHashAddress(pHash), pValue);
          }

          // Delete the value of an element at an address
        }, {
          key: "deleteValueAtAddress",
          value: function deleteValueAtAddress(pObject, pAddress, pValue) {
            return this.objectAddressDeleteValue.deleteValueAtAddress(pObject, pAddress, pValue);
          }

          // Validate the consistency of an object against the schema
        }, {
          key: "validate",
          value: function validate(pObject) {
            var tmpValidationData = {
              Error: null,
              Errors: [],
              MissingElements: []
            };
            if (_typeof(pObject) !== 'object') {
              tmpValidationData.Error = true;
              tmpValidationData.Errors.push("Expected passed in object to be type object but was passed in ".concat(_typeof(pObject)));
            }
            var addValidationError = function addValidationError(pAddress, pErrorMessage) {
              tmpValidationData.Error = true;
              tmpValidationData.Errors.push("Element at address \"".concat(pAddress, "\" ").concat(pErrorMessage, "."));
            };

            // Now enumerate through the values and check for anomalies based on the schema
            for (var i = 0; i < this.elementAddresses.length; i++) {
              var tmpDescriptor = this.getDescriptor(this.elementAddresses[i]);
              var tmpValueExists = this.checkAddressExists(pObject, tmpDescriptor.Address);
              var tmpValue = this.getValueAtAddress(pObject, tmpDescriptor.Address);
              if (typeof tmpValue == 'undefined' || !tmpValueExists) {
                // This will technically mean that `Object.Some.Value = undefined` will end up showing as "missing"
                // TODO: Do we want to do a different message based on if the property exists but is undefined?
                tmpValidationData.MissingElements.push(tmpDescriptor.Address);
                if (tmpDescriptor.Required || this.options.strict) {
                  addValidationError(tmpDescriptor.Address, 'is flagged REQUIRED but is not set in the object');
                }
              }

              // Now see if there is a data type specified for this element
              if (tmpDescriptor.DataType) {
                var tmpElementType = _typeof(tmpValue);
                switch (tmpDescriptor.DataType.toString().trim().toLowerCase()) {
                  case 'string':
                    if (tmpElementType != 'string') {
                      addValidationError(tmpDescriptor.Address, "has a DataType ".concat(tmpDescriptor.DataType, " but is of the type ").concat(tmpElementType));
                    }
                    break;
                  case 'number':
                    if (tmpElementType != 'number') {
                      addValidationError(tmpDescriptor.Address, "has a DataType ".concat(tmpDescriptor.DataType, " but is of the type ").concat(tmpElementType));
                    }
                    break;
                  case 'integer':
                    if (tmpElementType != 'number') {
                      addValidationError(tmpDescriptor.Address, "has a DataType ".concat(tmpDescriptor.DataType, " but is of the type ").concat(tmpElementType));
                    } else {
                      var tmpValueString = tmpValue.toString();
                      if (tmpValueString.indexOf('.') > -1) {
                        // TODO: Is this an error?
                        addValidationError(tmpDescriptor.Address, "has a DataType ".concat(tmpDescriptor.DataType, " but has a decimal point in the number."));
                      }
                    }
                    break;
                  case 'float':
                    if (tmpElementType != 'number') {
                      addValidationError(tmpDescriptor.Address, "has a DataType ".concat(tmpDescriptor.DataType, " but is of the type ").concat(tmpElementType));
                    }
                    break;
                  case 'DateTime':
                    var tmpValueDate = new Date(tmpValue);
                    if (tmpValueDate.toString() == 'Invalid Date') {
                      addValidationError(tmpDescriptor.Address, "has a DataType ".concat(tmpDescriptor.DataType, " but is not parsable as a Date by Javascript"));
                    }
                  default:
                    // Check if this is a string, in the default case
                    // Note this is only when a DataType is specified and it is an unrecognized data type.
                    if (tmpElementType != 'string') {
                      addValidationError(tmpDescriptor.Address, "has a DataType ".concat(tmpDescriptor.DataType, " (which auto-converted to String because it was unrecognized) but is of the type ").concat(tmpElementType));
                    }
                    break;
                }
              }
            }
            return tmpValidationData;
          }

          // Returns a default value, or, the default value for the data type (which is overridable with configuration)
        }, {
          key: "getDefaultValue",
          value: function getDefaultValue(pDescriptor) {
            if (_typeof(pDescriptor) != 'object') {
              return undefined;
            }
            if (pDescriptor.hasOwnProperty('Default')) {
              return pDescriptor.Default;
            } else {
              // Default to a null if it doesn't have a type specified.
              // This will ensure a placeholder is created but isn't misinterpreted.
              var tmpDataType = pDescriptor.hasOwnProperty('DataType') ? pDescriptor.DataType : 'String';
              if (this.options.defaultValues.hasOwnProperty(tmpDataType)) {
                return this.options.defaultValues[tmpDataType];
              } else {
                // give up and return null
                return null;
              }
            }
          }

          // Enumerate through the schema and populate default values if they don't exist.
        }, {
          key: "populateDefaults",
          value: function populateDefaults(pObject, pOverwriteProperties) {
            return this.populateObject(pObject, pOverwriteProperties,
            // This just sets up a simple filter to see if there is a default set.
            function (pDescriptor) {
              return pDescriptor.hasOwnProperty('Default');
            });
          }

          // Forcefully populate all values even if they don't have defaults.
          // Based on type, this can do unexpected things.
        }, {
          key: "populateObject",
          value: function populateObject(pObject, pOverwriteProperties, fFilter) {
            var _this4 = this;
            // Automatically create an object if one isn't passed in.
            var tmpObject = _typeof(pObject) === 'object' ? pObject : {};
            // Default to *NOT OVERWRITING* properties
            var tmpOverwriteProperties = typeof pOverwriteProperties == 'undefined' ? false : pOverwriteProperties;
            // This is a filter function, which is passed the schema and allows complex filtering of population
            // The default filter function just returns true, populating everything.
            var tmpFilterFunction = typeof fFilter == 'function' ? fFilter : function (pDescriptor) {
              return true;
            };
            this.elementAddresses.forEach(function (pAddress) {
              var tmpDescriptor = _this4.getDescriptor(pAddress);
              // Check the filter function to see if this is an address we want to set the value for.
              if (tmpFilterFunction(tmpDescriptor)) {
                // If we are overwriting properties OR the property does not exist
                if (tmpOverwriteProperties || !_this4.checkAddressExists(tmpObject, pAddress)) {
                  _this4.setValueAtAddress(tmpObject, pAddress, _this4.getDefaultValue(tmpDescriptor));
                }
              }
            });
            return tmpObject;
          }
        }]);
        return Manyfest;
      }(libFableServiceProviderBase);
      ;
      module.exports = Manyfest;
    }, {
      "./Manyfest-HashTranslation.js": 4,
      "./Manyfest-LogToConsole.js": 5,
      "./Manyfest-ObjectAddress-CheckAddressExists.js": 6,
      "./Manyfest-ObjectAddress-DeleteValue.js": 7,
      "./Manyfest-ObjectAddress-GetValue.js": 8,
      "./Manyfest-ObjectAddress-SetValue.js": 9,
      "./Manyfest-ObjectAddressGeneration.js": 10,
      "./Manyfest-SchemaManipulation.js": 12,
      "fable-serviceproviderbase": 2
    }]
  }, {}, [13])(13);
});