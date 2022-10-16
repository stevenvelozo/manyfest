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
	serialize()
	{
		return JSON.stringify(this.getManifest());
	}

	getManifest()
	{
		let tmpManifest = (
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
		if (this.elementHashes.hasOwnProperty(pHash) || this.hashTranslations.translationTable.hasOwnProperty(pHash))
		{
			return this.getDescriptor(this.elementHashes[this.hashTranslations.translate(pHash)]);
		}
		else
		{
			this.logError(`(${this.scope}) Error in getDescriptorByHash; the Hash ${pHash} doesn't exist in the schema.`);
			return undefined;
		}
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
		if (this.elementHashes.hasOwnProperty(pHash) || this.hashTranslations.translationTable.hasOwnProperty(pHash))
		{
			return this.checkAddressExists(pObject, this.elementHashes[this.hashTranslations.translate(pHash)]);
		}
		else
		{
			this.logError(`(${this.scope}) Error in checkAddressExistsByHash; the Hash ${pHash} doesn't exist in the schema.`);
			return undefined;
		}
	}

	// Check if an element exists at an address
	checkAddressExists (pObject, pAddress)
	{
		return this.objectAddressResolver.checkAddressExists(pObject, pAddress);
	}


	// Get the value of an element by its hash
	getValueByHash (pObject, pHash)
	{
		if (this.elementHashes.hasOwnProperty(pHash) || this.hashTranslations.translationTable.hasOwnProperty(pHash))
		{
			return this.getValueAtAddress(pObject, this.elementHashes[this.hashTranslations.translate(pHash)]);
		}
		else
		{
			this.logError(`(${this.scope}) Error in getValueByHash; the Hash ${pHash} doesn't exist in the schema.`);
			return undefined;
		}
	}

	// Get the value of an element at an address
	getValueAtAddress (pObject, pAddress)
	{
		return this.objectAddressResolver.getValueAtAddress(pObject, pAddress);
	}

	// Set the value of an element by its hash
	setValueByHash(pObject, pHash, pValue)
	{
		if (this.elementHashes.hasOwnProperty(pHash) || this.hashTranslations.translationTable.hasOwnProperty(pHash))
		{
			return this.setValueAtAddress(pObject, this.elementHashes[this.hashTranslations.translate(pHash)], pValue);
		}
		else
		{
			this.logError(`(${this.scope}) Error in setValueByHash; the Hash ${pHash} doesn't exist in the schema.  Value ${pValue} will not be written!`);
			return undefined;
		}
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvTWFueWZlc3QtQnJvd3Nlci1TaGltLmpzIiwic291cmNlL01hbnlmZXN0LUhhc2hUcmFuc2xhdGlvbi5qcyIsInNvdXJjZS9NYW55ZmVzdC1Mb2dUb0NvbnNvbGUuanMiLCJzb3VyY2UvTWFueWZlc3QtT2JqZWN0QWRkcmVzc1Jlc29sdmVyLmpzIiwic291cmNlL01hbnlmZXN0LVNjaGVtYU1hbmlwdWxhdGlvbi5qcyIsInNvdXJjZS9NYW55ZmVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4a0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiLyoqXG4qIEBsaWNlbnNlIE1JVFxuKiBAYXV0aG9yIDxzdGV2ZW5AdmVsb3pvLmNvbT5cbiovXG5cbi8qKlxuKiBNYW55ZmVzdCBicm93c2VyIHNoaW0gbG9hZGVyXG4qL1xuXG4vLyBMb2FkIHRoZSBtYW55ZmVzdCBtb2R1bGUgaW50byB0aGUgYnJvd3NlciBnbG9iYWwgYXV0b21hdGljYWxseS5cbnZhciBsaWJNYW55ZmVzdCA9IHJlcXVpcmUoJy4vTWFueWZlc3QuanMnKTtcblxuaWYgKHR5cGVvZih3aW5kb3cpID09PSAnb2JqZWN0Jykgd2luZG93Lk1hbnlmZXN0ID0gbGliTWFueWZlc3Q7XG5cbm1vZHVsZS5leHBvcnRzID0gbGliTWFueWZlc3Q7IiwiLyoqXG4qIEBsaWNlbnNlIE1JVFxuKiBAYXV0aG9yIDxzdGV2ZW5AdmVsb3pvLmNvbT5cbiovXG5sZXQgbGliU2ltcGxlTG9nID0gcmVxdWlyZSgnLi9NYW55ZmVzdC1Mb2dUb0NvbnNvbGUuanMnKTtcblxuLyoqXG4qIEhhc2ggVHJhbnNsYXRpb25cbipcbiogVGhpcyBpcyBhIHZlcnkgc2ltcGxlIHRyYW5zbGF0aW9uIHRhYmxlIGZvciBoYXNoZXMsIHdoaWNoIGFsbG93cyB0aGUgc2FtZSBzY2hlbWEgdG8gcmVzb2x2ZSBcbiogZGlmZmVyZW50bHkgYmFzZWQgb24gYSBsb2FkZWQgdHJhbnNsYXRpb24gdGFibGUuXG4qXG4qIFRoaXMgaXMgdG8gcHJldmVudCB0aGUgcmVxdWlyZW1lbnQgZm9yIG11dGF0aW5nIHNjaGVtYXMgb3ZlciBhbmQgb3ZlciBhZ2FpbiB3aGVuIHdlIHdhbnQgdG9cbiogcmV1c2UgdGhlIHN0cnVjdHVyZSBidXQgbG9vayB1cCBkYXRhIGVsZW1lbnRzIGJ5IGRpZmZlcmVudCBhZGRyZXNzZXMuXG4qXG4qIE9uZSBzaWRlLWVmZmVjdCBvZiB0aGlzIGlzIHRoYXQgYSB0cmFuc2xhdGlvbiB0YWJsZSBjYW4gXCJvdmVycmlkZVwiIHRoZSBidWlsdC1pbiBoYXNoZXMsIHNpbmNlXG4qIHRoaXMgaXMgYWx3YXlzIHVzZWQgdG8gcmVzb2x2ZSBoYXNoZXMgYmVmb3JlIGFueSBvZiB0aGUgZnVuY3Rpb25DYWxsQnlIYXNoKHBIYXNoLCAuLi4pIHBlcmZvcm1cbiogdGhlaXIgbG9va3VwcyBieSBoYXNoLlxuKlxuKiBAY2xhc3MgTWFueWZlc3RIYXNoVHJhbnNsYXRpb25cbiovXG5jbGFzcyBNYW55ZmVzdEhhc2hUcmFuc2xhdGlvblxue1xuXHRjb25zdHJ1Y3RvcihwSW5mb0xvZywgcEVycm9yTG9nKVxuXHR7XG5cdFx0Ly8gV2lyZSBpbiBsb2dnaW5nXG5cdFx0dGhpcy5sb2dJbmZvID0gKHR5cGVvZihwSW5mb0xvZykgPT09ICdmdW5jdGlvbicpID8gcEluZm9Mb2cgOiBsaWJTaW1wbGVMb2c7XG5cdFx0dGhpcy5sb2dFcnJvciA9ICh0eXBlb2YocEVycm9yTG9nKSA9PT0gJ2Z1bmN0aW9uJykgPyBwRXJyb3JMb2cgOiBsaWJTaW1wbGVMb2c7XG5cbiAgICAgICAgdGhpcy50cmFuc2xhdGlvblRhYmxlID0ge307XG5cdH1cblxuICAgIHRyYW5zbGF0aW9uQ291bnQoKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHRoaXMudHJhbnNsYXRpb25UYWJsZSkubGVuZ3RoO1xuICAgIH1cblxuICAgIGFkZFRyYW5zbGF0aW9uKHBUcmFuc2xhdGlvbilcbiAgICB7XG4gICAgICAgIC8vIFRoaXMgYWRkcyBhIHRyYW5zbGF0aW9uIGluIHRoZSBmb3JtIG9mOlxuICAgICAgICAvLyB7IFwiU291cmNlSGFzaFwiOiBcIkRlc3RpbmF0aW9uSGFzaFwiLCBcIlNlY29uZFNvdXJjZUhhc2hcIjpcIlNlY29uZERlc3RpbmF0aW9uSGFzaFwiIH1cbiAgICAgICAgaWYgKHR5cGVvZihwVHJhbnNsYXRpb24pICE9ICdvYmplY3QnKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmxvZ0Vycm9yKGBIYXNoIHRyYW5zbGF0aW9uIGFkZFRyYW5zbGF0aW9uIGV4cGVjdGVkIGEgdHJhbnNsYXRpb24gYmUgdHlwZSBvYmplY3QgYnV0IHdhcyBwYXNzZWQgaW4gJHt0eXBlb2YocFRyYW5zbGF0aW9uKX1gKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0bXBUcmFuc2xhdGlvblNvdXJjZXMgPSBPYmplY3Qua2V5cyhwVHJhbnNsYXRpb24pXG5cbiAgICAgICAgdG1wVHJhbnNsYXRpb25Tb3VyY2VzLmZvckVhY2goXG4gICAgICAgICAgICAocFRyYW5zbGF0aW9uU291cmNlKSA9PlxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YocFRyYW5zbGF0aW9uW3BUcmFuc2xhdGlvblNvdXJjZV0pICE9ICdzdHJpbmcnKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2dFcnJvcihgSGFzaCB0cmFuc2xhdGlvbiBhZGRUcmFuc2xhdGlvbiBleHBlY3RlZCBhIHRyYW5zbGF0aW9uIGRlc3RpbmF0aW9uIGhhc2ggZm9yIFske3BUcmFuc2xhdGlvblNvdXJjZX1dIHRvIGJlIGEgc3RyaW5nIGJ1dCB0aGUgcmVmZXJyYW50IHdhcyBhICR7dHlwZW9mKHBUcmFuc2xhdGlvbltwVHJhbnNsYXRpb25Tb3VyY2VdKX1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFuc2xhdGlvblRhYmxlW3BUcmFuc2xhdGlvblNvdXJjZV0gPSBwVHJhbnNsYXRpb25bcFRyYW5zbGF0aW9uU291cmNlXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZW1vdmVUcmFuc2xhdGlvbkhhc2gocFRyYW5zbGF0aW9uSGFzaClcbiAgICB7XG4gICAgICAgIGlmICh0aGlzLnRyYW5zbGF0aW9uVGFibGUuaGFzT3duUHJvcGVydHkocFRyYW5zbGF0aW9uSGFzaCkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0aGlzLnRyYW5zbGF0aW9uVGFibGVbcFRyYW5zbGF0aW9uSGFzaF07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUaGlzIHJlbW92ZXMgdHJhbnNsYXRpb25zLlxuICAgIC8vIElmIHBhc3NlZCBhIHN0cmluZywganVzdCByZW1vdmVzIHRoZSBzaW5nbGUgb25lLlxuICAgIC8vIElmIHBhc3NlZCBhbiBvYmplY3QsIGl0IGRvZXMgYWxsIHRoZSBzb3VyY2Uga2V5cy5cbiAgICByZW1vdmVUcmFuc2xhdGlvbihwVHJhbnNsYXRpb24pXG4gICAge1xuICAgICAgICBpZiAodHlwZW9mKHBUcmFuc2xhdGlvbikgPT0gJ3N0cmluZycpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlVHJhbnNsYXRpb25IYXNoKHBUcmFuc2xhdGlvbik7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YocFRyYW5zbGF0aW9uKSA9PSAnb2JqZWN0JylcbiAgICAgICAge1xuICAgICAgICAgICAgbGV0IHRtcFRyYW5zbGF0aW9uU291cmNlcyA9IE9iamVjdC5rZXlzKHBUcmFuc2xhdGlvbilcblxuICAgICAgICAgICAgdG1wVHJhbnNsYXRpb25Tb3VyY2VzLmZvckVhY2goXG4gICAgICAgICAgICAgICAgKHBUcmFuc2xhdGlvblNvdXJjZSkgPT5cbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlVHJhbnNsYXRpb24ocFRyYW5zbGF0aW9uU291cmNlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5sb2dFcnJvcihgSGFzaCB0cmFuc2xhdGlvbiByZW1vdmVUcmFuc2xhdGlvbiBleHBlY3RlZCBlaXRoZXIgYSBzdHJpbmcgb3IgYW4gb2JqZWN0IGJ1dCB0aGUgcGFzc2VkLWluIHRyYW5zbGF0aW9uIHdhcyB0eXBlICR7dHlwZW9mKHBUcmFuc2xhdGlvbil9YCk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbGVhclRyYW5zbGF0aW9ucygpXG4gICAge1xuICAgICAgICB0aGlzLnRyYW5zbGF0aW9uVGFibGUgPSB7fTtcbiAgICB9XG5cbiAgICB0cmFuc2xhdGUocFRyYW5zbGF0aW9uKVxuICAgIHtcbiAgICAgICAgaWYgKHRoaXMudHJhbnNsYXRpb25UYWJsZS5oYXNPd25Qcm9wZXJ0eShwVHJhbnNsYXRpb24pKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy50cmFuc2xhdGlvblRhYmxlW3BUcmFuc2xhdGlvbl07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gcFRyYW5zbGF0aW9uO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hbnlmZXN0SGFzaFRyYW5zbGF0aW9uOyIsIi8qKlxuKiBAbGljZW5zZSBNSVRcbiogQGF1dGhvciA8c3RldmVuQHZlbG96by5jb20+XG4qL1xuXG4vKipcbiogTWFueWZlc3Qgc2ltcGxlIGxvZ2dpbmcgc2hpbSAoZm9yIGJyb3dzZXIgYW5kIGRlcGVuZGVuY3ktZnJlZSBydW5uaW5nKVxuKi9cblxuY29uc3QgbG9nVG9Db25zb2xlID0gKHBMb2dMaW5lLCBwTG9nT2JqZWN0KSA9Plxue1xuICAgIGxldCB0bXBMb2dMaW5lID0gKHR5cGVvZihwTG9nTGluZSkgPT09ICdzdHJpbmcnKSA/IHBMb2dMaW5lIDogJyc7XG5cbiAgICBjb25zb2xlLmxvZyhgW01hbnlmZXN0XSAke3RtcExvZ0xpbmV9YCk7XG5cbiAgICBpZiAocExvZ09iamVjdCkgY29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkocExvZ09iamVjdCkpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBsb2dUb0NvbnNvbGU7IiwiLyoqXG4qIEBsaWNlbnNlIE1JVFxuKiBAYXV0aG9yIDxzdGV2ZW5AdmVsb3pvLmNvbT5cbiovXG5sZXQgbGliU2ltcGxlTG9nID0gcmVxdWlyZSgnLi9NYW55ZmVzdC1Mb2dUb0NvbnNvbGUuanMnKTtcblxuLyoqXG4qIE9iamVjdCBBZGRyZXNzIFJlc29sdmVyXG4qIFxuKiBJTVBPUlRBTlQgTk9URTogVGhpcyBjb2RlIGlzIGludGVudGlvbmFsbHkgbW9yZSB2ZXJib3NlIHRoYW4gbmVjZXNzYXJ5LCB0b1xuKiAgICAgICAgICAgICAgICAgYmUgZXh0cmVtZWx5IGNsZWFyIHdoYXQgaXMgZ29pbmcgb24gaW4gdGhlIHJlY3Vyc2lvbiBmb3JcbiogICAgICAgICAgICAgICAgIGVhY2ggb2YgdGhlIHRocmVlIGFkZHJlc3MgcmVzb2x1dGlvbiBmdW5jdGlvbnMuXG4qIFxuKiAgICAgICAgICAgICAgICAgQWx0aG91Z2ggdGhlcmUgaXMgc29tZSBvcHBvcnR1bml0eSB0byByZXBlYXQgb3Vyc2VsdmVzIGFcbiogICAgICAgICAgICAgICAgIGJpdCBsZXNzIGluIHRoaXMgY29kZWJhc2UgKGUuZy4gd2l0aCBkZXRlY3Rpb24gb2YgYXJyYXlzXG4qICAgICAgICAgICAgICAgICB2ZXJzdXMgb2JqZWN0cyB2ZXJzdXMgZGlyZWN0IHByb3BlcnRpZXMpLCBpdCBjYW4gbWFrZVxuKiAgICAgICAgICAgICAgICAgZGVidWdnaW5nLi4gY2hhbGxlbmdpbmcuICBUaGUgbWluaWZpZWQgdmVyc2lvbiBvZiB0aGUgY29kZVxuKiAgICAgICAgICAgICAgICAgb3B0aW1pemVzIG91dCBhbG1vc3QgYW55dGhpbmcgcmVwZWF0ZWQgaW4gaGVyZS4gIFNvIHBsZWFzZVxuKiAgICAgICAgICAgICAgICAgYmUga2luZCBhbmQgcmV3aW5kLi4uIG1lYW5pbmcgcGxlYXNlIGtlZXAgdGhlIGNvZGViYXNlIGxlc3NcbiogICAgICAgICAgICAgICAgIHRlcnNlIGFuZCBtb3JlIHZlcmJvc2Ugc28gaHVtYW5zIGNhbiBjb21wcmVoZW5kIGl0LlxuKiAgICAgICAgICAgICAgICAgXG4qXG4qIEBjbGFzcyBNYW55ZmVzdE9iamVjdEFkZHJlc3NSZXNvbHZlclxuKi9cbmNsYXNzIE1hbnlmZXN0T2JqZWN0QWRkcmVzc1Jlc29sdmVyXG57XG5cdGNvbnN0cnVjdG9yKHBJbmZvTG9nLCBwRXJyb3JMb2cpXG5cdHtcblx0XHQvLyBXaXJlIGluIGxvZ2dpbmdcblx0XHR0aGlzLmxvZ0luZm8gPSAodHlwZW9mKHBJbmZvTG9nKSA9PSAnZnVuY3Rpb24nKSA/IHBJbmZvTG9nIDogbGliU2ltcGxlTG9nO1xuXHRcdHRoaXMubG9nRXJyb3IgPSAodHlwZW9mKHBFcnJvckxvZykgPT0gJ2Z1bmN0aW9uJykgPyBwRXJyb3JMb2cgOiBsaWJTaW1wbGVMb2c7XG5cdH1cblxuXHQvLyBXaGVuIGEgYm94ZWQgcHJvcGVydHkgaXMgcGFzc2VkIGluLCBpdCBzaG91bGQgaGF2ZSBxdW90ZXMgb2Ygc29tZVxuXHQvLyBraW5kIGFyb3VuZCBpdC5cblx0Ly9cblx0Ly8gRm9yIGluc3RhbmNlOlxuXHQvLyBcdFx0TXlWYWx1ZXNbJ05hbWUnXVxuXHQvLyBcdFx0TXlWYWx1ZXNbXCJBZ2VcIl1cblx0Ly8gXHRcdE15VmFsdWVzW2BDb3N0YF1cblx0Ly9cblx0Ly8gVGhpcyBmdW5jdGlvbiByZW1vdmVzIHRoZSB3cmFwcGluZyBxdW90ZXMuXG5cdC8vXG5cdC8vIFBsZWFzZSBub3RlIGl0ICpET0VTIE5PVCBQQVJTRSogdGVtcGxhdGUgbGl0ZXJhbHMsIHNvIGJhY2t0aWNrcyBqdXN0XG5cdC8vIGVuZCB1cCBkb2luZyB0aGUgc2FtZSB0aGluZyBhcyBvdGhlciBxdW90ZSB0eXBlcy5cblx0Ly9cblx0Ly8gVE9ETzogU2hvdWxkIHRlbXBsYXRlIGxpdGVyYWxzIGJlIHByb2Nlc3NlZD8gIElmIHNvIHdoYXQgc3RhdGUgZG8gdGhleSBoYXZlIGFjY2VzcyB0bz9cblx0Y2xlYW5XcmFwQ2hhcmFjdGVycyAocENoYXJhY3RlciwgcFN0cmluZylcblx0e1xuXHRcdGlmIChwU3RyaW5nLnN0YXJ0c1dpdGgocENoYXJhY3RlcikgJiYgcFN0cmluZy5lbmRzV2l0aChwQ2hhcmFjdGVyKSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gcFN0cmluZy5zdWJzdHJpbmcoMSwgcFN0cmluZy5sZW5ndGggLSAxKTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHJldHVybiBwU3RyaW5nO1xuXHRcdH1cblx0fVxuXG5cdC8vIENoZWNrIGlmIGFuIGFkZHJlc3MgZXhpc3RzLlxuXHQvL1xuXHQvLyBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHRoZSBnZXRWYWx1ZUF0QWRkcmVzcyBmdW5jdGlvbiBpcyBhbWJpZ3VvdXMgb24gXG5cdC8vIHdoZXRoZXIgdGhlIGVsZW1lbnQvcHJvcGVydHkgaXMgYWN0dWFsbHkgdGhlcmUgb3Igbm90IChpdCByZXR1cm5zIFxuXHQvLyB1bmRlZmluZWQgd2hldGhlciB0aGUgcHJvcGVydHkgZXhpc3RzIG9yIG5vdCkuICBUaGlzIGZ1bmN0aW9uIGNoZWNrcyBmb3Jcblx0Ly8gZXhpc3RhbmNlIGFuZCByZXR1cm5zIHRydWUgb3IgZmFsc2UgZGVwZW5kZW50LlxuXHRjaGVja0FkZHJlc3NFeGlzdHMgKHBPYmplY3QsIHBBZGRyZXNzKVxuXHR7XG5cdFx0Ly8gVE9ETzogU2hvdWxkIHRoZXNlIHRocm93IGFuIGVycm9yP1xuXHRcdC8vIE1ha2Ugc3VyZSBwT2JqZWN0IGlzIGFuIG9iamVjdFxuXHRcdGlmICh0eXBlb2YocE9iamVjdCkgIT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcblx0XHQvLyBNYWtlIHN1cmUgcEFkZHJlc3MgaXMgYSBzdHJpbmdcblx0XHRpZiAodHlwZW9mKHBBZGRyZXNzKSAhPSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuXG5cdFx0Ly8gVE9ETzogTWFrZSB0aGlzIHdvcmsgZm9yIHRoaW5ncyBsaWtlIFNvbWVSb290T2JqZWN0Lk1ldGFkYXRhW1wiU29tZS5QZW9wbGUuVXNlLkJhZC5PYmplY3QuUHJvcGVydHkuTmFtZXNcIl1cblx0XHRsZXQgdG1wU2VwYXJhdG9ySW5kZXggPSBwQWRkcmVzcy5pbmRleE9mKCcuJyk7XG5cblx0XHQvLyBUaGlzIGlzIHRoZSB0ZXJtaW5hbCBhZGRyZXNzIHN0cmluZyAobm8gbW9yZSBkb3RzIHNvIHRoZSBSRUNVU0lPTiBFTkRTIElOIEhFUkUgc29tZWhvdylcblx0XHRpZiAodG1wU2VwYXJhdG9ySW5kZXggPT0gLTEpXG5cdFx0e1xuXHRcdFx0Ly8gQ2hlY2sgaWYgdGhlIGFkZHJlc3MgcmVmZXJzIHRvIGEgYm94ZWQgcHJvcGVydHlcblx0XHRcdGxldCB0bXBCcmFja2V0U3RhcnRJbmRleCA9IHBBZGRyZXNzLmluZGV4T2YoJ1snKTtcblx0XHRcdGxldCB0bXBCcmFja2V0U3RvcEluZGV4ID0gcEFkZHJlc3MuaW5kZXhPZignXScpO1xuXHRcdFx0Ly8gQm94ZWQgZWxlbWVudHMgbG9vayBsaWtlIHRoaXM6XG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbMTBdXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbJ05hbWUnXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzW1wiQWdlXCJdXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbYENvc3RgXVxuXHRcdFx0Ly9cblx0XHRcdC8vIFdoZW4gd2UgYXJlIHBhc3NlZCBTb21lT2JqZWN0W1wiTmFtZVwiXSB0aGlzIGNvZGUgYmVsb3cgcmVjdXJzZXMgYXMgaWYgaXQgd2VyZSBTb21lT2JqZWN0Lk5hbWVcblx0XHRcdC8vIFRoZSByZXF1aXJlbWVudHMgdG8gZGV0ZWN0IGEgYm94ZWQgZWxlbWVudCBhcmU6XG5cdFx0XHQvLyAgICAxKSBUaGUgc3RhcnQgYnJhY2tldCBpcyBhZnRlciBjaGFyYWN0ZXIgMFxuXHRcdFx0aWYgKCh0bXBCcmFja2V0U3RhcnRJbmRleCA+IDApIFxuXHRcdFx0Ly8gICAgMikgVGhlIGVuZCBicmFja2V0IGhhcyBzb21ldGhpbmcgYmV0d2VlbiB0aGVtXG5cdFx0XHRcdCYmICh0bXBCcmFja2V0U3RvcEluZGV4ID4gdG1wQnJhY2tldFN0YXJ0SW5kZXgpIFxuXHRcdFx0Ly8gICAgMykgVGhlcmUgaXMgZGF0YSBcblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggLSB0bXBCcmFja2V0U3RhcnRJbmRleCA+IDApKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBUaGUgXCJOYW1lXCIgb2YgdGhlIE9iamVjdCBjb250YWluZWQgdG9vIHRoZSBsZWZ0IG9mIHRoZSBicmFja2V0XG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5TmFtZSA9IHBBZGRyZXNzLnN1YnN0cmluZygwLCB0bXBCcmFja2V0U3RhcnRJbmRleCkudHJpbSgpO1xuXG5cdFx0XHRcdC8vIElmIHRoZSBzdWJwcm9wZXJ0eSBkb2Vzbid0IHRlc3QgYXMgYSBwcm9wZXIgT2JqZWN0LCBub25lIG9mIHRoZSByZXN0IG9mIHRoaXMgaXMgcG9zc2libGUuXG5cdFx0XHRcdC8vIFRoaXMgaXMgYSByYXJlIGNhc2Ugd2hlcmUgQXJyYXlzIHRlc3RpbmcgYXMgT2JqZWN0cyBpcyB1c2VmdWxcblx0XHRcdFx0aWYgKHR5cGVvZihwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXSkgIT09ICdvYmplY3QnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gVGhlIFwiUmVmZXJlbmNlXCIgdG8gdGhlIHByb3BlcnR5IHdpdGhpbiBpdCwgZWl0aGVyIGFuIGFycmF5IGVsZW1lbnQgb3Igb2JqZWN0IHByb3BlcnR5XG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gcEFkZHJlc3Muc3Vic3RyaW5nKHRtcEJyYWNrZXRTdGFydEluZGV4KzEsIHRtcEJyYWNrZXRTdG9wSW5kZXgpLnRyaW0oKTtcblx0XHRcdFx0Ly8gQXR0ZW1wdCB0byBwYXJzZSB0aGUgcmVmZXJlbmNlIGFzIGEgbnVtYmVyLCB3aGljaCB3aWxsIGJlIHVzZWQgYXMgYW4gYXJyYXkgZWxlbWVudFxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eU51bWJlciA9IHBhcnNlSW50KHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UsIDEwKTtcblxuXHRcdFx0XHQvLyBHdWFyZDogSWYgdGhlIHJlZmVycmFudCBpcyBhIG51bWJlciBhbmQgdGhlIGJveGVkIHByb3BlcnR5IGlzIG5vdCBhbiBhcnJheSwgb3IgdmljZSB2ZXJzYSwgcmV0dXJuIHVuZGVmaW5lZC5cblx0XHRcdFx0Ly8gICAgICAgIFRoaXMgc2VlbXMgY29uZnVzaW5nIHRvIG1lIGF0IGZpcnN0IHJlYWQsIHNvIGV4cGxhaW5hdGlvbjpcblx0XHRcdFx0Ly8gICAgICAgIElzIHRoZSBCb3hlZCBPYmplY3QgYW4gQXJyYXk/ICBUUlVFXG5cdFx0XHRcdC8vICAgICAgICBBbmQgaXMgdGhlIFJlZmVyZW5jZSBpbnNpZGUgdGhlIGJveGVkIE9iamVjdCBub3QgYSBudW1iZXI/IFRSVUVcblx0XHRcdFx0Ly8gICAgICAgIC0tPiAgU28gd2hlbiB0aGVzZSBhcmUgaW4gYWdyZWVtZW50LCBpdCdzIGFuIGltcG9zc2libGUgYWNjZXNzIHN0YXRlXG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdKSA9PSBpc05hTih0bXBCb3hlZFByb3BlcnR5TnVtYmVyKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vICAgIDQpIElmIHRoZSBtaWRkbGUgcGFydCBpcyAqb25seSogYSBudW1iZXIgKG5vIHNpbmdsZSwgZG91YmxlIG9yIGJhY2t0aWNrIHF1b3RlcykgaXQgaXMgYW4gYXJyYXkgZWxlbWVudCxcblx0XHRcdFx0Ly8gICAgICAgb3RoZXJ3aXNlIHdlIHdpbGwgdHJ5IHRvIHRyZWF0IGl0IGFzIGEgZHluYW1pYyBvYmplY3QgcHJvcGVydHkuXG5cdFx0XHRcdGlmIChpc05hTih0bXBCb3hlZFByb3BlcnR5TnVtYmVyKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIFRoaXMgaXNuJ3QgYSBudW1iZXIgLi4uIGxldCdzIHRyZWF0IGl0IGFzIGEgZHluYW1pYyBvYmplY3QgcHJvcGVydHkuXG5cdFx0XHRcdFx0Ly8gV2Ugd291bGQgZXhwZWN0IHRoZSBwcm9wZXJ0eSB0byBiZSB3cmFwcGVkIGluIHNvbWUga2luZCBvZiBxdW90ZXMgc28gc3RyaXAgdGhlbVxuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoJ1wiJywgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycygnYCcsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoXCInXCIsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXG5cdFx0XHRcdFx0Ly8gQ2hlY2sgaWYgdGhlIHByb3BlcnR5IGV4aXN0cy5cblx0XHRcdFx0XHRyZXR1cm4gcE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV0uaGFzT3duUHJvcGVydHkodG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gVXNlIHRoZSBuZXcgaW4gb3BlcmF0b3IgdG8gc2VlIGlmIHRoZSBlbGVtZW50IGlzIGluIHRoZSBhcnJheVxuXHRcdFx0XHRcdHJldHVybiAodG1wQm94ZWRQcm9wZXJ0eU51bWJlciBpbiBwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0Ly8gQ2hlY2sgaWYgdGhlIHByb3BlcnR5IGV4aXN0c1xuXHRcdFx0XHRyZXR1cm4gcE9iamVjdC5oYXNPd25Qcm9wZXJ0eShwQWRkcmVzcyk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRsZXQgdG1wU3ViT2JqZWN0TmFtZSA9IHBBZGRyZXNzLnN1YnN0cmluZygwLCB0bXBTZXBhcmF0b3JJbmRleCk7XG5cdFx0XHRsZXQgdG1wTmV3QWRkcmVzcyA9IHBBZGRyZXNzLnN1YnN0cmluZyh0bXBTZXBhcmF0b3JJbmRleCsxKTtcblxuXHRcdFx0Ly8gVGVzdCBpZiB0aGUgdG1wTmV3QWRkcmVzcyBpcyBhbiBhcnJheSBvciBvYmplY3Rcblx0XHRcdC8vIENoZWNrIGlmIGl0J3MgYSBib3hlZCBwcm9wZXJ0eVxuXHRcdFx0bGV0IHRtcEJyYWNrZXRTdGFydEluZGV4ID0gdG1wU3ViT2JqZWN0TmFtZS5pbmRleE9mKCdbJyk7XG5cdFx0XHRsZXQgdG1wQnJhY2tldFN0b3BJbmRleCA9IHRtcFN1Yk9iamVjdE5hbWUuaW5kZXhPZignXScpO1xuXHRcdFx0Ly8gQm94ZWQgZWxlbWVudHMgbG9vayBsaWtlIHRoaXM6XG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbNDJdXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbJ0NvbG9yJ11cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1tcIldlaWdodFwiXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzW2BEaWFtZXRlcmBdXG5cdFx0XHQvL1xuXHRcdFx0Ly8gV2hlbiB3ZSBhcmUgcGFzc2VkIFNvbWVPYmplY3RbXCJOYW1lXCJdIHRoaXMgY29kZSBiZWxvdyByZWN1cnNlcyBhcyBpZiBpdCB3ZXJlIFNvbWVPYmplY3QuTmFtZVxuXHRcdFx0Ly8gVGhlIHJlcXVpcmVtZW50cyB0byBkZXRlY3QgYSBib3hlZCBlbGVtZW50IGFyZTpcblx0XHRcdC8vICAgIDEpIFRoZSBzdGFydCBicmFja2V0IGlzIGFmdGVyIGNoYXJhY3RlciAwXG5cdFx0XHRpZiAoKHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMCkgXG5cdFx0XHQvLyAgICAyKSBUaGUgZW5kIGJyYWNrZXQgaGFzIHNvbWV0aGluZyBiZXR3ZWVuIHRoZW1cblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggPiB0bXBCcmFja2V0U3RhcnRJbmRleCkgXG5cdFx0XHQvLyAgICAzKSBUaGVyZSBpcyBkYXRhIFxuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCAtIHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMCkpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5TmFtZSA9IHRtcFN1Yk9iamVjdE5hbWUuc3Vic3RyaW5nKDAsIHRtcEJyYWNrZXRTdGFydEluZGV4KS50cmltKCk7XG5cblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0bXBTdWJPYmplY3ROYW1lLnN1YnN0cmluZyh0bXBCcmFja2V0U3RhcnRJbmRleCsxLCB0bXBCcmFja2V0U3RvcEluZGV4KS50cmltKCk7XG5cblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlOdW1iZXIgPSBwYXJzZUludCh0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlLCAxMCk7XG5cblx0XHRcdFx0Ly8gR3VhcmQ6IElmIHRoZSByZWZlcnJhbnQgaXMgYSBudW1iZXIgYW5kIHRoZSBib3hlZCBwcm9wZXJ0eSBpcyBub3QgYW4gYXJyYXksIG9yIHZpY2UgdmVyc2EsIHJldHVybiB1bmRlZmluZWQuXG5cdFx0XHRcdC8vICAgICAgICBUaGlzIHNlZW1zIGNvbmZ1c2luZyB0byBtZSBhdCBmaXJzdCByZWFkLCBzbyBleHBsYWluYXRpb246XG5cdFx0XHRcdC8vICAgICAgICBJcyB0aGUgQm94ZWQgT2JqZWN0IGFuIEFycmF5PyAgVFJVRVxuXHRcdFx0XHQvLyAgICAgICAgQW5kIGlzIHRoZSBSZWZlcmVuY2UgaW5zaWRlIHRoZSBib3hlZCBPYmplY3Qgbm90IGEgbnVtYmVyPyBUUlVFXG5cdFx0XHRcdC8vICAgICAgICAtLT4gIFNvIHdoZW4gdGhlc2UgYXJlIGluIGFncmVlbWVudCwgaXQncyBhbiBpbXBvc3NpYmxlIGFjY2VzcyBzdGF0ZVxuXHRcdFx0XHQvLyBUaGlzIGNvdWxkIGJlIGEgZmFpbHVyZSBpbiB0aGUgcmVjdXJzaW9uIGNoYWluIGJlY2F1c2UgdGhleSBwYXNzZWQgc29tZXRoaW5nIGxpa2UgdGhpcyBpbjpcblx0XHRcdFx0Ly8gICAgU3R1ZGVudERhdGEuU2VjdGlvbnMuQWxnZWJyYS5TdHVkZW50c1sxXS5UYXJkeVxuXHRcdFx0XHQvLyAgICAgICBCVVRcblx0XHRcdFx0Ly8gICAgICAgICBTdHVkZW50RGF0YS5TZWN0aW9ucy5BbGdlYnJhLlN0dWRlbnRzIGlzIGFuIG9iamVjdCwgc28gdGhlIFsxXS5UYXJkeSBpcyBub3QgcG9zc2libGUgdG8gYWNjZXNzXG5cdFx0XHRcdC8vIFRoaXMgY291bGQgYmUgYSBmYWlsdXJlIGluIHRoZSByZWN1cnNpb24gY2hhaW4gYmVjYXVzZSB0aGV5IHBhc3NlZCBzb21ldGhpbmcgbGlrZSB0aGlzIGluOlxuXHRcdFx0XHQvLyAgICBTdHVkZW50RGF0YS5TZWN0aW9ucy5BbGdlYnJhLlN0dWRlbnRzW1wiSmFuZURvZVwiXS5HcmFkZVxuXHRcdFx0XHQvLyAgICAgICBCVVRcblx0XHRcdFx0Ly8gICAgICAgICBTdHVkZW50RGF0YS5TZWN0aW9ucy5BbGdlYnJhLlN0dWRlbnRzIGlzIGFuIGFycmF5LCBzbyB0aGUgW1wiSmFuZURvZVwiXS5HcmFkZSBpcyBub3QgcG9zc2libGUgdG8gYWNjZXNzXG5cdFx0XHRcdC8vIFRPRE86IFNob3VsZCB0aGlzIGJlIGFuIGVycm9yIG9yIHNvbWV0aGluZz8gIFNob3VsZCB3ZSBrZWVwIGEgbG9nIG9mIGZhaWx1cmVzIGxpa2UgdGhpcz9cblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV0pID09IGlzTmFOKHRtcEJveGVkUHJvcGVydHlOdW1iZXIpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQmVjYXVzZSB0aGlzIGlzIGFuIGltcG9zc2libGUgYWRkcmVzcywgdGhlIHByb3BlcnR5IGRvZXNuJ3QgZXhpc3Rcblx0XHRcdFx0XHQvLyBUT0RPOiBTaG91bGQgd2UgdGhyb3cgYW4gZXJyb3IgaW4gdGhpcyBjb25kaXRpb24/XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9UaGlzIGlzIGEgYnJhY2tldGVkIHZhbHVlXG5cdFx0XHRcdC8vICAgIDQpIElmIHRoZSBtaWRkbGUgcGFydCBpcyAqb25seSogYSBudW1iZXIgKG5vIHNpbmdsZSwgZG91YmxlIG9yIGJhY2t0aWNrIHF1b3RlcykgaXQgaXMgYW4gYXJyYXkgZWxlbWVudCxcblx0XHRcdFx0Ly8gICAgICAgb3RoZXJ3aXNlIHdlIHdpbGwgdHJ5IHRvIHJlYXQgaXQgYXMgYSBkeW5hbWljIG9iamVjdCBwcm9wZXJ0eS5cblx0XHRcdFx0aWYgKGlzTmFOKHRtcEJveGVkUHJvcGVydHlOdW1iZXIpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gVGhpcyBpc24ndCBhIG51bWJlciAuLi4gbGV0J3MgdHJlYXQgaXQgYXMgYSBkeW5hbm1pYyBvYmplY3QgcHJvcGVydHkuXG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycygnXCInLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKCdgJywgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycyhcIidcIiwgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cblx0XHRcdFx0XHQvLyBSZWN1cnNlIGRpcmVjdGx5IGludG8gdGhlIHN1Ym9iamVjdFxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmNoZWNrQWRkcmVzc0V4aXN0cyhwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXVt0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlXSwgdG1wTmV3QWRkcmVzcyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gV2UgcGFyc2VkIGEgdmFsaWQgbnVtYmVyIG91dCBvZiB0aGUgYm94ZWQgcHJvcGVydHkgbmFtZSwgc28gcmVjdXJzZSBpbnRvIHRoZSBhcnJheVxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmNoZWNrQWRkcmVzc0V4aXN0cyhwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXVt0bXBCb3hlZFByb3BlcnR5TnVtYmVyXSwgdG1wTmV3QWRkcmVzcyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gSWYgdGhlcmUgaXMgYW4gb2JqZWN0IHByb3BlcnR5IGFscmVhZHkgbmFtZWQgZm9yIHRoZSBzdWIgb2JqZWN0LCBidXQgaXQgaXNuJ3QgYW4gb2JqZWN0XG5cdFx0XHQvLyB0aGVuIHRoZSBzeXN0ZW0gY2FuJ3Qgc2V0IHRoZSB2YWx1ZSBpbiB0aGVyZS4gIEVycm9yIGFuZCBhYm9ydCFcblx0XHRcdGlmIChwT2JqZWN0Lmhhc093blByb3BlcnR5KHRtcFN1Yk9iamVjdE5hbWUpICYmIHR5cGVvZihwT2JqZWN0W3RtcFN1Yk9iamVjdE5hbWVdKSAhPT0gJ29iamVjdCcpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHBPYmplY3QuaGFzT3duUHJvcGVydHkodG1wU3ViT2JqZWN0TmFtZSkpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIElmIHRoZXJlIGlzIGFscmVhZHkgYSBzdWJvYmplY3QgcGFzcyB0aGF0IHRvIHRoZSByZWN1cnNpdmUgdGhpbmd5XG5cdFx0XHRcdHJldHVybiB0aGlzLmNoZWNrQWRkcmVzc0V4aXN0cyhwT2JqZWN0W3RtcFN1Yk9iamVjdE5hbWVdLCB0bXBOZXdBZGRyZXNzKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0Ly8gQ3JlYXRlIGEgc3Vib2JqZWN0IGFuZCB0aGVuIHBhc3MgdGhhdFxuXHRcdFx0XHRwT2JqZWN0W3RtcFN1Yk9iamVjdE5hbWVdID0ge307XG5cdFx0XHRcdHJldHVybiB0aGlzLmNoZWNrQWRkcmVzc0V4aXN0cyhwT2JqZWN0W3RtcFN1Yk9iamVjdE5hbWVdLCB0bXBOZXdBZGRyZXNzKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBHZXQgdGhlIHZhbHVlIG9mIGFuIGVsZW1lbnQgYXQgYW4gYWRkcmVzc1xuXHRnZXRWYWx1ZUF0QWRkcmVzcyAocE9iamVjdCwgcEFkZHJlc3MpXG5cdHtcblx0XHQvLyBNYWtlIHN1cmUgcE9iamVjdCBpcyBhbiBvYmplY3Rcblx0XHRpZiAodHlwZW9mKHBPYmplY3QpICE9ICdvYmplY3QnKSByZXR1cm4gdW5kZWZpbmVkO1xuXHRcdC8vIE1ha2Ugc3VyZSBwQWRkcmVzcyBpcyBhIHN0cmluZ1xuXHRcdGlmICh0eXBlb2YocEFkZHJlc3MpICE9ICdzdHJpbmcnKSByZXR1cm4gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gVE9ETzogTWFrZSB0aGlzIHdvcmsgZm9yIHRoaW5ncyBsaWtlIFNvbWVSb290T2JqZWN0Lk1ldGFkYXRhW1wiU29tZS5QZW9wbGUuVXNlLkJhZC5PYmplY3QuUHJvcGVydHkuTmFtZXNcIl1cblx0XHRsZXQgdG1wU2VwYXJhdG9ySW5kZXggPSBwQWRkcmVzcy5pbmRleE9mKCcuJyk7XG5cblx0XHQvLyBUaGlzIGlzIHRoZSB0ZXJtaW5hbCBhZGRyZXNzIHN0cmluZyAobm8gbW9yZSBkb3RzIHNvIHRoZSBSRUNVU0lPTiBFTkRTIElOIEhFUkUgc29tZWhvdylcblx0XHRpZiAodG1wU2VwYXJhdG9ySW5kZXggPT0gLTEpXG5cdFx0e1xuXHRcdFx0Ly8gQ2hlY2sgaWYgdGhlIGFkZHJlc3MgcmVmZXJzIHRvIGEgYm94ZWQgcHJvcGVydHlcblx0XHRcdGxldCB0bXBCcmFja2V0U3RhcnRJbmRleCA9IHBBZGRyZXNzLmluZGV4T2YoJ1snKTtcblx0XHRcdGxldCB0bXBCcmFja2V0U3RvcEluZGV4ID0gcEFkZHJlc3MuaW5kZXhPZignXScpO1xuXHRcdFx0Ly8gQm94ZWQgZWxlbWVudHMgbG9vayBsaWtlIHRoaXM6XG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbMTBdXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbJ05hbWUnXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzW1wiQWdlXCJdXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbYENvc3RgXVxuXHRcdFx0Ly9cblx0XHRcdC8vIFdoZW4gd2UgYXJlIHBhc3NlZCBTb21lT2JqZWN0W1wiTmFtZVwiXSB0aGlzIGNvZGUgYmVsb3cgcmVjdXJzZXMgYXMgaWYgaXQgd2VyZSBTb21lT2JqZWN0Lk5hbWVcblx0XHRcdC8vIFRoZSByZXF1aXJlbWVudHMgdG8gZGV0ZWN0IGEgYm94ZWQgZWxlbWVudCBhcmU6XG5cdFx0XHQvLyAgICAxKSBUaGUgc3RhcnQgYnJhY2tldCBpcyBhZnRlciBjaGFyYWN0ZXIgMFxuXHRcdFx0aWYgKCh0bXBCcmFja2V0U3RhcnRJbmRleCA+IDApIFxuXHRcdFx0Ly8gICAgMikgVGhlIGVuZCBicmFja2V0IGhhcyBzb21ldGhpbmcgYmV0d2VlbiB0aGVtXG5cdFx0XHRcdCYmICh0bXBCcmFja2V0U3RvcEluZGV4ID4gdG1wQnJhY2tldFN0YXJ0SW5kZXgpIFxuXHRcdFx0Ly8gICAgMykgVGhlcmUgaXMgZGF0YSBcblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggLSB0bXBCcmFja2V0U3RhcnRJbmRleCA+IDApKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBUaGUgXCJOYW1lXCIgb2YgdGhlIE9iamVjdCBjb250YWluZWQgdG9vIHRoZSBsZWZ0IG9mIHRoZSBicmFja2V0XG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5TmFtZSA9IHBBZGRyZXNzLnN1YnN0cmluZygwLCB0bXBCcmFja2V0U3RhcnRJbmRleCkudHJpbSgpO1xuXG5cdFx0XHRcdC8vIElmIHRoZSBzdWJwcm9wZXJ0eSBkb2Vzbid0IHRlc3QgYXMgYSBwcm9wZXIgT2JqZWN0LCBub25lIG9mIHRoZSByZXN0IG9mIHRoaXMgaXMgcG9zc2libGUuXG5cdFx0XHRcdC8vIFRoaXMgaXMgYSByYXJlIGNhc2Ugd2hlcmUgQXJyYXlzIHRlc3RpbmcgYXMgT2JqZWN0cyBpcyB1c2VmdWxcblx0XHRcdFx0aWYgKHR5cGVvZihwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXSkgIT09ICdvYmplY3QnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFRoZSBcIlJlZmVyZW5jZVwiIHRvIHRoZSBwcm9wZXJ0eSB3aXRoaW4gaXQsIGVpdGhlciBhbiBhcnJheSBlbGVtZW50IG9yIG9iamVjdCBwcm9wZXJ0eVxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHBBZGRyZXNzLnN1YnN0cmluZyh0bXBCcmFja2V0U3RhcnRJbmRleCsxLCB0bXBCcmFja2V0U3RvcEluZGV4KS50cmltKCk7XG5cdFx0XHRcdC8vIEF0dGVtcHQgdG8gcGFyc2UgdGhlIHJlZmVyZW5jZSBhcyBhIG51bWJlciwgd2hpY2ggd2lsbCBiZSB1c2VkIGFzIGFuIGFycmF5IGVsZW1lbnRcblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlOdW1iZXIgPSBwYXJzZUludCh0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlLCAxMCk7XG5cblx0XHRcdFx0Ly8gR3VhcmQ6IElmIHRoZSByZWZlcnJhbnQgaXMgYSBudW1iZXIgYW5kIHRoZSBib3hlZCBwcm9wZXJ0eSBpcyBub3QgYW4gYXJyYXksIG9yIHZpY2UgdmVyc2EsIHJldHVybiB1bmRlZmluZWQuXG5cdFx0XHRcdC8vICAgICAgICBUaGlzIHNlZW1zIGNvbmZ1c2luZyB0byBtZSBhdCBmaXJzdCByZWFkLCBzbyBleHBsYWluYXRpb246XG5cdFx0XHRcdC8vICAgICAgICBJcyB0aGUgQm94ZWQgT2JqZWN0IGFuIEFycmF5PyAgVFJVRVxuXHRcdFx0XHQvLyAgICAgICAgQW5kIGlzIHRoZSBSZWZlcmVuY2UgaW5zaWRlIHRoZSBib3hlZCBPYmplY3Qgbm90IGEgbnVtYmVyPyBUUlVFXG5cdFx0XHRcdC8vICAgICAgICAtLT4gIFNvIHdoZW4gdGhlc2UgYXJlIGluIGFncmVlbWVudCwgaXQncyBhbiBpbXBvc3NpYmxlIGFjY2VzcyBzdGF0ZVxuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXSkgPT0gaXNOYU4odG1wQm94ZWRQcm9wZXJ0eU51bWJlcikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gICAgNCkgSWYgdGhlIG1pZGRsZSBwYXJ0IGlzICpvbmx5KiBhIG51bWJlciAobm8gc2luZ2xlLCBkb3VibGUgb3IgYmFja3RpY2sgcXVvdGVzKSBpdCBpcyBhbiBhcnJheSBlbGVtZW50LFxuXHRcdFx0XHQvLyAgICAgICBvdGhlcndpc2Ugd2Ugd2lsbCB0cnkgdG8gdHJlYXQgaXQgYXMgYSBkeW5hbWljIG9iamVjdCBwcm9wZXJ0eS5cblx0XHRcdFx0aWYgKGlzTmFOKHRtcEJveGVkUHJvcGVydHlOdW1iZXIpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gVGhpcyBpc24ndCBhIG51bWJlciAuLi4gbGV0J3MgdHJlYXQgaXQgYXMgYSBkeW5hbWljIG9iamVjdCBwcm9wZXJ0eS5cblx0XHRcdFx0XHQvLyBXZSB3b3VsZCBleHBlY3QgdGhlIHByb3BlcnR5IHRvIGJlIHdyYXBwZWQgaW4gc29tZSBraW5kIG9mIHF1b3RlcyBzbyBzdHJpcCB0aGVtXG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycygnXCInLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKCdgJywgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycyhcIidcIiwgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cblx0XHRcdFx0XHQvLyBSZXR1cm4gdGhlIHZhbHVlIGluIHRoZSBwcm9wZXJ0eVxuXHRcdFx0XHRcdHJldHVybiBwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXVt0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gcE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV1bdG1wQm94ZWRQcm9wZXJ0eU51bWJlcl07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0Ly8gTm93IGlzIHRoZSBwb2ludCBpbiByZWN1cnNpb24gdG8gcmV0dXJuIHRoZSB2YWx1ZSBpbiB0aGUgYWRkcmVzc1xuXHRcdFx0XHRyZXR1cm4gcE9iamVjdFtwQWRkcmVzc107XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRsZXQgdG1wU3ViT2JqZWN0TmFtZSA9IHBBZGRyZXNzLnN1YnN0cmluZygwLCB0bXBTZXBhcmF0b3JJbmRleCk7XG5cdFx0XHRsZXQgdG1wTmV3QWRkcmVzcyA9IHBBZGRyZXNzLnN1YnN0cmluZyh0bXBTZXBhcmF0b3JJbmRleCsxKTtcblxuXHRcdFx0Ly8gVGVzdCBpZiB0aGUgdG1wTmV3QWRkcmVzcyBpcyBhbiBhcnJheSBvciBvYmplY3Rcblx0XHRcdC8vIENoZWNrIGlmIGl0J3MgYSBib3hlZCBwcm9wZXJ0eVxuXHRcdFx0bGV0IHRtcEJyYWNrZXRTdGFydEluZGV4ID0gdG1wU3ViT2JqZWN0TmFtZS5pbmRleE9mKCdbJyk7XG5cdFx0XHRsZXQgdG1wQnJhY2tldFN0b3BJbmRleCA9IHRtcFN1Yk9iamVjdE5hbWUuaW5kZXhPZignXScpO1xuXHRcdFx0Ly8gQm94ZWQgZWxlbWVudHMgbG9vayBsaWtlIHRoaXM6XG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbNDJdXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbJ0NvbG9yJ11cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1tcIldlaWdodFwiXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzW2BEaWFtZXRlcmBdXG5cdFx0XHQvL1xuXHRcdFx0Ly8gV2hlbiB3ZSBhcmUgcGFzc2VkIFNvbWVPYmplY3RbXCJOYW1lXCJdIHRoaXMgY29kZSBiZWxvdyByZWN1cnNlcyBhcyBpZiBpdCB3ZXJlIFNvbWVPYmplY3QuTmFtZVxuXHRcdFx0Ly8gVGhlIHJlcXVpcmVtZW50cyB0byBkZXRlY3QgYSBib3hlZCBlbGVtZW50IGFyZTpcblx0XHRcdC8vICAgIDEpIFRoZSBzdGFydCBicmFja2V0IGlzIGFmdGVyIGNoYXJhY3RlciAwXG5cdFx0XHRpZiAoKHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMCkgXG5cdFx0XHQvLyAgICAyKSBUaGUgZW5kIGJyYWNrZXQgaGFzIHNvbWV0aGluZyBiZXR3ZWVuIHRoZW1cblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggPiB0bXBCcmFja2V0U3RhcnRJbmRleCkgXG5cdFx0XHQvLyAgICAzKSBUaGVyZSBpcyBkYXRhIFxuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCAtIHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMCkpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5TmFtZSA9IHRtcFN1Yk9iamVjdE5hbWUuc3Vic3RyaW5nKDAsIHRtcEJyYWNrZXRTdGFydEluZGV4KS50cmltKCk7XG5cblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0bXBTdWJPYmplY3ROYW1lLnN1YnN0cmluZyh0bXBCcmFja2V0U3RhcnRJbmRleCsxLCB0bXBCcmFja2V0U3RvcEluZGV4KS50cmltKCk7XG5cblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlOdW1iZXIgPSBwYXJzZUludCh0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlLCAxMCk7XG5cblx0XHRcdFx0Ly8gR3VhcmQ6IElmIHRoZSByZWZlcnJhbnQgaXMgYSBudW1iZXIgYW5kIHRoZSBib3hlZCBwcm9wZXJ0eSBpcyBub3QgYW4gYXJyYXksIG9yIHZpY2UgdmVyc2EsIHJldHVybiB1bmRlZmluZWQuXG5cdFx0XHRcdC8vICAgICAgICBUaGlzIHNlZW1zIGNvbmZ1c2luZyB0byBtZSBhdCBmaXJzdCByZWFkLCBzbyBleHBsYWluYXRpb246XG5cdFx0XHRcdC8vICAgICAgICBJcyB0aGUgQm94ZWQgT2JqZWN0IGFuIEFycmF5PyAgVFJVRVxuXHRcdFx0XHQvLyAgICAgICAgQW5kIGlzIHRoZSBSZWZlcmVuY2UgaW5zaWRlIHRoZSBib3hlZCBPYmplY3Qgbm90IGEgbnVtYmVyPyBUUlVFXG5cdFx0XHRcdC8vICAgICAgICAtLT4gIFNvIHdoZW4gdGhlc2UgYXJlIGluIGFncmVlbWVudCwgaXQncyBhbiBpbXBvc3NpYmxlIGFjY2VzcyBzdGF0ZVxuXHRcdFx0XHQvLyBUaGlzIGNvdWxkIGJlIGEgZmFpbHVyZSBpbiB0aGUgcmVjdXJzaW9uIGNoYWluIGJlY2F1c2UgdGhleSBwYXNzZWQgc29tZXRoaW5nIGxpa2UgdGhpcyBpbjpcblx0XHRcdFx0Ly8gICAgU3R1ZGVudERhdGEuU2VjdGlvbnMuQWxnZWJyYS5TdHVkZW50c1sxXS5UYXJkeVxuXHRcdFx0XHQvLyAgICAgICBCVVRcblx0XHRcdFx0Ly8gICAgICAgICBTdHVkZW50RGF0YS5TZWN0aW9ucy5BbGdlYnJhLlN0dWRlbnRzIGlzIGFuIG9iamVjdCwgc28gdGhlIFsxXS5UYXJkeSBpcyBub3QgcG9zc2libGUgdG8gYWNjZXNzXG5cdFx0XHRcdC8vIFRoaXMgY291bGQgYmUgYSBmYWlsdXJlIGluIHRoZSByZWN1cnNpb24gY2hhaW4gYmVjYXVzZSB0aGV5IHBhc3NlZCBzb21ldGhpbmcgbGlrZSB0aGlzIGluOlxuXHRcdFx0XHQvLyAgICBTdHVkZW50RGF0YS5TZWN0aW9ucy5BbGdlYnJhLlN0dWRlbnRzW1wiSmFuZURvZVwiXS5HcmFkZVxuXHRcdFx0XHQvLyAgICAgICBCVVRcblx0XHRcdFx0Ly8gICAgICAgICBTdHVkZW50RGF0YS5TZWN0aW9ucy5BbGdlYnJhLlN0dWRlbnRzIGlzIGFuIGFycmF5LCBzbyB0aGUgW1wiSmFuZURvZVwiXS5HcmFkZSBpcyBub3QgcG9zc2libGUgdG8gYWNjZXNzXG5cdFx0XHRcdC8vIFRPRE86IFNob3VsZCB0aGlzIGJlIGFuIGVycm9yIG9yIHNvbWV0aGluZz8gIFNob3VsZCB3ZSBrZWVwIGEgbG9nIG9mIGZhaWx1cmVzIGxpa2UgdGhpcz9cblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV0pID09IGlzTmFOKHRtcEJveGVkUHJvcGVydHlOdW1iZXIpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vVGhpcyBpcyBhIGJyYWNrZXRlZCB2YWx1ZVxuXHRcdFx0XHQvLyAgICA0KSBJZiB0aGUgbWlkZGxlIHBhcnQgaXMgKm9ubHkqIGEgbnVtYmVyIChubyBzaW5nbGUsIGRvdWJsZSBvciBiYWNrdGljayBxdW90ZXMpIGl0IGlzIGFuIGFycmF5IGVsZW1lbnQsXG5cdFx0XHRcdC8vICAgICAgIG90aGVyd2lzZSB3ZSB3aWxsIHRyeSB0byByZWF0IGl0IGFzIGEgZHluYW1pYyBvYmplY3QgcHJvcGVydHkuXG5cdFx0XHRcdGlmIChpc05hTih0bXBCb3hlZFByb3BlcnR5TnVtYmVyKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIFRoaXMgaXNuJ3QgYSBudW1iZXIgLi4uIGxldCdzIHRyZWF0IGl0IGFzIGEgZHluYW5taWMgb2JqZWN0IHByb3BlcnR5LlxuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoJ1wiJywgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycygnYCcsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoXCInXCIsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXG5cdFx0XHRcdFx0Ly8gUmVjdXJzZSBkaXJlY3RseSBpbnRvIHRoZSBzdWJvYmplY3Rcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5nZXRWYWx1ZUF0QWRkcmVzcyhwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXVt0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlXSwgdG1wTmV3QWRkcmVzcyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gV2UgcGFyc2VkIGEgdmFsaWQgbnVtYmVyIG91dCBvZiB0aGUgYm94ZWQgcHJvcGVydHkgbmFtZSwgc28gcmVjdXJzZSBpbnRvIHRoZSBhcnJheVxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmdldFZhbHVlQXRBZGRyZXNzKHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdW3RtcEJveGVkUHJvcGVydHlOdW1iZXJdLCB0bXBOZXdBZGRyZXNzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBJZiB0aGVyZSBpcyBhbiBvYmplY3QgcHJvcGVydHkgYWxyZWFkeSBuYW1lZCBmb3IgdGhlIHN1YiBvYmplY3QsIGJ1dCBpdCBpc24ndCBhbiBvYmplY3Rcblx0XHRcdC8vIHRoZW4gdGhlIHN5c3RlbSBjYW4ndCBzZXQgdGhlIHZhbHVlIGluIHRoZXJlLiAgRXJyb3IgYW5kIGFib3J0IVxuXHRcdFx0aWYgKHBPYmplY3QuaGFzT3duUHJvcGVydHkodG1wU3ViT2JqZWN0TmFtZSkgJiYgdHlwZW9mKHBPYmplY3RbdG1wU3ViT2JqZWN0TmFtZV0pICE9PSAnb2JqZWN0Jylcblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHBPYmplY3QuaGFzT3duUHJvcGVydHkodG1wU3ViT2JqZWN0TmFtZSkpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIElmIHRoZXJlIGlzIGFscmVhZHkgYSBzdWJvYmplY3QgcGFzcyB0aGF0IHRvIHRoZSByZWN1cnNpdmUgdGhpbmd5XG5cdFx0XHRcdHJldHVybiB0aGlzLmdldFZhbHVlQXRBZGRyZXNzKHBPYmplY3RbdG1wU3ViT2JqZWN0TmFtZV0sIHRtcE5ld0FkZHJlc3MpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBDcmVhdGUgYSBzdWJvYmplY3QgYW5kIHRoZW4gcGFzcyB0aGF0XG5cdFx0XHRcdHBPYmplY3RbdG1wU3ViT2JqZWN0TmFtZV0gPSB7fTtcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0VmFsdWVBdEFkZHJlc3MocE9iamVjdFt0bXBTdWJPYmplY3ROYW1lXSwgdG1wTmV3QWRkcmVzcyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gU2V0IHRoZSB2YWx1ZSBvZiBhbiBlbGVtZW50IGF0IGFuIGFkZHJlc3Ncblx0c2V0VmFsdWVBdEFkZHJlc3MgKHBPYmplY3QsIHBBZGRyZXNzLCBwVmFsdWUpXG5cdHtcblx0XHQvLyBNYWtlIHN1cmUgcE9iamVjdCBpcyBhbiBvYmplY3Rcblx0XHRpZiAodHlwZW9mKHBPYmplY3QpICE9ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG5cdFx0Ly8gTWFrZSBzdXJlIHBBZGRyZXNzIGlzIGEgc3RyaW5nXG5cdFx0aWYgKHR5cGVvZihwQWRkcmVzcykgIT0gJ3N0cmluZycpIHJldHVybiBmYWxzZTtcblxuXHRcdGxldCB0bXBTZXBhcmF0b3JJbmRleCA9IHBBZGRyZXNzLmluZGV4T2YoJy4nKTtcblxuXHRcdGlmICh0bXBTZXBhcmF0b3JJbmRleCA9PSAtMSlcblx0XHR7XG5cdFx0XHQvLyBDaGVjayBpZiBpdCdzIGEgYm94ZWQgcHJvcGVydHlcblx0XHRcdGxldCB0bXBCcmFja2V0U3RhcnRJbmRleCA9IHBBZGRyZXNzLmluZGV4T2YoJ1snKTtcblx0XHRcdGxldCB0bXBCcmFja2V0U3RvcEluZGV4ID0gcEFkZHJlc3MuaW5kZXhPZignXScpO1xuXHRcdFx0Ly8gQm94ZWQgZWxlbWVudHMgbG9vayBsaWtlIHRoaXM6XG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbMTBdXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbJ05hbWUnXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzW1wiQWdlXCJdXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbYENvc3RgXVxuXHRcdFx0Ly9cblx0XHRcdC8vIFdoZW4gd2UgYXJlIHBhc3NlZCBTb21lT2JqZWN0W1wiTmFtZVwiXSB0aGlzIGNvZGUgYmVsb3cgcmVjdXJzZXMgYXMgaWYgaXQgd2VyZSBTb21lT2JqZWN0Lk5hbWVcblx0XHRcdC8vIFRoZSByZXF1aXJlbWVudHMgdG8gZGV0ZWN0IGEgYm94ZWQgZWxlbWVudCBhcmU6XG5cdFx0XHQvLyAgICAxKSBUaGUgc3RhcnQgYnJhY2tldCBpcyBhZnRlciBjaGFyYWN0ZXIgMFxuXHRcdFx0aWYgKCh0bXBCcmFja2V0U3RhcnRJbmRleCA+IDApIFxuXHRcdFx0Ly8gICAgMikgVGhlIGVuZCBicmFja2V0IGhhcyBzb21ldGhpbmcgYmV0d2VlbiB0aGVtXG5cdFx0XHRcdCYmICh0bXBCcmFja2V0U3RvcEluZGV4ID4gdG1wQnJhY2tldFN0YXJ0SW5kZXgpIFxuXHRcdFx0Ly8gICAgMykgVGhlcmUgaXMgZGF0YSBcblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggLSB0bXBCcmFja2V0U3RhcnRJbmRleCA+IDApKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBUaGUgXCJOYW1lXCIgb2YgdGhlIE9iamVjdCBjb250YWluZWQgdG9vIHRoZSBsZWZ0IG9mIHRoZSBicmFja2V0XG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5TmFtZSA9IHBBZGRyZXNzLnN1YnN0cmluZygwLCB0bXBCcmFja2V0U3RhcnRJbmRleCkudHJpbSgpO1xuXG5cdFx0XHRcdC8vIElmIHRoZSBzdWJwcm9wZXJ0eSBkb2Vzbid0IHRlc3QgYXMgYSBwcm9wZXIgT2JqZWN0LCBub25lIG9mIHRoZSByZXN0IG9mIHRoaXMgaXMgcG9zc2libGUuXG5cdFx0XHRcdC8vIFRoaXMgaXMgYSByYXJlIGNhc2Ugd2hlcmUgQXJyYXlzIHRlc3RpbmcgYXMgT2JqZWN0cyBpcyB1c2VmdWxcblx0XHRcdFx0aWYgKHR5cGVvZihwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXSkgIT09ICdvYmplY3QnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gVGhlIFwiUmVmZXJlbmNlXCIgdG8gdGhlIHByb3BlcnR5IHdpdGhpbiBpdCwgZWl0aGVyIGFuIGFycmF5IGVsZW1lbnQgb3Igb2JqZWN0IHByb3BlcnR5XG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gcEFkZHJlc3Muc3Vic3RyaW5nKHRtcEJyYWNrZXRTdGFydEluZGV4KzEsIHRtcEJyYWNrZXRTdG9wSW5kZXgpLnRyaW0oKTtcblx0XHRcdFx0Ly8gQXR0ZW1wdCB0byBwYXJzZSB0aGUgcmVmZXJlbmNlIGFzIGEgbnVtYmVyLCB3aGljaCB3aWxsIGJlIHVzZWQgYXMgYW4gYXJyYXkgZWxlbWVudFxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eU51bWJlciA9IHBhcnNlSW50KHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UsIDEwKTtcblxuXHRcdFx0XHQvLyBHdWFyZDogSWYgdGhlIHJlZmVycmFudCBpcyBhIG51bWJlciBhbmQgdGhlIGJveGVkIHByb3BlcnR5IGlzIG5vdCBhbiBhcnJheSwgb3IgdmljZSB2ZXJzYSwgcmV0dXJuIHVuZGVmaW5lZC5cblx0XHRcdFx0Ly8gICAgICAgIFRoaXMgc2VlbXMgY29uZnVzaW5nIHRvIG1lIGF0IGZpcnN0IHJlYWQsIHNvIGV4cGxhaW5hdGlvbjpcblx0XHRcdFx0Ly8gICAgICAgIElzIHRoZSBCb3hlZCBPYmplY3QgYW4gQXJyYXk/ICBUUlVFXG5cdFx0XHRcdC8vICAgICAgICBBbmQgaXMgdGhlIFJlZmVyZW5jZSBpbnNpZGUgdGhlIGJveGVkIE9iamVjdCBub3QgYSBudW1iZXI/IFRSVUVcblx0XHRcdFx0Ly8gICAgICAgIC0tPiAgU28gd2hlbiB0aGVzZSBhcmUgaW4gYWdyZWVtZW50LCBpdCdzIGFuIGltcG9zc2libGUgYWNjZXNzIHN0YXRlXG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdKSA9PSBpc05hTih0bXBCb3hlZFByb3BlcnR5TnVtYmVyKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vICAgIDQpIElmIHRoZSBtaWRkbGUgcGFydCBpcyAqb25seSogYSBudW1iZXIgKG5vIHNpbmdsZSwgZG91YmxlIG9yIGJhY2t0aWNrIHF1b3RlcykgaXQgaXMgYW4gYXJyYXkgZWxlbWVudCxcblx0XHRcdFx0Ly8gICAgICAgb3RoZXJ3aXNlIHdlIHdpbGwgdHJ5IHRvIHRyZWF0IGl0IGFzIGEgZHluYW1pYyBvYmplY3QgcHJvcGVydHkuXG5cdFx0XHRcdGlmIChpc05hTih0bXBCb3hlZFByb3BlcnR5TnVtYmVyKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIFRoaXMgaXNuJ3QgYSBudW1iZXIgLi4uIGxldCdzIHRyZWF0IGl0IGFzIGEgZHluYW1pYyBvYmplY3QgcHJvcGVydHkuXG5cdFx0XHRcdFx0Ly8gV2Ugd291bGQgZXhwZWN0IHRoZSBwcm9wZXJ0eSB0byBiZSB3cmFwcGVkIGluIHNvbWUga2luZCBvZiBxdW90ZXMgc28gc3RyaXAgdGhlbVxuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoJ1wiJywgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycygnYCcsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoXCInXCIsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXG5cdFx0XHRcdFx0Ly8gUmV0dXJuIHRoZSB2YWx1ZSBpbiB0aGUgcHJvcGVydHlcblx0XHRcdFx0XHRwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXVt0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlXSA9IHBWYWx1ZTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXVt0bXBCb3hlZFByb3BlcnR5TnVtYmVyXSA9IHBWYWx1ZTtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBOb3cgaXMgdGhlIHRpbWUgaW4gcmVjdXJzaW9uIHRvIHNldCB0aGUgdmFsdWUgaW4gdGhlIG9iamVjdFxuXHRcdFx0XHRwT2JqZWN0W3BBZGRyZXNzXSA9IHBWYWx1ZTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRsZXQgdG1wU3ViT2JqZWN0TmFtZSA9IHBBZGRyZXNzLnN1YnN0cmluZygwLCB0bXBTZXBhcmF0b3JJbmRleCk7XG5cdFx0XHRsZXQgdG1wTmV3QWRkcmVzcyA9IHBBZGRyZXNzLnN1YnN0cmluZyh0bXBTZXBhcmF0b3JJbmRleCsxKTtcblxuXHRcdFx0Ly8gVGVzdCBpZiB0aGUgdG1wTmV3QWRkcmVzcyBpcyBhbiBhcnJheSBvciBvYmplY3Rcblx0XHRcdC8vIENoZWNrIGlmIGl0J3MgYSBib3hlZCBwcm9wZXJ0eVxuXHRcdFx0bGV0IHRtcEJyYWNrZXRTdGFydEluZGV4ID0gdG1wU3ViT2JqZWN0TmFtZS5pbmRleE9mKCdbJyk7XG5cdFx0XHRsZXQgdG1wQnJhY2tldFN0b3BJbmRleCA9IHRtcFN1Yk9iamVjdE5hbWUuaW5kZXhPZignXScpO1xuXHRcdFx0Ly8gQm94ZWQgZWxlbWVudHMgbG9vayBsaWtlIHRoaXM6XG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbNDJdXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbJ0NvbG9yJ11cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1tcIldlaWdodFwiXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzW2BEaWFtZXRlcmBdXG5cdFx0XHQvL1xuXHRcdFx0Ly8gV2hlbiB3ZSBhcmUgcGFzc2VkIFNvbWVPYmplY3RbXCJOYW1lXCJdIHRoaXMgY29kZSBiZWxvdyByZWN1cnNlcyBhcyBpZiBpdCB3ZXJlIFNvbWVPYmplY3QuTmFtZVxuXHRcdFx0Ly8gVGhlIHJlcXVpcmVtZW50cyB0byBkZXRlY3QgYSBib3hlZCBlbGVtZW50IGFyZTpcblx0XHRcdC8vICAgIDEpIFRoZSBzdGFydCBicmFja2V0IGlzIGFmdGVyIGNoYXJhY3RlciAwXG5cdFx0XHRpZiAoKHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMCkgXG5cdFx0XHQvLyAgICAyKSBUaGUgZW5kIGJyYWNrZXQgaGFzIHNvbWV0aGluZyBiZXR3ZWVuIHRoZW1cblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggPiB0bXBCcmFja2V0U3RhcnRJbmRleCkgXG5cdFx0XHQvLyAgICAzKSBUaGVyZSBpcyBkYXRhIFxuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCAtIHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMCkpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5TmFtZSA9IHRtcFN1Yk9iamVjdE5hbWUuc3Vic3RyaW5nKDAsIHRtcEJyYWNrZXRTdGFydEluZGV4KS50cmltKCk7XG5cblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0bXBTdWJPYmplY3ROYW1lLnN1YnN0cmluZyh0bXBCcmFja2V0U3RhcnRJbmRleCsxLCB0bXBCcmFja2V0U3RvcEluZGV4KS50cmltKCk7XG5cblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlOdW1iZXIgPSBwYXJzZUludCh0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlLCAxMCk7XG5cblx0XHRcdFx0Ly8gR3VhcmQ6IElmIHRoZSByZWZlcnJhbnQgaXMgYSBudW1iZXIgYW5kIHRoZSBib3hlZCBwcm9wZXJ0eSBpcyBub3QgYW4gYXJyYXksIG9yIHZpY2UgdmVyc2EsIHJldHVybiB1bmRlZmluZWQuXG5cdFx0XHRcdC8vICAgICAgICBUaGlzIHNlZW1zIGNvbmZ1c2luZyB0byBtZSBhdCBmaXJzdCByZWFkLCBzbyBleHBsYWluYXRpb246XG5cdFx0XHRcdC8vICAgICAgICBJcyB0aGUgQm94ZWQgT2JqZWN0IGFuIEFycmF5PyAgVFJVRVxuXHRcdFx0XHQvLyAgICAgICAgQW5kIGlzIHRoZSBSZWZlcmVuY2UgaW5zaWRlIHRoZSBib3hlZCBPYmplY3Qgbm90IGEgbnVtYmVyPyBUUlVFXG5cdFx0XHRcdC8vICAgICAgICAtLT4gIFNvIHdoZW4gdGhlc2UgYXJlIGluIGFncmVlbWVudCwgaXQncyBhbiBpbXBvc3NpYmxlIGFjY2VzcyBzdGF0ZVxuXHRcdFx0XHQvLyBUaGlzIGNvdWxkIGJlIGEgZmFpbHVyZSBpbiB0aGUgcmVjdXJzaW9uIGNoYWluIGJlY2F1c2UgdGhleSBwYXNzZWQgc29tZXRoaW5nIGxpa2UgdGhpcyBpbjpcblx0XHRcdFx0Ly8gICAgU3R1ZGVudERhdGEuU2VjdGlvbnMuQWxnZWJyYS5TdHVkZW50c1sxXS5UYXJkeVxuXHRcdFx0XHQvLyAgICAgICBCVVRcblx0XHRcdFx0Ly8gICAgICAgICBTdHVkZW50RGF0YS5TZWN0aW9ucy5BbGdlYnJhLlN0dWRlbnRzIGlzIGFuIG9iamVjdCwgc28gdGhlIFsxXS5UYXJkeSBpcyBub3QgcG9zc2libGUgdG8gYWNjZXNzXG5cdFx0XHRcdC8vIFRoaXMgY291bGQgYmUgYSBmYWlsdXJlIGluIHRoZSByZWN1cnNpb24gY2hhaW4gYmVjYXVzZSB0aGV5IHBhc3NlZCBzb21ldGhpbmcgbGlrZSB0aGlzIGluOlxuXHRcdFx0XHQvLyAgICBTdHVkZW50RGF0YS5TZWN0aW9ucy5BbGdlYnJhLlN0dWRlbnRzW1wiSmFuZURvZVwiXS5HcmFkZVxuXHRcdFx0XHQvLyAgICAgICBCVVRcblx0XHRcdFx0Ly8gICAgICAgICBTdHVkZW50RGF0YS5TZWN0aW9ucy5BbGdlYnJhLlN0dWRlbnRzIGlzIGFuIGFycmF5LCBzbyB0aGUgW1wiSmFuZURvZVwiXS5HcmFkZSBpcyBub3QgcG9zc2libGUgdG8gYWNjZXNzXG5cdFx0XHRcdC8vIFRPRE86IFNob3VsZCB0aGlzIGJlIGFuIGVycm9yIG9yIHNvbWV0aGluZz8gIFNob3VsZCB3ZSBrZWVwIGEgbG9nIG9mIGZhaWx1cmVzIGxpa2UgdGhpcz9cblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV0pID09IGlzTmFOKHRtcEJveGVkUHJvcGVydHlOdW1iZXIpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9UaGlzIGlzIGEgYnJhY2tldGVkIHZhbHVlXG5cdFx0XHRcdC8vICAgIDQpIElmIHRoZSBtaWRkbGUgcGFydCBpcyAqb25seSogYSBudW1iZXIgKG5vIHNpbmdsZSwgZG91YmxlIG9yIGJhY2t0aWNrIHF1b3RlcykgaXQgaXMgYW4gYXJyYXkgZWxlbWVudCxcblx0XHRcdFx0Ly8gICAgICAgb3RoZXJ3aXNlIHdlIHdpbGwgdHJ5IHRvIHJlYXQgaXQgYXMgYSBkeW5hbWljIG9iamVjdCBwcm9wZXJ0eS5cblx0XHRcdFx0aWYgKGlzTmFOKHRtcEJveGVkUHJvcGVydHlOdW1iZXIpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gVGhpcyBpc24ndCBhIG51bWJlciAuLi4gbGV0J3MgdHJlYXQgaXQgYXMgYSBkeW5hbm1pYyBvYmplY3QgcHJvcGVydHkuXG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycygnXCInLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKCdgJywgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycyhcIidcIiwgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cblx0XHRcdFx0XHQvLyBSZWN1cnNlIGRpcmVjdGx5IGludG8gdGhlIHN1Ym9iamVjdFxuXHRcdFx0XHRcdHJldHVybiB0aGlzLnNldFZhbHVlQXRBZGRyZXNzKHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdW3RtcEJveGVkUHJvcGVydHlSZWZlcmVuY2VdLCB0bXBOZXdBZGRyZXNzLCBwVmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIFdlIHBhcnNlZCBhIHZhbGlkIG51bWJlciBvdXQgb2YgdGhlIGJveGVkIHByb3BlcnR5IG5hbWUsIHNvIHJlY3Vyc2UgaW50byB0aGUgYXJyYXlcblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5zZXRWYWx1ZUF0QWRkcmVzcyhwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXVt0bXBCb3hlZFByb3BlcnR5TnVtYmVyXSwgdG1wTmV3QWRkcmVzcywgcFZhbHVlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBJZiB0aGVyZSBpcyBhbiBvYmplY3QgcHJvcGVydHkgYWxyZWFkeSBuYW1lZCBmb3IgdGhlIHN1YiBvYmplY3QsIGJ1dCBpdCBpc24ndCBhbiBvYmplY3Rcblx0XHRcdC8vIHRoZW4gdGhlIHN5c3RlbSBjYW4ndCBzZXQgdGhlIHZhbHVlIGluIHRoZXJlLiAgRXJyb3IgYW5kIGFib3J0IVxuXHRcdFx0aWYgKHBPYmplY3QuaGFzT3duUHJvcGVydHkodG1wU3ViT2JqZWN0TmFtZSkgJiYgdHlwZW9mKHBPYmplY3RbdG1wU3ViT2JqZWN0TmFtZV0pICE9PSAnb2JqZWN0Jylcblx0XHRcdHtcblx0XHRcdFx0aWYgKCFwT2JqZWN0Lmhhc093blByb3BlcnR5KCdfX0VSUk9SJykpXG5cdFx0XHRcdFx0cE9iamVjdFsnX19FUlJPUiddID0ge307XG5cdFx0XHRcdC8vIFB1dCBpdCBpbiBhbiBlcnJvciBvYmplY3Qgc28gZGF0YSBpc24ndCBsb3N0XG5cdFx0XHRcdHBPYmplY3RbJ19fRVJST1InXVtwQWRkcmVzc10gPSBwVmFsdWU7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHBPYmplY3QuaGFzT3duUHJvcGVydHkodG1wU3ViT2JqZWN0TmFtZSkpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIElmIHRoZXJlIGlzIGFscmVhZHkgYSBzdWJvYmplY3QgcGFzcyB0aGF0IHRvIHRoZSByZWN1cnNpdmUgdGhpbmd5XG5cdFx0XHRcdHJldHVybiB0aGlzLnNldFZhbHVlQXRBZGRyZXNzKHBPYmplY3RbdG1wU3ViT2JqZWN0TmFtZV0sIHRtcE5ld0FkZHJlc3MsIHBWYWx1ZSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdC8vIENyZWF0ZSBhIHN1Ym9iamVjdCBhbmQgdGhlbiBwYXNzIHRoYXRcblx0XHRcdFx0cE9iamVjdFt0bXBTdWJPYmplY3ROYW1lXSA9IHt9O1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5zZXRWYWx1ZUF0QWRkcmVzcyhwT2JqZWN0W3RtcFN1Yk9iamVjdE5hbWVdLCB0bXBOZXdBZGRyZXNzLCBwVmFsdWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYW55ZmVzdE9iamVjdEFkZHJlc3NSZXNvbHZlcjsiLCIvKipcbiogQGxpY2Vuc2UgTUlUXG4qIEBhdXRob3IgPHN0ZXZlbkB2ZWxvem8uY29tPlxuKi9cbmxldCBsaWJTaW1wbGVMb2cgPSByZXF1aXJlKCcuL01hbnlmZXN0LUxvZ1RvQ29uc29sZS5qcycpO1xuXG4vKipcbiogU2NoZW1hIE1hbmlwdWxhdGlvbiBGdW5jdGlvbnNcbipcbiogQGNsYXNzIE1hbnlmZXN0U2NoZW1hTWFuaXB1bGF0aW9uXG4qL1xuY2xhc3MgTWFueWZlc3RTY2hlbWFNYW5pcHVsYXRpb25cbntcblx0Y29uc3RydWN0b3IocEluZm9Mb2csIHBFcnJvckxvZylcblx0e1xuXHRcdC8vIFdpcmUgaW4gbG9nZ2luZ1xuXHRcdHRoaXMubG9nSW5mbyA9ICh0eXBlb2YocEluZm9Mb2cpID09PSAnZnVuY3Rpb24nKSA/IHBJbmZvTG9nIDogbGliU2ltcGxlTG9nO1xuXHRcdHRoaXMubG9nRXJyb3IgPSAodHlwZW9mKHBFcnJvckxvZykgPT09ICdmdW5jdGlvbicpID8gcEVycm9yTG9nIDogbGliU2ltcGxlTG9nO1xuXHR9XG5cbiAgICAvLyBUaGlzIHRyYW5zbGF0ZXMgdGhlIGRlZmF1bHQgYWRkcmVzcyBtYXBwaW5ncyB0byBzb21ldGhpbmcgZGlmZmVyZW50LlxuICAgIC8vXG4gICAgLy8gRm9yIGluc3RhbmNlIHlvdSBjYW4gcGFzcyBpbiBtYW55ZmVzdCBzY2hlbWEgZGVzY3JpcHRvciBvYmplY3Q6XG4gICAgLy8gXHR7XG5cdC8vXHQgIFwiQWRkcmVzcy5PZi5hXCI6IHsgXCJIYXNoXCI6IFwiYVwiLCBcIlR5cGVcIjogXCJOdW1iZXJcIiB9LFxuXHQvL1x0ICBcIkFkZHJlc3MuT2YuYlwiOiB7IFwiSGFzaFwiOiBcImJcIiwgXCJUeXBlXCI6IFwiTnVtYmVyXCIgfVxuXHQvLyAgfVxuICAgIC8vXG4gICAgLy9cbiAgICAvLyBBbmQgdGhlbiBhbiBhZGRyZXNzIG1hcHBpbmcgKGJhc2ljYWxseSBhIEhhc2gtPkFkZHJlc3MgbWFwKVxuICAgIC8vICB7XG4gICAgLy8gICAgXCJhXCI6IFwiTmV3LkFkZHJlc3MuT2YuYVwiLFxuICAgIC8vICAgIFwiYlwiOiBcIk5ldy5BZGRyZXNzLk9mLmJcIiAgXG4gICAgLy8gIH1cbiAgICAvL1xuICAgIC8vIE5PVEU6IFRoaXMgbXV0YXRlcyB0aGUgc2NoZW1hIG9iamVjdCBwZXJtYW5lbnRseSwgYWx0ZXJpbmcgdGhlIGJhc2UgaGFzaC5cbiAgICAvLyAgICAgICBJZiB0aGVyZSBpcyBhIGNvbGxpc2lvbiB3aXRoIGFuIGV4aXN0aW5nIGFkZHJlc3MsIGl0IGNhbiBsZWFkIHRvIG92ZXJ3cml0ZXMuXG4gICAgLy8gVE9ETzogRGlzY3VzcyB3aGF0IHNob3VsZCBoYXBwZW4gb24gY29sbGlzaW9ucy5cblx0cmVzb2x2ZUFkZHJlc3NNYXBwaW5ncyhwTWFueWZlc3RTY2hlbWFEZXNjcmlwdG9ycywgcEFkZHJlc3NNYXBwaW5nKVxuXHR7XG5cdFx0aWYgKHR5cGVvZihwTWFueWZlc3RTY2hlbWFEZXNjcmlwdG9ycykgIT0gJ29iamVjdCcpXG5cdFx0e1xuXHRcdFx0dGhpcy5sb2dFcnJvcihgQXR0ZW1wdGVkIHRvIHJlc29sdmUgYWRkcmVzcyBtYXBwaW5nIGJ1dCB0aGUgZGVzY3JpcHRvciB3YXMgbm90IGFuIG9iamVjdC5gKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRpZiAodHlwZW9mKHBBZGRyZXNzTWFwcGluZykgIT0gJ29iamVjdCcpXG5cdFx0e1xuXHRcdFx0Ly8gTm8gbWFwcGluZ3Mgd2VyZSBwYXNzZWQgaW5cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdC8vIEdldCB0aGUgYXJyYXlzIG9mIGJvdGggdGhlIHNjaGVtYSBkZWZpbml0aW9uIGFuZCB0aGUgaGFzaCBtYXBwaW5nXG5cdFx0bGV0IHRtcE1hbnlmZXN0QWRkcmVzc2VzID0gT2JqZWN0LmtleXMocE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnMpO1xuXHRcdGxldCB0bXBIYXNoTWFwcGluZyA9IHt9O1xuXHRcdHRtcE1hbnlmZXN0QWRkcmVzc2VzLmZvckVhY2goXG5cdFx0XHQocEFkZHJlc3MpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGlmIChwTWFueWZlc3RTY2hlbWFEZXNjcmlwdG9yc1twQWRkcmVzc10uaGFzT3duUHJvcGVydHkoJ0hhc2gnKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRtcEhhc2hNYXBwaW5nW3BNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzW3BBZGRyZXNzXS5IYXNoXSA9IHBBZGRyZXNzO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdGxldCB0bXBBZGRyZXNzTWFwcGluZ1NldCA9IE9iamVjdC5rZXlzKHBBZGRyZXNzTWFwcGluZyk7XG5cblx0XHR0bXBBZGRyZXNzTWFwcGluZ1NldC5mb3JFYWNoKFxuXHRcdFx0KHBJbnB1dEFkZHJlc3MpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGxldCB0bXBOZXdEZXNjcmlwdG9yQWRkcmVzcyA9IHBBZGRyZXNzTWFwcGluZ1twSW5wdXRBZGRyZXNzXTtcblx0XHRcdFx0bGV0IHRtcE9sZERlc2NyaXB0b3JBZGRyZXNzID0gZmFsc2U7XG5cdFx0XHRcdGxldCB0bXBEZXNjcmlwdG9yID0gZmFsc2U7XG5cblx0XHRcdFx0Ly8gU2VlIGlmIHRoZXJlIGlzIGEgbWF0Y2hpbmcgZGVzY3JpcHRvciBlaXRoZXIgYnkgQWRkcmVzcyBkaXJlY3RseSBvciBIYXNoXG5cdFx0XHRcdGlmIChwTWFueWZlc3RTY2hlbWFEZXNjcmlwdG9ycy5oYXNPd25Qcm9wZXJ0eShwSW5wdXRBZGRyZXNzKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRtcE9sZERlc2NyaXB0b3JBZGRyZXNzID0gcElucHV0QWRkcmVzcztcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlIGlmICh0bXBIYXNoTWFwcGluZy5oYXNPd25Qcm9wZXJ0eShwSW5wdXRBZGRyZXNzKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRtcE9sZERlc2NyaXB0b3JBZGRyZXNzID0gdG1wSGFzaE1hcHBpbmdbcElucHV0QWRkcmVzc107XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBJZiB0aGVyZSB3YXMgYSBtYXRjaGluZyBkZXNjcmlwdG9yIGluIHRoZSBtYW5pZmVzdCwgc3RvcmUgaXQgaW4gdGhlIHRlbXBvcmFyeSBkZXNjcmlwdG9yXG5cdFx0XHRcdGlmICh0bXBPbGREZXNjcmlwdG9yQWRkcmVzcylcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHRtcERlc2NyaXB0b3IgPSBwTWFueWZlc3RTY2hlbWFEZXNjcmlwdG9yc1t0bXBPbGREZXNjcmlwdG9yQWRkcmVzc107XG5cdFx0XHRcdFx0ZGVsZXRlIHBNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzW3RtcE9sZERlc2NyaXB0b3JBZGRyZXNzXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBDcmVhdGUgYSBuZXcgZGVzY3JpcHRvciEgIE1hcCBpdCB0byB0aGUgaW5wdXQgYWRkcmVzcy5cblx0XHRcdFx0XHR0bXBEZXNjcmlwdG9yID0geyBIYXNoOnBJbnB1dEFkZHJlc3MgfTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIE5vdyByZS1hZGQgdGhlIGRlc2NyaXB0b3IgdG8gdGhlIG1hbnlmZXN0IHNjaGVtYVxuXHRcdFx0XHRwTWFueWZlc3RTY2hlbWFEZXNjcmlwdG9yc1t0bXBOZXdEZXNjcmlwdG9yQWRkcmVzc10gPSB0bXBEZXNjcmlwdG9yO1xuXHRcdFx0fSk7XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdHNhZmVSZXNvbHZlQWRkcmVzc01hcHBpbmdzKHBNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzLCBwQWRkcmVzc01hcHBpbmcpXG5cdHtcblx0XHQvLyBUaGlzIHJldHVybnMgdGhlIGRlc2NyaXB0b3JzIGFzIGEgbmV3IG9iamVjdCwgc2FmZWx5IHJlbWFwcGluZyB3aXRob3V0IG11dGF0aW5nIHRoZSBvcmlnaW5hbCBzY2hlbWEgRGVzY3JpcHRvcnNcblx0XHRsZXQgdG1wTWFueWZlc3RTY2hlbWFEZXNjcmlwdG9ycyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkocE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnMpKTtcblx0XHR0aGlzLnJlc29sdmVBZGRyZXNzTWFwcGluZ3ModG1wTWFueWZlc3RTY2hlbWFEZXNjcmlwdG9ycywgcEFkZHJlc3NNYXBwaW5nKTtcblx0XHRyZXR1cm4gdG1wTWFueWZlc3RTY2hlbWFEZXNjcmlwdG9ycztcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IE1hbnlmZXN0U2NoZW1hTWFuaXB1bGF0aW9uOyIsIi8qKlxuKiBAbGljZW5zZSBNSVRcbiogQGF1dGhvciA8c3RldmVuQHZlbG96by5jb20+XG4qL1xubGV0IGxpYlNpbXBsZUxvZyA9IHJlcXVpcmUoJy4vTWFueWZlc3QtTG9nVG9Db25zb2xlLmpzJyk7XG5sZXQgbGliT2JqZWN0QWRkcmVzc1Jlc29sdmVyID0gcmVxdWlyZSgnLi9NYW55ZmVzdC1PYmplY3RBZGRyZXNzUmVzb2x2ZXIuanMnKTtcbmxldCBsaWJIYXNoVHJhbnNsYXRpb24gPSByZXF1aXJlKCcuL01hbnlmZXN0LUhhc2hUcmFuc2xhdGlvbi5qcycpO1xubGV0IGxpYlNjaGVtYU1hbmlwdWxhdGlvbiA9IHJlcXVpcmUoJy4vTWFueWZlc3QtU2NoZW1hTWFuaXB1bGF0aW9uLmpzJyk7XG5cbi8qKlxuKiBNYW55ZmVzdCBvYmplY3QgYWRkcmVzcy1iYXNlZCBkZXNjcmlwdGlvbnMgYW5kIG1hbmlwdWxhdGlvbnMuXG4qXG4qIEBjbGFzcyBNYW55ZmVzdFxuKi9cbmNsYXNzIE1hbnlmZXN0XG57XG5cdGNvbnN0cnVjdG9yKHBNYW5pZmVzdCwgcEluZm9Mb2csIHBFcnJvckxvZywgcE9wdGlvbnMpXG5cdHtcblx0XHQvLyBXaXJlIGluIGxvZ2dpbmdcblx0XHR0aGlzLmxvZ0luZm8gPSAodHlwZW9mKHBJbmZvTG9nKSA9PT0gJ2Z1bmN0aW9uJykgPyBwSW5mb0xvZyA6IGxpYlNpbXBsZUxvZztcblx0XHR0aGlzLmxvZ0Vycm9yID0gKHR5cGVvZihwRXJyb3JMb2cpID09PSAnZnVuY3Rpb24nKSA/IHBFcnJvckxvZyA6IGxpYlNpbXBsZUxvZztcblxuXHRcdC8vIENyZWF0ZSBhbiBvYmplY3QgYWRkcmVzcyByZXNvbHZlciBhbmQgbWFwIGluIHRoZSBmdW5jdGlvbnNcblx0XHR0aGlzLm9iamVjdEFkZHJlc3NSZXNvbHZlciA9IG5ldyBsaWJPYmplY3RBZGRyZXNzUmVzb2x2ZXIodGhpcy5sb2dJbmZvLCB0aGlzLmxvZ0Vycm9yKTtcblxuXHRcdHRoaXMub3B0aW9ucyA9IChcblx0XHRcdHtcblx0XHRcdFx0c3RyaWN0OiBmYWxzZSxcblx0XHRcdFx0ZGVmYXVsdFZhbHVlczogXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XCJTdHJpbmdcIjogXCJcIixcblx0XHRcdFx0XHRcdFwiTnVtYmVyXCI6IDAsXG5cdFx0XHRcdFx0XHRcIkZsb2F0XCI6IDAuMCxcblx0XHRcdFx0XHRcdFwiSW50ZWdlclwiOiAwLFxuXHRcdFx0XHRcdFx0XCJCb29sZWFuXCI6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XCJCaW5hcnlcIjogMCxcblx0XHRcdFx0XHRcdFwiRGF0ZVRpbWVcIjogMCxcblx0XHRcdFx0XHRcdFwiQXJyYXlcIjogW10sXG5cdFx0XHRcdFx0XHRcIk9iamVjdFwiOiB7fSxcblx0XHRcdFx0XHRcdFwiTnVsbFwiOiBudWxsXG5cdFx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHR0aGlzLnNjb3BlID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMuZWxlbWVudEFkZHJlc3NlcyA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLmVsZW1lbnRIYXNoZXMgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5lbGVtZW50RGVzY3JpcHRvcnMgPSB1bmRlZmluZWQ7XG5cblx0XHR0aGlzLnJlc2V0KCk7XG5cblx0XHRpZiAodHlwZW9mKHBNYW5pZmVzdCkgPT09ICdvYmplY3QnKVxuXHRcdHtcblx0XHRcdHRoaXMubG9hZE1hbmlmZXN0KHBNYW5pZmVzdCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5zY2hlbWFNYW5pcHVsYXRpb25zID0gbmV3IGxpYlNjaGVtYU1hbmlwdWxhdGlvbih0aGlzLmxvZ0luZm8sIHRoaXMubG9nRXJyb3IpO1xuXG5cdFx0dGhpcy5oYXNoVHJhbnNsYXRpb25zID0gbmV3IGxpYkhhc2hUcmFuc2xhdGlvbih0aGlzLmxvZ0luZm8sIHRoaXMubG9nRXJyb3IpO1xuXHR9XG5cblx0LyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblx0ICogU2NoZW1hIE1hbmlmZXN0IExvYWRpbmcsIFJlYWRpbmcsIE1hbmlwdWxhdGlvbiBhbmQgU2VyaWFsaXphdGlvbiBGdW5jdGlvbnNcblx0ICovXG5cblx0Ly8gUmVzZXQgY3JpdGljYWwgbWFuaWZlc3QgcHJvcGVydGllc1xuXHRyZXNldCgpXG5cdHtcblx0XHR0aGlzLnNjb3BlID0gJ0RFRkFVTFQnO1xuXHRcdHRoaXMuZWxlbWVudEFkZHJlc3NlcyA9IFtdO1xuXHRcdHRoaXMuZWxlbWVudEhhc2hlcyA9IHt9O1xuXHRcdHRoaXMuZWxlbWVudERlc2NyaXB0b3JzID0ge307XG5cdH1cblxuXHQvLyBEZXNlcmlhbGl6ZSBhIE1hbmlmZXN0IGZyb20gYSBzdHJpbmdcblx0ZGVzZXJpYWxpemUocE1hbmlmZXN0U3RyaW5nKVxuXHR7XG5cdFx0Ly8gVE9ETzogQWRkIGd1YXJkcyBmb3IgYmFkIG1hbmlmZXN0IHN0cmluZ1xuXHRcdHJldHVybiB0aGlzLmxvYWRNYW5pZmVzdChKU09OLnBhcnNlKHBNYW5pZmVzdFN0cmluZykpO1xuXHR9XG5cblx0Ly8gTG9hZCBhIG1hbmlmZXN0IGZyb20gYW4gb2JqZWN0XG5cdGxvYWRNYW5pZmVzdChwTWFuaWZlc3QpXG5cdHtcblx0XHRpZiAodHlwZW9mKHBNYW5pZmVzdCkgIT09ICdvYmplY3QnKVxuXHRcdHtcblx0XHRcdHRoaXMubG9nRXJyb3IoYCgke3RoaXMuc2NvcGV9KSBFcnJvciBsb2FkaW5nIG1hbmlmZXN0OyBleHBlY3RpbmcgYW4gb2JqZWN0IGJ1dCBwYXJhbWV0ZXIgd2FzIHR5cGUgJHt0eXBlb2YocE1hbmlmZXN0KX0uYCk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0aWYgKHBNYW5pZmVzdC5oYXNPd25Qcm9wZXJ0eSgnU2NvcGUnKSlcblx0XHR7XG5cdFx0XHRpZiAodHlwZW9mKHBNYW5pZmVzdC5TY29wZSkgPT09ICdzdHJpbmcnKVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLnNjb3BlID0gcE1hbmlmZXN0LlNjb3BlO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLmxvZ0Vycm9yKGAoJHt0aGlzLnNjb3BlfSkgRXJyb3IgbG9hZGluZyBzY29wZSBmcm9tIG1hbmlmZXN0OyBleHBlY3RpbmcgYSBzdHJpbmcgYnV0IHByb3BlcnR5IHdhcyB0eXBlICR7dHlwZW9mKHBNYW5pZmVzdC5TY29wZSl9LmAsIHBNYW5pZmVzdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR0aGlzLmxvZ0Vycm9yKGAoJHt0aGlzLnNjb3BlfSkgRXJyb3IgbG9hZGluZyBzY29wZSBmcm9tIG1hbmlmZXN0IG9iamVjdC4gIFByb3BlcnR5IFwiU2NvcGVcIiBkb2VzIG5vdCBleGlzdCBpbiB0aGUgcm9vdCBvZiB0aGUgb2JqZWN0LmAsIHBNYW5pZmVzdCk7XG5cdFx0fVxuXG5cdFx0aWYgKHBNYW5pZmVzdC5oYXNPd25Qcm9wZXJ0eSgnRGVzY3JpcHRvcnMnKSlcblx0XHR7XG5cdFx0XHRpZiAodHlwZW9mKHBNYW5pZmVzdC5EZXNjcmlwdG9ycykgPT09ICdvYmplY3QnKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdG1wRGVzY3JpcHRpb25BZGRyZXNzZXMgPSBPYmplY3Qua2V5cyhwTWFuaWZlc3QuRGVzY3JpcHRvcnMpO1xuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRtcERlc2NyaXB0aW9uQWRkcmVzc2VzLmxlbmd0aDsgaSsrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGhpcy5hZGREZXNjcmlwdG9yKHRtcERlc2NyaXB0aW9uQWRkcmVzc2VzW2ldLCBwTWFuaWZlc3QuRGVzY3JpcHRvcnNbdG1wRGVzY3JpcHRpb25BZGRyZXNzZXNbaV1dKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLmxvZ0Vycm9yKGAoJHt0aGlzLnNjb3BlfSkgRXJyb3IgbG9hZGluZyBkZXNjcmlwdGlvbiBvYmplY3QgZnJvbSBtYW5pZmVzdCBvYmplY3QuICBFeHBlY3RpbmcgYW4gb2JqZWN0IGluICdNYW5pZmVzdC5EZXNjcmlwdG9ycycgYnV0IHRoZSBwcm9wZXJ0eSB3YXMgdHlwZSAke3R5cGVvZihwTWFuaWZlc3QuRGVzY3JpcHRvcnMpfS5gLCBwTWFuaWZlc3QpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0dGhpcy5sb2dFcnJvcihgKCR7dGhpcy5zY29wZX0pIEVycm9yIGxvYWRpbmcgb2JqZWN0IGRlc2NyaXB0aW9uIGZyb20gbWFuaWZlc3Qgb2JqZWN0LiAgUHJvcGVydHkgXCJEZXNjcmlwdG9yc1wiIGRvZXMgbm90IGV4aXN0IGluIHRoZSByb290IG9mIHRoZSBNYW5pZmVzdCBvYmplY3QuYCwgcE1hbmlmZXN0KTtcblx0XHR9XG5cdH1cblxuXHQvLyBTZXJpYWxpemUgdGhlIE1hbmlmZXN0IHRvIGEgc3RyaW5nXG5cdHNlcmlhbGl6ZSgpXG5cdHtcblx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5nZXRNYW5pZmVzdCgpKTtcblx0fVxuXG5cdGdldE1hbmlmZXN0KClcblx0e1xuXHRcdGxldCB0bXBNYW5pZmVzdCA9IChcblx0XHRcdHtcblx0XHRcdFx0U2NvcGU6IHRoaXMuc2NvcGUsXG5cdFx0XHRcdERlc2NyaXB0b3JzOiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuZWxlbWVudERlc2NyaXB0b3JzKSlcblx0XHRcdH0pO1xuXHR9XG5cblx0Ly8gQWRkIGEgZGVzY3JpcHRvciB0byB0aGUgbWFuaWZlc3Rcblx0YWRkRGVzY3JpcHRvcihwQWRkcmVzcywgcERlc2NyaXB0b3IpXG5cdHtcblx0XHRpZiAodHlwZW9mKHBEZXNjcmlwdG9yKSA9PT0gJ29iamVjdCcpXG5cdFx0e1xuXHRcdFx0Ly8gQWRkIHRoZSBBZGRyZXNzIGludG8gdGhlIERlc2NyaXB0b3IgaWYgaXQgZG9lc24ndCBleGlzdDpcblx0XHRcdGlmICghcERlc2NyaXB0b3IuaGFzT3duUHJvcGVydHkoJ0FkZHJlc3MnKSlcblx0XHRcdHtcblx0XHRcdFx0cERlc2NyaXB0b3IuQWRkcmVzcyA9IHBBZGRyZXNzO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIXRoaXMuZWxlbWVudERlc2NyaXB0b3JzLmhhc093blByb3BlcnR5KHBBZGRyZXNzKSlcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5lbGVtZW50QWRkcmVzc2VzLnB1c2gocEFkZHJlc3MpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBBZGQgdGhlIGVsZW1lbnQgZGVzY3JpcHRvciB0byB0aGUgc2NoZW1hXG5cdFx0XHR0aGlzLmVsZW1lbnREZXNjcmlwdG9yc1twQWRkcmVzc10gPSBwRGVzY3JpcHRvcjtcblxuXHRcdFx0Ly8gQWx3YXlzIGFkZCB0aGUgYWRkcmVzcyBhcyBhIGhhc2hcblx0XHRcdHRoaXMuZWxlbWVudEhhc2hlc1twQWRkcmVzc10gPSBwQWRkcmVzcztcblxuXHRcdFx0aWYgKHBEZXNjcmlwdG9yLmhhc093blByb3BlcnR5KCdIYXNoJykpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIFRPRE86IENoZWNrIGlmIHRoaXMgaXMgYSBnb29kIGlkZWEgb3Igbm90Li5cblx0XHRcdFx0Ly8gICAgICAgQ29sbGlzaW9ucyBhcmUgYm91bmQgdG8gaGFwcGVuIHdpdGggYm90aCByZXByZXNlbnRhdGlvbnMgb2YgdGhlIGFkZHJlc3MvaGFzaCBpbiBoZXJlIGFuZCBkZXZlbG9wZXJzIGJlaW5nIGFibGUgdG8gY3JlYXRlIHRoZWlyIG93biBoYXNoZXMuXG5cdFx0XHRcdHRoaXMuZWxlbWVudEhhc2hlc1twRGVzY3JpcHRvci5IYXNoXSA9IHBBZGRyZXNzO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRwRGVzY3JpcHRvci5IYXNoID0gcEFkZHJlc3M7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0dGhpcy5sb2dFcnJvcihgKCR7dGhpcy5zY29wZX0pIEVycm9yIGxvYWRpbmcgb2JqZWN0IGRlc2NyaXB0b3IgZm9yIGFkZHJlc3MgJyR7cEFkZHJlc3N9JyBmcm9tIG1hbmlmZXN0IG9iamVjdC4gIEV4cGVjdGluZyBhbiBvYmplY3QgYnV0IHByb3BlcnR5IHdhcyB0eXBlICR7dHlwZW9mKHBEZXNjcmlwdG9yKX0uYCk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVx0XG5cdH1cblxuXHRnZXREZXNjcmlwdG9yQnlIYXNoKHBIYXNoKVxuXHR7XG5cdFx0aWYgKHRoaXMuZWxlbWVudEhhc2hlcy5oYXNPd25Qcm9wZXJ0eShwSGFzaCkgfHwgdGhpcy5oYXNoVHJhbnNsYXRpb25zLnRyYW5zbGF0aW9uVGFibGUuaGFzT3duUHJvcGVydHkocEhhc2gpKVxuXHRcdHtcblx0XHRcdHJldHVybiB0aGlzLmdldERlc2NyaXB0b3IodGhpcy5lbGVtZW50SGFzaGVzW3RoaXMuaGFzaFRyYW5zbGF0aW9ucy50cmFuc2xhdGUocEhhc2gpXSk7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR0aGlzLmxvZ0Vycm9yKGAoJHt0aGlzLnNjb3BlfSkgRXJyb3IgaW4gZ2V0RGVzY3JpcHRvckJ5SGFzaDsgdGhlIEhhc2ggJHtwSGFzaH0gZG9lc24ndCBleGlzdCBpbiB0aGUgc2NoZW1hLmApO1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdH1cblxuXHRnZXREZXNjcmlwdG9yKHBBZGRyZXNzKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuZWxlbWVudERlc2NyaXB0b3JzW3BBZGRyZXNzXTtcblx0fVxuXG5cdC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cdCAqIEJlZ2lubmluZyBvZiBPYmplY3QgTWFuaXB1bGF0aW9uIChyZWFkICYgd3JpdGUpIEZ1bmN0aW9uc1xuXHQgKi9cblx0Ly8gQ2hlY2sgaWYgYW4gZWxlbWVudCBleGlzdHMgYnkgaXRzIGhhc2hcblx0Y2hlY2tBZGRyZXNzRXhpc3RzQnlIYXNoIChwT2JqZWN0LCBwSGFzaClcblx0e1xuXHRcdGlmICh0aGlzLmVsZW1lbnRIYXNoZXMuaGFzT3duUHJvcGVydHkocEhhc2gpIHx8IHRoaXMuaGFzaFRyYW5zbGF0aW9ucy50cmFuc2xhdGlvblRhYmxlLmhhc093blByb3BlcnR5KHBIYXNoKSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gdGhpcy5jaGVja0FkZHJlc3NFeGlzdHMocE9iamVjdCwgdGhpcy5lbGVtZW50SGFzaGVzW3RoaXMuaGFzaFRyYW5zbGF0aW9ucy50cmFuc2xhdGUocEhhc2gpXSk7XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR0aGlzLmxvZ0Vycm9yKGAoJHt0aGlzLnNjb3BlfSkgRXJyb3IgaW4gY2hlY2tBZGRyZXNzRXhpc3RzQnlIYXNoOyB0aGUgSGFzaCAke3BIYXNofSBkb2Vzbid0IGV4aXN0IGluIHRoZSBzY2hlbWEuYCk7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxuXG5cdC8vIENoZWNrIGlmIGFuIGVsZW1lbnQgZXhpc3RzIGF0IGFuIGFkZHJlc3Ncblx0Y2hlY2tBZGRyZXNzRXhpc3RzIChwT2JqZWN0LCBwQWRkcmVzcylcblx0e1xuXHRcdHJldHVybiB0aGlzLm9iamVjdEFkZHJlc3NSZXNvbHZlci5jaGVja0FkZHJlc3NFeGlzdHMocE9iamVjdCwgcEFkZHJlc3MpO1xuXHR9XG5cblxuXHQvLyBHZXQgdGhlIHZhbHVlIG9mIGFuIGVsZW1lbnQgYnkgaXRzIGhhc2hcblx0Z2V0VmFsdWVCeUhhc2ggKHBPYmplY3QsIHBIYXNoKVxuXHR7XG5cdFx0aWYgKHRoaXMuZWxlbWVudEhhc2hlcy5oYXNPd25Qcm9wZXJ0eShwSGFzaCkgfHwgdGhpcy5oYXNoVHJhbnNsYXRpb25zLnRyYW5zbGF0aW9uVGFibGUuaGFzT3duUHJvcGVydHkocEhhc2gpKVxuXHRcdHtcblx0XHRcdHJldHVybiB0aGlzLmdldFZhbHVlQXRBZGRyZXNzKHBPYmplY3QsIHRoaXMuZWxlbWVudEhhc2hlc1t0aGlzLmhhc2hUcmFuc2xhdGlvbnMudHJhbnNsYXRlKHBIYXNoKV0pO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0dGhpcy5sb2dFcnJvcihgKCR7dGhpcy5zY29wZX0pIEVycm9yIGluIGdldFZhbHVlQnlIYXNoOyB0aGUgSGFzaCAke3BIYXNofSBkb2Vzbid0IGV4aXN0IGluIHRoZSBzY2hlbWEuYCk7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxuXG5cdC8vIEdldCB0aGUgdmFsdWUgb2YgYW4gZWxlbWVudCBhdCBhbiBhZGRyZXNzXG5cdGdldFZhbHVlQXRBZGRyZXNzIChwT2JqZWN0LCBwQWRkcmVzcylcblx0e1xuXHRcdHJldHVybiB0aGlzLm9iamVjdEFkZHJlc3NSZXNvbHZlci5nZXRWYWx1ZUF0QWRkcmVzcyhwT2JqZWN0LCBwQWRkcmVzcyk7XG5cdH1cblxuXHQvLyBTZXQgdGhlIHZhbHVlIG9mIGFuIGVsZW1lbnQgYnkgaXRzIGhhc2hcblx0c2V0VmFsdWVCeUhhc2gocE9iamVjdCwgcEhhc2gsIHBWYWx1ZSlcblx0e1xuXHRcdGlmICh0aGlzLmVsZW1lbnRIYXNoZXMuaGFzT3duUHJvcGVydHkocEhhc2gpIHx8IHRoaXMuaGFzaFRyYW5zbGF0aW9ucy50cmFuc2xhdGlvblRhYmxlLmhhc093blByb3BlcnR5KHBIYXNoKSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gdGhpcy5zZXRWYWx1ZUF0QWRkcmVzcyhwT2JqZWN0LCB0aGlzLmVsZW1lbnRIYXNoZXNbdGhpcy5oYXNoVHJhbnNsYXRpb25zLnRyYW5zbGF0ZShwSGFzaCldLCBwVmFsdWUpO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0dGhpcy5sb2dFcnJvcihgKCR7dGhpcy5zY29wZX0pIEVycm9yIGluIHNldFZhbHVlQnlIYXNoOyB0aGUgSGFzaCAke3BIYXNofSBkb2Vzbid0IGV4aXN0IGluIHRoZSBzY2hlbWEuICBWYWx1ZSAke3BWYWx1ZX0gd2lsbCBub3QgYmUgd3JpdHRlbiFgKTtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG5cblxuXHQvLyBTZXQgdGhlIHZhbHVlIG9mIGFuIGVsZW1lbnQgYXQgYW4gYWRkcmVzc1xuXHRzZXRWYWx1ZUF0QWRkcmVzcyAocE9iamVjdCwgcEFkZHJlc3MsIHBWYWx1ZSlcblx0e1xuXHRcdHJldHVybiB0aGlzLm9iamVjdEFkZHJlc3NSZXNvbHZlci5zZXRWYWx1ZUF0QWRkcmVzcyhwT2JqZWN0LCBwQWRkcmVzcywgcFZhbHVlKTtcblx0fVxuXG5cdC8vIFZhbGlkYXRlIHRoZSBjb25zaXN0ZW5jeSBvZiBhbiBvYmplY3QgYWdhaW5zdCB0aGUgc2NoZW1hXG5cdHZhbGlkYXRlKHBPYmplY3QpXG5cdHtcblx0XHRsZXQgdG1wVmFsaWRhdGlvbkRhdGEgPVxuXHRcdHtcblx0XHRcdEVycm9yOiBudWxsLFxuXHRcdFx0RXJyb3JzOiBbXSxcblx0XHRcdE1pc3NpbmdFbGVtZW50czpbXVxuXHRcdH07XG5cblx0XHRpZiAodHlwZW9mKHBPYmplY3QpICE9PSAnb2JqZWN0Jylcblx0XHR7XG5cdFx0XHR0bXBWYWxpZGF0aW9uRGF0YS5FcnJvciA9IHRydWU7XG5cdFx0XHR0bXBWYWxpZGF0aW9uRGF0YS5FcnJvcnMucHVzaChgRXhwZWN0ZWQgcGFzc2VkIGluIG9iamVjdCB0byBiZSB0eXBlIG9iamVjdCBidXQgd2FzIHBhc3NlZCBpbiAke3R5cGVvZihwT2JqZWN0KX1gKTtcblx0XHR9XG5cblx0XHRsZXQgYWRkVmFsaWRhdGlvbkVycm9yID0gKHBBZGRyZXNzLCBwRXJyb3JNZXNzYWdlKSA9PlxuXHRcdHtcblx0XHRcdHRtcFZhbGlkYXRpb25EYXRhLkVycm9yID0gdHJ1ZTtcblx0XHRcdHRtcFZhbGlkYXRpb25EYXRhLkVycm9ycy5wdXNoKGBFbGVtZW50IGF0IGFkZHJlc3MgXCIke3BBZGRyZXNzfVwiICR7cEVycm9yTWVzc2FnZX0uYCk7XG5cdFx0fTtcblxuXHRcdC8vIE5vdyBlbnVtZXJhdGUgdGhyb3VnaCB0aGUgdmFsdWVzIGFuZCBjaGVjayBmb3IgYW5vbWFsaWVzIGJhc2VkIG9uIHRoZSBzY2hlbWFcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZWxlbWVudEFkZHJlc3Nlcy5sZW5ndGg7IGkrKylcblx0XHR7XG5cdFx0XHRsZXQgdG1wRGVzY3JpcHRvciA9IHRoaXMuZ2V0RGVzY3JpcHRvcih0aGlzLmVsZW1lbnRBZGRyZXNzZXNbaV0pO1xuXHRcdFx0bGV0IHRtcFZhbHVlID0gdGhpcy5nZXRWYWx1ZUF0QWRkcmVzcyhwT2JqZWN0LCB0bXBEZXNjcmlwdG9yLkFkZHJlc3MpO1xuXG5cdFx0XHRpZiAodHlwZW9mKHRtcFZhbHVlKSA9PSAndW5kZWZpbmVkJylcblx0XHRcdHtcblx0XHRcdFx0Ly8gVGhpcyB3aWxsIHRlY2huaWNhbGx5IG1lYW4gdGhhdCBgT2JqZWN0LlNvbWUuVmFsdWUgPSB1bmRlZmluZWRgIHdpbGwgZW5kIHVwIHNob3dpbmcgYXMgXCJtaXNzaW5nXCJcblx0XHRcdFx0Ly8gVE9ETzogRG8gd2Ugd2FudCB0byBkbyBhIGRpZmZlcmVudCBtZXNzYWdlIGJhc2VkIG9uIGlmIHRoZSBwcm9wZXJ0eSBleGlzdHMgYnV0IGlzIHVuZGVmaW5lZD9cblx0XHRcdFx0dG1wVmFsaWRhdGlvbkRhdGEuTWlzc2luZ0VsZW1lbnRzLnB1c2godG1wRGVzY3JpcHRvci5BZGRyZXNzKTtcblx0XHRcdFx0aWYgKHRtcERlc2NyaXB0b3IuUmVxdWlyZWQgfHwgdGhpcy5vcHRpb25zLnN0cmljdClcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGFkZFZhbGlkYXRpb25FcnJvcih0bXBEZXNjcmlwdG9yLkFkZHJlc3MsICdpcyBmbGFnZ2VkIFJFUVVJUkVEIGJ1dCBpcyBub3Qgc2V0IGluIHRoZSBvYmplY3QnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvLyBOb3cgc2VlIGlmIHRoZXJlIGlzIGEgZGF0YSB0eXBlIHNwZWNpZmllZCBmb3IgdGhpcyBlbGVtZW50XG5cdFx0XHRpZiAodG1wRGVzY3JpcHRvci5EYXRhVHlwZSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IHRtcEVsZW1lbnRUeXBlID0gdHlwZW9mKHRtcFZhbHVlKTtcblx0XHRcdFx0c3dpdGNoKHRtcERlc2NyaXB0b3IuRGF0YVR5cGUudG9TdHJpbmcoKS50cmltKCkudG9Mb3dlckNhc2UoKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNhc2UgJ3N0cmluZyc6XG5cdFx0XHRcdFx0XHRpZiAodG1wRWxlbWVudFR5cGUgIT0gJ3N0cmluZycpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGFkZFZhbGlkYXRpb25FcnJvcih0bXBEZXNjcmlwdG9yLkFkZHJlc3MsIGBoYXMgYSBEYXRhVHlwZSAke3RtcERlc2NyaXB0b3IuRGF0YVR5cGV9IGJ1dCBpcyBvZiB0aGUgdHlwZSAke3RtcEVsZW1lbnRUeXBlfWApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlICdudW1iZXInOlxuXHRcdFx0XHRcdFx0aWYgKHRtcEVsZW1lbnRUeXBlICE9ICdudW1iZXInKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRhZGRWYWxpZGF0aW9uRXJyb3IodG1wRGVzY3JpcHRvci5BZGRyZXNzLCBgaGFzIGEgRGF0YVR5cGUgJHt0bXBEZXNjcmlwdG9yLkRhdGFUeXBlfSBidXQgaXMgb2YgdGhlIHR5cGUgJHt0bXBFbGVtZW50VHlwZX1gKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0Y2FzZSAnaW50ZWdlcic6XG5cdFx0XHRcdFx0XHRpZiAodG1wRWxlbWVudFR5cGUgIT0gJ251bWJlcicpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGFkZFZhbGlkYXRpb25FcnJvcih0bXBEZXNjcmlwdG9yLkFkZHJlc3MsIGBoYXMgYSBEYXRhVHlwZSAke3RtcERlc2NyaXB0b3IuRGF0YVR5cGV9IGJ1dCBpcyBvZiB0aGUgdHlwZSAke3RtcEVsZW1lbnRUeXBlfWApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZWxzZVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRsZXQgdG1wVmFsdWVTdHJpbmcgPSB0bXBWYWx1ZS50b1N0cmluZygpO1xuXHRcdFx0XHRcdFx0XHRpZiAodG1wVmFsdWVTdHJpbmcuaW5kZXhPZignLicpID4gLTEpXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHQvLyBUT0RPOiBJcyB0aGlzIGFuIGVycm9yP1xuXHRcdFx0XHRcdFx0XHRcdGFkZFZhbGlkYXRpb25FcnJvcih0bXBEZXNjcmlwdG9yLkFkZHJlc3MsIGBoYXMgYSBEYXRhVHlwZSAke3RtcERlc2NyaXB0b3IuRGF0YVR5cGV9IGJ1dCBoYXMgYSBkZWNpbWFsIHBvaW50IGluIHRoZSBudW1iZXIuYCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0Y2FzZSAnZmxvYXQnOlxuXHRcdFx0XHRcdFx0aWYgKHRtcEVsZW1lbnRUeXBlICE9ICdudW1iZXInKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRhZGRWYWxpZGF0aW9uRXJyb3IodG1wRGVzY3JpcHRvci5BZGRyZXNzLCBgaGFzIGEgRGF0YVR5cGUgJHt0bXBEZXNjcmlwdG9yLkRhdGFUeXBlfSBidXQgaXMgb2YgdGhlIHR5cGUgJHt0bXBFbGVtZW50VHlwZX1gKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0Y2FzZSAnRGF0ZVRpbWUnOlxuXHRcdFx0XHRcdFx0bGV0IHRtcFZhbHVlRGF0ZSA9IG5ldyBEYXRlKHRtcFZhbHVlKTtcblx0XHRcdFx0XHRcdGlmICh0bXBWYWx1ZURhdGUudG9TdHJpbmcoKSA9PSAnSW52YWxpZCBEYXRlJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YWRkVmFsaWRhdGlvbkVycm9yKHRtcERlc2NyaXB0b3IuQWRkcmVzcywgYGhhcyBhIERhdGFUeXBlICR7dG1wRGVzY3JpcHRvci5EYXRhVHlwZX0gYnV0IGlzIG5vdCBwYXJzYWJsZSBhcyBhIERhdGUgYnkgSmF2YXNjcmlwdGApO1xuXHRcdFx0XHRcdFx0fVxuXHRcblx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdFx0Ly8gQ2hlY2sgaWYgdGhpcyBpcyBhIHN0cmluZywgaW4gdGhlIGRlZmF1bHQgY2FzZVxuXHRcdFx0XHRcdFx0Ly8gTm90ZSB0aGlzIGlzIG9ubHkgd2hlbiBhIERhdGFUeXBlIGlzIHNwZWNpZmllZCBhbmQgaXQgaXMgYW4gdW5yZWNvZ25pemVkIGRhdGEgdHlwZS5cblx0XHRcdFx0XHRcdGlmICh0bXBFbGVtZW50VHlwZSAhPSAnc3RyaW5nJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YWRkVmFsaWRhdGlvbkVycm9yKHRtcERlc2NyaXB0b3IuQWRkcmVzcywgYGhhcyBhIERhdGFUeXBlICR7dG1wRGVzY3JpcHRvci5EYXRhVHlwZX0gKHdoaWNoIGF1dG8tY29udmVydGVkIHRvIFN0cmluZyBiZWNhdXNlIGl0IHdhcyB1bnJlY29nbml6ZWQpIGJ1dCBpcyBvZiB0aGUgdHlwZSAke3RtcEVsZW1lbnRUeXBlfWApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gdG1wVmFsaWRhdGlvbkRhdGE7XG5cdH1cblxuXHQvLyBSZXR1cm5zIGEgZGVmYXVsdCB2YWx1ZSwgb3IsIHRoZSBkZWZhdWx0IHZhbHVlIGZvciB0aGUgZGF0YSB0eXBlICh3aGljaCBpcyBvdmVycmlkYWJsZSB3aXRoIGNvbmZpZ3VyYXRpb24pXG5cdGdldERlZmF1bHRWYWx1ZShwRGVzY3JpcHRvcilcblx0e1xuXHRcdGlmIChwRGVzY3JpcHRvci5oYXNPd25Qcm9wZXJ0eSgnRGVmYXVsdCcpKVxuXHRcdHtcblx0XHRcdHJldHVybiBwRGVzY3JpcHRvci5EZWZhdWx0O1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0Ly8gRGVmYXVsdCB0byBhIG51bGwgaWYgaXQgZG9lc24ndCBoYXZlIGEgdHlwZSBzcGVjaWZpZWQuXG5cdFx0XHQvLyBUaGlzIHdpbGwgZW5zdXJlIGEgcGxhY2Vob2xkZXIgaXMgY3JlYXRlZCBidXQgaXNuJ3QgbWlzaW50ZXJwcmV0ZWQuXG5cdFx0XHRsZXQgdG1wRGF0YVR5cGUgPSAocERlc2NyaXB0b3IuaGFzT3duUHJvcGVydHkoJ0RhdGFUeXBlJykpID8gcERlc2NyaXB0b3IuRGF0YVR5cGUgOiAnU3RyaW5nJztcblx0XHRcdGlmICh0aGlzLm9wdGlvbnMuZGVmYXVsdFZhbHVlcy5oYXNPd25Qcm9wZXJ0eSh0bXBEYXRhVHlwZSkpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiB0aGlzLm9wdGlvbnMuZGVmYXVsdFZhbHVlc1t0bXBEYXRhVHlwZV07XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdC8vIGdpdmUgdXAgYW5kIHJldHVybiBudWxsXG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIEVudW1lcmF0ZSB0aHJvdWdoIHRoZSBzY2hlbWEgYW5kIHBvcHVsYXRlIGRlZmF1bHQgdmFsdWVzIGlmIHRoZXkgZG9uJ3QgZXhpc3QuXG5cdHBvcHVsYXRlRGVmYXVsdHMocE9iamVjdCwgcE92ZXJ3cml0ZVByb3BlcnRpZXMpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5wb3B1bGF0ZU9iamVjdChwT2JqZWN0LCBwT3ZlcndyaXRlUHJvcGVydGllcyxcblx0XHRcdC8vIFRoaXMganVzdCBzZXRzIHVwIGEgc2ltcGxlIGZpbHRlciB0byBzZWUgaWYgdGhlcmUgaXMgYSBkZWZhdWx0IHNldC5cblx0XHRcdChwRGVzY3JpcHRvcikgPT5cblx0XHRcdHtcblx0XHRcdFx0cmV0dXJuIHBEZXNjcmlwdG9yLmhhc093blByb3BlcnR5KCdEZWZhdWx0Jyk7XG5cdFx0XHR9KTtcblx0fVxuXG5cdC8vIEZvcmNlZnVsbHkgcG9wdWxhdGUgYWxsIHZhbHVlcyBldmVuIGlmIHRoZXkgZG9uJ3QgaGF2ZSBkZWZhdWx0cy5cblx0Ly8gQmFzZWQgb24gdHlwZSwgdGhpcyBjYW4gZG8gdW5leHBlY3RlZCB0aGluZ3MuXG5cdHBvcHVsYXRlT2JqZWN0KHBPYmplY3QsIHBPdmVyd3JpdGVQcm9wZXJ0aWVzLCBmRmlsdGVyKVxuXHR7XG5cdFx0Ly8gQXV0b21hdGljYWxseSBjcmVhdGUgYW4gb2JqZWN0IGlmIG9uZSBpc24ndCBwYXNzZWQgaW4uXG5cdFx0bGV0IHRtcE9iamVjdCA9ICh0eXBlb2YocE9iamVjdCkgPT09ICdvYmplY3QnKSA/IHBPYmplY3QgOiB7fTtcblx0XHQvLyBEZWZhdWx0IHRvICpOT1QgT1ZFUldSSVRJTkcqIHByb3BlcnRpZXNcblx0XHRsZXQgdG1wT3ZlcndyaXRlUHJvcGVydGllcyA9ICh0eXBlb2YocE92ZXJ3cml0ZVByb3BlcnRpZXMpID09ICd1bmRlZmluZWQnKSA/IGZhbHNlIDogcE92ZXJ3cml0ZVByb3BlcnRpZXM7XG5cdFx0Ly8gVGhpcyBpcyBhIGZpbHRlciBmdW5jdGlvbiwgd2hpY2ggaXMgcGFzc2VkIHRoZSBzY2hlbWEgYW5kIGFsbG93cyBjb21wbGV4IGZpbHRlcmluZyBvZiBwb3B1bGF0aW9uXG5cdFx0Ly8gVGhlIGRlZmF1bHQgZmlsdGVyIGZ1bmN0aW9uIGp1c3QgcmV0dXJucyB0cnVlLCBwb3B1bGF0aW5nIGV2ZXJ5dGhpbmcuXG5cdFx0bGV0IHRtcEZpbHRlckZ1bmN0aW9uID0gKHR5cGVvZihmRmlsdGVyKSA9PSAnZnVuY3Rpb24nKSA/IGZGaWx0ZXIgOiAocERlc2NyaXB0b3IpID0+IHsgcmV0dXJuIHRydWU7IH07XG5cblx0XHR0aGlzLmVsZW1lbnRBZGRyZXNzZXMuZm9yRWFjaChcblx0XHRcdChwQWRkcmVzcykgPT5cblx0XHRcdHtcblx0XHRcdFx0bGV0IHRtcERlc2NyaXB0b3IgPSB0aGlzLmdldERlc2NyaXB0b3IocEFkZHJlc3MpO1xuXHRcdFx0XHQvLyBDaGVjayB0aGUgZmlsdGVyIGZ1bmN0aW9uIHRvIHNlZSBpZiB0aGlzIGlzIGFuIGFkZHJlc3Mgd2Ugd2FudCB0byBzZXQgdGhlIHZhbHVlIGZvci5cblx0XHRcdFx0aWYgKHRtcEZpbHRlckZ1bmN0aW9uKHRtcERlc2NyaXB0b3IpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gSWYgd2UgYXJlIG92ZXJ3cml0aW5nIHByb3BlcnRpZXMgT1IgdGhlIHByb3BlcnR5IGRvZXMgbm90IGV4aXN0XG5cdFx0XHRcdFx0aWYgKHRtcE92ZXJ3cml0ZVByb3BlcnRpZXMgfHwgIXRoaXMuY2hlY2tBZGRyZXNzRXhpc3RzKHRtcE9iamVjdCwgcEFkZHJlc3MpKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdHRoaXMuc2V0VmFsdWVBdEFkZHJlc3ModG1wT2JqZWN0LCBwQWRkcmVzcywgdGhpcy5nZXREZWZhdWx0VmFsdWUodG1wRGVzY3JpcHRvcikpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRyZXR1cm4gdG1wT2JqZWN0O1xuXHR9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hbnlmZXN0OyJdfQ==
