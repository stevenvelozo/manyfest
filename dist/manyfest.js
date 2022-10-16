(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Manyfest = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
* @license MIT
* @author <steven@velozo.com>
*/

/**
* Manyfest browser shim loader
*/

// Load the manyfest module into the browser global automatically.
var libManyfest = require('./Manyfest.js');

if (typeof(window) === 'object') window.Manyfest = libManyfest;

module.exports = libManyfest;
},{"./Manyfest.js":6}],2:[function(require,module,exports){
/**
* @license MIT
* @author <steven@velozo.com>
*/
let libSimpleLog = require('./Manyfest-LogToConsole.js');

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
class ManyfestHashTranslation
{
	constructor(pInfoLog, pErrorLog)
	{
		// Wire in logging
		this.logInfo = (typeof(pInfoLog) === 'function') ? pInfoLog : libSimpleLog;
		this.logError = (typeof(pErrorLog) === 'function') ? pErrorLog : libSimpleLog;

        this.translationTable = {};
	}

    translationCount()
    {
        return Object.keys(this.translationTable).length;
    }

    addTranslation(pTranslation)
    {
        // This adds a translation in the form of:
        // { "SourceHash": "DestinationHash", "SecondSourceHash":"SecondDestinationHash" }
        if (typeof(pTranslation) != 'object')
        {
            this.logError(`Hash translation addTranslation expected a translation be type object but was passed in ${typeof(pTranslation)}`);
            return false;
        }

        let tmpTranslationSources = Object.keys(pTranslation)

        tmpTranslationSources.forEach(
            (pTranslationSource) =>
            {
                if (typeof(pTranslation[pTranslationSource]) != 'string')
                {
                    this.logError(`Hash translation addTranslation expected a translation destination hash for [${pTranslationSource}] to be a string but the referrant was a ${typeof(pTranslation[pTranslationSource])}`);
                }
                else
                {
                    this.translationTable[pTranslationSource] = pTranslation[pTranslationSource];
                }
            });
    }

    removeTranslationHash(pTranslationHash)
    {
        if (this.translationTable.hasOwnProperty(pTranslationHash))
        {
            delete this.translationTable[pTranslationHash];
        }
    }

    // This removes translations.
    // If passed a string, just removes the single one.
    // If passed an object, it does all the source keys.
    removeTranslation(pTranslation)
    {
        if (typeof(pTranslation) == 'string')
        {
            this.removeTranslationHash(pTranslation);
            return true;
        }
        else if (typeof(pTranslation) == 'object')
        {
            let tmpTranslationSources = Object.keys(pTranslation)

            tmpTranslationSources.forEach(
                (pTranslationSource) =>
                {
                    this.removeTranslation(pTranslationSource);
                });
            return true;
        }
        else
        {
            this.logError(`Hash translation removeTranslation expected either a string or an object but the passed-in translation was type ${typeof(pTranslation)}`);
            return false;
        }
    }

    clearTranslations()
    {
        this.translationTable = {};
    }

    translate(pTranslation)
    {
        if (this.translationTable.hasOwnProperty(pTranslation))
        {
            return this.translationTable[pTranslation];
        }
        else
        {
            return pTranslation;
        }
    }
}

module.exports = ManyfestHashTranslation;
},{"./Manyfest-LogToConsole.js":3}],3:[function(require,module,exports){
/**
* @license MIT
* @author <steven@velozo.com>
*/

/**
* Manyfest simple logging shim (for browser and dependency-free running)
*/

const logToConsole = (pLogLine, pLogObject) =>
{
    let tmpLogLine = (typeof(pLogLine) === 'string') ? pLogLine : '';

    console.log(`[Manyfest] ${tmpLogLine}`);

    if (pLogObject) console.log(JSON.stringify(pLogObject));
};

module.exports = logToConsole;
},{}],4:[function(require,module,exports){
/**
* @license MIT
* @author <steven@velozo.com>
*/
let libSimpleLog = require('./Manyfest-LogToConsole.js');

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
* @class ManyfestObjectAddressResolver
*/
class ManyfestObjectAddressResolver
{
	constructor(pInfoLog, pErrorLog)
	{
		// Wire in logging
		this.logInfo = (typeof(pInfoLog) == 'function') ? pInfoLog : libSimpleLog;
		this.logError = (typeof(pErrorLog) == 'function') ? pErrorLog : libSimpleLog;
	}

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
	// TODO: Should template literals be processed?  If so what state do they have access to?
	cleanWrapCharacters (pCharacter, pString)
	{
		if (pString.startsWith(pCharacter) && pString.endsWith(pCharacter))
		{
			return pString.substring(1, pString.length - 1);
		}
		else
		{
			return pString;
		}
	}

	// Check if an address exists.
	//
	// This is necessary because the getValueAtAddress function is ambiguous on 
	// whether the element/property is actually there or not (it returns 
	// undefined whether the property exists or not).  This function checks for
	// existance and returns true or false dependent.
	checkAddressExists (pObject, pAddress)
	{
		// TODO: Should these throw an error?
		// Make sure pObject is an object
		if (typeof(pObject) != 'object') return false;
		// Make sure pAddress is a string
		if (typeof(pAddress) != 'string') return false;

		// TODO: Make this work for things like SomeRootObject.Metadata["Some.People.Use.Bad.Object.Property.Names"]
		let tmpSeparatorIndex = pAddress.indexOf('.');

		// This is the terminal address string (no more dots so the RECUSION ENDS IN HERE somehow)
		if (tmpSeparatorIndex == -1)
		{
			// Check if the address refers to a boxed property
			let tmpBracketStartIndex = pAddress.indexOf('[');
			let tmpBracketStopIndex = pAddress.indexOf(']');
			// Boxed elements look like this:
			// 		MyValues[10]
			// 		MyValues['Name']
			// 		MyValues["Age"]
			// 		MyValues[`Cost`]
			//
			// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
			// The requirements to detect a boxed element are:
			//    1) The start bracket is after character 0
			if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket has something between them
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is data 
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 0))
			{
				// The "Name" of the Object contained too the left of the bracket
				let tmpBoxedPropertyName = pAddress.substring(0, tmpBracketStartIndex).trim();

				// If the subproperty doesn't test as a proper Object, none of the rest of this is possible.
				// This is a rare case where Arrays testing as Objects is useful
				if (typeof(pObject[tmpBoxedPropertyName]) !== 'object')
				{
					return false;
				}

				// The "Reference" to the property within it, either an array element or object property
				let tmpBoxedPropertyReference = pAddress.substring(tmpBracketStartIndex+1, tmpBracketStopIndex).trim();
				// Attempt to parse the reference as a number, which will be used as an array element
				let tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);

				// Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
				//        This seems confusing to me at first read, so explaination:
				//        Is the Boxed Object an Array?  TRUE
				//        And is the Reference inside the boxed Object not a number? TRUE
				//        -->  So when these are in agreement, it's an impossible access state
				if (Array.isArray(pObject[tmpBoxedPropertyName]) == isNaN(tmpBoxedPropertyNumber))
				{
					return false;
				}

				//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
				//       otherwise we will try to treat it as a dynamic object property.
				if (isNaN(tmpBoxedPropertyNumber))
				{
					// This isn't a number ... let's treat it as a dynamic object property.
					// We would expect the property to be wrapped in some kind of quotes so strip them
					tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

					// Check if the property exists.
					return pObject[tmpBoxedPropertyName].hasOwnProperty(tmpBoxedPropertyReference);
				}
				else
				{
					// Use the new in operator to see if the element is in the array
					return (tmpBoxedPropertyNumber in pObject[tmpBoxedPropertyName]);
				}
			}
			else
			{
				// Check if the property exists
				return pObject.hasOwnProperty(pAddress);
			}
		}
		else
		{
			let tmpSubObjectName = pAddress.substring(0, tmpSeparatorIndex);
			let tmpNewAddress = pAddress.substring(tmpSeparatorIndex+1);

			// Test if the tmpNewAddress is an array or object
			// Check if it's a boxed property
			let tmpBracketStartIndex = tmpSubObjectName.indexOf('[');
			let tmpBracketStopIndex = tmpSubObjectName.indexOf(']');
			// Boxed elements look like this:
			// 		MyValues[42]
			// 		MyValues['Color']
			// 		MyValues["Weight"]
			// 		MyValues[`Diameter`]
			//
			// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
			// The requirements to detect a boxed element are:
			//    1) The start bracket is after character 0
			if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket has something between them
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is data 
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 0))
			{
				let tmpBoxedPropertyName = tmpSubObjectName.substring(0, tmpBracketStartIndex).trim();

				let tmpBoxedPropertyReference = tmpSubObjectName.substring(tmpBracketStartIndex+1, tmpBracketStopIndex).trim();

				let tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);

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
				if (Array.isArray(pObject[tmpBoxedPropertyName]) == isNaN(tmpBoxedPropertyNumber))
				{
					// Because this is an impossible address, the property doesn't exist
					// TODO: Should we throw an error in this condition?
					return false;
				}

				//This is a bracketed value
				//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
				//       otherwise we will try to reat it as a dynamic object property.
				if (isNaN(tmpBoxedPropertyNumber))
				{
					// This isn't a number ... let's treat it as a dynanmic object property.
					tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

					// Recurse directly into the subobject
					return this.checkAddressExists(pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference], tmpNewAddress);
				}
				else
				{
					// We parsed a valid number out of the boxed property name, so recurse into the array
					return this.checkAddressExists(pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber], tmpNewAddress);
				}
			}

			// If there is an object property already named for the sub object, but it isn't an object
			// then the system can't set the value in there.  Error and abort!
			if (pObject.hasOwnProperty(tmpSubObjectName) && typeof(pObject[tmpSubObjectName]) !== 'object')
			{
				return false;
			}
			else if (pObject.hasOwnProperty(tmpSubObjectName))
			{
				// If there is already a subobject pass that to the recursive thingy
				return this.checkAddressExists(pObject[tmpSubObjectName], tmpNewAddress);
			}
			else
			{
				// Create a subobject and then pass that
				pObject[tmpSubObjectName] = {};
				return this.checkAddressExists(pObject[tmpSubObjectName], tmpNewAddress);
			}
		}
	}

	// Get the value of an element at an address
	getValueAtAddress (pObject, pAddress)
	{
		// Make sure pObject is an object
		if (typeof(pObject) != 'object') return undefined;
		// Make sure pAddress is a string
		if (typeof(pAddress) != 'string') return undefined;

		// TODO: Make this work for things like SomeRootObject.Metadata["Some.People.Use.Bad.Object.Property.Names"]
		let tmpSeparatorIndex = pAddress.indexOf('.');

		// This is the terminal address string (no more dots so the RECUSION ENDS IN HERE somehow)
		if (tmpSeparatorIndex == -1)
		{
			// Check if the address refers to a boxed property
			let tmpBracketStartIndex = pAddress.indexOf('[');
			let tmpBracketStopIndex = pAddress.indexOf(']');
			// Boxed elements look like this:
			// 		MyValues[10]
			// 		MyValues['Name']
			// 		MyValues["Age"]
			// 		MyValues[`Cost`]
			//
			// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
			// The requirements to detect a boxed element are:
			//    1) The start bracket is after character 0
			if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket has something between them
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is data 
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 0))
			{
				// The "Name" of the Object contained too the left of the bracket
				let tmpBoxedPropertyName = pAddress.substring(0, tmpBracketStartIndex).trim();

				// If the subproperty doesn't test as a proper Object, none of the rest of this is possible.
				// This is a rare case where Arrays testing as Objects is useful
				if (typeof(pObject[tmpBoxedPropertyName]) !== 'object')
				{
					return undefined;
				}

				// The "Reference" to the property within it, either an array element or object property
				let tmpBoxedPropertyReference = pAddress.substring(tmpBracketStartIndex+1, tmpBracketStopIndex).trim();
				// Attempt to parse the reference as a number, which will be used as an array element
				let tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);

				// Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
				//        This seems confusing to me at first read, so explaination:
				//        Is the Boxed Object an Array?  TRUE
				//        And is the Reference inside the boxed Object not a number? TRUE
				//        -->  So when these are in agreement, it's an impossible access state
				if (Array.isArray(pObject[tmpBoxedPropertyName]) == isNaN(tmpBoxedPropertyNumber))
				{
					return undefined;
				}

				//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
				//       otherwise we will try to treat it as a dynamic object property.
				if (isNaN(tmpBoxedPropertyNumber))
				{
					// This isn't a number ... let's treat it as a dynamic object property.
					// We would expect the property to be wrapped in some kind of quotes so strip them
					tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

					// Return the value in the property
					return pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference];
				}
				else
				{
					return pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber];
				}
			}
			else
			{
				// Now is the point in recursion to return the value in the address
				return pObject[pAddress];
			}
		}
		else
		{
			let tmpSubObjectName = pAddress.substring(0, tmpSeparatorIndex);
			let tmpNewAddress = pAddress.substring(tmpSeparatorIndex+1);

			// Test if the tmpNewAddress is an array or object
			// Check if it's a boxed property
			let tmpBracketStartIndex = tmpSubObjectName.indexOf('[');
			let tmpBracketStopIndex = tmpSubObjectName.indexOf(']');
			// Boxed elements look like this:
			// 		MyValues[42]
			// 		MyValues['Color']
			// 		MyValues["Weight"]
			// 		MyValues[`Diameter`]
			//
			// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
			// The requirements to detect a boxed element are:
			//    1) The start bracket is after character 0
			if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket has something between them
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is data 
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 0))
			{
				let tmpBoxedPropertyName = tmpSubObjectName.substring(0, tmpBracketStartIndex).trim();

				let tmpBoxedPropertyReference = tmpSubObjectName.substring(tmpBracketStartIndex+1, tmpBracketStopIndex).trim();

				let tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);

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
				if (Array.isArray(pObject[tmpBoxedPropertyName]) == isNaN(tmpBoxedPropertyNumber))
				{
					return undefined;
				}

				//This is a bracketed value
				//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
				//       otherwise we will try to reat it as a dynamic object property.
				if (isNaN(tmpBoxedPropertyNumber))
				{
					// This isn't a number ... let's treat it as a dynanmic object property.
					tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

					// Recurse directly into the subobject
					return this.getValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference], tmpNewAddress);
				}
				else
				{
					// We parsed a valid number out of the boxed property name, so recurse into the array
					return this.getValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber], tmpNewAddress);
				}
			}

			// If there is an object property already named for the sub object, but it isn't an object
			// then the system can't set the value in there.  Error and abort!
			if (pObject.hasOwnProperty(tmpSubObjectName) && typeof(pObject[tmpSubObjectName]) !== 'object')
			{
				return undefined;
			}
			else if (pObject.hasOwnProperty(tmpSubObjectName))
			{
				// If there is already a subobject pass that to the recursive thingy
				return this.getValueAtAddress(pObject[tmpSubObjectName], tmpNewAddress);
			}
			else
			{
				// Create a subobject and then pass that
				pObject[tmpSubObjectName] = {};
				return this.getValueAtAddress(pObject[tmpSubObjectName], tmpNewAddress);
			}
		}
	}

	// Set the value of an element at an address
	setValueAtAddress (pObject, pAddress, pValue)
	{
		// Make sure pObject is an object
		if (typeof(pObject) != 'object') return false;
		// Make sure pAddress is a string
		if (typeof(pAddress) != 'string') return false;

		let tmpSeparatorIndex = pAddress.indexOf('.');

		if (tmpSeparatorIndex == -1)
		{
			// Check if it's a boxed property
			let tmpBracketStartIndex = pAddress.indexOf('[');
			let tmpBracketStopIndex = pAddress.indexOf(']');
			// Boxed elements look like this:
			// 		MyValues[10]
			// 		MyValues['Name']
			// 		MyValues["Age"]
			// 		MyValues[`Cost`]
			//
			// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
			// The requirements to detect a boxed element are:
			//    1) The start bracket is after character 0
			if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket has something between them
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is data 
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 0))
			{
				// The "Name" of the Object contained too the left of the bracket
				let tmpBoxedPropertyName = pAddress.substring(0, tmpBracketStartIndex).trim();

				// If the subproperty doesn't test as a proper Object, none of the rest of this is possible.
				// This is a rare case where Arrays testing as Objects is useful
				if (typeof(pObject[tmpBoxedPropertyName]) !== 'object')
				{
					return false;
				}

				// The "Reference" to the property within it, either an array element or object property
				let tmpBoxedPropertyReference = pAddress.substring(tmpBracketStartIndex+1, tmpBracketStopIndex).trim();
				// Attempt to parse the reference as a number, which will be used as an array element
				let tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);

				// Guard: If the referrant is a number and the boxed property is not an array, or vice versa, return undefined.
				//        This seems confusing to me at first read, so explaination:
				//        Is the Boxed Object an Array?  TRUE
				//        And is the Reference inside the boxed Object not a number? TRUE
				//        -->  So when these are in agreement, it's an impossible access state
				if (Array.isArray(pObject[tmpBoxedPropertyName]) == isNaN(tmpBoxedPropertyNumber))
				{
					return false;
				}

				//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
				//       otherwise we will try to treat it as a dynamic object property.
				if (isNaN(tmpBoxedPropertyNumber))
				{
					// This isn't a number ... let's treat it as a dynamic object property.
					// We would expect the property to be wrapped in some kind of quotes so strip them
					tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

					// Return the value in the property
					pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference] = pValue;
					return true;
				}
				else
				{
					pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber] = pValue;
					return true;
				}
			}
			else
			{
				// Now is the time in recursion to set the value in the object
				pObject[pAddress] = pValue;
				return true;
			}
		}
		else
		{
			let tmpSubObjectName = pAddress.substring(0, tmpSeparatorIndex);
			let tmpNewAddress = pAddress.substring(tmpSeparatorIndex+1);

			// Test if the tmpNewAddress is an array or object
			// Check if it's a boxed property
			let tmpBracketStartIndex = tmpSubObjectName.indexOf('[');
			let tmpBracketStopIndex = tmpSubObjectName.indexOf(']');
			// Boxed elements look like this:
			// 		MyValues[42]
			// 		MyValues['Color']
			// 		MyValues["Weight"]
			// 		MyValues[`Diameter`]
			//
			// When we are passed SomeObject["Name"] this code below recurses as if it were SomeObject.Name
			// The requirements to detect a boxed element are:
			//    1) The start bracket is after character 0
			if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket has something between them
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is data 
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 0))
			{
				let tmpBoxedPropertyName = tmpSubObjectName.substring(0, tmpBracketStartIndex).trim();

				let tmpBoxedPropertyReference = tmpSubObjectName.substring(tmpBracketStartIndex+1, tmpBracketStopIndex).trim();

				let tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);

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
				if (Array.isArray(pObject[tmpBoxedPropertyName]) == isNaN(tmpBoxedPropertyNumber))
				{
					return false;
				}

				//This is a bracketed value
				//    4) If the middle part is *only* a number (no single, double or backtick quotes) it is an array element,
				//       otherwise we will try to reat it as a dynamic object property.
				if (isNaN(tmpBoxedPropertyNumber))
				{
					// This isn't a number ... let's treat it as a dynanmic object property.
					tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
					tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

					// Recurse directly into the subobject
					return this.setValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference], tmpNewAddress, pValue);
				}
				else
				{
					// We parsed a valid number out of the boxed property name, so recurse into the array
					return this.setValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber], tmpNewAddress, pValue);
				}
			}

			// If there is an object property already named for the sub object, but it isn't an object
			// then the system can't set the value in there.  Error and abort!
			if (pObject.hasOwnProperty(tmpSubObjectName) && typeof(pObject[tmpSubObjectName]) !== 'object')
			{
				if (!pObject.hasOwnProperty('__ERROR'))
					pObject['__ERROR'] = {};
				// Put it in an error object so data isn't lost
				pObject['__ERROR'][pAddress] = pValue;
				return false;
			}
			else if (pObject.hasOwnProperty(tmpSubObjectName))
			{
				// If there is already a subobject pass that to the recursive thingy
				return this.setValueAtAddress(pObject[tmpSubObjectName], tmpNewAddress, pValue);
			}
			else
			{
				// Create a subobject and then pass that
				pObject[tmpSubObjectName] = {};
				return this.setValueAtAddress(pObject[tmpSubObjectName], tmpNewAddress, pValue);
			}
		}
	}
};

module.exports = ManyfestObjectAddressResolver;
},{"./Manyfest-LogToConsole.js":3}],5:[function(require,module,exports){
/**
* @license MIT
* @author <steven@velozo.com>
*/
let libSimpleLog = require('./Manyfest-LogToConsole.js');

/**
* Schema Manipulation Functions
*
* @class ManyfestSchemaManipulation
*/
class ManyfestSchemaManipulation
{
	constructor(pInfoLog, pErrorLog)
	{
		// Wire in logging
		this.logInfo = (typeof(pInfoLog) === 'function') ? pInfoLog : libSimpleLog;
		this.logError = (typeof(pErrorLog) === 'function') ? pErrorLog : libSimpleLog;
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
	resolveAddressMappings(pManyfestSchemaDescriptors, pAddressMapping)
	{
		if (typeof(pManyfestSchemaDescriptors) != 'object')
		{
			this.logError(`Attempted to resolve address mapping but the descriptor was not an object.`);
			return false;
		}

		if (typeof(pAddressMapping) != 'object')
		{
			// No mappings were passed in
			return true;
		}

		// Get the arrays of both the schema definition and the hash mapping
		let tmpManyfestAddresses = Object.keys(pManyfestSchemaDescriptors);
		let tmpHashMapping = {};
		tmpManyfestAddresses.forEach(
			(pAddress) =>
			{
				if (pManyfestSchemaDescriptors[pAddress].hasOwnProperty('Hash'))
				{
					tmpHashMapping[pManyfestSchemaDescriptors[pAddress].Hash] = pAddress;
				}
			});

		let tmpAddressMappingSet = Object.keys(pAddressMapping);

		tmpAddressMappingSet.forEach(
			(pInputAddress) =>
			{
				let tmpNewDescriptorAddress = pAddressMapping[pInputAddress];
				let tmpOldDescriptorAddress = false;
				let tmpDescriptor = false;

				// See if there is a matching descriptor either by Address directly or Hash
				if (pManyfestSchemaDescriptors.hasOwnProperty(pInputAddress))
				{
					tmpOldDescriptorAddress = pInputAddress;
				}
				else if (tmpHashMapping.hasOwnProperty(pInputAddress))
				{
					tmpOldDescriptorAddress = tmpHashMapping[pInputAddress];
				}

				// If there was a matching descriptor in the manifest, store it in the temporary descriptor
				if (tmpOldDescriptorAddress)
				{
					tmpDescriptor = pManyfestSchemaDescriptors[tmpOldDescriptorAddress];
					delete pManyfestSchemaDescriptors[tmpOldDescriptorAddress];
				}
				else
				{
					// Create a new descriptor!  Map it to the input address.
					tmpDescriptor = { Hash:pInputAddress };
				}

				// Now re-add the descriptor to the manyfest schema
				pManyfestSchemaDescriptors[tmpNewDescriptorAddress] = tmpDescriptor;
			});

		return true;
	}

	safeResolveAddressMappings(pManyfestSchemaDescriptors, pAddressMapping)
	{
		// This returns the descriptors as a new object, safely remapping without mutating the original schema Descriptors
		let tmpManyfestSchemaDescriptors = JSON.parse(JSON.stringify(pManyfestSchemaDescriptors));
		this.resolveAddressMappings(tmpManyfestSchemaDescriptors, pAddressMapping);
		return tmpManyfestSchemaDescriptors;
	}

	mergeAddressMappings(pManyfestSchemaDescriptorsDestination, pManyfestSchemaDescriptorsSource)
	{
		if ((typeof(pManyfestSchemaDescriptorsSource) != 'object') || (typeof(pManyfestSchemaDescriptorsDestination) != 'object'))
		{
			this.logError(`Attempted to merge two schema descriptors but both were not objects.`);
			return false;
		}

		let tmpSource = JSON.parse(JSON.stringify(pManyfestSchemaDescriptorsSource));
		let tmpNewManyfestSchemaDescriptors = JSON.parse(JSON.stringify(pManyfestSchemaDescriptorsDestination));

		// The first passed-in set of descriptors takes precedence.
		let tmpDescriptorAddresses = Object.keys(tmpSource);

		tmpDescriptorAddresses.forEach(
			(pDescriptorAddress) => 
			{
				if (!tmpNewManyfestSchemaDescriptors.hasOwnProperty(pDescriptorAddress))
				{
					tmpNewManyfestSchemaDescriptors[pDescriptorAddress] = tmpSource[pDescriptorAddress];
				}
			});
		
		return tmpNewManyfestSchemaDescriptors;
	}
}

module.exports = ManyfestSchemaManipulation;
},{"./Manyfest-LogToConsole.js":3}],6:[function(require,module,exports){
/**
* @license MIT
* @author <steven@velozo.com>
*/
let libSimpleLog = require('./Manyfest-LogToConsole.js');
let libObjectAddressResolver = require('./Manyfest-ObjectAddressResolver.js');
let libHashTranslation = require('./Manyfest-HashTranslation.js');
let libSchemaManipulation = require('./Manyfest-SchemaManipulation.js');

/**
* Manyfest object address-based descriptions and manipulations.
*
* @class Manyfest
*/
class Manyfest
{
	constructor(pManifest, pInfoLog, pErrorLog, pOptions)
	{
		// Wire in logging
		this.logInfo = (typeof(pInfoLog) === 'function') ? pInfoLog : libSimpleLog;
		this.logError = (typeof(pErrorLog) === 'function') ? pErrorLog : libSimpleLog;

		// Create an object address resolver and map in the functions
		this.objectAddressResolver = new libObjectAddressResolver(this.logInfo, this.logError);

		this.options = (
			{
				strict: false,
				defaultValues: 
					{
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
					}
			});

		this.scope = undefined;
		this.elementAddresses = undefined;
		this.elementHashes = undefined;
		this.elementDescriptors = undefined;

		this.reset();

		if (typeof(pManifest) === 'object')
		{
			this.loadManifest(pManifest);
		}

		this.schemaManipulations = new libSchemaManipulation(this.logInfo, this.logError);

		this.hashTranslations = new libHashTranslation(this.logInfo, this.logError);
	}

	/*************************************************************************
	 * Schema Manifest Loading, Reading, Manipulation and Serialization Functions
	 */

	// Reset critical manifest properties
	reset()
	{
		this.scope = 'DEFAULT';
		this.elementAddresses = [];
		this.elementHashes = {};
		this.elementDescriptors = {};
	}

	clone()
	{
		// Make a copy of the options in-place
		let tmpNewOptions = JSON.parse(JSON.stringify(this.options));

		let tmpNewManyfest = new Manyfest(this.getManifest(), this.logInfo, this.logError, tmpNewOptions);

		// Import the hash translations
		tmpNewManyfest.hashTranslations.addTranslation(this.hashTranslations.translationTable);

		return tmpNewManyfest;
	}

	// Deserialize a Manifest from a string
	deserialize(pManifestString)
	{
		// TODO: Add guards for bad manifest string
		return this.loadManifest(JSON.parse(pManifestString));
	}

	// Load a manifest from an object
	loadManifest(pManifest)
	{
		if (typeof(pManifest) !== 'object')
		{
			this.logError(`(${this.scope}) Error loading manifest; expecting an object but parameter was type ${typeof(pManifest)}.`);
			return false;
		}

		if (pManifest.hasOwnProperty('Scope'))
		{
			if (typeof(pManifest.Scope) === 'string')
			{
				this.scope = pManifest.Scope;
			}
			else
			{
				this.logError(`(${this.scope}) Error loading scope from manifest; expecting a string but property was type ${typeof(pManifest.Scope)}.`, pManifest);
			}
		}
		else
		{
			this.logError(`(${this.scope}) Error loading scope from manifest object.  Property "Scope" does not exist in the root of the object.`, pManifest);
		}

		if (pManifest.hasOwnProperty('Descriptors'))
		{
			if (typeof(pManifest.Descriptors) === 'object')
			{
				let tmpDescriptionAddresses = Object.keys(pManifest.Descriptors);
				for (let i = 0; i < tmpDescriptionAddresses.length; i++)
				{
					this.addDescriptor(tmpDescriptionAddresses[i], pManifest.Descriptors[tmpDescriptionAddresses[i]]);
				}
			}
			else
			{
				this.logError(`(${this.scope}) Error loading description object from manifest object.  Expecting an object in 'Manifest.Descriptors' but the property was type ${typeof(pManifest.Descriptors)}.`, pManifest);
			}
		}
		else
		{
			this.logError(`(${this.scope}) Error loading object description from manifest object.  Property "Descriptors" does not exist in the root of the Manifest object.`, pManifest);
		}
	}

	// Serialize the Manifest to a string
	// TODO: Should this also serialize the translation table?
	serialize()
	{
		return JSON.stringify(this.getManifest());
	}

	getManifest()
	{
		return (
			{
				Scope: this.scope,
				Descriptors: JSON.parse(JSON.stringify(this.elementDescriptors))
			});
	}

	// Add a descriptor to the manifest
	addDescriptor(pAddress, pDescriptor)
	{
		if (typeof(pDescriptor) === 'object')
		{
			// Add the Address into the Descriptor if it doesn't exist:
			if (!pDescriptor.hasOwnProperty('Address'))
			{
				pDescriptor.Address = pAddress;
			}

			if (!this.elementDescriptors.hasOwnProperty(pAddress))
			{
				this.elementAddresses.push(pAddress);
			}

			// Add the element descriptor to the schema
			this.elementDescriptors[pAddress] = pDescriptor;

			// Always add the address as a hash
			this.elementHashes[pAddress] = pAddress;

			if (pDescriptor.hasOwnProperty('Hash'))
			{
				// TODO: Check if this is a good idea or not..
				//       Collisions are bound to happen with both representations of the address/hash in here and developers being able to create their own hashes.
				this.elementHashes[pDescriptor.Hash] = pAddress;
			}
			else
			{
				pDescriptor.Hash = pAddress;
			}

			return true;
		}
		else
		{
			this.logError(`(${this.scope}) Error loading object descriptor for address '${pAddress}' from manifest object.  Expecting an object but property was type ${typeof(pDescriptor)}.`);
			return false;
		}	
	}

	getDescriptorByHash(pHash)
	{
		return this.getDescriptor(this.resolveHashAddress(pHash));
	}

	getDescriptor(pAddress)
	{
		return this.elementDescriptors[pAddress];
	}

	/*************************************************************************
	 * Beginning of Object Manipulation (read & write) Functions
	 */
	// Check if an element exists by its hash
	checkAddressExistsByHash (pObject, pHash)
	{
		return this.checkAddressExists(pObject,this.resolveHashAddress(pHash));
	}

	// Check if an element exists at an address
	checkAddressExists (pObject, pAddress)
	{
		return this.objectAddressResolver.checkAddressExists(pObject, pAddress);
	}

	// Turn a hash into an address, factoring in the translation table.
	resolveHashAddress(pHash)
	{
		let tmpAddress = undefined;

		let tmpInElementHashTable = this.elementHashes.hasOwnProperty(pHash);
		let tmpInTranslationTable = this.hashTranslations.translationTable.hasOwnProperty(pHash);

		// The most straightforward: the hash exists, no translations.
		if (tmpInElementHashTable && !tmpInTranslationTable)
		{
			tmpAddress = this.elementHashes[pHash];
		}
		// There is a translation from one hash to another, and, the elementHashes contains the pointer end
		else if (tmpInTranslationTable && this.elementHashes.hasOwnProperty(this.hashTranslations.translate(pHash)))
		{
			tmpAddress = this.elementHashes[this.hashTranslations.translate(pHash)];
		}
		// Use the level of indirection only in the Translation Table 
		else if (tmpInTranslationTable)
		{
			tmpAddress = this.hashTranslations.translate(pHash);
		}
		// Just treat the hash as an address.
		// TODO: Discuss this ... it is magic but controversial
		else
		{
			tmpAddress = pHash;
		}

		return tmpAddress;
	}

	// Get the value of an element by its hash
	getValueByHash (pObject, pHash)
	{
		return this.getValueAtAddress(pObject, this.resolveHashAddress(pHash));
	}

	// Get the value of an element at an address
	getValueAtAddress (pObject, pAddress)
	{
		return this.objectAddressResolver.getValueAtAddress(pObject, pAddress);
	}

	// Set the value of an element by its hash
	setValueByHash(pObject, pHash, pValue)
	{
		return this.setValueAtAddress(pObject, this.resolveHashAddress(pHash), pValue);
	}


	// Set the value of an element at an address
	setValueAtAddress (pObject, pAddress, pValue)
	{
		return this.objectAddressResolver.setValueAtAddress(pObject, pAddress, pValue);
	}

	// Validate the consistency of an object against the schema
	validate(pObject)
	{
		let tmpValidationData =
		{
			Error: null,
			Errors: [],
			MissingElements:[]
		};

		if (typeof(pObject) !== 'object')
		{
			tmpValidationData.Error = true;
			tmpValidationData.Errors.push(`Expected passed in object to be type object but was passed in ${typeof(pObject)}`);
		}

		let addValidationError = (pAddress, pErrorMessage) =>
		{
			tmpValidationData.Error = true;
			tmpValidationData.Errors.push(`Element at address "${pAddress}" ${pErrorMessage}.`);
		};

		// Now enumerate through the values and check for anomalies based on the schema
		for (let i = 0; i < this.elementAddresses.length; i++)
		{
			let tmpDescriptor = this.getDescriptor(this.elementAddresses[i]);
			let tmpValue = this.getValueAtAddress(pObject, tmpDescriptor.Address);

			if (typeof(tmpValue) == 'undefined')
			{
				// This will technically mean that `Object.Some.Value = undefined` will end up showing as "missing"
				// TODO: Do we want to do a different message based on if the property exists but is undefined?
				tmpValidationData.MissingElements.push(tmpDescriptor.Address);
				if (tmpDescriptor.Required || this.options.strict)
				{
					addValidationError(tmpDescriptor.Address, 'is flagged REQUIRED but is not set in the object');
				}
			}

			// Now see if there is a data type specified for this element
			if (tmpDescriptor.DataType)
			{
				let tmpElementType = typeof(tmpValue);
				switch(tmpDescriptor.DataType.toString().trim().toLowerCase())
				{
					case 'string':
						if (tmpElementType != 'string')
						{
							addValidationError(tmpDescriptor.Address, `has a DataType ${tmpDescriptor.DataType} but is of the type ${tmpElementType}`);
						}
						break;

					case 'number':
						if (tmpElementType != 'number')
						{
							addValidationError(tmpDescriptor.Address, `has a DataType ${tmpDescriptor.DataType} but is of the type ${tmpElementType}`);
						}
						break;

					case 'integer':
						if (tmpElementType != 'number')
						{
							addValidationError(tmpDescriptor.Address, `has a DataType ${tmpDescriptor.DataType} but is of the type ${tmpElementType}`);
						}
						else
						{
							let tmpValueString = tmpValue.toString();
							if (tmpValueString.indexOf('.') > -1)
							{
								// TODO: Is this an error?
								addValidationError(tmpDescriptor.Address, `has a DataType ${tmpDescriptor.DataType} but has a decimal point in the number.`);
							}
						}
						break;

					case 'float':
						if (tmpElementType != 'number')
						{
							addValidationError(tmpDescriptor.Address, `has a DataType ${tmpDescriptor.DataType} but is of the type ${tmpElementType}`);
						}
						break;

					case 'DateTime':
						let tmpValueDate = new Date(tmpValue);
						if (tmpValueDate.toString() == 'Invalid Date')
						{
							addValidationError(tmpDescriptor.Address, `has a DataType ${tmpDescriptor.DataType} but is not parsable as a Date by Javascript`);
						}
	
					default:
						// Check if this is a string, in the default case
						// Note this is only when a DataType is specified and it is an unrecognized data type.
						if (tmpElementType != 'string')
						{
							addValidationError(tmpDescriptor.Address, `has a DataType ${tmpDescriptor.DataType} (which auto-converted to String because it was unrecognized) but is of the type ${tmpElementType}`);
						}
						break;
				}
			}
		}

		return tmpValidationData;
	}

	// Returns a default value, or, the default value for the data type (which is overridable with configuration)
	getDefaultValue(pDescriptor)
	{
		if (pDescriptor.hasOwnProperty('Default'))
		{
			return pDescriptor.Default;
		}
		else
		{
			// Default to a null if it doesn't have a type specified.
			// This will ensure a placeholder is created but isn't misinterpreted.
			let tmpDataType = (pDescriptor.hasOwnProperty('DataType')) ? pDescriptor.DataType : 'String';
			if (this.options.defaultValues.hasOwnProperty(tmpDataType))
			{
				return this.options.defaultValues[tmpDataType];
			}
			else
			{
				// give up and return null
				return null;
			}
		}
	}

	// Enumerate through the schema and populate default values if they don't exist.
	populateDefaults(pObject, pOverwriteProperties)
	{
		return this.populateObject(pObject, pOverwriteProperties,
			// This just sets up a simple filter to see if there is a default set.
			(pDescriptor) =>
			{
				return pDescriptor.hasOwnProperty('Default');
			});
	}

	// Forcefully populate all values even if they don't have defaults.
	// Based on type, this can do unexpected things.
	populateObject(pObject, pOverwriteProperties, fFilter)
	{
		// Automatically create an object if one isn't passed in.
		let tmpObject = (typeof(pObject) === 'object') ? pObject : {};
		// Default to *NOT OVERWRITING* properties
		let tmpOverwriteProperties = (typeof(pOverwriteProperties) == 'undefined') ? false : pOverwriteProperties;
		// This is a filter function, which is passed the schema and allows complex filtering of population
		// The default filter function just returns true, populating everything.
		let tmpFilterFunction = (typeof(fFilter) == 'function') ? fFilter : (pDescriptor) => { return true; };

		this.elementAddresses.forEach(
			(pAddress) =>
			{
				let tmpDescriptor = this.getDescriptor(pAddress);
				// Check the filter function to see if this is an address we want to set the value for.
				if (tmpFilterFunction(tmpDescriptor))
				{
					// If we are overwriting properties OR the property does not exist
					if (tmpOverwriteProperties || !this.checkAddressExists(tmpObject, pAddress))
					{
						this.setValueAtAddress(tmpObject, pAddress, this.getDefaultValue(tmpDescriptor));
					}
				}
			});

		return tmpObject;
	}
};

module.exports = Manyfest;
},{"./Manyfest-HashTranslation.js":2,"./Manyfest-LogToConsole.js":3,"./Manyfest-ObjectAddressResolver.js":4,"./Manyfest-SchemaManipulation.js":5}]},{},[1])(1)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvTWFueWZlc3QtQnJvd3Nlci1TaGltLmpzIiwic291cmNlL01hbnlmZXN0LUhhc2hUcmFuc2xhdGlvbi5qcyIsInNvdXJjZS9NYW55ZmVzdC1Mb2dUb0NvbnNvbGUuanMiLCJzb3VyY2UvTWFueWZlc3QtT2JqZWN0QWRkcmVzc1Jlc29sdmVyLmpzIiwic291cmNlL01hbnlmZXN0LVNjaGVtYU1hbmlwdWxhdGlvbi5qcyIsInNvdXJjZS9NYW55ZmVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4a0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKipcbiogQGxpY2Vuc2UgTUlUXG4qIEBhdXRob3IgPHN0ZXZlbkB2ZWxvem8uY29tPlxuKi9cblxuLyoqXG4qIE1hbnlmZXN0IGJyb3dzZXIgc2hpbSBsb2FkZXJcbiovXG5cbi8vIExvYWQgdGhlIG1hbnlmZXN0IG1vZHVsZSBpbnRvIHRoZSBicm93c2VyIGdsb2JhbCBhdXRvbWF0aWNhbGx5LlxudmFyIGxpYk1hbnlmZXN0ID0gcmVxdWlyZSgnLi9NYW55ZmVzdC5qcycpO1xuXG5pZiAodHlwZW9mKHdpbmRvdykgPT09ICdvYmplY3QnKSB3aW5kb3cuTWFueWZlc3QgPSBsaWJNYW55ZmVzdDtcblxubW9kdWxlLmV4cG9ydHMgPSBsaWJNYW55ZmVzdDsiLCIvKipcbiogQGxpY2Vuc2UgTUlUXG4qIEBhdXRob3IgPHN0ZXZlbkB2ZWxvem8uY29tPlxuKi9cbmxldCBsaWJTaW1wbGVMb2cgPSByZXF1aXJlKCcuL01hbnlmZXN0LUxvZ1RvQ29uc29sZS5qcycpO1xuXG4vKipcbiogSGFzaCBUcmFuc2xhdGlvblxuKlxuKiBUaGlzIGlzIGEgdmVyeSBzaW1wbGUgdHJhbnNsYXRpb24gdGFibGUgZm9yIGhhc2hlcywgd2hpY2ggYWxsb3dzIHRoZSBzYW1lIHNjaGVtYSB0byByZXNvbHZlIFxuKiBkaWZmZXJlbnRseSBiYXNlZCBvbiBhIGxvYWRlZCB0cmFuc2xhdGlvbiB0YWJsZS5cbipcbiogVGhpcyBpcyB0byBwcmV2ZW50IHRoZSByZXF1aXJlbWVudCBmb3IgbXV0YXRpbmcgc2NoZW1hcyBvdmVyIGFuZCBvdmVyIGFnYWluIHdoZW4gd2Ugd2FudCB0b1xuKiByZXVzZSB0aGUgc3RydWN0dXJlIGJ1dCBsb29rIHVwIGRhdGEgZWxlbWVudHMgYnkgZGlmZmVyZW50IGFkZHJlc3Nlcy5cbipcbiogT25lIHNpZGUtZWZmZWN0IG9mIHRoaXMgaXMgdGhhdCBhIHRyYW5zbGF0aW9uIHRhYmxlIGNhbiBcIm92ZXJyaWRlXCIgdGhlIGJ1aWx0LWluIGhhc2hlcywgc2luY2VcbiogdGhpcyBpcyBhbHdheXMgdXNlZCB0byByZXNvbHZlIGhhc2hlcyBiZWZvcmUgYW55IG9mIHRoZSBmdW5jdGlvbkNhbGxCeUhhc2gocEhhc2gsIC4uLikgcGVyZm9ybVxuKiB0aGVpciBsb29rdXBzIGJ5IGhhc2guXG4qXG4qIEBjbGFzcyBNYW55ZmVzdEhhc2hUcmFuc2xhdGlvblxuKi9cbmNsYXNzIE1hbnlmZXN0SGFzaFRyYW5zbGF0aW9uXG57XG5cdGNvbnN0cnVjdG9yKHBJbmZvTG9nLCBwRXJyb3JMb2cpXG5cdHtcblx0XHQvLyBXaXJlIGluIGxvZ2dpbmdcblx0XHR0aGlzLmxvZ0luZm8gPSAodHlwZW9mKHBJbmZvTG9nKSA9PT0gJ2Z1bmN0aW9uJykgPyBwSW5mb0xvZyA6IGxpYlNpbXBsZUxvZztcblx0XHR0aGlzLmxvZ0Vycm9yID0gKHR5cGVvZihwRXJyb3JMb2cpID09PSAnZnVuY3Rpb24nKSA/IHBFcnJvckxvZyA6IGxpYlNpbXBsZUxvZztcblxuICAgICAgICB0aGlzLnRyYW5zbGF0aW9uVGFibGUgPSB7fTtcblx0fVxuXG4gICAgdHJhbnNsYXRpb25Db3VudCgpXG4gICAge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy50cmFuc2xhdGlvblRhYmxlKS5sZW5ndGg7XG4gICAgfVxuXG4gICAgYWRkVHJhbnNsYXRpb24ocFRyYW5zbGF0aW9uKVxuICAgIHtcbiAgICAgICAgLy8gVGhpcyBhZGRzIGEgdHJhbnNsYXRpb24gaW4gdGhlIGZvcm0gb2Y6XG4gICAgICAgIC8vIHsgXCJTb3VyY2VIYXNoXCI6IFwiRGVzdGluYXRpb25IYXNoXCIsIFwiU2Vjb25kU291cmNlSGFzaFwiOlwiU2Vjb25kRGVzdGluYXRpb25IYXNoXCIgfVxuICAgICAgICBpZiAodHlwZW9mKHBUcmFuc2xhdGlvbikgIT0gJ29iamVjdCcpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMubG9nRXJyb3IoYEhhc2ggdHJhbnNsYXRpb24gYWRkVHJhbnNsYXRpb24gZXhwZWN0ZWQgYSB0cmFuc2xhdGlvbiBiZSB0eXBlIG9iamVjdCBidXQgd2FzIHBhc3NlZCBpbiAke3R5cGVvZihwVHJhbnNsYXRpb24pfWApO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRtcFRyYW5zbGF0aW9uU291cmNlcyA9IE9iamVjdC5rZXlzKHBUcmFuc2xhdGlvbilcblxuICAgICAgICB0bXBUcmFuc2xhdGlvblNvdXJjZXMuZm9yRWFjaChcbiAgICAgICAgICAgIChwVHJhbnNsYXRpb25Tb3VyY2UpID0+XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZihwVHJhbnNsYXRpb25bcFRyYW5zbGF0aW9uU291cmNlXSkgIT0gJ3N0cmluZycpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ0Vycm9yKGBIYXNoIHRyYW5zbGF0aW9uIGFkZFRyYW5zbGF0aW9uIGV4cGVjdGVkIGEgdHJhbnNsYXRpb24gZGVzdGluYXRpb24gaGFzaCBmb3IgWyR7cFRyYW5zbGF0aW9uU291cmNlfV0gdG8gYmUgYSBzdHJpbmcgYnV0IHRoZSByZWZlcnJhbnQgd2FzIGEgJHt0eXBlb2YocFRyYW5zbGF0aW9uW3BUcmFuc2xhdGlvblNvdXJjZV0pfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zbGF0aW9uVGFibGVbcFRyYW5zbGF0aW9uU291cmNlXSA9IHBUcmFuc2xhdGlvbltwVHJhbnNsYXRpb25Tb3VyY2VdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbW92ZVRyYW5zbGF0aW9uSGFzaChwVHJhbnNsYXRpb25IYXNoKVxuICAgIHtcbiAgICAgICAgaWYgKHRoaXMudHJhbnNsYXRpb25UYWJsZS5oYXNPd25Qcm9wZXJ0eShwVHJhbnNsYXRpb25IYXNoKSlcbiAgICAgICAge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMudHJhbnNsYXRpb25UYWJsZVtwVHJhbnNsYXRpb25IYXNoXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRoaXMgcmVtb3ZlcyB0cmFuc2xhdGlvbnMuXG4gICAgLy8gSWYgcGFzc2VkIGEgc3RyaW5nLCBqdXN0IHJlbW92ZXMgdGhlIHNpbmdsZSBvbmUuXG4gICAgLy8gSWYgcGFzc2VkIGFuIG9iamVjdCwgaXQgZG9lcyBhbGwgdGhlIHNvdXJjZSBrZXlzLlxuICAgIHJlbW92ZVRyYW5zbGF0aW9uKHBUcmFuc2xhdGlvbilcbiAgICB7XG4gICAgICAgIGlmICh0eXBlb2YocFRyYW5zbGF0aW9uKSA9PSAnc3RyaW5nJylcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVUcmFuc2xhdGlvbkhhc2gocFRyYW5zbGF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZihwVHJhbnNsYXRpb24pID09ICdvYmplY3QnKVxuICAgICAgICB7XG4gICAgICAgICAgICBsZXQgdG1wVHJhbnNsYXRpb25Tb3VyY2VzID0gT2JqZWN0LmtleXMocFRyYW5zbGF0aW9uKVxuXG4gICAgICAgICAgICB0bXBUcmFuc2xhdGlvblNvdXJjZXMuZm9yRWFjaChcbiAgICAgICAgICAgICAgICAocFRyYW5zbGF0aW9uU291cmNlKSA9PlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVUcmFuc2xhdGlvbihwVHJhbnNsYXRpb25Tb3VyY2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmxvZ0Vycm9yKGBIYXNoIHRyYW5zbGF0aW9uIHJlbW92ZVRyYW5zbGF0aW9uIGV4cGVjdGVkIGVpdGhlciBhIHN0cmluZyBvciBhbiBvYmplY3QgYnV0IHRoZSBwYXNzZWQtaW4gdHJhbnNsYXRpb24gd2FzIHR5cGUgJHt0eXBlb2YocFRyYW5zbGF0aW9uKX1gKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsZWFyVHJhbnNsYXRpb25zKClcbiAgICB7XG4gICAgICAgIHRoaXMudHJhbnNsYXRpb25UYWJsZSA9IHt9O1xuICAgIH1cblxuICAgIHRyYW5zbGF0ZShwVHJhbnNsYXRpb24pXG4gICAge1xuICAgICAgICBpZiAodGhpcy50cmFuc2xhdGlvblRhYmxlLmhhc093blByb3BlcnR5KHBUcmFuc2xhdGlvbikpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zbGF0aW9uVGFibGVbcFRyYW5zbGF0aW9uXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBwVHJhbnNsYXRpb247XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFueWZlc3RIYXNoVHJhbnNsYXRpb247IiwiLyoqXG4qIEBsaWNlbnNlIE1JVFxuKiBAYXV0aG9yIDxzdGV2ZW5AdmVsb3pvLmNvbT5cbiovXG5cbi8qKlxuKiBNYW55ZmVzdCBzaW1wbGUgbG9nZ2luZyBzaGltIChmb3IgYnJvd3NlciBhbmQgZGVwZW5kZW5jeS1mcmVlIHJ1bm5pbmcpXG4qL1xuXG5jb25zdCBsb2dUb0NvbnNvbGUgPSAocExvZ0xpbmUsIHBMb2dPYmplY3QpID0+XG57XG4gICAgbGV0IHRtcExvZ0xpbmUgPSAodHlwZW9mKHBMb2dMaW5lKSA9PT0gJ3N0cmluZycpID8gcExvZ0xpbmUgOiAnJztcblxuICAgIGNvbnNvbGUubG9nKGBbTWFueWZlc3RdICR7dG1wTG9nTGluZX1gKTtcblxuICAgIGlmIChwTG9nT2JqZWN0KSBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShwTG9nT2JqZWN0KSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxvZ1RvQ29uc29sZTsiLCIvKipcbiogQGxpY2Vuc2UgTUlUXG4qIEBhdXRob3IgPHN0ZXZlbkB2ZWxvem8uY29tPlxuKi9cbmxldCBsaWJTaW1wbGVMb2cgPSByZXF1aXJlKCcuL01hbnlmZXN0LUxvZ1RvQ29uc29sZS5qcycpO1xuXG4vKipcbiogT2JqZWN0IEFkZHJlc3MgUmVzb2x2ZXJcbiogXG4qIElNUE9SVEFOVCBOT1RFOiBUaGlzIGNvZGUgaXMgaW50ZW50aW9uYWxseSBtb3JlIHZlcmJvc2UgdGhhbiBuZWNlc3NhcnksIHRvXG4qICAgICAgICAgICAgICAgICBiZSBleHRyZW1lbHkgY2xlYXIgd2hhdCBpcyBnb2luZyBvbiBpbiB0aGUgcmVjdXJzaW9uIGZvclxuKiAgICAgICAgICAgICAgICAgZWFjaCBvZiB0aGUgdGhyZWUgYWRkcmVzcyByZXNvbHV0aW9uIGZ1bmN0aW9ucy5cbiogXG4qICAgICAgICAgICAgICAgICBBbHRob3VnaCB0aGVyZSBpcyBzb21lIG9wcG9ydHVuaXR5IHRvIHJlcGVhdCBvdXJzZWx2ZXMgYVxuKiAgICAgICAgICAgICAgICAgYml0IGxlc3MgaW4gdGhpcyBjb2RlYmFzZSAoZS5nLiB3aXRoIGRldGVjdGlvbiBvZiBhcnJheXNcbiogICAgICAgICAgICAgICAgIHZlcnN1cyBvYmplY3RzIHZlcnN1cyBkaXJlY3QgcHJvcGVydGllcyksIGl0IGNhbiBtYWtlXG4qICAgICAgICAgICAgICAgICBkZWJ1Z2dpbmcuLiBjaGFsbGVuZ2luZy4gIFRoZSBtaW5pZmllZCB2ZXJzaW9uIG9mIHRoZSBjb2RlXG4qICAgICAgICAgICAgICAgICBvcHRpbWl6ZXMgb3V0IGFsbW9zdCBhbnl0aGluZyByZXBlYXRlZCBpbiBoZXJlLiAgU28gcGxlYXNlXG4qICAgICAgICAgICAgICAgICBiZSBraW5kIGFuZCByZXdpbmQuLi4gbWVhbmluZyBwbGVhc2Uga2VlcCB0aGUgY29kZWJhc2UgbGVzc1xuKiAgICAgICAgICAgICAgICAgdGVyc2UgYW5kIG1vcmUgdmVyYm9zZSBzbyBodW1hbnMgY2FuIGNvbXByZWhlbmQgaXQuXG4qICAgICAgICAgICAgICAgICBcbipcbiogQGNsYXNzIE1hbnlmZXN0T2JqZWN0QWRkcmVzc1Jlc29sdmVyXG4qL1xuY2xhc3MgTWFueWZlc3RPYmplY3RBZGRyZXNzUmVzb2x2ZXJcbntcblx0Y29uc3RydWN0b3IocEluZm9Mb2csIHBFcnJvckxvZylcblx0e1xuXHRcdC8vIFdpcmUgaW4gbG9nZ2luZ1xuXHRcdHRoaXMubG9nSW5mbyA9ICh0eXBlb2YocEluZm9Mb2cpID09ICdmdW5jdGlvbicpID8gcEluZm9Mb2cgOiBsaWJTaW1wbGVMb2c7XG5cdFx0dGhpcy5sb2dFcnJvciA9ICh0eXBlb2YocEVycm9yTG9nKSA9PSAnZnVuY3Rpb24nKSA/IHBFcnJvckxvZyA6IGxpYlNpbXBsZUxvZztcblx0fVxuXG5cdC8vIFdoZW4gYSBib3hlZCBwcm9wZXJ0eSBpcyBwYXNzZWQgaW4sIGl0IHNob3VsZCBoYXZlIHF1b3RlcyBvZiBzb21lXG5cdC8vIGtpbmQgYXJvdW5kIGl0LlxuXHQvL1xuXHQvLyBGb3IgaW5zdGFuY2U6XG5cdC8vIFx0XHRNeVZhbHVlc1snTmFtZSddXG5cdC8vIFx0XHRNeVZhbHVlc1tcIkFnZVwiXVxuXHQvLyBcdFx0TXlWYWx1ZXNbYENvc3RgXVxuXHQvL1xuXHQvLyBUaGlzIGZ1bmN0aW9uIHJlbW92ZXMgdGhlIHdyYXBwaW5nIHF1b3Rlcy5cblx0Ly9cblx0Ly8gUGxlYXNlIG5vdGUgaXQgKkRPRVMgTk9UIFBBUlNFKiB0ZW1wbGF0ZSBsaXRlcmFscywgc28gYmFja3RpY2tzIGp1c3Rcblx0Ly8gZW5kIHVwIGRvaW5nIHRoZSBzYW1lIHRoaW5nIGFzIG90aGVyIHF1b3RlIHR5cGVzLlxuXHQvL1xuXHQvLyBUT0RPOiBTaG91bGQgdGVtcGxhdGUgbGl0ZXJhbHMgYmUgcHJvY2Vzc2VkPyAgSWYgc28gd2hhdCBzdGF0ZSBkbyB0aGV5IGhhdmUgYWNjZXNzIHRvP1xuXHRjbGVhbldyYXBDaGFyYWN0ZXJzIChwQ2hhcmFjdGVyLCBwU3RyaW5nKVxuXHR7XG5cdFx0aWYgKHBTdHJpbmcuc3RhcnRzV2l0aChwQ2hhcmFjdGVyKSAmJiBwU3RyaW5nLmVuZHNXaXRoKHBDaGFyYWN0ZXIpKVxuXHRcdHtcblx0XHRcdHJldHVybiBwU3RyaW5nLnN1YnN0cmluZygxLCBwU3RyaW5nLmxlbmd0aCAtIDEpO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHBTdHJpbmc7XG5cdFx0fVxuXHR9XG5cblx0Ly8gQ2hlY2sgaWYgYW4gYWRkcmVzcyBleGlzdHMuXG5cdC8vXG5cdC8vIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2UgdGhlIGdldFZhbHVlQXRBZGRyZXNzIGZ1bmN0aW9uIGlzIGFtYmlndW91cyBvbiBcblx0Ly8gd2hldGhlciB0aGUgZWxlbWVudC9wcm9wZXJ0eSBpcyBhY3R1YWxseSB0aGVyZSBvciBub3QgKGl0IHJldHVybnMgXG5cdC8vIHVuZGVmaW5lZCB3aGV0aGVyIHRoZSBwcm9wZXJ0eSBleGlzdHMgb3Igbm90KS4gIFRoaXMgZnVuY3Rpb24gY2hlY2tzIGZvclxuXHQvLyBleGlzdGFuY2UgYW5kIHJldHVybnMgdHJ1ZSBvciBmYWxzZSBkZXBlbmRlbnQuXG5cdGNoZWNrQWRkcmVzc0V4aXN0cyAocE9iamVjdCwgcEFkZHJlc3MpXG5cdHtcblx0XHQvLyBUT0RPOiBTaG91bGQgdGhlc2UgdGhyb3cgYW4gZXJyb3I/XG5cdFx0Ly8gTWFrZSBzdXJlIHBPYmplY3QgaXMgYW4gb2JqZWN0XG5cdFx0aWYgKHR5cGVvZihwT2JqZWN0KSAhPSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuXHRcdC8vIE1ha2Ugc3VyZSBwQWRkcmVzcyBpcyBhIHN0cmluZ1xuXHRcdGlmICh0eXBlb2YocEFkZHJlc3MpICE9ICdzdHJpbmcnKSByZXR1cm4gZmFsc2U7XG5cblx0XHQvLyBUT0RPOiBNYWtlIHRoaXMgd29yayBmb3IgdGhpbmdzIGxpa2UgU29tZVJvb3RPYmplY3QuTWV0YWRhdGFbXCJTb21lLlBlb3BsZS5Vc2UuQmFkLk9iamVjdC5Qcm9wZXJ0eS5OYW1lc1wiXVxuXHRcdGxldCB0bXBTZXBhcmF0b3JJbmRleCA9IHBBZGRyZXNzLmluZGV4T2YoJy4nKTtcblxuXHRcdC8vIFRoaXMgaXMgdGhlIHRlcm1pbmFsIGFkZHJlc3Mgc3RyaW5nIChubyBtb3JlIGRvdHMgc28gdGhlIFJFQ1VTSU9OIEVORFMgSU4gSEVSRSBzb21laG93KVxuXHRcdGlmICh0bXBTZXBhcmF0b3JJbmRleCA9PSAtMSlcblx0XHR7XG5cdFx0XHQvLyBDaGVjayBpZiB0aGUgYWRkcmVzcyByZWZlcnMgdG8gYSBib3hlZCBwcm9wZXJ0eVxuXHRcdFx0bGV0IHRtcEJyYWNrZXRTdGFydEluZGV4ID0gcEFkZHJlc3MuaW5kZXhPZignWycpO1xuXHRcdFx0bGV0IHRtcEJyYWNrZXRTdG9wSW5kZXggPSBwQWRkcmVzcy5pbmRleE9mKCddJyk7XG5cdFx0XHQvLyBCb3hlZCBlbGVtZW50cyBsb29rIGxpa2UgdGhpczpcblx0XHRcdC8vIFx0XHRNeVZhbHVlc1sxMF1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1snTmFtZSddXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbXCJBZ2VcIl1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1tgQ29zdGBdXG5cdFx0XHQvL1xuXHRcdFx0Ly8gV2hlbiB3ZSBhcmUgcGFzc2VkIFNvbWVPYmplY3RbXCJOYW1lXCJdIHRoaXMgY29kZSBiZWxvdyByZWN1cnNlcyBhcyBpZiBpdCB3ZXJlIFNvbWVPYmplY3QuTmFtZVxuXHRcdFx0Ly8gVGhlIHJlcXVpcmVtZW50cyB0byBkZXRlY3QgYSBib3hlZCBlbGVtZW50IGFyZTpcblx0XHRcdC8vICAgIDEpIFRoZSBzdGFydCBicmFja2V0IGlzIGFmdGVyIGNoYXJhY3RlciAwXG5cdFx0XHRpZiAoKHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMCkgXG5cdFx0XHQvLyAgICAyKSBUaGUgZW5kIGJyYWNrZXQgaGFzIHNvbWV0aGluZyBiZXR3ZWVuIHRoZW1cblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggPiB0bXBCcmFja2V0U3RhcnRJbmRleCkgXG5cdFx0XHQvLyAgICAzKSBUaGVyZSBpcyBkYXRhIFxuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCAtIHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMCkpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIFRoZSBcIk5hbWVcIiBvZiB0aGUgT2JqZWN0IGNvbnRhaW5lZCB0b28gdGhlIGxlZnQgb2YgdGhlIGJyYWNrZXRcblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlOYW1lID0gcEFkZHJlc3Muc3Vic3RyaW5nKDAsIHRtcEJyYWNrZXRTdGFydEluZGV4KS50cmltKCk7XG5cblx0XHRcdFx0Ly8gSWYgdGhlIHN1YnByb3BlcnR5IGRvZXNuJ3QgdGVzdCBhcyBhIHByb3BlciBPYmplY3QsIG5vbmUgb2YgdGhlIHJlc3Qgb2YgdGhpcyBpcyBwb3NzaWJsZS5cblx0XHRcdFx0Ly8gVGhpcyBpcyBhIHJhcmUgY2FzZSB3aGVyZSBBcnJheXMgdGVzdGluZyBhcyBPYmplY3RzIGlzIHVzZWZ1bFxuXHRcdFx0XHRpZiAodHlwZW9mKHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdKSAhPT0gJ29iamVjdCcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBUaGUgXCJSZWZlcmVuY2VcIiB0byB0aGUgcHJvcGVydHkgd2l0aGluIGl0LCBlaXRoZXIgYW4gYXJyYXkgZWxlbWVudCBvciBvYmplY3QgcHJvcGVydHlcblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSBwQWRkcmVzcy5zdWJzdHJpbmcodG1wQnJhY2tldFN0YXJ0SW5kZXgrMSwgdG1wQnJhY2tldFN0b3BJbmRleCkudHJpbSgpO1xuXHRcdFx0XHQvLyBBdHRlbXB0IHRvIHBhcnNlIHRoZSByZWZlcmVuY2UgYXMgYSBudW1iZXIsIHdoaWNoIHdpbGwgYmUgdXNlZCBhcyBhbiBhcnJheSBlbGVtZW50XG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5TnVtYmVyID0gcGFyc2VJbnQodG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSwgMTApO1xuXG5cdFx0XHRcdC8vIEd1YXJkOiBJZiB0aGUgcmVmZXJyYW50IGlzIGEgbnVtYmVyIGFuZCB0aGUgYm94ZWQgcHJvcGVydHkgaXMgbm90IGFuIGFycmF5LCBvciB2aWNlIHZlcnNhLCByZXR1cm4gdW5kZWZpbmVkLlxuXHRcdFx0XHQvLyAgICAgICAgVGhpcyBzZWVtcyBjb25mdXNpbmcgdG8gbWUgYXQgZmlyc3QgcmVhZCwgc28gZXhwbGFpbmF0aW9uOlxuXHRcdFx0XHQvLyAgICAgICAgSXMgdGhlIEJveGVkIE9iamVjdCBhbiBBcnJheT8gIFRSVUVcblx0XHRcdFx0Ly8gICAgICAgIEFuZCBpcyB0aGUgUmVmZXJlbmNlIGluc2lkZSB0aGUgYm94ZWQgT2JqZWN0IG5vdCBhIG51bWJlcj8gVFJVRVxuXHRcdFx0XHQvLyAgICAgICAgLS0+ICBTbyB3aGVuIHRoZXNlIGFyZSBpbiBhZ3JlZW1lbnQsIGl0J3MgYW4gaW1wb3NzaWJsZSBhY2Nlc3Mgc3RhdGVcblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV0pID09IGlzTmFOKHRtcEJveGVkUHJvcGVydHlOdW1iZXIpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gICAgNCkgSWYgdGhlIG1pZGRsZSBwYXJ0IGlzICpvbmx5KiBhIG51bWJlciAobm8gc2luZ2xlLCBkb3VibGUgb3IgYmFja3RpY2sgcXVvdGVzKSBpdCBpcyBhbiBhcnJheSBlbGVtZW50LFxuXHRcdFx0XHQvLyAgICAgICBvdGhlcndpc2Ugd2Ugd2lsbCB0cnkgdG8gdHJlYXQgaXQgYXMgYSBkeW5hbWljIG9iamVjdCBwcm9wZXJ0eS5cblx0XHRcdFx0aWYgKGlzTmFOKHRtcEJveGVkUHJvcGVydHlOdW1iZXIpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gVGhpcyBpc24ndCBhIG51bWJlciAuLi4gbGV0J3MgdHJlYXQgaXQgYXMgYSBkeW5hbWljIG9iamVjdCBwcm9wZXJ0eS5cblx0XHRcdFx0XHQvLyBXZSB3b3VsZCBleHBlY3QgdGhlIHByb3BlcnR5IHRvIGJlIHdyYXBwZWQgaW4gc29tZSBraW5kIG9mIHF1b3RlcyBzbyBzdHJpcCB0aGVtXG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycygnXCInLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKCdgJywgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycyhcIidcIiwgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cblx0XHRcdFx0XHQvLyBDaGVjayBpZiB0aGUgcHJvcGVydHkgZXhpc3RzLlxuXHRcdFx0XHRcdHJldHVybiBwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXS5oYXNPd25Qcm9wZXJ0eSh0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBVc2UgdGhlIG5ldyBpbiBvcGVyYXRvciB0byBzZWUgaWYgdGhlIGVsZW1lbnQgaXMgaW4gdGhlIGFycmF5XG5cdFx0XHRcdFx0cmV0dXJuICh0bXBCb3hlZFByb3BlcnR5TnVtYmVyIGluIHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBDaGVjayBpZiB0aGUgcHJvcGVydHkgZXhpc3RzXG5cdFx0XHRcdHJldHVybiBwT2JqZWN0Lmhhc093blByb3BlcnR5KHBBZGRyZXNzKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGxldCB0bXBTdWJPYmplY3ROYW1lID0gcEFkZHJlc3Muc3Vic3RyaW5nKDAsIHRtcFNlcGFyYXRvckluZGV4KTtcblx0XHRcdGxldCB0bXBOZXdBZGRyZXNzID0gcEFkZHJlc3Muc3Vic3RyaW5nKHRtcFNlcGFyYXRvckluZGV4KzEpO1xuXG5cdFx0XHQvLyBUZXN0IGlmIHRoZSB0bXBOZXdBZGRyZXNzIGlzIGFuIGFycmF5IG9yIG9iamVjdFxuXHRcdFx0Ly8gQ2hlY2sgaWYgaXQncyBhIGJveGVkIHByb3BlcnR5XG5cdFx0XHRsZXQgdG1wQnJhY2tldFN0YXJ0SW5kZXggPSB0bXBTdWJPYmplY3ROYW1lLmluZGV4T2YoJ1snKTtcblx0XHRcdGxldCB0bXBCcmFja2V0U3RvcEluZGV4ID0gdG1wU3ViT2JqZWN0TmFtZS5pbmRleE9mKCddJyk7XG5cdFx0XHQvLyBCb3hlZCBlbGVtZW50cyBsb29rIGxpa2UgdGhpczpcblx0XHRcdC8vIFx0XHRNeVZhbHVlc1s0Ml1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1snQ29sb3InXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzW1wiV2VpZ2h0XCJdXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbYERpYW1ldGVyYF1cblx0XHRcdC8vXG5cdFx0XHQvLyBXaGVuIHdlIGFyZSBwYXNzZWQgU29tZU9iamVjdFtcIk5hbWVcIl0gdGhpcyBjb2RlIGJlbG93IHJlY3Vyc2VzIGFzIGlmIGl0IHdlcmUgU29tZU9iamVjdC5OYW1lXG5cdFx0XHQvLyBUaGUgcmVxdWlyZW1lbnRzIHRvIGRldGVjdCBhIGJveGVkIGVsZW1lbnQgYXJlOlxuXHRcdFx0Ly8gICAgMSkgVGhlIHN0YXJ0IGJyYWNrZXQgaXMgYWZ0ZXIgY2hhcmFjdGVyIDBcblx0XHRcdGlmICgodG1wQnJhY2tldFN0YXJ0SW5kZXggPiAwKSBcblx0XHRcdC8vICAgIDIpIFRoZSBlbmQgYnJhY2tldCBoYXMgc29tZXRoaW5nIGJldHdlZW4gdGhlbVxuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCA+IHRtcEJyYWNrZXRTdGFydEluZGV4KSBcblx0XHRcdC8vICAgIDMpIFRoZXJlIGlzIGRhdGEgXG5cdFx0XHRcdCYmICh0bXBCcmFja2V0U3RvcEluZGV4IC0gdG1wQnJhY2tldFN0YXJ0SW5kZXggPiAwKSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlOYW1lID0gdG1wU3ViT2JqZWN0TmFtZS5zdWJzdHJpbmcoMCwgdG1wQnJhY2tldFN0YXJ0SW5kZXgpLnRyaW0oKTtcblxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRtcFN1Yk9iamVjdE5hbWUuc3Vic3RyaW5nKHRtcEJyYWNrZXRTdGFydEluZGV4KzEsIHRtcEJyYWNrZXRTdG9wSW5kZXgpLnRyaW0oKTtcblxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eU51bWJlciA9IHBhcnNlSW50KHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UsIDEwKTtcblxuXHRcdFx0XHQvLyBHdWFyZDogSWYgdGhlIHJlZmVycmFudCBpcyBhIG51bWJlciBhbmQgdGhlIGJveGVkIHByb3BlcnR5IGlzIG5vdCBhbiBhcnJheSwgb3IgdmljZSB2ZXJzYSwgcmV0dXJuIHVuZGVmaW5lZC5cblx0XHRcdFx0Ly8gICAgICAgIFRoaXMgc2VlbXMgY29uZnVzaW5nIHRvIG1lIGF0IGZpcnN0IHJlYWQsIHNvIGV4cGxhaW5hdGlvbjpcblx0XHRcdFx0Ly8gICAgICAgIElzIHRoZSBCb3hlZCBPYmplY3QgYW4gQXJyYXk/ICBUUlVFXG5cdFx0XHRcdC8vICAgICAgICBBbmQgaXMgdGhlIFJlZmVyZW5jZSBpbnNpZGUgdGhlIGJveGVkIE9iamVjdCBub3QgYSBudW1iZXI/IFRSVUVcblx0XHRcdFx0Ly8gICAgICAgIC0tPiAgU28gd2hlbiB0aGVzZSBhcmUgaW4gYWdyZWVtZW50LCBpdCdzIGFuIGltcG9zc2libGUgYWNjZXNzIHN0YXRlXG5cdFx0XHRcdC8vIFRoaXMgY291bGQgYmUgYSBmYWlsdXJlIGluIHRoZSByZWN1cnNpb24gY2hhaW4gYmVjYXVzZSB0aGV5IHBhc3NlZCBzb21ldGhpbmcgbGlrZSB0aGlzIGluOlxuXHRcdFx0XHQvLyAgICBTdHVkZW50RGF0YS5TZWN0aW9ucy5BbGdlYnJhLlN0dWRlbnRzWzFdLlRhcmR5XG5cdFx0XHRcdC8vICAgICAgIEJVVFxuXHRcdFx0XHQvLyAgICAgICAgIFN0dWRlbnREYXRhLlNlY3Rpb25zLkFsZ2VicmEuU3R1ZGVudHMgaXMgYW4gb2JqZWN0LCBzbyB0aGUgWzFdLlRhcmR5IGlzIG5vdCBwb3NzaWJsZSB0byBhY2Nlc3Ncblx0XHRcdFx0Ly8gVGhpcyBjb3VsZCBiZSBhIGZhaWx1cmUgaW4gdGhlIHJlY3Vyc2lvbiBjaGFpbiBiZWNhdXNlIHRoZXkgcGFzc2VkIHNvbWV0aGluZyBsaWtlIHRoaXMgaW46XG5cdFx0XHRcdC8vICAgIFN0dWRlbnREYXRhLlNlY3Rpb25zLkFsZ2VicmEuU3R1ZGVudHNbXCJKYW5lRG9lXCJdLkdyYWRlXG5cdFx0XHRcdC8vICAgICAgIEJVVFxuXHRcdFx0XHQvLyAgICAgICAgIFN0dWRlbnREYXRhLlNlY3Rpb25zLkFsZ2VicmEuU3R1ZGVudHMgaXMgYW4gYXJyYXksIHNvIHRoZSBbXCJKYW5lRG9lXCJdLkdyYWRlIGlzIG5vdCBwb3NzaWJsZSB0byBhY2Nlc3Ncblx0XHRcdFx0Ly8gVE9ETzogU2hvdWxkIHRoaXMgYmUgYW4gZXJyb3Igb3Igc29tZXRoaW5nPyAgU2hvdWxkIHdlIGtlZXAgYSBsb2cgb2YgZmFpbHVyZXMgbGlrZSB0aGlzP1xuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXSkgPT0gaXNOYU4odG1wQm94ZWRQcm9wZXJ0eU51bWJlcikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBCZWNhdXNlIHRoaXMgaXMgYW4gaW1wb3NzaWJsZSBhZGRyZXNzLCB0aGUgcHJvcGVydHkgZG9lc24ndCBleGlzdFxuXHRcdFx0XHRcdC8vIFRPRE86IFNob3VsZCB3ZSB0aHJvdyBhbiBlcnJvciBpbiB0aGlzIGNvbmRpdGlvbj9cblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL1RoaXMgaXMgYSBicmFja2V0ZWQgdmFsdWVcblx0XHRcdFx0Ly8gICAgNCkgSWYgdGhlIG1pZGRsZSBwYXJ0IGlzICpvbmx5KiBhIG51bWJlciAobm8gc2luZ2xlLCBkb3VibGUgb3IgYmFja3RpY2sgcXVvdGVzKSBpdCBpcyBhbiBhcnJheSBlbGVtZW50LFxuXHRcdFx0XHQvLyAgICAgICBvdGhlcndpc2Ugd2Ugd2lsbCB0cnkgdG8gcmVhdCBpdCBhcyBhIGR5bmFtaWMgb2JqZWN0IHByb3BlcnR5LlxuXHRcdFx0XHRpZiAoaXNOYU4odG1wQm94ZWRQcm9wZXJ0eU51bWJlcikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBUaGlzIGlzbid0IGEgbnVtYmVyIC4uLiBsZXQncyB0cmVhdCBpdCBhcyBhIGR5bmFubWljIG9iamVjdCBwcm9wZXJ0eS5cblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKCdcIicsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoJ2AnLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKFwiJ1wiLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblxuXHRcdFx0XHRcdC8vIFJlY3Vyc2UgZGlyZWN0bHkgaW50byB0aGUgc3Vib2JqZWN0XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuY2hlY2tBZGRyZXNzRXhpc3RzKHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdW3RtcEJveGVkUHJvcGVydHlSZWZlcmVuY2VdLCB0bXBOZXdBZGRyZXNzKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBXZSBwYXJzZWQgYSB2YWxpZCBudW1iZXIgb3V0IG9mIHRoZSBib3hlZCBwcm9wZXJ0eSBuYW1lLCBzbyByZWN1cnNlIGludG8gdGhlIGFycmF5XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuY2hlY2tBZGRyZXNzRXhpc3RzKHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdW3RtcEJveGVkUHJvcGVydHlOdW1iZXJdLCB0bXBOZXdBZGRyZXNzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBJZiB0aGVyZSBpcyBhbiBvYmplY3QgcHJvcGVydHkgYWxyZWFkeSBuYW1lZCBmb3IgdGhlIHN1YiBvYmplY3QsIGJ1dCBpdCBpc24ndCBhbiBvYmplY3Rcblx0XHRcdC8vIHRoZW4gdGhlIHN5c3RlbSBjYW4ndCBzZXQgdGhlIHZhbHVlIGluIHRoZXJlLiAgRXJyb3IgYW5kIGFib3J0IVxuXHRcdFx0aWYgKHBPYmplY3QuaGFzT3duUHJvcGVydHkodG1wU3ViT2JqZWN0TmFtZSkgJiYgdHlwZW9mKHBPYmplY3RbdG1wU3ViT2JqZWN0TmFtZV0pICE9PSAnb2JqZWN0Jylcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAocE9iamVjdC5oYXNPd25Qcm9wZXJ0eSh0bXBTdWJPYmplY3ROYW1lKSlcblx0XHRcdHtcblx0XHRcdFx0Ly8gSWYgdGhlcmUgaXMgYWxyZWFkeSBhIHN1Ym9iamVjdCBwYXNzIHRoYXQgdG8gdGhlIHJlY3Vyc2l2ZSB0aGluZ3lcblx0XHRcdFx0cmV0dXJuIHRoaXMuY2hlY2tBZGRyZXNzRXhpc3RzKHBPYmplY3RbdG1wU3ViT2JqZWN0TmFtZV0sIHRtcE5ld0FkZHJlc3MpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBDcmVhdGUgYSBzdWJvYmplY3QgYW5kIHRoZW4gcGFzcyB0aGF0XG5cdFx0XHRcdHBPYmplY3RbdG1wU3ViT2JqZWN0TmFtZV0gPSB7fTtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY2hlY2tBZGRyZXNzRXhpc3RzKHBPYmplY3RbdG1wU3ViT2JqZWN0TmFtZV0sIHRtcE5ld0FkZHJlc3MpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIEdldCB0aGUgdmFsdWUgb2YgYW4gZWxlbWVudCBhdCBhbiBhZGRyZXNzXG5cdGdldFZhbHVlQXRBZGRyZXNzIChwT2JqZWN0LCBwQWRkcmVzcylcblx0e1xuXHRcdC8vIE1ha2Ugc3VyZSBwT2JqZWN0IGlzIGFuIG9iamVjdFxuXHRcdGlmICh0eXBlb2YocE9iamVjdCkgIT0gJ29iamVjdCcpIHJldHVybiB1bmRlZmluZWQ7XG5cdFx0Ly8gTWFrZSBzdXJlIHBBZGRyZXNzIGlzIGEgc3RyaW5nXG5cdFx0aWYgKHR5cGVvZihwQWRkcmVzcykgIT0gJ3N0cmluZycpIHJldHVybiB1bmRlZmluZWQ7XG5cblx0XHQvLyBUT0RPOiBNYWtlIHRoaXMgd29yayBmb3IgdGhpbmdzIGxpa2UgU29tZVJvb3RPYmplY3QuTWV0YWRhdGFbXCJTb21lLlBlb3BsZS5Vc2UuQmFkLk9iamVjdC5Qcm9wZXJ0eS5OYW1lc1wiXVxuXHRcdGxldCB0bXBTZXBhcmF0b3JJbmRleCA9IHBBZGRyZXNzLmluZGV4T2YoJy4nKTtcblxuXHRcdC8vIFRoaXMgaXMgdGhlIHRlcm1pbmFsIGFkZHJlc3Mgc3RyaW5nIChubyBtb3JlIGRvdHMgc28gdGhlIFJFQ1VTSU9OIEVORFMgSU4gSEVSRSBzb21laG93KVxuXHRcdGlmICh0bXBTZXBhcmF0b3JJbmRleCA9PSAtMSlcblx0XHR7XG5cdFx0XHQvLyBDaGVjayBpZiB0aGUgYWRkcmVzcyByZWZlcnMgdG8gYSBib3hlZCBwcm9wZXJ0eVxuXHRcdFx0bGV0IHRtcEJyYWNrZXRTdGFydEluZGV4ID0gcEFkZHJlc3MuaW5kZXhPZignWycpO1xuXHRcdFx0bGV0IHRtcEJyYWNrZXRTdG9wSW5kZXggPSBwQWRkcmVzcy5pbmRleE9mKCddJyk7XG5cdFx0XHQvLyBCb3hlZCBlbGVtZW50cyBsb29rIGxpa2UgdGhpczpcblx0XHRcdC8vIFx0XHRNeVZhbHVlc1sxMF1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1snTmFtZSddXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbXCJBZ2VcIl1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1tgQ29zdGBdXG5cdFx0XHQvL1xuXHRcdFx0Ly8gV2hlbiB3ZSBhcmUgcGFzc2VkIFNvbWVPYmplY3RbXCJOYW1lXCJdIHRoaXMgY29kZSBiZWxvdyByZWN1cnNlcyBhcyBpZiBpdCB3ZXJlIFNvbWVPYmplY3QuTmFtZVxuXHRcdFx0Ly8gVGhlIHJlcXVpcmVtZW50cyB0byBkZXRlY3QgYSBib3hlZCBlbGVtZW50IGFyZTpcblx0XHRcdC8vICAgIDEpIFRoZSBzdGFydCBicmFja2V0IGlzIGFmdGVyIGNoYXJhY3RlciAwXG5cdFx0XHRpZiAoKHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMCkgXG5cdFx0XHQvLyAgICAyKSBUaGUgZW5kIGJyYWNrZXQgaGFzIHNvbWV0aGluZyBiZXR3ZWVuIHRoZW1cblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggPiB0bXBCcmFja2V0U3RhcnRJbmRleCkgXG5cdFx0XHQvLyAgICAzKSBUaGVyZSBpcyBkYXRhIFxuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCAtIHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMCkpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIFRoZSBcIk5hbWVcIiBvZiB0aGUgT2JqZWN0IGNvbnRhaW5lZCB0b28gdGhlIGxlZnQgb2YgdGhlIGJyYWNrZXRcblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlOYW1lID0gcEFkZHJlc3Muc3Vic3RyaW5nKDAsIHRtcEJyYWNrZXRTdGFydEluZGV4KS50cmltKCk7XG5cblx0XHRcdFx0Ly8gSWYgdGhlIHN1YnByb3BlcnR5IGRvZXNuJ3QgdGVzdCBhcyBhIHByb3BlciBPYmplY3QsIG5vbmUgb2YgdGhlIHJlc3Qgb2YgdGhpcyBpcyBwb3NzaWJsZS5cblx0XHRcdFx0Ly8gVGhpcyBpcyBhIHJhcmUgY2FzZSB3aGVyZSBBcnJheXMgdGVzdGluZyBhcyBPYmplY3RzIGlzIHVzZWZ1bFxuXHRcdFx0XHRpZiAodHlwZW9mKHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdKSAhPT0gJ29iamVjdCcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gVGhlIFwiUmVmZXJlbmNlXCIgdG8gdGhlIHByb3BlcnR5IHdpdGhpbiBpdCwgZWl0aGVyIGFuIGFycmF5IGVsZW1lbnQgb3Igb2JqZWN0IHByb3BlcnR5XG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gcEFkZHJlc3Muc3Vic3RyaW5nKHRtcEJyYWNrZXRTdGFydEluZGV4KzEsIHRtcEJyYWNrZXRTdG9wSW5kZXgpLnRyaW0oKTtcblx0XHRcdFx0Ly8gQXR0ZW1wdCB0byBwYXJzZSB0aGUgcmVmZXJlbmNlIGFzIGEgbnVtYmVyLCB3aGljaCB3aWxsIGJlIHVzZWQgYXMgYW4gYXJyYXkgZWxlbWVudFxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eU51bWJlciA9IHBhcnNlSW50KHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UsIDEwKTtcblxuXHRcdFx0XHQvLyBHdWFyZDogSWYgdGhlIHJlZmVycmFudCBpcyBhIG51bWJlciBhbmQgdGhlIGJveGVkIHByb3BlcnR5IGlzIG5vdCBhbiBhcnJheSwgb3IgdmljZSB2ZXJzYSwgcmV0dXJuIHVuZGVmaW5lZC5cblx0XHRcdFx0Ly8gICAgICAgIFRoaXMgc2VlbXMgY29uZnVzaW5nIHRvIG1lIGF0IGZpcnN0IHJlYWQsIHNvIGV4cGxhaW5hdGlvbjpcblx0XHRcdFx0Ly8gICAgICAgIElzIHRoZSBCb3hlZCBPYmplY3QgYW4gQXJyYXk/ICBUUlVFXG5cdFx0XHRcdC8vICAgICAgICBBbmQgaXMgdGhlIFJlZmVyZW5jZSBpbnNpZGUgdGhlIGJveGVkIE9iamVjdCBub3QgYSBudW1iZXI/IFRSVUVcblx0XHRcdFx0Ly8gICAgICAgIC0tPiAgU28gd2hlbiB0aGVzZSBhcmUgaW4gYWdyZWVtZW50LCBpdCdzIGFuIGltcG9zc2libGUgYWNjZXNzIHN0YXRlXG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdKSA9PSBpc05hTih0bXBCb3hlZFByb3BlcnR5TnVtYmVyKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyAgICA0KSBJZiB0aGUgbWlkZGxlIHBhcnQgaXMgKm9ubHkqIGEgbnVtYmVyIChubyBzaW5nbGUsIGRvdWJsZSBvciBiYWNrdGljayBxdW90ZXMpIGl0IGlzIGFuIGFycmF5IGVsZW1lbnQsXG5cdFx0XHRcdC8vICAgICAgIG90aGVyd2lzZSB3ZSB3aWxsIHRyeSB0byB0cmVhdCBpdCBhcyBhIGR5bmFtaWMgb2JqZWN0IHByb3BlcnR5LlxuXHRcdFx0XHRpZiAoaXNOYU4odG1wQm94ZWRQcm9wZXJ0eU51bWJlcikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBUaGlzIGlzbid0IGEgbnVtYmVyIC4uLiBsZXQncyB0cmVhdCBpdCBhcyBhIGR5bmFtaWMgb2JqZWN0IHByb3BlcnR5LlxuXHRcdFx0XHRcdC8vIFdlIHdvdWxkIGV4cGVjdCB0aGUgcHJvcGVydHkgdG8gYmUgd3JhcHBlZCBpbiBzb21lIGtpbmQgb2YgcXVvdGVzIHNvIHN0cmlwIHRoZW1cblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKCdcIicsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoJ2AnLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKFwiJ1wiLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblxuXHRcdFx0XHRcdC8vIFJldHVybiB0aGUgdmFsdWUgaW4gdGhlIHByb3BlcnR5XG5cdFx0XHRcdFx0cmV0dXJuIHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdW3RtcEJveGVkUHJvcGVydHlSZWZlcmVuY2VdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXVt0bXBCb3hlZFByb3BlcnR5TnVtYmVyXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBOb3cgaXMgdGhlIHBvaW50IGluIHJlY3Vyc2lvbiB0byByZXR1cm4gdGhlIHZhbHVlIGluIHRoZSBhZGRyZXNzXG5cdFx0XHRcdHJldHVybiBwT2JqZWN0W3BBZGRyZXNzXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGxldCB0bXBTdWJPYmplY3ROYW1lID0gcEFkZHJlc3Muc3Vic3RyaW5nKDAsIHRtcFNlcGFyYXRvckluZGV4KTtcblx0XHRcdGxldCB0bXBOZXdBZGRyZXNzID0gcEFkZHJlc3Muc3Vic3RyaW5nKHRtcFNlcGFyYXRvckluZGV4KzEpO1xuXG5cdFx0XHQvLyBUZXN0IGlmIHRoZSB0bXBOZXdBZGRyZXNzIGlzIGFuIGFycmF5IG9yIG9iamVjdFxuXHRcdFx0Ly8gQ2hlY2sgaWYgaXQncyBhIGJveGVkIHByb3BlcnR5XG5cdFx0XHRsZXQgdG1wQnJhY2tldFN0YXJ0SW5kZXggPSB0bXBTdWJPYmplY3ROYW1lLmluZGV4T2YoJ1snKTtcblx0XHRcdGxldCB0bXBCcmFja2V0U3RvcEluZGV4ID0gdG1wU3ViT2JqZWN0TmFtZS5pbmRleE9mKCddJyk7XG5cdFx0XHQvLyBCb3hlZCBlbGVtZW50cyBsb29rIGxpa2UgdGhpczpcblx0XHRcdC8vIFx0XHRNeVZhbHVlc1s0Ml1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1snQ29sb3InXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzW1wiV2VpZ2h0XCJdXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbYERpYW1ldGVyYF1cblx0XHRcdC8vXG5cdFx0XHQvLyBXaGVuIHdlIGFyZSBwYXNzZWQgU29tZU9iamVjdFtcIk5hbWVcIl0gdGhpcyBjb2RlIGJlbG93IHJlY3Vyc2VzIGFzIGlmIGl0IHdlcmUgU29tZU9iamVjdC5OYW1lXG5cdFx0XHQvLyBUaGUgcmVxdWlyZW1lbnRzIHRvIGRldGVjdCBhIGJveGVkIGVsZW1lbnQgYXJlOlxuXHRcdFx0Ly8gICAgMSkgVGhlIHN0YXJ0IGJyYWNrZXQgaXMgYWZ0ZXIgY2hhcmFjdGVyIDBcblx0XHRcdGlmICgodG1wQnJhY2tldFN0YXJ0SW5kZXggPiAwKSBcblx0XHRcdC8vICAgIDIpIFRoZSBlbmQgYnJhY2tldCBoYXMgc29tZXRoaW5nIGJldHdlZW4gdGhlbVxuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCA+IHRtcEJyYWNrZXRTdGFydEluZGV4KSBcblx0XHRcdC8vICAgIDMpIFRoZXJlIGlzIGRhdGEgXG5cdFx0XHRcdCYmICh0bXBCcmFja2V0U3RvcEluZGV4IC0gdG1wQnJhY2tldFN0YXJ0SW5kZXggPiAwKSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlOYW1lID0gdG1wU3ViT2JqZWN0TmFtZS5zdWJzdHJpbmcoMCwgdG1wQnJhY2tldFN0YXJ0SW5kZXgpLnRyaW0oKTtcblxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRtcFN1Yk9iamVjdE5hbWUuc3Vic3RyaW5nKHRtcEJyYWNrZXRTdGFydEluZGV4KzEsIHRtcEJyYWNrZXRTdG9wSW5kZXgpLnRyaW0oKTtcblxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eU51bWJlciA9IHBhcnNlSW50KHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UsIDEwKTtcblxuXHRcdFx0XHQvLyBHdWFyZDogSWYgdGhlIHJlZmVycmFudCBpcyBhIG51bWJlciBhbmQgdGhlIGJveGVkIHByb3BlcnR5IGlzIG5vdCBhbiBhcnJheSwgb3IgdmljZSB2ZXJzYSwgcmV0dXJuIHVuZGVmaW5lZC5cblx0XHRcdFx0Ly8gICAgICAgIFRoaXMgc2VlbXMgY29uZnVzaW5nIHRvIG1lIGF0IGZpcnN0IHJlYWQsIHNvIGV4cGxhaW5hdGlvbjpcblx0XHRcdFx0Ly8gICAgICAgIElzIHRoZSBCb3hlZCBPYmplY3QgYW4gQXJyYXk/ICBUUlVFXG5cdFx0XHRcdC8vICAgICAgICBBbmQgaXMgdGhlIFJlZmVyZW5jZSBpbnNpZGUgdGhlIGJveGVkIE9iamVjdCBub3QgYSBudW1iZXI/IFRSVUVcblx0XHRcdFx0Ly8gICAgICAgIC0tPiAgU28gd2hlbiB0aGVzZSBhcmUgaW4gYWdyZWVtZW50LCBpdCdzIGFuIGltcG9zc2libGUgYWNjZXNzIHN0YXRlXG5cdFx0XHRcdC8vIFRoaXMgY291bGQgYmUgYSBmYWlsdXJlIGluIHRoZSByZWN1cnNpb24gY2hhaW4gYmVjYXVzZSB0aGV5IHBhc3NlZCBzb21ldGhpbmcgbGlrZSB0aGlzIGluOlxuXHRcdFx0XHQvLyAgICBTdHVkZW50RGF0YS5TZWN0aW9ucy5BbGdlYnJhLlN0dWRlbnRzWzFdLlRhcmR5XG5cdFx0XHRcdC8vICAgICAgIEJVVFxuXHRcdFx0XHQvLyAgICAgICAgIFN0dWRlbnREYXRhLlNlY3Rpb25zLkFsZ2VicmEuU3R1ZGVudHMgaXMgYW4gb2JqZWN0LCBzbyB0aGUgWzFdLlRhcmR5IGlzIG5vdCBwb3NzaWJsZSB0byBhY2Nlc3Ncblx0XHRcdFx0Ly8gVGhpcyBjb3VsZCBiZSBhIGZhaWx1cmUgaW4gdGhlIHJlY3Vyc2lvbiBjaGFpbiBiZWNhdXNlIHRoZXkgcGFzc2VkIHNvbWV0aGluZyBsaWtlIHRoaXMgaW46XG5cdFx0XHRcdC8vICAgIFN0dWRlbnREYXRhLlNlY3Rpb25zLkFsZ2VicmEuU3R1ZGVudHNbXCJKYW5lRG9lXCJdLkdyYWRlXG5cdFx0XHRcdC8vICAgICAgIEJVVFxuXHRcdFx0XHQvLyAgICAgICAgIFN0dWRlbnREYXRhLlNlY3Rpb25zLkFsZ2VicmEuU3R1ZGVudHMgaXMgYW4gYXJyYXksIHNvIHRoZSBbXCJKYW5lRG9lXCJdLkdyYWRlIGlzIG5vdCBwb3NzaWJsZSB0byBhY2Nlc3Ncblx0XHRcdFx0Ly8gVE9ETzogU2hvdWxkIHRoaXMgYmUgYW4gZXJyb3Igb3Igc29tZXRoaW5nPyAgU2hvdWxkIHdlIGtlZXAgYSBsb2cgb2YgZmFpbHVyZXMgbGlrZSB0aGlzP1xuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXSkgPT0gaXNOYU4odG1wQm94ZWRQcm9wZXJ0eU51bWJlcikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9UaGlzIGlzIGEgYnJhY2tldGVkIHZhbHVlXG5cdFx0XHRcdC8vICAgIDQpIElmIHRoZSBtaWRkbGUgcGFydCBpcyAqb25seSogYSBudW1iZXIgKG5vIHNpbmdsZSwgZG91YmxlIG9yIGJhY2t0aWNrIHF1b3RlcykgaXQgaXMgYW4gYXJyYXkgZWxlbWVudCxcblx0XHRcdFx0Ly8gICAgICAgb3RoZXJ3aXNlIHdlIHdpbGwgdHJ5IHRvIHJlYXQgaXQgYXMgYSBkeW5hbWljIG9iamVjdCBwcm9wZXJ0eS5cblx0XHRcdFx0aWYgKGlzTmFOKHRtcEJveGVkUHJvcGVydHlOdW1iZXIpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gVGhpcyBpc24ndCBhIG51bWJlciAuLi4gbGV0J3MgdHJlYXQgaXQgYXMgYSBkeW5hbm1pYyBvYmplY3QgcHJvcGVydHkuXG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycygnXCInLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKCdgJywgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycyhcIidcIiwgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cblx0XHRcdFx0XHQvLyBSZWN1cnNlIGRpcmVjdGx5IGludG8gdGhlIHN1Ym9iamVjdFxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmdldFZhbHVlQXRBZGRyZXNzKHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdW3RtcEJveGVkUHJvcGVydHlSZWZlcmVuY2VdLCB0bXBOZXdBZGRyZXNzKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBXZSBwYXJzZWQgYSB2YWxpZCBudW1iZXIgb3V0IG9mIHRoZSBib3hlZCBwcm9wZXJ0eSBuYW1lLCBzbyByZWN1cnNlIGludG8gdGhlIGFycmF5XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0VmFsdWVBdEFkZHJlc3MocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV1bdG1wQm94ZWRQcm9wZXJ0eU51bWJlcl0sIHRtcE5ld0FkZHJlc3MpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIElmIHRoZXJlIGlzIGFuIG9iamVjdCBwcm9wZXJ0eSBhbHJlYWR5IG5hbWVkIGZvciB0aGUgc3ViIG9iamVjdCwgYnV0IGl0IGlzbid0IGFuIG9iamVjdFxuXHRcdFx0Ly8gdGhlbiB0aGUgc3lzdGVtIGNhbid0IHNldCB0aGUgdmFsdWUgaW4gdGhlcmUuICBFcnJvciBhbmQgYWJvcnQhXG5cdFx0XHRpZiAocE9iamVjdC5oYXNPd25Qcm9wZXJ0eSh0bXBTdWJPYmplY3ROYW1lKSAmJiB0eXBlb2YocE9iamVjdFt0bXBTdWJPYmplY3ROYW1lXSkgIT09ICdvYmplY3QnKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAocE9iamVjdC5oYXNPd25Qcm9wZXJ0eSh0bXBTdWJPYmplY3ROYW1lKSlcblx0XHRcdHtcblx0XHRcdFx0Ly8gSWYgdGhlcmUgaXMgYWxyZWFkeSBhIHN1Ym9iamVjdCBwYXNzIHRoYXQgdG8gdGhlIHJlY3Vyc2l2ZSB0aGluZ3lcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0VmFsdWVBdEFkZHJlc3MocE9iamVjdFt0bXBTdWJPYmplY3ROYW1lXSwgdG1wTmV3QWRkcmVzcyk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdC8vIENyZWF0ZSBhIHN1Ym9iamVjdCBhbmQgdGhlbiBwYXNzIHRoYXRcblx0XHRcdFx0cE9iamVjdFt0bXBTdWJPYmplY3ROYW1lXSA9IHt9O1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5nZXRWYWx1ZUF0QWRkcmVzcyhwT2JqZWN0W3RtcFN1Yk9iamVjdE5hbWVdLCB0bXBOZXdBZGRyZXNzKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBTZXQgdGhlIHZhbHVlIG9mIGFuIGVsZW1lbnQgYXQgYW4gYWRkcmVzc1xuXHRzZXRWYWx1ZUF0QWRkcmVzcyAocE9iamVjdCwgcEFkZHJlc3MsIHBWYWx1ZSlcblx0e1xuXHRcdC8vIE1ha2Ugc3VyZSBwT2JqZWN0IGlzIGFuIG9iamVjdFxuXHRcdGlmICh0eXBlb2YocE9iamVjdCkgIT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcblx0XHQvLyBNYWtlIHN1cmUgcEFkZHJlc3MgaXMgYSBzdHJpbmdcblx0XHRpZiAodHlwZW9mKHBBZGRyZXNzKSAhPSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuXG5cdFx0bGV0IHRtcFNlcGFyYXRvckluZGV4ID0gcEFkZHJlc3MuaW5kZXhPZignLicpO1xuXG5cdFx0aWYgKHRtcFNlcGFyYXRvckluZGV4ID09IC0xKVxuXHRcdHtcblx0XHRcdC8vIENoZWNrIGlmIGl0J3MgYSBib3hlZCBwcm9wZXJ0eVxuXHRcdFx0bGV0IHRtcEJyYWNrZXRTdGFydEluZGV4ID0gcEFkZHJlc3MuaW5kZXhPZignWycpO1xuXHRcdFx0bGV0IHRtcEJyYWNrZXRTdG9wSW5kZXggPSBwQWRkcmVzcy5pbmRleE9mKCddJyk7XG5cdFx0XHQvLyBCb3hlZCBlbGVtZW50cyBsb29rIGxpa2UgdGhpczpcblx0XHRcdC8vIFx0XHRNeVZhbHVlc1sxMF1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1snTmFtZSddXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbXCJBZ2VcIl1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1tgQ29zdGBdXG5cdFx0XHQvL1xuXHRcdFx0Ly8gV2hlbiB3ZSBhcmUgcGFzc2VkIFNvbWVPYmplY3RbXCJOYW1lXCJdIHRoaXMgY29kZSBiZWxvdyByZWN1cnNlcyBhcyBpZiBpdCB3ZXJlIFNvbWVPYmplY3QuTmFtZVxuXHRcdFx0Ly8gVGhlIHJlcXVpcmVtZW50cyB0byBkZXRlY3QgYSBib3hlZCBlbGVtZW50IGFyZTpcblx0XHRcdC8vICAgIDEpIFRoZSBzdGFydCBicmFja2V0IGlzIGFmdGVyIGNoYXJhY3RlciAwXG5cdFx0XHRpZiAoKHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMCkgXG5cdFx0XHQvLyAgICAyKSBUaGUgZW5kIGJyYWNrZXQgaGFzIHNvbWV0aGluZyBiZXR3ZWVuIHRoZW1cblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggPiB0bXBCcmFja2V0U3RhcnRJbmRleCkgXG5cdFx0XHQvLyAgICAzKSBUaGVyZSBpcyBkYXRhIFxuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCAtIHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMCkpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIFRoZSBcIk5hbWVcIiBvZiB0aGUgT2JqZWN0IGNvbnRhaW5lZCB0b28gdGhlIGxlZnQgb2YgdGhlIGJyYWNrZXRcblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlOYW1lID0gcEFkZHJlc3Muc3Vic3RyaW5nKDAsIHRtcEJyYWNrZXRTdGFydEluZGV4KS50cmltKCk7XG5cblx0XHRcdFx0Ly8gSWYgdGhlIHN1YnByb3BlcnR5IGRvZXNuJ3QgdGVzdCBhcyBhIHByb3BlciBPYmplY3QsIG5vbmUgb2YgdGhlIHJlc3Qgb2YgdGhpcyBpcyBwb3NzaWJsZS5cblx0XHRcdFx0Ly8gVGhpcyBpcyBhIHJhcmUgY2FzZSB3aGVyZSBBcnJheXMgdGVzdGluZyBhcyBPYmplY3RzIGlzIHVzZWZ1bFxuXHRcdFx0XHRpZiAodHlwZW9mKHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdKSAhPT0gJ29iamVjdCcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBUaGUgXCJSZWZlcmVuY2VcIiB0byB0aGUgcHJvcGVydHkgd2l0aGluIGl0LCBlaXRoZXIgYW4gYXJyYXkgZWxlbWVudCBvciBvYmplY3QgcHJvcGVydHlcblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSBwQWRkcmVzcy5zdWJzdHJpbmcodG1wQnJhY2tldFN0YXJ0SW5kZXgrMSwgdG1wQnJhY2tldFN0b3BJbmRleCkudHJpbSgpO1xuXHRcdFx0XHQvLyBBdHRlbXB0IHRvIHBhcnNlIHRoZSByZWZlcmVuY2UgYXMgYSBudW1iZXIsIHdoaWNoIHdpbGwgYmUgdXNlZCBhcyBhbiBhcnJheSBlbGVtZW50XG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5TnVtYmVyID0gcGFyc2VJbnQodG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSwgMTApO1xuXG5cdFx0XHRcdC8vIEd1YXJkOiBJZiB0aGUgcmVmZXJyYW50IGlzIGEgbnVtYmVyIGFuZCB0aGUgYm94ZWQgcHJvcGVydHkgaXMgbm90IGFuIGFycmF5LCBvciB2aWNlIHZlcnNhLCByZXR1cm4gdW5kZWZpbmVkLlxuXHRcdFx0XHQvLyAgICAgICAgVGhpcyBzZWVtcyBjb25mdXNpbmcgdG8gbWUgYXQgZmlyc3QgcmVhZCwgc28gZXhwbGFpbmF0aW9uOlxuXHRcdFx0XHQvLyAgICAgICAgSXMgdGhlIEJveGVkIE9iamVjdCBhbiBBcnJheT8gIFRSVUVcblx0XHRcdFx0Ly8gICAgICAgIEFuZCBpcyB0aGUgUmVmZXJlbmNlIGluc2lkZSB0aGUgYm94ZWQgT2JqZWN0IG5vdCBhIG51bWJlcj8gVFJVRVxuXHRcdFx0XHQvLyAgICAgICAgLS0+ICBTbyB3aGVuIHRoZXNlIGFyZSBpbiBhZ3JlZW1lbnQsIGl0J3MgYW4gaW1wb3NzaWJsZSBhY2Nlc3Mgc3RhdGVcblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV0pID09IGlzTmFOKHRtcEJveGVkUHJvcGVydHlOdW1iZXIpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gICAgNCkgSWYgdGhlIG1pZGRsZSBwYXJ0IGlzICpvbmx5KiBhIG51bWJlciAobm8gc2luZ2xlLCBkb3VibGUgb3IgYmFja3RpY2sgcXVvdGVzKSBpdCBpcyBhbiBhcnJheSBlbGVtZW50LFxuXHRcdFx0XHQvLyAgICAgICBvdGhlcndpc2Ugd2Ugd2lsbCB0cnkgdG8gdHJlYXQgaXQgYXMgYSBkeW5hbWljIG9iamVjdCBwcm9wZXJ0eS5cblx0XHRcdFx0aWYgKGlzTmFOKHRtcEJveGVkUHJvcGVydHlOdW1iZXIpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gVGhpcyBpc24ndCBhIG51bWJlciAuLi4gbGV0J3MgdHJlYXQgaXQgYXMgYSBkeW5hbWljIG9iamVjdCBwcm9wZXJ0eS5cblx0XHRcdFx0XHQvLyBXZSB3b3VsZCBleHBlY3QgdGhlIHByb3BlcnR5IHRvIGJlIHdyYXBwZWQgaW4gc29tZSBraW5kIG9mIHF1b3RlcyBzbyBzdHJpcCB0aGVtXG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycygnXCInLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKCdgJywgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycyhcIidcIiwgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cblx0XHRcdFx0XHQvLyBSZXR1cm4gdGhlIHZhbHVlIGluIHRoZSBwcm9wZXJ0eVxuXHRcdFx0XHRcdHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdW3RtcEJveGVkUHJvcGVydHlSZWZlcmVuY2VdID0gcFZhbHVlO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdW3RtcEJveGVkUHJvcGVydHlOdW1iZXJdID0gcFZhbHVlO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdC8vIE5vdyBpcyB0aGUgdGltZSBpbiByZWN1cnNpb24gdG8gc2V0IHRoZSB2YWx1ZSBpbiB0aGUgb2JqZWN0XG5cdFx0XHRcdHBPYmplY3RbcEFkZHJlc3NdID0gcFZhbHVlO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGxldCB0bXBTdWJPYmplY3ROYW1lID0gcEFkZHJlc3Muc3Vic3RyaW5nKDAsIHRtcFNlcGFyYXRvckluZGV4KTtcblx0XHRcdGxldCB0bXBOZXdBZGRyZXNzID0gcEFkZHJlc3Muc3Vic3RyaW5nKHRtcFNlcGFyYXRvckluZGV4KzEpO1xuXG5cdFx0XHQvLyBUZXN0IGlmIHRoZSB0bXBOZXdBZGRyZXNzIGlzIGFuIGFycmF5IG9yIG9iamVjdFxuXHRcdFx0Ly8gQ2hlY2sgaWYgaXQncyBhIGJveGVkIHByb3BlcnR5XG5cdFx0XHRsZXQgdG1wQnJhY2tldFN0YXJ0SW5kZXggPSB0bXBTdWJPYmplY3ROYW1lLmluZGV4T2YoJ1snKTtcblx0XHRcdGxldCB0bXBCcmFja2V0U3RvcEluZGV4ID0gdG1wU3ViT2JqZWN0TmFtZS5pbmRleE9mKCddJyk7XG5cdFx0XHQvLyBCb3hlZCBlbGVtZW50cyBsb29rIGxpa2UgdGhpczpcblx0XHRcdC8vIFx0XHRNeVZhbHVlc1s0Ml1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1snQ29sb3InXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzW1wiV2VpZ2h0XCJdXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbYERpYW1ldGVyYF1cblx0XHRcdC8vXG5cdFx0XHQvLyBXaGVuIHdlIGFyZSBwYXNzZWQgU29tZU9iamVjdFtcIk5hbWVcIl0gdGhpcyBjb2RlIGJlbG93IHJlY3Vyc2VzIGFzIGlmIGl0IHdlcmUgU29tZU9iamVjdC5OYW1lXG5cdFx0XHQvLyBUaGUgcmVxdWlyZW1lbnRzIHRvIGRldGVjdCBhIGJveGVkIGVsZW1lbnQgYXJlOlxuXHRcdFx0Ly8gICAgMSkgVGhlIHN0YXJ0IGJyYWNrZXQgaXMgYWZ0ZXIgY2hhcmFjdGVyIDBcblx0XHRcdGlmICgodG1wQnJhY2tldFN0YXJ0SW5kZXggPiAwKSBcblx0XHRcdC8vICAgIDIpIFRoZSBlbmQgYnJhY2tldCBoYXMgc29tZXRoaW5nIGJldHdlZW4gdGhlbVxuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCA+IHRtcEJyYWNrZXRTdGFydEluZGV4KSBcblx0XHRcdC8vICAgIDMpIFRoZXJlIGlzIGRhdGEgXG5cdFx0XHRcdCYmICh0bXBCcmFja2V0U3RvcEluZGV4IC0gdG1wQnJhY2tldFN0YXJ0SW5kZXggPiAwKSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlOYW1lID0gdG1wU3ViT2JqZWN0TmFtZS5zdWJzdHJpbmcoMCwgdG1wQnJhY2tldFN0YXJ0SW5kZXgpLnRyaW0oKTtcblxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRtcFN1Yk9iamVjdE5hbWUuc3Vic3RyaW5nKHRtcEJyYWNrZXRTdGFydEluZGV4KzEsIHRtcEJyYWNrZXRTdG9wSW5kZXgpLnRyaW0oKTtcblxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eU51bWJlciA9IHBhcnNlSW50KHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UsIDEwKTtcblxuXHRcdFx0XHQvLyBHdWFyZDogSWYgdGhlIHJlZmVycmFudCBpcyBhIG51bWJlciBhbmQgdGhlIGJveGVkIHByb3BlcnR5IGlzIG5vdCBhbiBhcnJheSwgb3IgdmljZSB2ZXJzYSwgcmV0dXJuIHVuZGVmaW5lZC5cblx0XHRcdFx0Ly8gICAgICAgIFRoaXMgc2VlbXMgY29uZnVzaW5nIHRvIG1lIGF0IGZpcnN0IHJlYWQsIHNvIGV4cGxhaW5hdGlvbjpcblx0XHRcdFx0Ly8gICAgICAgIElzIHRoZSBCb3hlZCBPYmplY3QgYW4gQXJyYXk/ICBUUlVFXG5cdFx0XHRcdC8vICAgICAgICBBbmQgaXMgdGhlIFJlZmVyZW5jZSBpbnNpZGUgdGhlIGJveGVkIE9iamVjdCBub3QgYSBudW1iZXI/IFRSVUVcblx0XHRcdFx0Ly8gICAgICAgIC0tPiAgU28gd2hlbiB0aGVzZSBhcmUgaW4gYWdyZWVtZW50LCBpdCdzIGFuIGltcG9zc2libGUgYWNjZXNzIHN0YXRlXG5cdFx0XHRcdC8vIFRoaXMgY291bGQgYmUgYSBmYWlsdXJlIGluIHRoZSByZWN1cnNpb24gY2hhaW4gYmVjYXVzZSB0aGV5IHBhc3NlZCBzb21ldGhpbmcgbGlrZSB0aGlzIGluOlxuXHRcdFx0XHQvLyAgICBTdHVkZW50RGF0YS5TZWN0aW9ucy5BbGdlYnJhLlN0dWRlbnRzWzFdLlRhcmR5XG5cdFx0XHRcdC8vICAgICAgIEJVVFxuXHRcdFx0XHQvLyAgICAgICAgIFN0dWRlbnREYXRhLlNlY3Rpb25zLkFsZ2VicmEuU3R1ZGVudHMgaXMgYW4gb2JqZWN0LCBzbyB0aGUgWzFdLlRhcmR5IGlzIG5vdCBwb3NzaWJsZSB0byBhY2Nlc3Ncblx0XHRcdFx0Ly8gVGhpcyBjb3VsZCBiZSBhIGZhaWx1cmUgaW4gdGhlIHJlY3Vyc2lvbiBjaGFpbiBiZWNhdXNlIHRoZXkgcGFzc2VkIHNvbWV0aGluZyBsaWtlIHRoaXMgaW46XG5cdFx0XHRcdC8vICAgIFN0dWRlbnREYXRhLlNlY3Rpb25zLkFsZ2VicmEuU3R1ZGVudHNbXCJKYW5lRG9lXCJdLkdyYWRlXG5cdFx0XHRcdC8vICAgICAgIEJVVFxuXHRcdFx0XHQvLyAgICAgICAgIFN0dWRlbnREYXRhLlNlY3Rpb25zLkFsZ2VicmEuU3R1ZGVudHMgaXMgYW4gYXJyYXksIHNvIHRoZSBbXCJKYW5lRG9lXCJdLkdyYWRlIGlzIG5vdCBwb3NzaWJsZSB0byBhY2Nlc3Ncblx0XHRcdFx0Ly8gVE9ETzogU2hvdWxkIHRoaXMgYmUgYW4gZXJyb3Igb3Igc29tZXRoaW5nPyAgU2hvdWxkIHdlIGtlZXAgYSBsb2cgb2YgZmFpbHVyZXMgbGlrZSB0aGlzP1xuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXSkgPT0gaXNOYU4odG1wQm94ZWRQcm9wZXJ0eU51bWJlcikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL1RoaXMgaXMgYSBicmFja2V0ZWQgdmFsdWVcblx0XHRcdFx0Ly8gICAgNCkgSWYgdGhlIG1pZGRsZSBwYXJ0IGlzICpvbmx5KiBhIG51bWJlciAobm8gc2luZ2xlLCBkb3VibGUgb3IgYmFja3RpY2sgcXVvdGVzKSBpdCBpcyBhbiBhcnJheSBlbGVtZW50LFxuXHRcdFx0XHQvLyAgICAgICBvdGhlcndpc2Ugd2Ugd2lsbCB0cnkgdG8gcmVhdCBpdCBhcyBhIGR5bmFtaWMgb2JqZWN0IHByb3BlcnR5LlxuXHRcdFx0XHRpZiAoaXNOYU4odG1wQm94ZWRQcm9wZXJ0eU51bWJlcikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBUaGlzIGlzbid0IGEgbnVtYmVyIC4uLiBsZXQncyB0cmVhdCBpdCBhcyBhIGR5bmFubWljIG9iamVjdCBwcm9wZXJ0eS5cblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKCdcIicsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoJ2AnLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKFwiJ1wiLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblxuXHRcdFx0XHRcdC8vIFJlY3Vyc2UgZGlyZWN0bHkgaW50byB0aGUgc3Vib2JqZWN0XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuc2V0VmFsdWVBdEFkZHJlc3MocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV1bdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZV0sIHRtcE5ld0FkZHJlc3MsIHBWYWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gV2UgcGFyc2VkIGEgdmFsaWQgbnVtYmVyIG91dCBvZiB0aGUgYm94ZWQgcHJvcGVydHkgbmFtZSwgc28gcmVjdXJzZSBpbnRvIHRoZSBhcnJheVxuXHRcdFx0XHRcdHJldHVybiB0aGlzLnNldFZhbHVlQXRBZGRyZXNzKHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdW3RtcEJveGVkUHJvcGVydHlOdW1iZXJdLCB0bXBOZXdBZGRyZXNzLCBwVmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIElmIHRoZXJlIGlzIGFuIG9iamVjdCBwcm9wZXJ0eSBhbHJlYWR5IG5hbWVkIGZvciB0aGUgc3ViIG9iamVjdCwgYnV0IGl0IGlzbid0IGFuIG9iamVjdFxuXHRcdFx0Ly8gdGhlbiB0aGUgc3lzdGVtIGNhbid0IHNldCB0aGUgdmFsdWUgaW4gdGhlcmUuICBFcnJvciBhbmQgYWJvcnQhXG5cdFx0XHRpZiAocE9iamVjdC5oYXNPd25Qcm9wZXJ0eSh0bXBTdWJPYmplY3ROYW1lKSAmJiB0eXBlb2YocE9iamVjdFt0bXBTdWJPYmplY3ROYW1lXSkgIT09ICdvYmplY3QnKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoIXBPYmplY3QuaGFzT3duUHJvcGVydHkoJ19fRVJST1InKSlcblx0XHRcdFx0XHRwT2JqZWN0WydfX0VSUk9SJ10gPSB7fTtcblx0XHRcdFx0Ly8gUHV0IGl0IGluIGFuIGVycm9yIG9iamVjdCBzbyBkYXRhIGlzbid0IGxvc3Rcblx0XHRcdFx0cE9iamVjdFsnX19FUlJPUiddW3BBZGRyZXNzXSA9IHBWYWx1ZTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAocE9iamVjdC5oYXNPd25Qcm9wZXJ0eSh0bXBTdWJPYmplY3ROYW1lKSlcblx0XHRcdHtcblx0XHRcdFx0Ly8gSWYgdGhlcmUgaXMgYWxyZWFkeSBhIHN1Ym9iamVjdCBwYXNzIHRoYXQgdG8gdGhlIHJlY3Vyc2l2ZSB0aGluZ3lcblx0XHRcdFx0cmV0dXJuIHRoaXMuc2V0VmFsdWVBdEFkZHJlc3MocE9iamVjdFt0bXBTdWJPYmplY3ROYW1lXSwgdG1wTmV3QWRkcmVzcywgcFZhbHVlKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0Ly8gQ3JlYXRlIGEgc3Vib2JqZWN0IGFuZCB0aGVuIHBhc3MgdGhhdFxuXHRcdFx0XHRwT2JqZWN0W3RtcFN1Yk9iamVjdE5hbWVdID0ge307XG5cdFx0XHRcdHJldHVybiB0aGlzLnNldFZhbHVlQXRBZGRyZXNzKHBPYmplY3RbdG1wU3ViT2JqZWN0TmFtZV0sIHRtcE5ld0FkZHJlc3MsIHBWYWx1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hbnlmZXN0T2JqZWN0QWRkcmVzc1Jlc29sdmVyOyIsIi8qKlxuKiBAbGljZW5zZSBNSVRcbiogQGF1dGhvciA8c3RldmVuQHZlbG96by5jb20+XG4qL1xubGV0IGxpYlNpbXBsZUxvZyA9IHJlcXVpcmUoJy4vTWFueWZlc3QtTG9nVG9Db25zb2xlLmpzJyk7XG5cbi8qKlxuKiBTY2hlbWEgTWFuaXB1bGF0aW9uIEZ1bmN0aW9uc1xuKlxuKiBAY2xhc3MgTWFueWZlc3RTY2hlbWFNYW5pcHVsYXRpb25cbiovXG5jbGFzcyBNYW55ZmVzdFNjaGVtYU1hbmlwdWxhdGlvblxue1xuXHRjb25zdHJ1Y3RvcihwSW5mb0xvZywgcEVycm9yTG9nKVxuXHR7XG5cdFx0Ly8gV2lyZSBpbiBsb2dnaW5nXG5cdFx0dGhpcy5sb2dJbmZvID0gKHR5cGVvZihwSW5mb0xvZykgPT09ICdmdW5jdGlvbicpID8gcEluZm9Mb2cgOiBsaWJTaW1wbGVMb2c7XG5cdFx0dGhpcy5sb2dFcnJvciA9ICh0eXBlb2YocEVycm9yTG9nKSA9PT0gJ2Z1bmN0aW9uJykgPyBwRXJyb3JMb2cgOiBsaWJTaW1wbGVMb2c7XG5cdH1cblxuICAgIC8vIFRoaXMgdHJhbnNsYXRlcyB0aGUgZGVmYXVsdCBhZGRyZXNzIG1hcHBpbmdzIHRvIHNvbWV0aGluZyBkaWZmZXJlbnQuXG4gICAgLy9cbiAgICAvLyBGb3IgaW5zdGFuY2UgeW91IGNhbiBwYXNzIGluIG1hbnlmZXN0IHNjaGVtYSBkZXNjcmlwdG9yIG9iamVjdDpcbiAgICAvLyBcdHtcblx0Ly9cdCAgXCJBZGRyZXNzLk9mLmFcIjogeyBcIkhhc2hcIjogXCJhXCIsIFwiVHlwZVwiOiBcIk51bWJlclwiIH0sXG5cdC8vXHQgIFwiQWRkcmVzcy5PZi5iXCI6IHsgXCJIYXNoXCI6IFwiYlwiLCBcIlR5cGVcIjogXCJOdW1iZXJcIiB9XG5cdC8vICB9XG4gICAgLy9cbiAgICAvL1xuICAgIC8vIEFuZCB0aGVuIGFuIGFkZHJlc3MgbWFwcGluZyAoYmFzaWNhbGx5IGEgSGFzaC0+QWRkcmVzcyBtYXApXG4gICAgLy8gIHtcbiAgICAvLyAgICBcImFcIjogXCJOZXcuQWRkcmVzcy5PZi5hXCIsXG4gICAgLy8gICAgXCJiXCI6IFwiTmV3LkFkZHJlc3MuT2YuYlwiICBcbiAgICAvLyAgfVxuICAgIC8vXG4gICAgLy8gTk9URTogVGhpcyBtdXRhdGVzIHRoZSBzY2hlbWEgb2JqZWN0IHBlcm1hbmVudGx5LCBhbHRlcmluZyB0aGUgYmFzZSBoYXNoLlxuICAgIC8vICAgICAgIElmIHRoZXJlIGlzIGEgY29sbGlzaW9uIHdpdGggYW4gZXhpc3RpbmcgYWRkcmVzcywgaXQgY2FuIGxlYWQgdG8gb3ZlcndyaXRlcy5cbiAgICAvLyBUT0RPOiBEaXNjdXNzIHdoYXQgc2hvdWxkIGhhcHBlbiBvbiBjb2xsaXNpb25zLlxuXHRyZXNvbHZlQWRkcmVzc01hcHBpbmdzKHBNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzLCBwQWRkcmVzc01hcHBpbmcpXG5cdHtcblx0XHRpZiAodHlwZW9mKHBNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzKSAhPSAnb2JqZWN0Jylcblx0XHR7XG5cdFx0XHR0aGlzLmxvZ0Vycm9yKGBBdHRlbXB0ZWQgdG8gcmVzb2x2ZSBhZGRyZXNzIG1hcHBpbmcgYnV0IHRoZSBkZXNjcmlwdG9yIHdhcyBub3QgYW4gb2JqZWN0LmApO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YocEFkZHJlc3NNYXBwaW5nKSAhPSAnb2JqZWN0Jylcblx0XHR7XG5cdFx0XHQvLyBObyBtYXBwaW5ncyB3ZXJlIHBhc3NlZCBpblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gR2V0IHRoZSBhcnJheXMgb2YgYm90aCB0aGUgc2NoZW1hIGRlZmluaXRpb24gYW5kIHRoZSBoYXNoIG1hcHBpbmdcblx0XHRsZXQgdG1wTWFueWZlc3RBZGRyZXNzZXMgPSBPYmplY3Qua2V5cyhwTWFueWZlc3RTY2hlbWFEZXNjcmlwdG9ycyk7XG5cdFx0bGV0IHRtcEhhc2hNYXBwaW5nID0ge307XG5cdFx0dG1wTWFueWZlc3RBZGRyZXNzZXMuZm9yRWFjaChcblx0XHRcdChwQWRkcmVzcykgPT5cblx0XHRcdHtcblx0XHRcdFx0aWYgKHBNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzW3BBZGRyZXNzXS5oYXNPd25Qcm9wZXJ0eSgnSGFzaCcpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dG1wSGFzaE1hcHBpbmdbcE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnNbcEFkZHJlc3NdLkhhc2hdID0gcEFkZHJlc3M7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0bGV0IHRtcEFkZHJlc3NNYXBwaW5nU2V0ID0gT2JqZWN0LmtleXMocEFkZHJlc3NNYXBwaW5nKTtcblxuXHRcdHRtcEFkZHJlc3NNYXBwaW5nU2V0LmZvckVhY2goXG5cdFx0XHQocElucHV0QWRkcmVzcykgPT5cblx0XHRcdHtcblx0XHRcdFx0bGV0IHRtcE5ld0Rlc2NyaXB0b3JBZGRyZXNzID0gcEFkZHJlc3NNYXBwaW5nW3BJbnB1dEFkZHJlc3NdO1xuXHRcdFx0XHRsZXQgdG1wT2xkRGVzY3JpcHRvckFkZHJlc3MgPSBmYWxzZTtcblx0XHRcdFx0bGV0IHRtcERlc2NyaXB0b3IgPSBmYWxzZTtcblxuXHRcdFx0XHQvLyBTZWUgaWYgdGhlcmUgaXMgYSBtYXRjaGluZyBkZXNjcmlwdG9yIGVpdGhlciBieSBBZGRyZXNzIGRpcmVjdGx5IG9yIEhhc2hcblx0XHRcdFx0aWYgKHBNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzLmhhc093blByb3BlcnR5KHBJbnB1dEFkZHJlc3MpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dG1wT2xkRGVzY3JpcHRvckFkZHJlc3MgPSBwSW5wdXRBZGRyZXNzO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKHRtcEhhc2hNYXBwaW5nLmhhc093blByb3BlcnR5KHBJbnB1dEFkZHJlc3MpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dG1wT2xkRGVzY3JpcHRvckFkZHJlc3MgPSB0bXBIYXNoTWFwcGluZ1twSW5wdXRBZGRyZXNzXTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIElmIHRoZXJlIHdhcyBhIG1hdGNoaW5nIGRlc2NyaXB0b3IgaW4gdGhlIG1hbmlmZXN0LCBzdG9yZSBpdCBpbiB0aGUgdGVtcG9yYXJ5IGRlc2NyaXB0b3Jcblx0XHRcdFx0aWYgKHRtcE9sZERlc2NyaXB0b3JBZGRyZXNzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dG1wRGVzY3JpcHRvciA9IHBNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzW3RtcE9sZERlc2NyaXB0b3JBZGRyZXNzXTtcblx0XHRcdFx0XHRkZWxldGUgcE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnNbdG1wT2xkRGVzY3JpcHRvckFkZHJlc3NdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIENyZWF0ZSBhIG5ldyBkZXNjcmlwdG9yISAgTWFwIGl0IHRvIHRoZSBpbnB1dCBhZGRyZXNzLlxuXHRcdFx0XHRcdHRtcERlc2NyaXB0b3IgPSB7IEhhc2g6cElucHV0QWRkcmVzcyB9O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gTm93IHJlLWFkZCB0aGUgZGVzY3JpcHRvciB0byB0aGUgbWFueWZlc3Qgc2NoZW1hXG5cdFx0XHRcdHBNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzW3RtcE5ld0Rlc2NyaXB0b3JBZGRyZXNzXSA9IHRtcERlc2NyaXB0b3I7XG5cdFx0XHR9KTtcblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0c2FmZVJlc29sdmVBZGRyZXNzTWFwcGluZ3MocE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnMsIHBBZGRyZXNzTWFwcGluZylcblx0e1xuXHRcdC8vIFRoaXMgcmV0dXJucyB0aGUgZGVzY3JpcHRvcnMgYXMgYSBuZXcgb2JqZWN0LCBzYWZlbHkgcmVtYXBwaW5nIHdpdGhvdXQgbXV0YXRpbmcgdGhlIG9yaWdpbmFsIHNjaGVtYSBEZXNjcmlwdG9yc1xuXHRcdGxldCB0bXBNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShwTWFueWZlc3RTY2hlbWFEZXNjcmlwdG9ycykpO1xuXHRcdHRoaXMucmVzb2x2ZUFkZHJlc3NNYXBwaW5ncyh0bXBNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzLCBwQWRkcmVzc01hcHBpbmcpO1xuXHRcdHJldHVybiB0bXBNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzO1xuXHR9XG5cblx0bWVyZ2VBZGRyZXNzTWFwcGluZ3MocE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnNEZXN0aW5hdGlvbiwgcE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnNTb3VyY2UpXG5cdHtcblx0XHRpZiAoKHR5cGVvZihwTWFueWZlc3RTY2hlbWFEZXNjcmlwdG9yc1NvdXJjZSkgIT0gJ29iamVjdCcpIHx8ICh0eXBlb2YocE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnNEZXN0aW5hdGlvbikgIT0gJ29iamVjdCcpKVxuXHRcdHtcblx0XHRcdHRoaXMubG9nRXJyb3IoYEF0dGVtcHRlZCB0byBtZXJnZSB0d28gc2NoZW1hIGRlc2NyaXB0b3JzIGJ1dCBib3RoIHdlcmUgbm90IG9iamVjdHMuYCk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0bGV0IHRtcFNvdXJjZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkocE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnNTb3VyY2UpKTtcblx0XHRsZXQgdG1wTmV3TWFueWZlc3RTY2hlbWFEZXNjcmlwdG9ycyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkocE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnNEZXN0aW5hdGlvbikpO1xuXG5cdFx0Ly8gVGhlIGZpcnN0IHBhc3NlZC1pbiBzZXQgb2YgZGVzY3JpcHRvcnMgdGFrZXMgcHJlY2VkZW5jZS5cblx0XHRsZXQgdG1wRGVzY3JpcHRvckFkZHJlc3NlcyA9IE9iamVjdC5rZXlzKHRtcFNvdXJjZSk7XG5cblx0XHR0bXBEZXNjcmlwdG9yQWRkcmVzc2VzLmZvckVhY2goXG5cdFx0XHQocERlc2NyaXB0b3JBZGRyZXNzKSA9PiBcblx0XHRcdHtcblx0XHRcdFx0aWYgKCF0bXBOZXdNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzLmhhc093blByb3BlcnR5KHBEZXNjcmlwdG9yQWRkcmVzcykpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0bXBOZXdNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzW3BEZXNjcmlwdG9yQWRkcmVzc10gPSB0bXBTb3VyY2VbcERlc2NyaXB0b3JBZGRyZXNzXTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XG5cdFx0cmV0dXJuIHRtcE5ld01hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnM7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNYW55ZmVzdFNjaGVtYU1hbmlwdWxhdGlvbjsiLCIvKipcbiogQGxpY2Vuc2UgTUlUXG4qIEBhdXRob3IgPHN0ZXZlbkB2ZWxvem8uY29tPlxuKi9cbmxldCBsaWJTaW1wbGVMb2cgPSByZXF1aXJlKCcuL01hbnlmZXN0LUxvZ1RvQ29uc29sZS5qcycpO1xubGV0IGxpYk9iamVjdEFkZHJlc3NSZXNvbHZlciA9IHJlcXVpcmUoJy4vTWFueWZlc3QtT2JqZWN0QWRkcmVzc1Jlc29sdmVyLmpzJyk7XG5sZXQgbGliSGFzaFRyYW5zbGF0aW9uID0gcmVxdWlyZSgnLi9NYW55ZmVzdC1IYXNoVHJhbnNsYXRpb24uanMnKTtcbmxldCBsaWJTY2hlbWFNYW5pcHVsYXRpb24gPSByZXF1aXJlKCcuL01hbnlmZXN0LVNjaGVtYU1hbmlwdWxhdGlvbi5qcycpO1xuXG4vKipcbiogTWFueWZlc3Qgb2JqZWN0IGFkZHJlc3MtYmFzZWQgZGVzY3JpcHRpb25zIGFuZCBtYW5pcHVsYXRpb25zLlxuKlxuKiBAY2xhc3MgTWFueWZlc3RcbiovXG5jbGFzcyBNYW55ZmVzdFxue1xuXHRjb25zdHJ1Y3RvcihwTWFuaWZlc3QsIHBJbmZvTG9nLCBwRXJyb3JMb2csIHBPcHRpb25zKVxuXHR7XG5cdFx0Ly8gV2lyZSBpbiBsb2dnaW5nXG5cdFx0dGhpcy5sb2dJbmZvID0gKHR5cGVvZihwSW5mb0xvZykgPT09ICdmdW5jdGlvbicpID8gcEluZm9Mb2cgOiBsaWJTaW1wbGVMb2c7XG5cdFx0dGhpcy5sb2dFcnJvciA9ICh0eXBlb2YocEVycm9yTG9nKSA9PT0gJ2Z1bmN0aW9uJykgPyBwRXJyb3JMb2cgOiBsaWJTaW1wbGVMb2c7XG5cblx0XHQvLyBDcmVhdGUgYW4gb2JqZWN0IGFkZHJlc3MgcmVzb2x2ZXIgYW5kIG1hcCBpbiB0aGUgZnVuY3Rpb25zXG5cdFx0dGhpcy5vYmplY3RBZGRyZXNzUmVzb2x2ZXIgPSBuZXcgbGliT2JqZWN0QWRkcmVzc1Jlc29sdmVyKHRoaXMubG9nSW5mbywgdGhpcy5sb2dFcnJvcik7XG5cblx0XHR0aGlzLm9wdGlvbnMgPSAoXG5cdFx0XHR7XG5cdFx0XHRcdHN0cmljdDogZmFsc2UsXG5cdFx0XHRcdGRlZmF1bHRWYWx1ZXM6IFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFwiU3RyaW5nXCI6IFwiXCIsXG5cdFx0XHRcdFx0XHRcIk51bWJlclwiOiAwLFxuXHRcdFx0XHRcdFx0XCJGbG9hdFwiOiAwLjAsXG5cdFx0XHRcdFx0XHRcIkludGVnZXJcIjogMCxcblx0XHRcdFx0XHRcdFwiQm9vbGVhblwiOiBmYWxzZSxcblx0XHRcdFx0XHRcdFwiQmluYXJ5XCI6IDAsXG5cdFx0XHRcdFx0XHRcIkRhdGVUaW1lXCI6IDAsXG5cdFx0XHRcdFx0XHRcIkFycmF5XCI6IFtdLFxuXHRcdFx0XHRcdFx0XCJPYmplY3RcIjoge30sXG5cdFx0XHRcdFx0XHRcIk51bGxcIjogbnVsbFxuXHRcdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0dGhpcy5zY29wZSA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLmVsZW1lbnRBZGRyZXNzZXMgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5lbGVtZW50SGFzaGVzID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMuZWxlbWVudERlc2NyaXB0b3JzID0gdW5kZWZpbmVkO1xuXG5cdFx0dGhpcy5yZXNldCgpO1xuXG5cdFx0aWYgKHR5cGVvZihwTWFuaWZlc3QpID09PSAnb2JqZWN0Jylcblx0XHR7XG5cdFx0XHR0aGlzLmxvYWRNYW5pZmVzdChwTWFuaWZlc3QpO1xuXHRcdH1cblxuXHRcdHRoaXMuc2NoZW1hTWFuaXB1bGF0aW9ucyA9IG5ldyBsaWJTY2hlbWFNYW5pcHVsYXRpb24odGhpcy5sb2dJbmZvLCB0aGlzLmxvZ0Vycm9yKTtcblxuXHRcdHRoaXMuaGFzaFRyYW5zbGF0aW9ucyA9IG5ldyBsaWJIYXNoVHJhbnNsYXRpb24odGhpcy5sb2dJbmZvLCB0aGlzLmxvZ0Vycm9yKTtcblx0fVxuXG5cdC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cdCAqIFNjaGVtYSBNYW5pZmVzdCBMb2FkaW5nLCBSZWFkaW5nLCBNYW5pcHVsYXRpb24gYW5kIFNlcmlhbGl6YXRpb24gRnVuY3Rpb25zXG5cdCAqL1xuXG5cdC8vIFJlc2V0IGNyaXRpY2FsIG1hbmlmZXN0IHByb3BlcnRpZXNcblx0cmVzZXQoKVxuXHR7XG5cdFx0dGhpcy5zY29wZSA9ICdERUZBVUxUJztcblx0XHR0aGlzLmVsZW1lbnRBZGRyZXNzZXMgPSBbXTtcblx0XHR0aGlzLmVsZW1lbnRIYXNoZXMgPSB7fTtcblx0XHR0aGlzLmVsZW1lbnREZXNjcmlwdG9ycyA9IHt9O1xuXHR9XG5cblx0Y2xvbmUoKVxuXHR7XG5cdFx0Ly8gTWFrZSBhIGNvcHkgb2YgdGhlIG9wdGlvbnMgaW4tcGxhY2Vcblx0XHRsZXQgdG1wTmV3T3B0aW9ucyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGhpcy5vcHRpb25zKSk7XG5cblx0XHRsZXQgdG1wTmV3TWFueWZlc3QgPSBuZXcgTWFueWZlc3QodGhpcy5nZXRNYW5pZmVzdCgpLCB0aGlzLmxvZ0luZm8sIHRoaXMubG9nRXJyb3IsIHRtcE5ld09wdGlvbnMpO1xuXG5cdFx0Ly8gSW1wb3J0IHRoZSBoYXNoIHRyYW5zbGF0aW9uc1xuXHRcdHRtcE5ld01hbnlmZXN0Lmhhc2hUcmFuc2xhdGlvbnMuYWRkVHJhbnNsYXRpb24odGhpcy5oYXNoVHJhbnNsYXRpb25zLnRyYW5zbGF0aW9uVGFibGUpO1xuXG5cdFx0cmV0dXJuIHRtcE5ld01hbnlmZXN0O1xuXHR9XG5cblx0Ly8gRGVzZXJpYWxpemUgYSBNYW5pZmVzdCBmcm9tIGEgc3RyaW5nXG5cdGRlc2VyaWFsaXplKHBNYW5pZmVzdFN0cmluZylcblx0e1xuXHRcdC8vIFRPRE86IEFkZCBndWFyZHMgZm9yIGJhZCBtYW5pZmVzdCBzdHJpbmdcblx0XHRyZXR1cm4gdGhpcy5sb2FkTWFuaWZlc3QoSlNPTi5wYXJzZShwTWFuaWZlc3RTdHJpbmcpKTtcblx0fVxuXG5cdC8vIExvYWQgYSBtYW5pZmVzdCBmcm9tIGFuIG9iamVjdFxuXHRsb2FkTWFuaWZlc3QocE1hbmlmZXN0KVxuXHR7XG5cdFx0aWYgKHR5cGVvZihwTWFuaWZlc3QpICE9PSAnb2JqZWN0Jylcblx0XHR7XG5cdFx0XHR0aGlzLmxvZ0Vycm9yKGAoJHt0aGlzLnNjb3BlfSkgRXJyb3IgbG9hZGluZyBtYW5pZmVzdDsgZXhwZWN0aW5nIGFuIG9iamVjdCBidXQgcGFyYW1ldGVyIHdhcyB0eXBlICR7dHlwZW9mKHBNYW5pZmVzdCl9LmApO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdGlmIChwTWFuaWZlc3QuaGFzT3duUHJvcGVydHkoJ1Njb3BlJykpXG5cdFx0e1xuXHRcdFx0aWYgKHR5cGVvZihwTWFuaWZlc3QuU2NvcGUpID09PSAnc3RyaW5nJylcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5zY29wZSA9IHBNYW5pZmVzdC5TY29wZTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5sb2dFcnJvcihgKCR7dGhpcy5zY29wZX0pIEVycm9yIGxvYWRpbmcgc2NvcGUgZnJvbSBtYW5pZmVzdDsgZXhwZWN0aW5nIGEgc3RyaW5nIGJ1dCBwcm9wZXJ0eSB3YXMgdHlwZSAke3R5cGVvZihwTWFuaWZlc3QuU2NvcGUpfS5gLCBwTWFuaWZlc3QpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0dGhpcy5sb2dFcnJvcihgKCR7dGhpcy5zY29wZX0pIEVycm9yIGxvYWRpbmcgc2NvcGUgZnJvbSBtYW5pZmVzdCBvYmplY3QuICBQcm9wZXJ0eSBcIlNjb3BlXCIgZG9lcyBub3QgZXhpc3QgaW4gdGhlIHJvb3Qgb2YgdGhlIG9iamVjdC5gLCBwTWFuaWZlc3QpO1xuXHRcdH1cblxuXHRcdGlmIChwTWFuaWZlc3QuaGFzT3duUHJvcGVydHkoJ0Rlc2NyaXB0b3JzJykpXG5cdFx0e1xuXHRcdFx0aWYgKHR5cGVvZihwTWFuaWZlc3QuRGVzY3JpcHRvcnMpID09PSAnb2JqZWN0Jylcblx0XHRcdHtcblx0XHRcdFx0bGV0IHRtcERlc2NyaXB0aW9uQWRkcmVzc2VzID0gT2JqZWN0LmtleXMocE1hbmlmZXN0LkRlc2NyaXB0b3JzKTtcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0bXBEZXNjcmlwdGlvbkFkZHJlc3Nlcy5sZW5ndGg7IGkrKylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRoaXMuYWRkRGVzY3JpcHRvcih0bXBEZXNjcmlwdGlvbkFkZHJlc3Nlc1tpXSwgcE1hbmlmZXN0LkRlc2NyaXB0b3JzW3RtcERlc2NyaXB0aW9uQWRkcmVzc2VzW2ldXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5sb2dFcnJvcihgKCR7dGhpcy5zY29wZX0pIEVycm9yIGxvYWRpbmcgZGVzY3JpcHRpb24gb2JqZWN0IGZyb20gbWFuaWZlc3Qgb2JqZWN0LiAgRXhwZWN0aW5nIGFuIG9iamVjdCBpbiAnTWFuaWZlc3QuRGVzY3JpcHRvcnMnIGJ1dCB0aGUgcHJvcGVydHkgd2FzIHR5cGUgJHt0eXBlb2YocE1hbmlmZXN0LkRlc2NyaXB0b3JzKX0uYCwgcE1hbmlmZXN0KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHRoaXMubG9nRXJyb3IoYCgke3RoaXMuc2NvcGV9KSBFcnJvciBsb2FkaW5nIG9iamVjdCBkZXNjcmlwdGlvbiBmcm9tIG1hbmlmZXN0IG9iamVjdC4gIFByb3BlcnR5IFwiRGVzY3JpcHRvcnNcIiBkb2VzIG5vdCBleGlzdCBpbiB0aGUgcm9vdCBvZiB0aGUgTWFuaWZlc3Qgb2JqZWN0LmAsIHBNYW5pZmVzdCk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gU2VyaWFsaXplIHRoZSBNYW5pZmVzdCB0byBhIHN0cmluZ1xuXHQvLyBUT0RPOiBTaG91bGQgdGhpcyBhbHNvIHNlcmlhbGl6ZSB0aGUgdHJhbnNsYXRpb24gdGFibGU/XG5cdHNlcmlhbGl6ZSgpXG5cdHtcblx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5nZXRNYW5pZmVzdCgpKTtcblx0fVxuXG5cdGdldE1hbmlmZXN0KClcblx0e1xuXHRcdHJldHVybiAoXG5cdFx0XHR7XG5cdFx0XHRcdFNjb3BlOiB0aGlzLnNjb3BlLFxuXHRcdFx0XHREZXNjcmlwdG9yczogSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLmVsZW1lbnREZXNjcmlwdG9ycykpXG5cdFx0XHR9KTtcblx0fVxuXG5cdC8vIEFkZCBhIGRlc2NyaXB0b3IgdG8gdGhlIG1hbmlmZXN0XG5cdGFkZERlc2NyaXB0b3IocEFkZHJlc3MsIHBEZXNjcmlwdG9yKVxuXHR7XG5cdFx0aWYgKHR5cGVvZihwRGVzY3JpcHRvcikgPT09ICdvYmplY3QnKVxuXHRcdHtcblx0XHRcdC8vIEFkZCB0aGUgQWRkcmVzcyBpbnRvIHRoZSBEZXNjcmlwdG9yIGlmIGl0IGRvZXNuJ3QgZXhpc3Q6XG5cdFx0XHRpZiAoIXBEZXNjcmlwdG9yLmhhc093blByb3BlcnR5KCdBZGRyZXNzJykpXG5cdFx0XHR7XG5cdFx0XHRcdHBEZXNjcmlwdG9yLkFkZHJlc3MgPSBwQWRkcmVzcztcblx0XHRcdH1cblxuXHRcdFx0aWYgKCF0aGlzLmVsZW1lbnREZXNjcmlwdG9ycy5oYXNPd25Qcm9wZXJ0eShwQWRkcmVzcykpXG5cdFx0XHR7XG5cdFx0XHRcdHRoaXMuZWxlbWVudEFkZHJlc3Nlcy5wdXNoKHBBZGRyZXNzKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gQWRkIHRoZSBlbGVtZW50IGRlc2NyaXB0b3IgdG8gdGhlIHNjaGVtYVxuXHRcdFx0dGhpcy5lbGVtZW50RGVzY3JpcHRvcnNbcEFkZHJlc3NdID0gcERlc2NyaXB0b3I7XG5cblx0XHRcdC8vIEFsd2F5cyBhZGQgdGhlIGFkZHJlc3MgYXMgYSBoYXNoXG5cdFx0XHR0aGlzLmVsZW1lbnRIYXNoZXNbcEFkZHJlc3NdID0gcEFkZHJlc3M7XG5cblx0XHRcdGlmIChwRGVzY3JpcHRvci5oYXNPd25Qcm9wZXJ0eSgnSGFzaCcpKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBUT0RPOiBDaGVjayBpZiB0aGlzIGlzIGEgZ29vZCBpZGVhIG9yIG5vdC4uXG5cdFx0XHRcdC8vICAgICAgIENvbGxpc2lvbnMgYXJlIGJvdW5kIHRvIGhhcHBlbiB3aXRoIGJvdGggcmVwcmVzZW50YXRpb25zIG9mIHRoZSBhZGRyZXNzL2hhc2ggaW4gaGVyZSBhbmQgZGV2ZWxvcGVycyBiZWluZyBhYmxlIHRvIGNyZWF0ZSB0aGVpciBvd24gaGFzaGVzLlxuXHRcdFx0XHR0aGlzLmVsZW1lbnRIYXNoZXNbcERlc2NyaXB0b3IuSGFzaF0gPSBwQWRkcmVzcztcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0cERlc2NyaXB0b3IuSGFzaCA9IHBBZGRyZXNzO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHRoaXMubG9nRXJyb3IoYCgke3RoaXMuc2NvcGV9KSBFcnJvciBsb2FkaW5nIG9iamVjdCBkZXNjcmlwdG9yIGZvciBhZGRyZXNzICcke3BBZGRyZXNzfScgZnJvbSBtYW5pZmVzdCBvYmplY3QuICBFeHBlY3RpbmcgYW4gb2JqZWN0IGJ1dCBwcm9wZXJ0eSB3YXMgdHlwZSAke3R5cGVvZihwRGVzY3JpcHRvcil9LmApO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cdFxuXHR9XG5cblx0Z2V0RGVzY3JpcHRvckJ5SGFzaChwSGFzaClcblx0e1xuXHRcdHJldHVybiB0aGlzLmdldERlc2NyaXB0b3IodGhpcy5yZXNvbHZlSGFzaEFkZHJlc3MocEhhc2gpKTtcblx0fVxuXG5cdGdldERlc2NyaXB0b3IocEFkZHJlc3MpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5lbGVtZW50RGVzY3JpcHRvcnNbcEFkZHJlc3NdO1xuXHR9XG5cblx0LyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblx0ICogQmVnaW5uaW5nIG9mIE9iamVjdCBNYW5pcHVsYXRpb24gKHJlYWQgJiB3cml0ZSkgRnVuY3Rpb25zXG5cdCAqL1xuXHQvLyBDaGVjayBpZiBhbiBlbGVtZW50IGV4aXN0cyBieSBpdHMgaGFzaFxuXHRjaGVja0FkZHJlc3NFeGlzdHNCeUhhc2ggKHBPYmplY3QsIHBIYXNoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuY2hlY2tBZGRyZXNzRXhpc3RzKHBPYmplY3QsdGhpcy5yZXNvbHZlSGFzaEFkZHJlc3MocEhhc2gpKTtcblx0fVxuXG5cdC8vIENoZWNrIGlmIGFuIGVsZW1lbnQgZXhpc3RzIGF0IGFuIGFkZHJlc3Ncblx0Y2hlY2tBZGRyZXNzRXhpc3RzIChwT2JqZWN0LCBwQWRkcmVzcylcblx0e1xuXHRcdHJldHVybiB0aGlzLm9iamVjdEFkZHJlc3NSZXNvbHZlci5jaGVja0FkZHJlc3NFeGlzdHMocE9iamVjdCwgcEFkZHJlc3MpO1xuXHR9XG5cblx0Ly8gVHVybiBhIGhhc2ggaW50byBhbiBhZGRyZXNzLCBmYWN0b3JpbmcgaW4gdGhlIHRyYW5zbGF0aW9uIHRhYmxlLlxuXHRyZXNvbHZlSGFzaEFkZHJlc3MocEhhc2gpXG5cdHtcblx0XHRsZXQgdG1wQWRkcmVzcyA9IHVuZGVmaW5lZDtcblxuXHRcdGxldCB0bXBJbkVsZW1lbnRIYXNoVGFibGUgPSB0aGlzLmVsZW1lbnRIYXNoZXMuaGFzT3duUHJvcGVydHkocEhhc2gpO1xuXHRcdGxldCB0bXBJblRyYW5zbGF0aW9uVGFibGUgPSB0aGlzLmhhc2hUcmFuc2xhdGlvbnMudHJhbnNsYXRpb25UYWJsZS5oYXNPd25Qcm9wZXJ0eShwSGFzaCk7XG5cblx0XHQvLyBUaGUgbW9zdCBzdHJhaWdodGZvcndhcmQ6IHRoZSBoYXNoIGV4aXN0cywgbm8gdHJhbnNsYXRpb25zLlxuXHRcdGlmICh0bXBJbkVsZW1lbnRIYXNoVGFibGUgJiYgIXRtcEluVHJhbnNsYXRpb25UYWJsZSlcblx0XHR7XG5cdFx0XHR0bXBBZGRyZXNzID0gdGhpcy5lbGVtZW50SGFzaGVzW3BIYXNoXTtcblx0XHR9XG5cdFx0Ly8gVGhlcmUgaXMgYSB0cmFuc2xhdGlvbiBmcm9tIG9uZSBoYXNoIHRvIGFub3RoZXIsIGFuZCwgdGhlIGVsZW1lbnRIYXNoZXMgY29udGFpbnMgdGhlIHBvaW50ZXIgZW5kXG5cdFx0ZWxzZSBpZiAodG1wSW5UcmFuc2xhdGlvblRhYmxlICYmIHRoaXMuZWxlbWVudEhhc2hlcy5oYXNPd25Qcm9wZXJ0eSh0aGlzLmhhc2hUcmFuc2xhdGlvbnMudHJhbnNsYXRlKHBIYXNoKSkpXG5cdFx0e1xuXHRcdFx0dG1wQWRkcmVzcyA9IHRoaXMuZWxlbWVudEhhc2hlc1t0aGlzLmhhc2hUcmFuc2xhdGlvbnMudHJhbnNsYXRlKHBIYXNoKV07XG5cdFx0fVxuXHRcdC8vIFVzZSB0aGUgbGV2ZWwgb2YgaW5kaXJlY3Rpb24gb25seSBpbiB0aGUgVHJhbnNsYXRpb24gVGFibGUgXG5cdFx0ZWxzZSBpZiAodG1wSW5UcmFuc2xhdGlvblRhYmxlKVxuXHRcdHtcblx0XHRcdHRtcEFkZHJlc3MgPSB0aGlzLmhhc2hUcmFuc2xhdGlvbnMudHJhbnNsYXRlKHBIYXNoKTtcblx0XHR9XG5cdFx0Ly8gSnVzdCB0cmVhdCB0aGUgaGFzaCBhcyBhbiBhZGRyZXNzLlxuXHRcdC8vIFRPRE86IERpc2N1c3MgdGhpcyAuLi4gaXQgaXMgbWFnaWMgYnV0IGNvbnRyb3ZlcnNpYWxcblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0dG1wQWRkcmVzcyA9IHBIYXNoO1xuXHRcdH1cblxuXHRcdHJldHVybiB0bXBBZGRyZXNzO1xuXHR9XG5cblx0Ly8gR2V0IHRoZSB2YWx1ZSBvZiBhbiBlbGVtZW50IGJ5IGl0cyBoYXNoXG5cdGdldFZhbHVlQnlIYXNoIChwT2JqZWN0LCBwSGFzaClcblx0e1xuXHRcdHJldHVybiB0aGlzLmdldFZhbHVlQXRBZGRyZXNzKHBPYmplY3QsIHRoaXMucmVzb2x2ZUhhc2hBZGRyZXNzKHBIYXNoKSk7XG5cdH1cblxuXHQvLyBHZXQgdGhlIHZhbHVlIG9mIGFuIGVsZW1lbnQgYXQgYW4gYWRkcmVzc1xuXHRnZXRWYWx1ZUF0QWRkcmVzcyAocE9iamVjdCwgcEFkZHJlc3MpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5vYmplY3RBZGRyZXNzUmVzb2x2ZXIuZ2V0VmFsdWVBdEFkZHJlc3MocE9iamVjdCwgcEFkZHJlc3MpO1xuXHR9XG5cblx0Ly8gU2V0IHRoZSB2YWx1ZSBvZiBhbiBlbGVtZW50IGJ5IGl0cyBoYXNoXG5cdHNldFZhbHVlQnlIYXNoKHBPYmplY3QsIHBIYXNoLCBwVmFsdWUpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5zZXRWYWx1ZUF0QWRkcmVzcyhwT2JqZWN0LCB0aGlzLnJlc29sdmVIYXNoQWRkcmVzcyhwSGFzaCksIHBWYWx1ZSk7XG5cdH1cblxuXG5cdC8vIFNldCB0aGUgdmFsdWUgb2YgYW4gZWxlbWVudCBhdCBhbiBhZGRyZXNzXG5cdHNldFZhbHVlQXRBZGRyZXNzIChwT2JqZWN0LCBwQWRkcmVzcywgcFZhbHVlKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMub2JqZWN0QWRkcmVzc1Jlc29sdmVyLnNldFZhbHVlQXRBZGRyZXNzKHBPYmplY3QsIHBBZGRyZXNzLCBwVmFsdWUpO1xuXHR9XG5cblx0Ly8gVmFsaWRhdGUgdGhlIGNvbnNpc3RlbmN5IG9mIGFuIG9iamVjdCBhZ2FpbnN0IHRoZSBzY2hlbWFcblx0dmFsaWRhdGUocE9iamVjdClcblx0e1xuXHRcdGxldCB0bXBWYWxpZGF0aW9uRGF0YSA9XG5cdFx0e1xuXHRcdFx0RXJyb3I6IG51bGwsXG5cdFx0XHRFcnJvcnM6IFtdLFxuXHRcdFx0TWlzc2luZ0VsZW1lbnRzOltdXG5cdFx0fTtcblxuXHRcdGlmICh0eXBlb2YocE9iamVjdCkgIT09ICdvYmplY3QnKVxuXHRcdHtcblx0XHRcdHRtcFZhbGlkYXRpb25EYXRhLkVycm9yID0gdHJ1ZTtcblx0XHRcdHRtcFZhbGlkYXRpb25EYXRhLkVycm9ycy5wdXNoKGBFeHBlY3RlZCBwYXNzZWQgaW4gb2JqZWN0IHRvIGJlIHR5cGUgb2JqZWN0IGJ1dCB3YXMgcGFzc2VkIGluICR7dHlwZW9mKHBPYmplY3QpfWApO1xuXHRcdH1cblxuXHRcdGxldCBhZGRWYWxpZGF0aW9uRXJyb3IgPSAocEFkZHJlc3MsIHBFcnJvck1lc3NhZ2UpID0+XG5cdFx0e1xuXHRcdFx0dG1wVmFsaWRhdGlvbkRhdGEuRXJyb3IgPSB0cnVlO1xuXHRcdFx0dG1wVmFsaWRhdGlvbkRhdGEuRXJyb3JzLnB1c2goYEVsZW1lbnQgYXQgYWRkcmVzcyBcIiR7cEFkZHJlc3N9XCIgJHtwRXJyb3JNZXNzYWdlfS5gKTtcblx0XHR9O1xuXG5cdFx0Ly8gTm93IGVudW1lcmF0ZSB0aHJvdWdoIHRoZSB2YWx1ZXMgYW5kIGNoZWNrIGZvciBhbm9tYWxpZXMgYmFzZWQgb24gdGhlIHNjaGVtYVxuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5lbGVtZW50QWRkcmVzc2VzLmxlbmd0aDsgaSsrKVxuXHRcdHtcblx0XHRcdGxldCB0bXBEZXNjcmlwdG9yID0gdGhpcy5nZXREZXNjcmlwdG9yKHRoaXMuZWxlbWVudEFkZHJlc3Nlc1tpXSk7XG5cdFx0XHRsZXQgdG1wVmFsdWUgPSB0aGlzLmdldFZhbHVlQXRBZGRyZXNzKHBPYmplY3QsIHRtcERlc2NyaXB0b3IuQWRkcmVzcyk7XG5cblx0XHRcdGlmICh0eXBlb2YodG1wVmFsdWUpID09ICd1bmRlZmluZWQnKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBUaGlzIHdpbGwgdGVjaG5pY2FsbHkgbWVhbiB0aGF0IGBPYmplY3QuU29tZS5WYWx1ZSA9IHVuZGVmaW5lZGAgd2lsbCBlbmQgdXAgc2hvd2luZyBhcyBcIm1pc3NpbmdcIlxuXHRcdFx0XHQvLyBUT0RPOiBEbyB3ZSB3YW50IHRvIGRvIGEgZGlmZmVyZW50IG1lc3NhZ2UgYmFzZWQgb24gaWYgdGhlIHByb3BlcnR5IGV4aXN0cyBidXQgaXMgdW5kZWZpbmVkP1xuXHRcdFx0XHR0bXBWYWxpZGF0aW9uRGF0YS5NaXNzaW5nRWxlbWVudHMucHVzaCh0bXBEZXNjcmlwdG9yLkFkZHJlc3MpO1xuXHRcdFx0XHRpZiAodG1wRGVzY3JpcHRvci5SZXF1aXJlZCB8fCB0aGlzLm9wdGlvbnMuc3RyaWN0KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YWRkVmFsaWRhdGlvbkVycm9yKHRtcERlc2NyaXB0b3IuQWRkcmVzcywgJ2lzIGZsYWdnZWQgUkVRVUlSRUQgYnV0IGlzIG5vdCBzZXQgaW4gdGhlIG9iamVjdCcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIE5vdyBzZWUgaWYgdGhlcmUgaXMgYSBkYXRhIHR5cGUgc3BlY2lmaWVkIGZvciB0aGlzIGVsZW1lbnRcblx0XHRcdGlmICh0bXBEZXNjcmlwdG9yLkRhdGFUeXBlKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdG1wRWxlbWVudFR5cGUgPSB0eXBlb2YodG1wVmFsdWUpO1xuXHRcdFx0XHRzd2l0Y2godG1wRGVzY3JpcHRvci5EYXRhVHlwZS50b1N0cmluZygpLnRyaW0oKS50b0xvd2VyQ2FzZSgpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y2FzZSAnc3RyaW5nJzpcblx0XHRcdFx0XHRcdGlmICh0bXBFbGVtZW50VHlwZSAhPSAnc3RyaW5nJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YWRkVmFsaWRhdGlvbkVycm9yKHRtcERlc2NyaXB0b3IuQWRkcmVzcywgYGhhcyBhIERhdGFUeXBlICR7dG1wRGVzY3JpcHRvci5EYXRhVHlwZX0gYnV0IGlzIG9mIHRoZSB0eXBlICR7dG1wRWxlbWVudFR5cGV9YCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdGNhc2UgJ251bWJlcic6XG5cdFx0XHRcdFx0XHRpZiAodG1wRWxlbWVudFR5cGUgIT0gJ251bWJlcicpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGFkZFZhbGlkYXRpb25FcnJvcih0bXBEZXNjcmlwdG9yLkFkZHJlc3MsIGBoYXMgYSBEYXRhVHlwZSAke3RtcERlc2NyaXB0b3IuRGF0YVR5cGV9IGJ1dCBpcyBvZiB0aGUgdHlwZSAke3RtcEVsZW1lbnRUeXBlfWApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlICdpbnRlZ2VyJzpcblx0XHRcdFx0XHRcdGlmICh0bXBFbGVtZW50VHlwZSAhPSAnbnVtYmVyJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YWRkVmFsaWRhdGlvbkVycm9yKHRtcERlc2NyaXB0b3IuQWRkcmVzcywgYGhhcyBhIERhdGFUeXBlICR7dG1wRGVzY3JpcHRvci5EYXRhVHlwZX0gYnV0IGlzIG9mIHRoZSB0eXBlICR7dG1wRWxlbWVudFR5cGV9YCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCB0bXBWYWx1ZVN0cmluZyA9IHRtcFZhbHVlLnRvU3RyaW5nKCk7XG5cdFx0XHRcdFx0XHRcdGlmICh0bXBWYWx1ZVN0cmluZy5pbmRleE9mKCcuJykgPiAtMSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdC8vIFRPRE86IElzIHRoaXMgYW4gZXJyb3I/XG5cdFx0XHRcdFx0XHRcdFx0YWRkVmFsaWRhdGlvbkVycm9yKHRtcERlc2NyaXB0b3IuQWRkcmVzcywgYGhhcyBhIERhdGFUeXBlICR7dG1wRGVzY3JpcHRvci5EYXRhVHlwZX0gYnV0IGhhcyBhIGRlY2ltYWwgcG9pbnQgaW4gdGhlIG51bWJlci5gKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlICdmbG9hdCc6XG5cdFx0XHRcdFx0XHRpZiAodG1wRWxlbWVudFR5cGUgIT0gJ251bWJlcicpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGFkZFZhbGlkYXRpb25FcnJvcih0bXBEZXNjcmlwdG9yLkFkZHJlc3MsIGBoYXMgYSBEYXRhVHlwZSAke3RtcERlc2NyaXB0b3IuRGF0YVR5cGV9IGJ1dCBpcyBvZiB0aGUgdHlwZSAke3RtcEVsZW1lbnRUeXBlfWApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlICdEYXRlVGltZSc6XG5cdFx0XHRcdFx0XHRsZXQgdG1wVmFsdWVEYXRlID0gbmV3IERhdGUodG1wVmFsdWUpO1xuXHRcdFx0XHRcdFx0aWYgKHRtcFZhbHVlRGF0ZS50b1N0cmluZygpID09ICdJbnZhbGlkIERhdGUnKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRhZGRWYWxpZGF0aW9uRXJyb3IodG1wRGVzY3JpcHRvci5BZGRyZXNzLCBgaGFzIGEgRGF0YVR5cGUgJHt0bXBEZXNjcmlwdG9yLkRhdGFUeXBlfSBidXQgaXMgbm90IHBhcnNhYmxlIGFzIGEgRGF0ZSBieSBKYXZhc2NyaXB0YCk7XG5cdFx0XHRcdFx0XHR9XG5cdFxuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHQvLyBDaGVjayBpZiB0aGlzIGlzIGEgc3RyaW5nLCBpbiB0aGUgZGVmYXVsdCBjYXNlXG5cdFx0XHRcdFx0XHQvLyBOb3RlIHRoaXMgaXMgb25seSB3aGVuIGEgRGF0YVR5cGUgaXMgc3BlY2lmaWVkIGFuZCBpdCBpcyBhbiB1bnJlY29nbml6ZWQgZGF0YSB0eXBlLlxuXHRcdFx0XHRcdFx0aWYgKHRtcEVsZW1lbnRUeXBlICE9ICdzdHJpbmcnKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRhZGRWYWxpZGF0aW9uRXJyb3IodG1wRGVzY3JpcHRvci5BZGRyZXNzLCBgaGFzIGEgRGF0YVR5cGUgJHt0bXBEZXNjcmlwdG9yLkRhdGFUeXBlfSAod2hpY2ggYXV0by1jb252ZXJ0ZWQgdG8gU3RyaW5nIGJlY2F1c2UgaXQgd2FzIHVucmVjb2duaXplZCkgYnV0IGlzIG9mIHRoZSB0eXBlICR7dG1wRWxlbWVudFR5cGV9YCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0bXBWYWxpZGF0aW9uRGF0YTtcblx0fVxuXG5cdC8vIFJldHVybnMgYSBkZWZhdWx0IHZhbHVlLCBvciwgdGhlIGRlZmF1bHQgdmFsdWUgZm9yIHRoZSBkYXRhIHR5cGUgKHdoaWNoIGlzIG92ZXJyaWRhYmxlIHdpdGggY29uZmlndXJhdGlvbilcblx0Z2V0RGVmYXVsdFZhbHVlKHBEZXNjcmlwdG9yKVxuXHR7XG5cdFx0aWYgKHBEZXNjcmlwdG9yLmhhc093blByb3BlcnR5KCdEZWZhdWx0JykpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHBEZXNjcmlwdG9yLkRlZmF1bHQ7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHQvLyBEZWZhdWx0IHRvIGEgbnVsbCBpZiBpdCBkb2Vzbid0IGhhdmUgYSB0eXBlIHNwZWNpZmllZC5cblx0XHRcdC8vIFRoaXMgd2lsbCBlbnN1cmUgYSBwbGFjZWhvbGRlciBpcyBjcmVhdGVkIGJ1dCBpc24ndCBtaXNpbnRlcnByZXRlZC5cblx0XHRcdGxldCB0bXBEYXRhVHlwZSA9IChwRGVzY3JpcHRvci5oYXNPd25Qcm9wZXJ0eSgnRGF0YVR5cGUnKSkgPyBwRGVzY3JpcHRvci5EYXRhVHlwZSA6ICdTdHJpbmcnO1xuXHRcdFx0aWYgKHRoaXMub3B0aW9ucy5kZWZhdWx0VmFsdWVzLmhhc093blByb3BlcnR5KHRtcERhdGFUeXBlKSlcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHRoaXMub3B0aW9ucy5kZWZhdWx0VmFsdWVzW3RtcERhdGFUeXBlXTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0Ly8gZ2l2ZSB1cCBhbmQgcmV0dXJuIG51bGxcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gRW51bWVyYXRlIHRocm91Z2ggdGhlIHNjaGVtYSBhbmQgcG9wdWxhdGUgZGVmYXVsdCB2YWx1ZXMgaWYgdGhleSBkb24ndCBleGlzdC5cblx0cG9wdWxhdGVEZWZhdWx0cyhwT2JqZWN0LCBwT3ZlcndyaXRlUHJvcGVydGllcylcblx0e1xuXHRcdHJldHVybiB0aGlzLnBvcHVsYXRlT2JqZWN0KHBPYmplY3QsIHBPdmVyd3JpdGVQcm9wZXJ0aWVzLFxuXHRcdFx0Ly8gVGhpcyBqdXN0IHNldHMgdXAgYSBzaW1wbGUgZmlsdGVyIHRvIHNlZSBpZiB0aGVyZSBpcyBhIGRlZmF1bHQgc2V0LlxuXHRcdFx0KHBEZXNjcmlwdG9yKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gcERlc2NyaXB0b3IuaGFzT3duUHJvcGVydHkoJ0RlZmF1bHQnKTtcblx0XHRcdH0pO1xuXHR9XG5cblx0Ly8gRm9yY2VmdWxseSBwb3B1bGF0ZSBhbGwgdmFsdWVzIGV2ZW4gaWYgdGhleSBkb24ndCBoYXZlIGRlZmF1bHRzLlxuXHQvLyBCYXNlZCBvbiB0eXBlLCB0aGlzIGNhbiBkbyB1bmV4cGVjdGVkIHRoaW5ncy5cblx0cG9wdWxhdGVPYmplY3QocE9iamVjdCwgcE92ZXJ3cml0ZVByb3BlcnRpZXMsIGZGaWx0ZXIpXG5cdHtcblx0XHQvLyBBdXRvbWF0aWNhbGx5IGNyZWF0ZSBhbiBvYmplY3QgaWYgb25lIGlzbid0IHBhc3NlZCBpbi5cblx0XHRsZXQgdG1wT2JqZWN0ID0gKHR5cGVvZihwT2JqZWN0KSA9PT0gJ29iamVjdCcpID8gcE9iamVjdCA6IHt9O1xuXHRcdC8vIERlZmF1bHQgdG8gKk5PVCBPVkVSV1JJVElORyogcHJvcGVydGllc1xuXHRcdGxldCB0bXBPdmVyd3JpdGVQcm9wZXJ0aWVzID0gKHR5cGVvZihwT3ZlcndyaXRlUHJvcGVydGllcykgPT0gJ3VuZGVmaW5lZCcpID8gZmFsc2UgOiBwT3ZlcndyaXRlUHJvcGVydGllcztcblx0XHQvLyBUaGlzIGlzIGEgZmlsdGVyIGZ1bmN0aW9uLCB3aGljaCBpcyBwYXNzZWQgdGhlIHNjaGVtYSBhbmQgYWxsb3dzIGNvbXBsZXggZmlsdGVyaW5nIG9mIHBvcHVsYXRpb25cblx0XHQvLyBUaGUgZGVmYXVsdCBmaWx0ZXIgZnVuY3Rpb24ganVzdCByZXR1cm5zIHRydWUsIHBvcHVsYXRpbmcgZXZlcnl0aGluZy5cblx0XHRsZXQgdG1wRmlsdGVyRnVuY3Rpb24gPSAodHlwZW9mKGZGaWx0ZXIpID09ICdmdW5jdGlvbicpID8gZkZpbHRlciA6IChwRGVzY3JpcHRvcikgPT4geyByZXR1cm4gdHJ1ZTsgfTtcblxuXHRcdHRoaXMuZWxlbWVudEFkZHJlc3Nlcy5mb3JFYWNoKFxuXHRcdFx0KHBBZGRyZXNzKSA9PlxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdG1wRGVzY3JpcHRvciA9IHRoaXMuZ2V0RGVzY3JpcHRvcihwQWRkcmVzcyk7XG5cdFx0XHRcdC8vIENoZWNrIHRoZSBmaWx0ZXIgZnVuY3Rpb24gdG8gc2VlIGlmIHRoaXMgaXMgYW4gYWRkcmVzcyB3ZSB3YW50IHRvIHNldCB0aGUgdmFsdWUgZm9yLlxuXHRcdFx0XHRpZiAodG1wRmlsdGVyRnVuY3Rpb24odG1wRGVzY3JpcHRvcikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBJZiB3ZSBhcmUgb3ZlcndyaXRpbmcgcHJvcGVydGllcyBPUiB0aGUgcHJvcGVydHkgZG9lcyBub3QgZXhpc3Rcblx0XHRcdFx0XHRpZiAodG1wT3ZlcndyaXRlUHJvcGVydGllcyB8fCAhdGhpcy5jaGVja0FkZHJlc3NFeGlzdHModG1wT2JqZWN0LCBwQWRkcmVzcykpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dGhpcy5zZXRWYWx1ZUF0QWRkcmVzcyh0bXBPYmplY3QsIHBBZGRyZXNzLCB0aGlzLmdldERlZmF1bHRWYWx1ZSh0bXBEZXNjcmlwdG9yKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdHJldHVybiB0bXBPYmplY3Q7XG5cdH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTWFueWZlc3Q7Il19
