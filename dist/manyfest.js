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
},{"./Manyfest.js":7}],2:[function(require,module,exports){
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
class ManyfestObjectAddressGeneration
{
	constructor(pInfoLog, pErrorLog)
	{
		// Wire in logging
		this.logInfo = (typeof(pInfoLog) == 'function') ? pInfoLog : libSimpleLog;
		this.logError = (typeof(pErrorLog) == 'function') ? pErrorLog : libSimpleLog;
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
	generateAddressses (pObject, pBaseAddress, pSchema)
	{
		let tmpBaseAddress = (typeof(pBaseAddress) == 'string') ? pBaseAddress : '';
		let tmpSchema = (typeof(pSchema) == 'object') ? pSchema : {};

		let tmpObjectType = typeof(pObject);

		let tmpSchemaObjectEntry = (
			{
				Address: tmpBaseAddress,
				Hash: tmpBaseAddress,
				Name: tmpBaseAddress,
				// This is so scripts and UI controls can force a developer to opt-in.
				InSchema: false
			}
		)

		switch(tmpObjectType)
		{
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
				tmpSchemaObjectEntry.DataType = 'Any';
				tmpSchemaObjectEntry.Default = pObject;
				tmpSchema[tmpBaseAddress] = tmpSchemaObjectEntry;
				break;
			case 'object':
				if (Array.isArray(pObject))
				{
					tmpSchemaObjectEntry.DataType = 'Array';
					if (tmpBaseAddress != '')
					{
						tmpSchema[tmpBaseAddress] = tmpSchemaObjectEntry;
					}
	
					for (let i = 0; i < pObject.length; i++)
					{
						this.generateAddressses(pObject[i], `${tmpBaseAddress}[${i}]`, tmpSchema);
					}
				}
				else
				{
					tmpSchemaObjectEntry.DataType = 'Object';
					if (tmpBaseAddress != '')
					{
						tmpSchema[tmpBaseAddress] = tmpSchemaObjectEntry;
						tmpBaseAddress += '.';
					}
	
					let tmpObjectProperties = Object.keys(pObject);

					for (let i = 0; i < tmpObjectProperties.length; i++)
					{
						this.generateAddressses(pObject[tmpObjectProperties[i]], `${tmpBaseAddress}${tmpObjectProperties[i]}`, tmpSchema);
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
};

module.exports = ManyfestObjectAddressGeneration;
},{"./Manyfest-LogToConsole.js":3}],5:[function(require,module,exports){
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
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 1))
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
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 1))
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
	getValueAtAddress (pObject, pAddress, pParentAddress)
	{
		// Make sure pObject is an object
		if (typeof(pObject) != 'object') return undefined;
		// Make sure pAddress is a string
		if (typeof(pAddress) != 'string') return undefined;
		let tmpParentAddress = "";
		if (typeof(pParentAddress) == 'string')
		{
			tmpParentAddress = pParentAddress;
		}

		// TODO: Make this work for things like SomeRootObject.Metadata["Some.People.Use.Bad.Object.Property.Names"]
		let tmpSeparatorIndex = pAddress.indexOf('.');

		// This is the terminal address string (no more dots so the RECUSION ENDS IN HERE somehow)
		if (tmpSeparatorIndex == -1)
		{
			// Check if the address refers to a boxed property
			let tmpBracketStartIndex = pAddress.indexOf('[');
			let tmpBracketStopIndex = pAddress.indexOf(']');

			// Check for the Object Set Type marker.
			// Note this will not work with a bracket in the same address box set
			let tmpObjectTypeMarkerIndex = pAddress.indexOf('{}');

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
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 1))
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
			// The requirements to detect a boxed set element are:
			//    1) The start bracket is after character 0
			else if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket is after the start bracket
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is nothing in the brackets
				&& (tmpBracketStopIndex - tmpBracketStartIndex == 1))
			{
				let tmpBoxedPropertyName = pAddress.substring(0, tmpBracketStartIndex).trim();

				if (!Array.isArray(pObject[tmpBoxedPropertyName]))
				{
					// We asked for a set from an array but it isnt' an array.
					return false;
				}

				return pObject[tmpBoxedPropertyName];
			}
			// The object has been flagged as an object set, so treat it as such
			else if (tmpObjectTypeMarkerIndex > 0)
			{
				let tmpObjectPropertyName = pAddress.substring(0, tmpObjectTypeMarkerIndex).trim();

				if (typeof(pObject[tmpObjectPropertyName]) != 'object')
				{
					// We asked for a set from an array but it isnt' an array.
					return false;
				}

				return pObject[tmpObjectPropertyName];
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

			// BOXED ELEMENTS
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
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 1))
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

					// Continue to manage the parent address for recursion
					tmpParentAddress = `${tmpParentAddress}${(tmpParentAddress.length > 0) ? '.' : ''}${tmpSubObjectName}`;
					// Recurse directly into the subobject
					return this.getValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference], tmpNewAddress, tmpParentAddress);
				}
				else
				{
					// Continue to manage the parent address for recursion
					tmpParentAddress = `${tmpParentAddress}${(tmpParentAddress.length > 0) ? '.' : ''}${tmpSubObjectName}`;
					// We parsed a valid number out of the boxed property name, so recurse into the array
					return this.getValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber], tmpNewAddress, tmpParentAddress);
				}
			}
			// The requirements to detect a boxed set element are:
			//    1) The start bracket is after character 0
			else if ((tmpBracketStartIndex > 0) 
			//    2) The end bracket is after the start bracket
				&& (tmpBracketStopIndex > tmpBracketStartIndex) 
			//    3) There is nothing in the brackets
				&& (tmpBracketStopIndex - tmpBracketStartIndex == 1))
			{
				let tmpBoxedPropertyName = pAddress.substring(0, tmpBracketStartIndex).trim();

				if (!Array.isArray(pObject[tmpBoxedPropertyName]))
				{
					// We asked for a set from an array but it isnt' an array.
					return false;
				}

				// We need to enumerate the array and grab the addresses from there.
				let tmpArrayProperty = pObject[tmpBoxedPropertyName];
				// Managing the parent address is a bit more complex here -- the box will be added for each element.
				tmpParentAddress = `${tmpParentAddress}${(tmpParentAddress.length > 0) ? '.' : ''}${tmpBoxedPropertyName}`;
				// The container object is where we have the "Address":SOMEVALUE pairs
				let tmpContainerObject = {};
				for (let i = 0; i < tmpArrayProperty.length; i++)
				{
					let tmpPropertyParentAddress = `${tmpParentAddress}[${i}]`;
					let tmpValue = this.getValueAtAddress(pObject[tmpBoxedPropertyName][i], tmpNewAddress, tmpPropertyParentAddress);;
					tmpContainerObject[`${tmpPropertyParentAddress}.${tmpNewAddress}`] = tmpValue;
				}

				return tmpContainerObject;
			}

			// OBJECT SET
			// Note this will not work with a bracket in the same address box set
			let tmpObjectTypeMarkerIndex = pAddress.indexOf('{}');
			if (tmpObjectTypeMarkerIndex > 0)
			{
				let tmpObjectPropertyName = pAddress.substring(0, tmpObjectTypeMarkerIndex).trim();

				if (typeof(pObject[tmpObjectPropertyName]) != 'object')
				{
					// We asked for a set from an array but it isnt' an array.
					return false;
				}

				// We need to enumerate the Object and grab the addresses from there.
				let tmpObjectProperty = pObject[tmpObjectPropertyName];
				let tmpObjectPropertyKeys = Object.keys(tmpObjectProperty);
				// Managing the parent address is a bit more complex here -- the box will be added for each element.
				tmpParentAddress = `${tmpParentAddress}${(tmpParentAddress.length > 0) ? '.' : ''}${tmpObjectPropertyName}`;
				// The container object is where we have the "Address":SOMEVALUE pairs
				let tmpContainerObject = {};
				for (let i = 0; i < tmpObjectPropertyKeys.length; i++)
				{
					let tmpPropertyParentAddress = `${tmpParentAddress}.${tmpObjectPropertyKeys[i]}`;
					let tmpValue = this.getValueAtAddress(pObject[tmpObjectPropertyName][tmpObjectPropertyKeys[i]], tmpNewAddress, tmpPropertyParentAddress);;
					tmpContainerObject[`${tmpPropertyParentAddress}.${tmpNewAddress}`] = tmpValue;
				}

				return tmpContainerObject;
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
				// Continue to manage the parent address for recursion
				tmpParentAddress = `${tmpParentAddress}${(tmpParentAddress.length > 0) ? '.' : ''}${tmpSubObjectName}`;
				return this.getValueAtAddress(pObject[tmpSubObjectName], tmpNewAddress, tmpParentAddress);
			}
			else
			{
				// Create a subobject and then pass that
				// Continue to manage the parent address for recursion
				tmpParentAddress = `${tmpParentAddress}${(tmpParentAddress.length > 0) ? '.' : ''}${tmpSubObjectName}`;
				pObject[tmpSubObjectName] = {};
				return this.getValueAtAddress(pObject[tmpSubObjectName], tmpNewAddress, tmpParentAddress);
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
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 1))
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
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 1))
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
},{"./Manyfest-LogToConsole.js":3}],6:[function(require,module,exports){
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
},{"./Manyfest-LogToConsole.js":3}],7:[function(require,module,exports){
/**
* @license MIT
* @author <steven@velozo.com>
*/
let libSimpleLog = require('./Manyfest-LogToConsole.js');

let libHashTranslation = require('./Manyfest-HashTranslation.js');
let libObjectAddressResolver = require('./Manyfest-ObjectAddressResolver.js');
let libObjectAddressGeneration = require('./Manyfest-ObjectAddressGeneration.js');
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
		this.objectAddressGeneration = new libObjectAddressGeneration(this.logInfo, this.logError);

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
		let tmpValue = this.getValueAtAddress(pObject, this.resolveHashAddress(pHash));

		if (typeof(tmpValue) == 'undefined')
		{
			// Try to get a default if it exists
			tmpValue = this.getDefaultValue(this.getDescriptorByHash(pHash));
		}

		return tmpValue;
	}

	// Get the value of an element at an address
	getValueAtAddress (pObject, pAddress)
	{
		let tmpValue = this.objectAddressResolver.getValueAtAddress(pObject, pAddress);

		if (typeof(tmpValue) == 'undefined')
		{
			// Try to get a default if it exists
			tmpValue = this.getDefaultValue(this.getDescriptor(pAddress));
		}

		return tmpValue;
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
			let tmpValueExists = this.checkAddressExists(pObject, tmpDescriptor.Address);
			let tmpValue = this.getValueAtAddress(pObject, tmpDescriptor.Address);

			if ((typeof(tmpValue) == 'undefined') || !tmpValueExists)
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
		if (typeof(pDescriptor) != 'object')
		{
			return undefined;
		}

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
},{"./Manyfest-HashTranslation.js":2,"./Manyfest-LogToConsole.js":3,"./Manyfest-ObjectAddressGeneration.js":4,"./Manyfest-ObjectAddressResolver.js":5,"./Manyfest-SchemaManipulation.js":6}]},{},[1])(1)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2UvTWFueWZlc3QtQnJvd3Nlci1TaGltLmpzIiwic291cmNlL01hbnlmZXN0LUhhc2hUcmFuc2xhdGlvbi5qcyIsInNvdXJjZS9NYW55ZmVzdC1Mb2dUb0NvbnNvbGUuanMiLCJzb3VyY2UvTWFueWZlc3QtT2JqZWN0QWRkcmVzc0dlbmVyYXRpb24uanMiLCJzb3VyY2UvTWFueWZlc3QtT2JqZWN0QWRkcmVzc1Jlc29sdmVyLmpzIiwic291cmNlL01hbnlmZXN0LVNjaGVtYU1hbmlwdWxhdGlvbi5qcyIsInNvdXJjZS9NYW55ZmVzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCIvKipcbiogQGxpY2Vuc2UgTUlUXG4qIEBhdXRob3IgPHN0ZXZlbkB2ZWxvem8uY29tPlxuKi9cblxuLyoqXG4qIE1hbnlmZXN0IGJyb3dzZXIgc2hpbSBsb2FkZXJcbiovXG5cbi8vIExvYWQgdGhlIG1hbnlmZXN0IG1vZHVsZSBpbnRvIHRoZSBicm93c2VyIGdsb2JhbCBhdXRvbWF0aWNhbGx5LlxudmFyIGxpYk1hbnlmZXN0ID0gcmVxdWlyZSgnLi9NYW55ZmVzdC5qcycpO1xuXG5pZiAodHlwZW9mKHdpbmRvdykgPT09ICdvYmplY3QnKSB3aW5kb3cuTWFueWZlc3QgPSBsaWJNYW55ZmVzdDtcblxubW9kdWxlLmV4cG9ydHMgPSBsaWJNYW55ZmVzdDsiLCIvKipcbiogQGxpY2Vuc2UgTUlUXG4qIEBhdXRob3IgPHN0ZXZlbkB2ZWxvem8uY29tPlxuKi9cbmxldCBsaWJTaW1wbGVMb2cgPSByZXF1aXJlKCcuL01hbnlmZXN0LUxvZ1RvQ29uc29sZS5qcycpO1xuXG4vKipcbiogSGFzaCBUcmFuc2xhdGlvblxuKlxuKiBUaGlzIGlzIGEgdmVyeSBzaW1wbGUgdHJhbnNsYXRpb24gdGFibGUgZm9yIGhhc2hlcywgd2hpY2ggYWxsb3dzIHRoZSBzYW1lIHNjaGVtYSB0byByZXNvbHZlIFxuKiBkaWZmZXJlbnRseSBiYXNlZCBvbiBhIGxvYWRlZCB0cmFuc2xhdGlvbiB0YWJsZS5cbipcbiogVGhpcyBpcyB0byBwcmV2ZW50IHRoZSByZXF1aXJlbWVudCBmb3IgbXV0YXRpbmcgc2NoZW1hcyBvdmVyIGFuZCBvdmVyIGFnYWluIHdoZW4gd2Ugd2FudCB0b1xuKiByZXVzZSB0aGUgc3RydWN0dXJlIGJ1dCBsb29rIHVwIGRhdGEgZWxlbWVudHMgYnkgZGlmZmVyZW50IGFkZHJlc3Nlcy5cbipcbiogT25lIHNpZGUtZWZmZWN0IG9mIHRoaXMgaXMgdGhhdCBhIHRyYW5zbGF0aW9uIHRhYmxlIGNhbiBcIm92ZXJyaWRlXCIgdGhlIGJ1aWx0LWluIGhhc2hlcywgc2luY2VcbiogdGhpcyBpcyBhbHdheXMgdXNlZCB0byByZXNvbHZlIGhhc2hlcyBiZWZvcmUgYW55IG9mIHRoZSBmdW5jdGlvbkNhbGxCeUhhc2gocEhhc2gsIC4uLikgcGVyZm9ybVxuKiB0aGVpciBsb29rdXBzIGJ5IGhhc2guXG4qXG4qIEBjbGFzcyBNYW55ZmVzdEhhc2hUcmFuc2xhdGlvblxuKi9cbmNsYXNzIE1hbnlmZXN0SGFzaFRyYW5zbGF0aW9uXG57XG5cdGNvbnN0cnVjdG9yKHBJbmZvTG9nLCBwRXJyb3JMb2cpXG5cdHtcblx0XHQvLyBXaXJlIGluIGxvZ2dpbmdcblx0XHR0aGlzLmxvZ0luZm8gPSAodHlwZW9mKHBJbmZvTG9nKSA9PT0gJ2Z1bmN0aW9uJykgPyBwSW5mb0xvZyA6IGxpYlNpbXBsZUxvZztcblx0XHR0aGlzLmxvZ0Vycm9yID0gKHR5cGVvZihwRXJyb3JMb2cpID09PSAnZnVuY3Rpb24nKSA/IHBFcnJvckxvZyA6IGxpYlNpbXBsZUxvZztcblxuICAgICAgICB0aGlzLnRyYW5zbGF0aW9uVGFibGUgPSB7fTtcblx0fVxuXG4gICAgdHJhbnNsYXRpb25Db3VudCgpXG4gICAge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXModGhpcy50cmFuc2xhdGlvblRhYmxlKS5sZW5ndGg7XG4gICAgfVxuXG4gICAgYWRkVHJhbnNsYXRpb24ocFRyYW5zbGF0aW9uKVxuICAgIHtcbiAgICAgICAgLy8gVGhpcyBhZGRzIGEgdHJhbnNsYXRpb24gaW4gdGhlIGZvcm0gb2Y6XG4gICAgICAgIC8vIHsgXCJTb3VyY2VIYXNoXCI6IFwiRGVzdGluYXRpb25IYXNoXCIsIFwiU2Vjb25kU291cmNlSGFzaFwiOlwiU2Vjb25kRGVzdGluYXRpb25IYXNoXCIgfVxuICAgICAgICBpZiAodHlwZW9mKHBUcmFuc2xhdGlvbikgIT0gJ29iamVjdCcpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMubG9nRXJyb3IoYEhhc2ggdHJhbnNsYXRpb24gYWRkVHJhbnNsYXRpb24gZXhwZWN0ZWQgYSB0cmFuc2xhdGlvbiBiZSB0eXBlIG9iamVjdCBidXQgd2FzIHBhc3NlZCBpbiAke3R5cGVvZihwVHJhbnNsYXRpb24pfWApO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRtcFRyYW5zbGF0aW9uU291cmNlcyA9IE9iamVjdC5rZXlzKHBUcmFuc2xhdGlvbilcblxuICAgICAgICB0bXBUcmFuc2xhdGlvblNvdXJjZXMuZm9yRWFjaChcbiAgICAgICAgICAgIChwVHJhbnNsYXRpb25Tb3VyY2UpID0+XG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZihwVHJhbnNsYXRpb25bcFRyYW5zbGF0aW9uU291cmNlXSkgIT0gJ3N0cmluZycpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmxvZ0Vycm9yKGBIYXNoIHRyYW5zbGF0aW9uIGFkZFRyYW5zbGF0aW9uIGV4cGVjdGVkIGEgdHJhbnNsYXRpb24gZGVzdGluYXRpb24gaGFzaCBmb3IgWyR7cFRyYW5zbGF0aW9uU291cmNlfV0gdG8gYmUgYSBzdHJpbmcgYnV0IHRoZSByZWZlcnJhbnQgd2FzIGEgJHt0eXBlb2YocFRyYW5zbGF0aW9uW3BUcmFuc2xhdGlvblNvdXJjZV0pfWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zbGF0aW9uVGFibGVbcFRyYW5zbGF0aW9uU291cmNlXSA9IHBUcmFuc2xhdGlvbltwVHJhbnNsYXRpb25Tb3VyY2VdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJlbW92ZVRyYW5zbGF0aW9uSGFzaChwVHJhbnNsYXRpb25IYXNoKVxuICAgIHtcbiAgICAgICAgaWYgKHRoaXMudHJhbnNsYXRpb25UYWJsZS5oYXNPd25Qcm9wZXJ0eShwVHJhbnNsYXRpb25IYXNoKSlcbiAgICAgICAge1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMudHJhbnNsYXRpb25UYWJsZVtwVHJhbnNsYXRpb25IYXNoXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRoaXMgcmVtb3ZlcyB0cmFuc2xhdGlvbnMuXG4gICAgLy8gSWYgcGFzc2VkIGEgc3RyaW5nLCBqdXN0IHJlbW92ZXMgdGhlIHNpbmdsZSBvbmUuXG4gICAgLy8gSWYgcGFzc2VkIGFuIG9iamVjdCwgaXQgZG9lcyBhbGwgdGhlIHNvdXJjZSBrZXlzLlxuICAgIHJlbW92ZVRyYW5zbGF0aW9uKHBUcmFuc2xhdGlvbilcbiAgICB7XG4gICAgICAgIGlmICh0eXBlb2YocFRyYW5zbGF0aW9uKSA9PSAnc3RyaW5nJylcbiAgICAgICAge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVUcmFuc2xhdGlvbkhhc2gocFRyYW5zbGF0aW9uKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZihwVHJhbnNsYXRpb24pID09ICdvYmplY3QnKVxuICAgICAgICB7XG4gICAgICAgICAgICBsZXQgdG1wVHJhbnNsYXRpb25Tb3VyY2VzID0gT2JqZWN0LmtleXMocFRyYW5zbGF0aW9uKVxuXG4gICAgICAgICAgICB0bXBUcmFuc2xhdGlvblNvdXJjZXMuZm9yRWFjaChcbiAgICAgICAgICAgICAgICAocFRyYW5zbGF0aW9uU291cmNlKSA9PlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVUcmFuc2xhdGlvbihwVHJhbnNsYXRpb25Tb3VyY2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLmxvZ0Vycm9yKGBIYXNoIHRyYW5zbGF0aW9uIHJlbW92ZVRyYW5zbGF0aW9uIGV4cGVjdGVkIGVpdGhlciBhIHN0cmluZyBvciBhbiBvYmplY3QgYnV0IHRoZSBwYXNzZWQtaW4gdHJhbnNsYXRpb24gd2FzIHR5cGUgJHt0eXBlb2YocFRyYW5zbGF0aW9uKX1gKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNsZWFyVHJhbnNsYXRpb25zKClcbiAgICB7XG4gICAgICAgIHRoaXMudHJhbnNsYXRpb25UYWJsZSA9IHt9O1xuICAgIH1cblxuICAgIHRyYW5zbGF0ZShwVHJhbnNsYXRpb24pXG4gICAge1xuICAgICAgICBpZiAodGhpcy50cmFuc2xhdGlvblRhYmxlLmhhc093blByb3BlcnR5KHBUcmFuc2xhdGlvbikpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnRyYW5zbGF0aW9uVGFibGVbcFRyYW5zbGF0aW9uXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiBwVHJhbnNsYXRpb247XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTWFueWZlc3RIYXNoVHJhbnNsYXRpb247IiwiLyoqXG4qIEBsaWNlbnNlIE1JVFxuKiBAYXV0aG9yIDxzdGV2ZW5AdmVsb3pvLmNvbT5cbiovXG5cbi8qKlxuKiBNYW55ZmVzdCBzaW1wbGUgbG9nZ2luZyBzaGltIChmb3IgYnJvd3NlciBhbmQgZGVwZW5kZW5jeS1mcmVlIHJ1bm5pbmcpXG4qL1xuXG5jb25zdCBsb2dUb0NvbnNvbGUgPSAocExvZ0xpbmUsIHBMb2dPYmplY3QpID0+XG57XG4gICAgbGV0IHRtcExvZ0xpbmUgPSAodHlwZW9mKHBMb2dMaW5lKSA9PT0gJ3N0cmluZycpID8gcExvZ0xpbmUgOiAnJztcblxuICAgIGNvbnNvbGUubG9nKGBbTWFueWZlc3RdICR7dG1wTG9nTGluZX1gKTtcblxuICAgIGlmIChwTG9nT2JqZWN0KSBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShwTG9nT2JqZWN0KSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxvZ1RvQ29uc29sZTsiLCIvKipcbiogQGxpY2Vuc2UgTUlUXG4qIEBhdXRob3IgPHN0ZXZlbkB2ZWxvem8uY29tPlxuKi9cbmxldCBsaWJTaW1wbGVMb2cgPSByZXF1aXJlKCcuL01hbnlmZXN0LUxvZ1RvQ29uc29sZS5qcycpO1xuXG4vKipcbiogT2JqZWN0IEFkZHJlc3MgR2VuZXJhdGlvblxuKlxuKiBBdXRvbWFnaWNhbGx5IGdlbmVyYXRlIGFkZHJlc3NlcyBhbmQgcHJvcGVydGllcyBiYXNlZCBvbiBhIHBhc3NlZC1pbiBvYmplY3QsIFxuKiB0byBiZSB1c2VkIGZvciBlYXN5IGNyZWF0aW9uIG9mIHNjaGVtYXMuICBNZWFudCB0byBzaW1wbGlmeSB0aGUgbGl2ZXMgb2ZcbiogZGV2ZWxvcGVycyB3YW50aW5nIHRvIGNyZWF0ZSBzY2hlbWFzIHdpdGhvdXQgdHlwaW5nIGEgYnVuY2ggb2Ygc3R1ZmYuXG4qIFxuKiBJTVBPUlRBTlQgTk9URTogVGhpcyBjb2RlIGlzIGludGVudGlvbmFsbHkgbW9yZSB2ZXJib3NlIHRoYW4gbmVjZXNzYXJ5LCB0b1xuKiAgICAgICAgICAgICAgICAgYmUgZXh0cmVtZWx5IGNsZWFyIHdoYXQgaXMgZ29pbmcgb24gaW4gdGhlIHJlY3Vyc2lvbiBmb3JcbiogICAgICAgICAgICAgICAgIGVhY2ggb2YgdGhlIHRocmVlIGFkZHJlc3MgcmVzb2x1dGlvbiBmdW5jdGlvbnMuXG4qIFxuKiAgICAgICAgICAgICAgICAgQWx0aG91Z2ggdGhlcmUgaXMgc29tZSBvcHBvcnR1bml0eSB0byByZXBlYXQgb3Vyc2VsdmVzIGFcbiogICAgICAgICAgICAgICAgIGJpdCBsZXNzIGluIHRoaXMgY29kZWJhc2UgKGUuZy4gd2l0aCBkZXRlY3Rpb24gb2YgYXJyYXlzXG4qICAgICAgICAgICAgICAgICB2ZXJzdXMgb2JqZWN0cyB2ZXJzdXMgZGlyZWN0IHByb3BlcnRpZXMpLCBpdCBjYW4gbWFrZVxuKiAgICAgICAgICAgICAgICAgZGVidWdnaW5nLi4gY2hhbGxlbmdpbmcuICBUaGUgbWluaWZpZWQgdmVyc2lvbiBvZiB0aGUgY29kZVxuKiAgICAgICAgICAgICAgICAgb3B0aW1pemVzIG91dCBhbG1vc3QgYW55dGhpbmcgcmVwZWF0ZWQgaW4gaGVyZS4gIFNvIHBsZWFzZVxuKiAgICAgICAgICAgICAgICAgYmUga2luZCBhbmQgcmV3aW5kLi4uIG1lYW5pbmcgcGxlYXNlIGtlZXAgdGhlIGNvZGViYXNlIGxlc3NcbiogICAgICAgICAgICAgICAgIHRlcnNlIGFuZCBtb3JlIHZlcmJvc2Ugc28gaHVtYW5zIGNhbiBjb21wcmVoZW5kIGl0LlxuKiAgICAgICAgICAgICAgICAgXG4qXG4qIEBjbGFzcyBNYW55ZmVzdE9iamVjdEFkZHJlc3NHZW5lcmF0aW9uXG4qL1xuY2xhc3MgTWFueWZlc3RPYmplY3RBZGRyZXNzR2VuZXJhdGlvblxue1xuXHRjb25zdHJ1Y3RvcihwSW5mb0xvZywgcEVycm9yTG9nKVxuXHR7XG5cdFx0Ly8gV2lyZSBpbiBsb2dnaW5nXG5cdFx0dGhpcy5sb2dJbmZvID0gKHR5cGVvZihwSW5mb0xvZykgPT0gJ2Z1bmN0aW9uJykgPyBwSW5mb0xvZyA6IGxpYlNpbXBsZUxvZztcblx0XHR0aGlzLmxvZ0Vycm9yID0gKHR5cGVvZihwRXJyb3JMb2cpID09ICdmdW5jdGlvbicpID8gcEVycm9yTG9nIDogbGliU2ltcGxlTG9nO1xuXHR9XG5cblx0Ly8gZ2VuZXJhdGVBZGRyZXNzc2VzXG5cdC8vXG5cdC8vIFRoaXMgZmxhdHRlbnMgYW4gb2JqZWN0IGludG8gYSBzZXQgb2Yga2V5OnZhbHVlIHBhaXJzIGZvciAqRVZFUlkgU0lOR0xFXG5cdC8vIFBPU1NJQkxFIEFERFJFU1MqIGluIHRoZSBvYmplY3QuICBJdCBjYW4gZ2V0IC4uLiByZWFsbHkgaW5zYW5lIHJlYWxseVxuXHQvLyBxdWlja2x5LiAgVGhpcyBpcyBub3QgbWVhbnQgdG8gYmUgdXNlZCBkaXJlY3RseSB0byBnZW5lcmF0ZSBzY2hlbWFzLCBidXRcblx0Ly8gaW5zdGVhZCBhcyBhIHN0YXJ0aW5nIHBvaW50IGZvciBzY3JpcHRzIG9yIFVJcy5cblx0Ly9cblx0Ly8gVGhpcyB3aWxsIHJldHVybiBhIG1lZ2Egc2V0IG9mIGtleTp2YWx1ZSBwYWlycyB3aXRoIGFsbCBwb3NzaWJsZSBzY2hlbWEgXG5cdC8vIHBlcm11dGF0aW9ucyBhbmQgZGVmYXVsdCB2YWx1ZXMgKHdoZW4gbm90IGFuIG9iamVjdCkgYW5kIGV2ZXJ5dGhpbmcgZWxzZS5cblx0Z2VuZXJhdGVBZGRyZXNzc2VzIChwT2JqZWN0LCBwQmFzZUFkZHJlc3MsIHBTY2hlbWEpXG5cdHtcblx0XHRsZXQgdG1wQmFzZUFkZHJlc3MgPSAodHlwZW9mKHBCYXNlQWRkcmVzcykgPT0gJ3N0cmluZycpID8gcEJhc2VBZGRyZXNzIDogJyc7XG5cdFx0bGV0IHRtcFNjaGVtYSA9ICh0eXBlb2YocFNjaGVtYSkgPT0gJ29iamVjdCcpID8gcFNjaGVtYSA6IHt9O1xuXG5cdFx0bGV0IHRtcE9iamVjdFR5cGUgPSB0eXBlb2YocE9iamVjdCk7XG5cblx0XHRsZXQgdG1wU2NoZW1hT2JqZWN0RW50cnkgPSAoXG5cdFx0XHR7XG5cdFx0XHRcdEFkZHJlc3M6IHRtcEJhc2VBZGRyZXNzLFxuXHRcdFx0XHRIYXNoOiB0bXBCYXNlQWRkcmVzcyxcblx0XHRcdFx0TmFtZTogdG1wQmFzZUFkZHJlc3MsXG5cdFx0XHRcdC8vIFRoaXMgaXMgc28gc2NyaXB0cyBhbmQgVUkgY29udHJvbHMgY2FuIGZvcmNlIGEgZGV2ZWxvcGVyIHRvIG9wdC1pbi5cblx0XHRcdFx0SW5TY2hlbWE6IGZhbHNlXG5cdFx0XHR9XG5cdFx0KVxuXG5cdFx0c3dpdGNoKHRtcE9iamVjdFR5cGUpXG5cdFx0e1xuXHRcdFx0Y2FzZSAnc3RyaW5nJzpcblx0XHRcdFx0dG1wU2NoZW1hT2JqZWN0RW50cnkuRGF0YVR5cGUgPSAnU3RyaW5nJztcblx0XHRcdFx0dG1wU2NoZW1hT2JqZWN0RW50cnkuRGVmYXVsdCA9IHBPYmplY3Q7XG5cdFx0XHRcdHRtcFNjaGVtYVt0bXBCYXNlQWRkcmVzc10gPSB0bXBTY2hlbWFPYmplY3RFbnRyeTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdudW1iZXInOlxuXHRcdFx0Y2FzZSAnYmlnaW50Jzpcblx0XHRcdFx0dG1wU2NoZW1hT2JqZWN0RW50cnkuRGF0YVR5cGUgPSAnTnVtYmVyJztcblx0XHRcdFx0dG1wU2NoZW1hT2JqZWN0RW50cnkuRGVmYXVsdCA9IHBPYmplY3Q7XG5cdFx0XHRcdHRtcFNjaGVtYVt0bXBCYXNlQWRkcmVzc10gPSB0bXBTY2hlbWFPYmplY3RFbnRyeTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICd1bmRlZmluZWQnOlxuXHRcdFx0XHR0bXBTY2hlbWFPYmplY3RFbnRyeS5EYXRhVHlwZSA9ICdBbnknO1xuXHRcdFx0XHR0bXBTY2hlbWFPYmplY3RFbnRyeS5EZWZhdWx0ID0gcE9iamVjdDtcblx0XHRcdFx0dG1wU2NoZW1hW3RtcEJhc2VBZGRyZXNzXSA9IHRtcFNjaGVtYU9iamVjdEVudHJ5O1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ29iamVjdCc6XG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHBPYmplY3QpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dG1wU2NoZW1hT2JqZWN0RW50cnkuRGF0YVR5cGUgPSAnQXJyYXknO1xuXHRcdFx0XHRcdGlmICh0bXBCYXNlQWRkcmVzcyAhPSAnJylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR0bXBTY2hlbWFbdG1wQmFzZUFkZHJlc3NdID0gdG1wU2NoZW1hT2JqZWN0RW50cnk7XG5cdFx0XHRcdFx0fVxuXHRcblx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHBPYmplY3QubGVuZ3RoOyBpKyspXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dGhpcy5nZW5lcmF0ZUFkZHJlc3NzZXMocE9iamVjdFtpXSwgYCR7dG1wQmFzZUFkZHJlc3N9WyR7aX1dYCwgdG1wU2NoZW1hKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dG1wU2NoZW1hT2JqZWN0RW50cnkuRGF0YVR5cGUgPSAnT2JqZWN0Jztcblx0XHRcdFx0XHRpZiAodG1wQmFzZUFkZHJlc3MgIT0gJycpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0dG1wU2NoZW1hW3RtcEJhc2VBZGRyZXNzXSA9IHRtcFNjaGVtYU9iamVjdEVudHJ5O1xuXHRcdFx0XHRcdFx0dG1wQmFzZUFkZHJlc3MgKz0gJy4nO1xuXHRcdFx0XHRcdH1cblx0XG5cdFx0XHRcdFx0bGV0IHRtcE9iamVjdFByb3BlcnRpZXMgPSBPYmplY3Qua2V5cyhwT2JqZWN0KTtcblxuXHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdG1wT2JqZWN0UHJvcGVydGllcy5sZW5ndGg7IGkrKylcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR0aGlzLmdlbmVyYXRlQWRkcmVzc3NlcyhwT2JqZWN0W3RtcE9iamVjdFByb3BlcnRpZXNbaV1dLCBgJHt0bXBCYXNlQWRkcmVzc30ke3RtcE9iamVjdFByb3BlcnRpZXNbaV19YCwgdG1wU2NoZW1hKTtcblx0XHRcdFx0XHR9XHRcdFx0XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdzeW1ib2wnOlxuXHRcdFx0Y2FzZSAnZnVuY3Rpb24nOlxuXHRcdFx0XHQvLyBTeW1ib2xzIGFuZCBmdW5jdGlvbnMgbmVpdGhlciByZWN1cnNlIG5vciBnZXQgYWRkZWQgdG8gdGhlIHNjaGVtYVxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRyZXR1cm4gdG1wU2NoZW1hO1xuXHR9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hbnlmZXN0T2JqZWN0QWRkcmVzc0dlbmVyYXRpb247IiwiLyoqXG4qIEBsaWNlbnNlIE1JVFxuKiBAYXV0aG9yIDxzdGV2ZW5AdmVsb3pvLmNvbT5cbiovXG5sZXQgbGliU2ltcGxlTG9nID0gcmVxdWlyZSgnLi9NYW55ZmVzdC1Mb2dUb0NvbnNvbGUuanMnKTtcblxuLyoqXG4qIE9iamVjdCBBZGRyZXNzIFJlc29sdmVyXG4qIFxuKiBJTVBPUlRBTlQgTk9URTogVGhpcyBjb2RlIGlzIGludGVudGlvbmFsbHkgbW9yZSB2ZXJib3NlIHRoYW4gbmVjZXNzYXJ5LCB0b1xuKiAgICAgICAgICAgICAgICAgYmUgZXh0cmVtZWx5IGNsZWFyIHdoYXQgaXMgZ29pbmcgb24gaW4gdGhlIHJlY3Vyc2lvbiBmb3JcbiogICAgICAgICAgICAgICAgIGVhY2ggb2YgdGhlIHRocmVlIGFkZHJlc3MgcmVzb2x1dGlvbiBmdW5jdGlvbnMuXG4qIFxuKiAgICAgICAgICAgICAgICAgQWx0aG91Z2ggdGhlcmUgaXMgc29tZSBvcHBvcnR1bml0eSB0byByZXBlYXQgb3Vyc2VsdmVzIGFcbiogICAgICAgICAgICAgICAgIGJpdCBsZXNzIGluIHRoaXMgY29kZWJhc2UgKGUuZy4gd2l0aCBkZXRlY3Rpb24gb2YgYXJyYXlzXG4qICAgICAgICAgICAgICAgICB2ZXJzdXMgb2JqZWN0cyB2ZXJzdXMgZGlyZWN0IHByb3BlcnRpZXMpLCBpdCBjYW4gbWFrZVxuKiAgICAgICAgICAgICAgICAgZGVidWdnaW5nLi4gY2hhbGxlbmdpbmcuICBUaGUgbWluaWZpZWQgdmVyc2lvbiBvZiB0aGUgY29kZVxuKiAgICAgICAgICAgICAgICAgb3B0aW1pemVzIG91dCBhbG1vc3QgYW55dGhpbmcgcmVwZWF0ZWQgaW4gaGVyZS4gIFNvIHBsZWFzZVxuKiAgICAgICAgICAgICAgICAgYmUga2luZCBhbmQgcmV3aW5kLi4uIG1lYW5pbmcgcGxlYXNlIGtlZXAgdGhlIGNvZGViYXNlIGxlc3NcbiogICAgICAgICAgICAgICAgIHRlcnNlIGFuZCBtb3JlIHZlcmJvc2Ugc28gaHVtYW5zIGNhbiBjb21wcmVoZW5kIGl0LlxuKiAgICAgICAgICAgICAgICAgXG4qXG4qIEBjbGFzcyBNYW55ZmVzdE9iamVjdEFkZHJlc3NSZXNvbHZlclxuKi9cbmNsYXNzIE1hbnlmZXN0T2JqZWN0QWRkcmVzc1Jlc29sdmVyXG57XG5cdGNvbnN0cnVjdG9yKHBJbmZvTG9nLCBwRXJyb3JMb2cpXG5cdHtcblx0XHQvLyBXaXJlIGluIGxvZ2dpbmdcblx0XHR0aGlzLmxvZ0luZm8gPSAodHlwZW9mKHBJbmZvTG9nKSA9PSAnZnVuY3Rpb24nKSA/IHBJbmZvTG9nIDogbGliU2ltcGxlTG9nO1xuXHRcdHRoaXMubG9nRXJyb3IgPSAodHlwZW9mKHBFcnJvckxvZykgPT0gJ2Z1bmN0aW9uJykgPyBwRXJyb3JMb2cgOiBsaWJTaW1wbGVMb2c7XG5cdH1cblxuXHQvLyBXaGVuIGEgYm94ZWQgcHJvcGVydHkgaXMgcGFzc2VkIGluLCBpdCBzaG91bGQgaGF2ZSBxdW90ZXMgb2Ygc29tZVxuXHQvLyBraW5kIGFyb3VuZCBpdC5cblx0Ly9cblx0Ly8gRm9yIGluc3RhbmNlOlxuXHQvLyBcdFx0TXlWYWx1ZXNbJ05hbWUnXVxuXHQvLyBcdFx0TXlWYWx1ZXNbXCJBZ2VcIl1cblx0Ly8gXHRcdE15VmFsdWVzW2BDb3N0YF1cblx0Ly9cblx0Ly8gVGhpcyBmdW5jdGlvbiByZW1vdmVzIHRoZSB3cmFwcGluZyBxdW90ZXMuXG5cdC8vXG5cdC8vIFBsZWFzZSBub3RlIGl0ICpET0VTIE5PVCBQQVJTRSogdGVtcGxhdGUgbGl0ZXJhbHMsIHNvIGJhY2t0aWNrcyBqdXN0XG5cdC8vIGVuZCB1cCBkb2luZyB0aGUgc2FtZSB0aGluZyBhcyBvdGhlciBxdW90ZSB0eXBlcy5cblx0Ly9cblx0Ly8gVE9ETzogU2hvdWxkIHRlbXBsYXRlIGxpdGVyYWxzIGJlIHByb2Nlc3NlZD8gIElmIHNvIHdoYXQgc3RhdGUgZG8gdGhleSBoYXZlIGFjY2VzcyB0bz9cblx0Y2xlYW5XcmFwQ2hhcmFjdGVycyAocENoYXJhY3RlciwgcFN0cmluZylcblx0e1xuXHRcdGlmIChwU3RyaW5nLnN0YXJ0c1dpdGgocENoYXJhY3RlcikgJiYgcFN0cmluZy5lbmRzV2l0aChwQ2hhcmFjdGVyKSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gcFN0cmluZy5zdWJzdHJpbmcoMSwgcFN0cmluZy5sZW5ndGggLSAxKTtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdHJldHVybiBwU3RyaW5nO1xuXHRcdH1cblx0fVxuXG5cdC8vIENoZWNrIGlmIGFuIGFkZHJlc3MgZXhpc3RzLlxuXHQvL1xuXHQvLyBUaGlzIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIHRoZSBnZXRWYWx1ZUF0QWRkcmVzcyBmdW5jdGlvbiBpcyBhbWJpZ3VvdXMgb24gXG5cdC8vIHdoZXRoZXIgdGhlIGVsZW1lbnQvcHJvcGVydHkgaXMgYWN0dWFsbHkgdGhlcmUgb3Igbm90IChpdCByZXR1cm5zIFxuXHQvLyB1bmRlZmluZWQgd2hldGhlciB0aGUgcHJvcGVydHkgZXhpc3RzIG9yIG5vdCkuICBUaGlzIGZ1bmN0aW9uIGNoZWNrcyBmb3Jcblx0Ly8gZXhpc3RhbmNlIGFuZCByZXR1cm5zIHRydWUgb3IgZmFsc2UgZGVwZW5kZW50LlxuXHRjaGVja0FkZHJlc3NFeGlzdHMgKHBPYmplY3QsIHBBZGRyZXNzKVxuXHR7XG5cdFx0Ly8gVE9ETzogU2hvdWxkIHRoZXNlIHRocm93IGFuIGVycm9yP1xuXHRcdC8vIE1ha2Ugc3VyZSBwT2JqZWN0IGlzIGFuIG9iamVjdFxuXHRcdGlmICh0eXBlb2YocE9iamVjdCkgIT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcblx0XHQvLyBNYWtlIHN1cmUgcEFkZHJlc3MgaXMgYSBzdHJpbmdcblx0XHRpZiAodHlwZW9mKHBBZGRyZXNzKSAhPSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuXG5cdFx0Ly8gVE9ETzogTWFrZSB0aGlzIHdvcmsgZm9yIHRoaW5ncyBsaWtlIFNvbWVSb290T2JqZWN0Lk1ldGFkYXRhW1wiU29tZS5QZW9wbGUuVXNlLkJhZC5PYmplY3QuUHJvcGVydHkuTmFtZXNcIl1cblx0XHRsZXQgdG1wU2VwYXJhdG9ySW5kZXggPSBwQWRkcmVzcy5pbmRleE9mKCcuJyk7XG5cblx0XHQvLyBUaGlzIGlzIHRoZSB0ZXJtaW5hbCBhZGRyZXNzIHN0cmluZyAobm8gbW9yZSBkb3RzIHNvIHRoZSBSRUNVU0lPTiBFTkRTIElOIEhFUkUgc29tZWhvdylcblx0XHRpZiAodG1wU2VwYXJhdG9ySW5kZXggPT0gLTEpXG5cdFx0e1xuXHRcdFx0Ly8gQ2hlY2sgaWYgdGhlIGFkZHJlc3MgcmVmZXJzIHRvIGEgYm94ZWQgcHJvcGVydHlcblx0XHRcdGxldCB0bXBCcmFja2V0U3RhcnRJbmRleCA9IHBBZGRyZXNzLmluZGV4T2YoJ1snKTtcblx0XHRcdGxldCB0bXBCcmFja2V0U3RvcEluZGV4ID0gcEFkZHJlc3MuaW5kZXhPZignXScpO1xuXHRcdFx0Ly8gQm94ZWQgZWxlbWVudHMgbG9vayBsaWtlIHRoaXM6XG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbMTBdXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbJ05hbWUnXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzW1wiQWdlXCJdXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbYENvc3RgXVxuXHRcdFx0Ly9cblx0XHRcdC8vIFdoZW4gd2UgYXJlIHBhc3NlZCBTb21lT2JqZWN0W1wiTmFtZVwiXSB0aGlzIGNvZGUgYmVsb3cgcmVjdXJzZXMgYXMgaWYgaXQgd2VyZSBTb21lT2JqZWN0Lk5hbWVcblx0XHRcdC8vIFRoZSByZXF1aXJlbWVudHMgdG8gZGV0ZWN0IGEgYm94ZWQgZWxlbWVudCBhcmU6XG5cdFx0XHQvLyAgICAxKSBUaGUgc3RhcnQgYnJhY2tldCBpcyBhZnRlciBjaGFyYWN0ZXIgMFxuXHRcdFx0aWYgKCh0bXBCcmFja2V0U3RhcnRJbmRleCA+IDApIFxuXHRcdFx0Ly8gICAgMikgVGhlIGVuZCBicmFja2V0IGhhcyBzb21ldGhpbmcgYmV0d2VlbiB0aGVtXG5cdFx0XHRcdCYmICh0bXBCcmFja2V0U3RvcEluZGV4ID4gdG1wQnJhY2tldFN0YXJ0SW5kZXgpIFxuXHRcdFx0Ly8gICAgMykgVGhlcmUgaXMgZGF0YSBcblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggLSB0bXBCcmFja2V0U3RhcnRJbmRleCA+IDEpKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBUaGUgXCJOYW1lXCIgb2YgdGhlIE9iamVjdCBjb250YWluZWQgdG9vIHRoZSBsZWZ0IG9mIHRoZSBicmFja2V0XG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5TmFtZSA9IHBBZGRyZXNzLnN1YnN0cmluZygwLCB0bXBCcmFja2V0U3RhcnRJbmRleCkudHJpbSgpO1xuXG5cdFx0XHRcdC8vIElmIHRoZSBzdWJwcm9wZXJ0eSBkb2Vzbid0IHRlc3QgYXMgYSBwcm9wZXIgT2JqZWN0LCBub25lIG9mIHRoZSByZXN0IG9mIHRoaXMgaXMgcG9zc2libGUuXG5cdFx0XHRcdC8vIFRoaXMgaXMgYSByYXJlIGNhc2Ugd2hlcmUgQXJyYXlzIHRlc3RpbmcgYXMgT2JqZWN0cyBpcyB1c2VmdWxcblx0XHRcdFx0aWYgKHR5cGVvZihwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXSkgIT09ICdvYmplY3QnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gVGhlIFwiUmVmZXJlbmNlXCIgdG8gdGhlIHByb3BlcnR5IHdpdGhpbiBpdCwgZWl0aGVyIGFuIGFycmF5IGVsZW1lbnQgb3Igb2JqZWN0IHByb3BlcnR5XG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gcEFkZHJlc3Muc3Vic3RyaW5nKHRtcEJyYWNrZXRTdGFydEluZGV4KzEsIHRtcEJyYWNrZXRTdG9wSW5kZXgpLnRyaW0oKTtcblx0XHRcdFx0Ly8gQXR0ZW1wdCB0byBwYXJzZSB0aGUgcmVmZXJlbmNlIGFzIGEgbnVtYmVyLCB3aGljaCB3aWxsIGJlIHVzZWQgYXMgYW4gYXJyYXkgZWxlbWVudFxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eU51bWJlciA9IHBhcnNlSW50KHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UsIDEwKTtcblxuXHRcdFx0XHQvLyBHdWFyZDogSWYgdGhlIHJlZmVycmFudCBpcyBhIG51bWJlciBhbmQgdGhlIGJveGVkIHByb3BlcnR5IGlzIG5vdCBhbiBhcnJheSwgb3IgdmljZSB2ZXJzYSwgcmV0dXJuIHVuZGVmaW5lZC5cblx0XHRcdFx0Ly8gICAgICAgIFRoaXMgc2VlbXMgY29uZnVzaW5nIHRvIG1lIGF0IGZpcnN0IHJlYWQsIHNvIGV4cGxhaW5hdGlvbjpcblx0XHRcdFx0Ly8gICAgICAgIElzIHRoZSBCb3hlZCBPYmplY3QgYW4gQXJyYXk/ICBUUlVFXG5cdFx0XHRcdC8vICAgICAgICBBbmQgaXMgdGhlIFJlZmVyZW5jZSBpbnNpZGUgdGhlIGJveGVkIE9iamVjdCBub3QgYSBudW1iZXI/IFRSVUVcblx0XHRcdFx0Ly8gICAgICAgIC0tPiAgU28gd2hlbiB0aGVzZSBhcmUgaW4gYWdyZWVtZW50LCBpdCdzIGFuIGltcG9zc2libGUgYWNjZXNzIHN0YXRlXG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdKSA9PSBpc05hTih0bXBCb3hlZFByb3BlcnR5TnVtYmVyKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vICAgIDQpIElmIHRoZSBtaWRkbGUgcGFydCBpcyAqb25seSogYSBudW1iZXIgKG5vIHNpbmdsZSwgZG91YmxlIG9yIGJhY2t0aWNrIHF1b3RlcykgaXQgaXMgYW4gYXJyYXkgZWxlbWVudCxcblx0XHRcdFx0Ly8gICAgICAgb3RoZXJ3aXNlIHdlIHdpbGwgdHJ5IHRvIHRyZWF0IGl0IGFzIGEgZHluYW1pYyBvYmplY3QgcHJvcGVydHkuXG5cdFx0XHRcdGlmIChpc05hTih0bXBCb3hlZFByb3BlcnR5TnVtYmVyKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIFRoaXMgaXNuJ3QgYSBudW1iZXIgLi4uIGxldCdzIHRyZWF0IGl0IGFzIGEgZHluYW1pYyBvYmplY3QgcHJvcGVydHkuXG5cdFx0XHRcdFx0Ly8gV2Ugd291bGQgZXhwZWN0IHRoZSBwcm9wZXJ0eSB0byBiZSB3cmFwcGVkIGluIHNvbWUga2luZCBvZiBxdW90ZXMgc28gc3RyaXAgdGhlbVxuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoJ1wiJywgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycygnYCcsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoXCInXCIsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXG5cdFx0XHRcdFx0Ly8gQ2hlY2sgaWYgdGhlIHByb3BlcnR5IGV4aXN0cy5cblx0XHRcdFx0XHRyZXR1cm4gcE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV0uaGFzT3duUHJvcGVydHkodG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gVXNlIHRoZSBuZXcgaW4gb3BlcmF0b3IgdG8gc2VlIGlmIHRoZSBlbGVtZW50IGlzIGluIHRoZSBhcnJheVxuXHRcdFx0XHRcdHJldHVybiAodG1wQm94ZWRQcm9wZXJ0eU51bWJlciBpbiBwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0Ly8gQ2hlY2sgaWYgdGhlIHByb3BlcnR5IGV4aXN0c1xuXHRcdFx0XHRyZXR1cm4gcE9iamVjdC5oYXNPd25Qcm9wZXJ0eShwQWRkcmVzcyk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRsZXQgdG1wU3ViT2JqZWN0TmFtZSA9IHBBZGRyZXNzLnN1YnN0cmluZygwLCB0bXBTZXBhcmF0b3JJbmRleCk7XG5cdFx0XHRsZXQgdG1wTmV3QWRkcmVzcyA9IHBBZGRyZXNzLnN1YnN0cmluZyh0bXBTZXBhcmF0b3JJbmRleCsxKTtcblxuXHRcdFx0Ly8gVGVzdCBpZiB0aGUgdG1wTmV3QWRkcmVzcyBpcyBhbiBhcnJheSBvciBvYmplY3Rcblx0XHRcdC8vIENoZWNrIGlmIGl0J3MgYSBib3hlZCBwcm9wZXJ0eVxuXHRcdFx0bGV0IHRtcEJyYWNrZXRTdGFydEluZGV4ID0gdG1wU3ViT2JqZWN0TmFtZS5pbmRleE9mKCdbJyk7XG5cdFx0XHRsZXQgdG1wQnJhY2tldFN0b3BJbmRleCA9IHRtcFN1Yk9iamVjdE5hbWUuaW5kZXhPZignXScpO1xuXHRcdFx0Ly8gQm94ZWQgZWxlbWVudHMgbG9vayBsaWtlIHRoaXM6XG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbNDJdXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbJ0NvbG9yJ11cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1tcIldlaWdodFwiXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzW2BEaWFtZXRlcmBdXG5cdFx0XHQvL1xuXHRcdFx0Ly8gV2hlbiB3ZSBhcmUgcGFzc2VkIFNvbWVPYmplY3RbXCJOYW1lXCJdIHRoaXMgY29kZSBiZWxvdyByZWN1cnNlcyBhcyBpZiBpdCB3ZXJlIFNvbWVPYmplY3QuTmFtZVxuXHRcdFx0Ly8gVGhlIHJlcXVpcmVtZW50cyB0byBkZXRlY3QgYSBib3hlZCBlbGVtZW50IGFyZTpcblx0XHRcdC8vICAgIDEpIFRoZSBzdGFydCBicmFja2V0IGlzIGFmdGVyIGNoYXJhY3RlciAwXG5cdFx0XHRpZiAoKHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMCkgXG5cdFx0XHQvLyAgICAyKSBUaGUgZW5kIGJyYWNrZXQgaGFzIHNvbWV0aGluZyBiZXR3ZWVuIHRoZW1cblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggPiB0bXBCcmFja2V0U3RhcnRJbmRleCkgXG5cdFx0XHQvLyAgICAzKSBUaGVyZSBpcyBkYXRhIFxuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCAtIHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMSkpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5TmFtZSA9IHRtcFN1Yk9iamVjdE5hbWUuc3Vic3RyaW5nKDAsIHRtcEJyYWNrZXRTdGFydEluZGV4KS50cmltKCk7XG5cblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0bXBTdWJPYmplY3ROYW1lLnN1YnN0cmluZyh0bXBCcmFja2V0U3RhcnRJbmRleCsxLCB0bXBCcmFja2V0U3RvcEluZGV4KS50cmltKCk7XG5cblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlOdW1iZXIgPSBwYXJzZUludCh0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlLCAxMCk7XG5cblx0XHRcdFx0Ly8gR3VhcmQ6IElmIHRoZSByZWZlcnJhbnQgaXMgYSBudW1iZXIgYW5kIHRoZSBib3hlZCBwcm9wZXJ0eSBpcyBub3QgYW4gYXJyYXksIG9yIHZpY2UgdmVyc2EsIHJldHVybiB1bmRlZmluZWQuXG5cdFx0XHRcdC8vICAgICAgICBUaGlzIHNlZW1zIGNvbmZ1c2luZyB0byBtZSBhdCBmaXJzdCByZWFkLCBzbyBleHBsYWluYXRpb246XG5cdFx0XHRcdC8vICAgICAgICBJcyB0aGUgQm94ZWQgT2JqZWN0IGFuIEFycmF5PyAgVFJVRVxuXHRcdFx0XHQvLyAgICAgICAgQW5kIGlzIHRoZSBSZWZlcmVuY2UgaW5zaWRlIHRoZSBib3hlZCBPYmplY3Qgbm90IGEgbnVtYmVyPyBUUlVFXG5cdFx0XHRcdC8vICAgICAgICAtLT4gIFNvIHdoZW4gdGhlc2UgYXJlIGluIGFncmVlbWVudCwgaXQncyBhbiBpbXBvc3NpYmxlIGFjY2VzcyBzdGF0ZVxuXHRcdFx0XHQvLyBUaGlzIGNvdWxkIGJlIGEgZmFpbHVyZSBpbiB0aGUgcmVjdXJzaW9uIGNoYWluIGJlY2F1c2UgdGhleSBwYXNzZWQgc29tZXRoaW5nIGxpa2UgdGhpcyBpbjpcblx0XHRcdFx0Ly8gICAgU3R1ZGVudERhdGEuU2VjdGlvbnMuQWxnZWJyYS5TdHVkZW50c1sxXS5UYXJkeVxuXHRcdFx0XHQvLyAgICAgICBCVVRcblx0XHRcdFx0Ly8gICAgICAgICBTdHVkZW50RGF0YS5TZWN0aW9ucy5BbGdlYnJhLlN0dWRlbnRzIGlzIGFuIG9iamVjdCwgc28gdGhlIFsxXS5UYXJkeSBpcyBub3QgcG9zc2libGUgdG8gYWNjZXNzXG5cdFx0XHRcdC8vIFRoaXMgY291bGQgYmUgYSBmYWlsdXJlIGluIHRoZSByZWN1cnNpb24gY2hhaW4gYmVjYXVzZSB0aGV5IHBhc3NlZCBzb21ldGhpbmcgbGlrZSB0aGlzIGluOlxuXHRcdFx0XHQvLyAgICBTdHVkZW50RGF0YS5TZWN0aW9ucy5BbGdlYnJhLlN0dWRlbnRzW1wiSmFuZURvZVwiXS5HcmFkZVxuXHRcdFx0XHQvLyAgICAgICBCVVRcblx0XHRcdFx0Ly8gICAgICAgICBTdHVkZW50RGF0YS5TZWN0aW9ucy5BbGdlYnJhLlN0dWRlbnRzIGlzIGFuIGFycmF5LCBzbyB0aGUgW1wiSmFuZURvZVwiXS5HcmFkZSBpcyBub3QgcG9zc2libGUgdG8gYWNjZXNzXG5cdFx0XHRcdC8vIFRPRE86IFNob3VsZCB0aGlzIGJlIGFuIGVycm9yIG9yIHNvbWV0aGluZz8gIFNob3VsZCB3ZSBrZWVwIGEgbG9nIG9mIGZhaWx1cmVzIGxpa2UgdGhpcz9cblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV0pID09IGlzTmFOKHRtcEJveGVkUHJvcGVydHlOdW1iZXIpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gQmVjYXVzZSB0aGlzIGlzIGFuIGltcG9zc2libGUgYWRkcmVzcywgdGhlIHByb3BlcnR5IGRvZXNuJ3QgZXhpc3Rcblx0XHRcdFx0XHQvLyBUT0RPOiBTaG91bGQgd2UgdGhyb3cgYW4gZXJyb3IgaW4gdGhpcyBjb25kaXRpb24/XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9UaGlzIGlzIGEgYnJhY2tldGVkIHZhbHVlXG5cdFx0XHRcdC8vICAgIDQpIElmIHRoZSBtaWRkbGUgcGFydCBpcyAqb25seSogYSBudW1iZXIgKG5vIHNpbmdsZSwgZG91YmxlIG9yIGJhY2t0aWNrIHF1b3RlcykgaXQgaXMgYW4gYXJyYXkgZWxlbWVudCxcblx0XHRcdFx0Ly8gICAgICAgb3RoZXJ3aXNlIHdlIHdpbGwgdHJ5IHRvIHJlYXQgaXQgYXMgYSBkeW5hbWljIG9iamVjdCBwcm9wZXJ0eS5cblx0XHRcdFx0aWYgKGlzTmFOKHRtcEJveGVkUHJvcGVydHlOdW1iZXIpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gVGhpcyBpc24ndCBhIG51bWJlciAuLi4gbGV0J3MgdHJlYXQgaXQgYXMgYSBkeW5hbm1pYyBvYmplY3QgcHJvcGVydHkuXG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycygnXCInLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKCdgJywgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycyhcIidcIiwgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cblx0XHRcdFx0XHQvLyBSZWN1cnNlIGRpcmVjdGx5IGludG8gdGhlIHN1Ym9iamVjdFxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmNoZWNrQWRkcmVzc0V4aXN0cyhwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXVt0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlXSwgdG1wTmV3QWRkcmVzcyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gV2UgcGFyc2VkIGEgdmFsaWQgbnVtYmVyIG91dCBvZiB0aGUgYm94ZWQgcHJvcGVydHkgbmFtZSwgc28gcmVjdXJzZSBpbnRvIHRoZSBhcnJheVxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmNoZWNrQWRkcmVzc0V4aXN0cyhwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXVt0bXBCb3hlZFByb3BlcnR5TnVtYmVyXSwgdG1wTmV3QWRkcmVzcyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gSWYgdGhlcmUgaXMgYW4gb2JqZWN0IHByb3BlcnR5IGFscmVhZHkgbmFtZWQgZm9yIHRoZSBzdWIgb2JqZWN0LCBidXQgaXQgaXNuJ3QgYW4gb2JqZWN0XG5cdFx0XHQvLyB0aGVuIHRoZSBzeXN0ZW0gY2FuJ3Qgc2V0IHRoZSB2YWx1ZSBpbiB0aGVyZS4gIEVycm9yIGFuZCBhYm9ydCFcblx0XHRcdGlmIChwT2JqZWN0Lmhhc093blByb3BlcnR5KHRtcFN1Yk9iamVjdE5hbWUpICYmIHR5cGVvZihwT2JqZWN0W3RtcFN1Yk9iamVjdE5hbWVdKSAhPT0gJ29iamVjdCcpXG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHBPYmplY3QuaGFzT3duUHJvcGVydHkodG1wU3ViT2JqZWN0TmFtZSkpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIElmIHRoZXJlIGlzIGFscmVhZHkgYSBzdWJvYmplY3QgcGFzcyB0aGF0IHRvIHRoZSByZWN1cnNpdmUgdGhpbmd5XG5cdFx0XHRcdHJldHVybiB0aGlzLmNoZWNrQWRkcmVzc0V4aXN0cyhwT2JqZWN0W3RtcFN1Yk9iamVjdE5hbWVdLCB0bXBOZXdBZGRyZXNzKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0Ly8gQ3JlYXRlIGEgc3Vib2JqZWN0IGFuZCB0aGVuIHBhc3MgdGhhdFxuXHRcdFx0XHRwT2JqZWN0W3RtcFN1Yk9iamVjdE5hbWVdID0ge307XG5cdFx0XHRcdHJldHVybiB0aGlzLmNoZWNrQWRkcmVzc0V4aXN0cyhwT2JqZWN0W3RtcFN1Yk9iamVjdE5hbWVdLCB0bXBOZXdBZGRyZXNzKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBHZXQgdGhlIHZhbHVlIG9mIGFuIGVsZW1lbnQgYXQgYW4gYWRkcmVzc1xuXHRnZXRWYWx1ZUF0QWRkcmVzcyAocE9iamVjdCwgcEFkZHJlc3MsIHBQYXJlbnRBZGRyZXNzKVxuXHR7XG5cdFx0Ly8gTWFrZSBzdXJlIHBPYmplY3QgaXMgYW4gb2JqZWN0XG5cdFx0aWYgKHR5cGVvZihwT2JqZWN0KSAhPSAnb2JqZWN0JykgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHQvLyBNYWtlIHN1cmUgcEFkZHJlc3MgaXMgYSBzdHJpbmdcblx0XHRpZiAodHlwZW9mKHBBZGRyZXNzKSAhPSAnc3RyaW5nJykgcmV0dXJuIHVuZGVmaW5lZDtcblx0XHRsZXQgdG1wUGFyZW50QWRkcmVzcyA9IFwiXCI7XG5cdFx0aWYgKHR5cGVvZihwUGFyZW50QWRkcmVzcykgPT0gJ3N0cmluZycpXG5cdFx0e1xuXHRcdFx0dG1wUGFyZW50QWRkcmVzcyA9IHBQYXJlbnRBZGRyZXNzO1xuXHRcdH1cblxuXHRcdC8vIFRPRE86IE1ha2UgdGhpcyB3b3JrIGZvciB0aGluZ3MgbGlrZSBTb21lUm9vdE9iamVjdC5NZXRhZGF0YVtcIlNvbWUuUGVvcGxlLlVzZS5CYWQuT2JqZWN0LlByb3BlcnR5Lk5hbWVzXCJdXG5cdFx0bGV0IHRtcFNlcGFyYXRvckluZGV4ID0gcEFkZHJlc3MuaW5kZXhPZignLicpO1xuXG5cdFx0Ly8gVGhpcyBpcyB0aGUgdGVybWluYWwgYWRkcmVzcyBzdHJpbmcgKG5vIG1vcmUgZG90cyBzbyB0aGUgUkVDVVNJT04gRU5EUyBJTiBIRVJFIHNvbWVob3cpXG5cdFx0aWYgKHRtcFNlcGFyYXRvckluZGV4ID09IC0xKVxuXHRcdHtcblx0XHRcdC8vIENoZWNrIGlmIHRoZSBhZGRyZXNzIHJlZmVycyB0byBhIGJveGVkIHByb3BlcnR5XG5cdFx0XHRsZXQgdG1wQnJhY2tldFN0YXJ0SW5kZXggPSBwQWRkcmVzcy5pbmRleE9mKCdbJyk7XG5cdFx0XHRsZXQgdG1wQnJhY2tldFN0b3BJbmRleCA9IHBBZGRyZXNzLmluZGV4T2YoJ10nKTtcblxuXHRcdFx0Ly8gQ2hlY2sgZm9yIHRoZSBPYmplY3QgU2V0IFR5cGUgbWFya2VyLlxuXHRcdFx0Ly8gTm90ZSB0aGlzIHdpbGwgbm90IHdvcmsgd2l0aCBhIGJyYWNrZXQgaW4gdGhlIHNhbWUgYWRkcmVzcyBib3ggc2V0XG5cdFx0XHRsZXQgdG1wT2JqZWN0VHlwZU1hcmtlckluZGV4ID0gcEFkZHJlc3MuaW5kZXhPZigne30nKTtcblxuXHRcdFx0Ly8gQm94ZWQgZWxlbWVudHMgbG9vayBsaWtlIHRoaXM6XG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbMTBdXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbJ05hbWUnXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzW1wiQWdlXCJdXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbYENvc3RgXVxuXHRcdFx0Ly9cblx0XHRcdC8vIFdoZW4gd2UgYXJlIHBhc3NlZCBTb21lT2JqZWN0W1wiTmFtZVwiXSB0aGlzIGNvZGUgYmVsb3cgcmVjdXJzZXMgYXMgaWYgaXQgd2VyZSBTb21lT2JqZWN0Lk5hbWVcblx0XHRcdC8vIFRoZSByZXF1aXJlbWVudHMgdG8gZGV0ZWN0IGEgYm94ZWQgZWxlbWVudCBhcmU6XG5cdFx0XHQvLyAgICAxKSBUaGUgc3RhcnQgYnJhY2tldCBpcyBhZnRlciBjaGFyYWN0ZXIgMFxuXHRcdFx0aWYgKCh0bXBCcmFja2V0U3RhcnRJbmRleCA+IDApIFxuXHRcdFx0Ly8gICAgMikgVGhlIGVuZCBicmFja2V0IGhhcyBzb21ldGhpbmcgYmV0d2VlbiB0aGVtXG5cdFx0XHRcdCYmICh0bXBCcmFja2V0U3RvcEluZGV4ID4gdG1wQnJhY2tldFN0YXJ0SW5kZXgpIFxuXHRcdFx0Ly8gICAgMykgVGhlcmUgaXMgZGF0YSBcblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggLSB0bXBCcmFja2V0U3RhcnRJbmRleCA+IDEpKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBUaGUgXCJOYW1lXCIgb2YgdGhlIE9iamVjdCBjb250YWluZWQgdG9vIHRoZSBsZWZ0IG9mIHRoZSBicmFja2V0XG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5TmFtZSA9IHBBZGRyZXNzLnN1YnN0cmluZygwLCB0bXBCcmFja2V0U3RhcnRJbmRleCkudHJpbSgpO1xuXG5cdFx0XHRcdC8vIElmIHRoZSBzdWJwcm9wZXJ0eSBkb2Vzbid0IHRlc3QgYXMgYSBwcm9wZXIgT2JqZWN0LCBub25lIG9mIHRoZSByZXN0IG9mIHRoaXMgaXMgcG9zc2libGUuXG5cdFx0XHRcdC8vIFRoaXMgaXMgYSByYXJlIGNhc2Ugd2hlcmUgQXJyYXlzIHRlc3RpbmcgYXMgT2JqZWN0cyBpcyB1c2VmdWxcblx0XHRcdFx0aWYgKHR5cGVvZihwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXSkgIT09ICdvYmplY3QnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFRoZSBcIlJlZmVyZW5jZVwiIHRvIHRoZSBwcm9wZXJ0eSB3aXRoaW4gaXQsIGVpdGhlciBhbiBhcnJheSBlbGVtZW50IG9yIG9iamVjdCBwcm9wZXJ0eVxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHBBZGRyZXNzLnN1YnN0cmluZyh0bXBCcmFja2V0U3RhcnRJbmRleCsxLCB0bXBCcmFja2V0U3RvcEluZGV4KS50cmltKCk7XG5cdFx0XHRcdC8vIEF0dGVtcHQgdG8gcGFyc2UgdGhlIHJlZmVyZW5jZSBhcyBhIG51bWJlciwgd2hpY2ggd2lsbCBiZSB1c2VkIGFzIGFuIGFycmF5IGVsZW1lbnRcblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlOdW1iZXIgPSBwYXJzZUludCh0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlLCAxMCk7XG5cblx0XHRcdFx0Ly8gR3VhcmQ6IElmIHRoZSByZWZlcnJhbnQgaXMgYSBudW1iZXIgYW5kIHRoZSBib3hlZCBwcm9wZXJ0eSBpcyBub3QgYW4gYXJyYXksIG9yIHZpY2UgdmVyc2EsIHJldHVybiB1bmRlZmluZWQuXG5cdFx0XHRcdC8vICAgICAgICBUaGlzIHNlZW1zIGNvbmZ1c2luZyB0byBtZSBhdCBmaXJzdCByZWFkLCBzbyBleHBsYWluYXRpb246XG5cdFx0XHRcdC8vICAgICAgICBJcyB0aGUgQm94ZWQgT2JqZWN0IGFuIEFycmF5PyAgVFJVRVxuXHRcdFx0XHQvLyAgICAgICAgQW5kIGlzIHRoZSBSZWZlcmVuY2UgaW5zaWRlIHRoZSBib3hlZCBPYmplY3Qgbm90IGEgbnVtYmVyPyBUUlVFXG5cdFx0XHRcdC8vICAgICAgICAtLT4gIFNvIHdoZW4gdGhlc2UgYXJlIGluIGFncmVlbWVudCwgaXQncyBhbiBpbXBvc3NpYmxlIGFjY2VzcyBzdGF0ZVxuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXSkgPT0gaXNOYU4odG1wQm94ZWRQcm9wZXJ0eU51bWJlcikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gICAgNCkgSWYgdGhlIG1pZGRsZSBwYXJ0IGlzICpvbmx5KiBhIG51bWJlciAobm8gc2luZ2xlLCBkb3VibGUgb3IgYmFja3RpY2sgcXVvdGVzKSBpdCBpcyBhbiBhcnJheSBlbGVtZW50LFxuXHRcdFx0XHQvLyAgICAgICBvdGhlcndpc2Ugd2Ugd2lsbCB0cnkgdG8gdHJlYXQgaXQgYXMgYSBkeW5hbWljIG9iamVjdCBwcm9wZXJ0eS5cblx0XHRcdFx0aWYgKGlzTmFOKHRtcEJveGVkUHJvcGVydHlOdW1iZXIpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gVGhpcyBpc24ndCBhIG51bWJlciAuLi4gbGV0J3MgdHJlYXQgaXQgYXMgYSBkeW5hbWljIG9iamVjdCBwcm9wZXJ0eS5cblx0XHRcdFx0XHQvLyBXZSB3b3VsZCBleHBlY3QgdGhlIHByb3BlcnR5IHRvIGJlIHdyYXBwZWQgaW4gc29tZSBraW5kIG9mIHF1b3RlcyBzbyBzdHJpcCB0aGVtXG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycygnXCInLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKCdgJywgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycyhcIidcIiwgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cblx0XHRcdFx0XHQvLyBSZXR1cm4gdGhlIHZhbHVlIGluIHRoZSBwcm9wZXJ0eVxuXHRcdFx0XHRcdHJldHVybiBwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXVt0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gcE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV1bdG1wQm94ZWRQcm9wZXJ0eU51bWJlcl07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIFRoZSByZXF1aXJlbWVudHMgdG8gZGV0ZWN0IGEgYm94ZWQgc2V0IGVsZW1lbnQgYXJlOlxuXHRcdFx0Ly8gICAgMSkgVGhlIHN0YXJ0IGJyYWNrZXQgaXMgYWZ0ZXIgY2hhcmFjdGVyIDBcblx0XHRcdGVsc2UgaWYgKCh0bXBCcmFja2V0U3RhcnRJbmRleCA+IDApIFxuXHRcdFx0Ly8gICAgMikgVGhlIGVuZCBicmFja2V0IGlzIGFmdGVyIHRoZSBzdGFydCBicmFja2V0XG5cdFx0XHRcdCYmICh0bXBCcmFja2V0U3RvcEluZGV4ID4gdG1wQnJhY2tldFN0YXJ0SW5kZXgpIFxuXHRcdFx0Ly8gICAgMykgVGhlcmUgaXMgbm90aGluZyBpbiB0aGUgYnJhY2tldHNcblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggLSB0bXBCcmFja2V0U3RhcnRJbmRleCA9PSAxKSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlOYW1lID0gcEFkZHJlc3Muc3Vic3RyaW5nKDAsIHRtcEJyYWNrZXRTdGFydEluZGV4KS50cmltKCk7XG5cblx0XHRcdFx0aWYgKCFBcnJheS5pc0FycmF5KHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIFdlIGFza2VkIGZvciBhIHNldCBmcm9tIGFuIGFycmF5IGJ1dCBpdCBpc250JyBhbiBhcnJheS5cblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV07XG5cdFx0XHR9XG5cdFx0XHQvLyBUaGUgb2JqZWN0IGhhcyBiZWVuIGZsYWdnZWQgYXMgYW4gb2JqZWN0IHNldCwgc28gdHJlYXQgaXQgYXMgc3VjaFxuXHRcdFx0ZWxzZSBpZiAodG1wT2JqZWN0VHlwZU1hcmtlckluZGV4ID4gMClcblx0XHRcdHtcblx0XHRcdFx0bGV0IHRtcE9iamVjdFByb3BlcnR5TmFtZSA9IHBBZGRyZXNzLnN1YnN0cmluZygwLCB0bXBPYmplY3RUeXBlTWFya2VySW5kZXgpLnRyaW0oKTtcblxuXHRcdFx0XHRpZiAodHlwZW9mKHBPYmplY3RbdG1wT2JqZWN0UHJvcGVydHlOYW1lXSkgIT0gJ29iamVjdCcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBXZSBhc2tlZCBmb3IgYSBzZXQgZnJvbSBhbiBhcnJheSBidXQgaXQgaXNudCcgYW4gYXJyYXkuXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHBPYmplY3RbdG1wT2JqZWN0UHJvcGVydHlOYW1lXTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0Ly8gTm93IGlzIHRoZSBwb2ludCBpbiByZWN1cnNpb24gdG8gcmV0dXJuIHRoZSB2YWx1ZSBpbiB0aGUgYWRkcmVzc1xuXHRcdFx0XHRyZXR1cm4gcE9iamVjdFtwQWRkcmVzc107XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHRsZXQgdG1wU3ViT2JqZWN0TmFtZSA9IHBBZGRyZXNzLnN1YnN0cmluZygwLCB0bXBTZXBhcmF0b3JJbmRleCk7XG5cdFx0XHRsZXQgdG1wTmV3QWRkcmVzcyA9IHBBZGRyZXNzLnN1YnN0cmluZyh0bXBTZXBhcmF0b3JJbmRleCsxKTtcblxuXHRcdFx0Ly8gQk9YRUQgRUxFTUVOVFNcblx0XHRcdC8vIFRlc3QgaWYgdGhlIHRtcE5ld0FkZHJlc3MgaXMgYW4gYXJyYXkgb3Igb2JqZWN0XG5cdFx0XHQvLyBDaGVjayBpZiBpdCdzIGEgYm94ZWQgcHJvcGVydHlcblx0XHRcdGxldCB0bXBCcmFja2V0U3RhcnRJbmRleCA9IHRtcFN1Yk9iamVjdE5hbWUuaW5kZXhPZignWycpO1xuXHRcdFx0bGV0IHRtcEJyYWNrZXRTdG9wSW5kZXggPSB0bXBTdWJPYmplY3ROYW1lLmluZGV4T2YoJ10nKTtcblx0XHRcdC8vIEJveGVkIGVsZW1lbnRzIGxvb2sgbGlrZSB0aGlzOlxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzWzQyXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzWydDb2xvciddXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbXCJXZWlnaHRcIl1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1tgRGlhbWV0ZXJgXVxuXHRcdFx0Ly9cblx0XHRcdC8vIFdoZW4gd2UgYXJlIHBhc3NlZCBTb21lT2JqZWN0W1wiTmFtZVwiXSB0aGlzIGNvZGUgYmVsb3cgcmVjdXJzZXMgYXMgaWYgaXQgd2VyZSBTb21lT2JqZWN0Lk5hbWVcblx0XHRcdC8vIFRoZSByZXF1aXJlbWVudHMgdG8gZGV0ZWN0IGEgYm94ZWQgZWxlbWVudCBhcmU6XG5cdFx0XHQvLyAgICAxKSBUaGUgc3RhcnQgYnJhY2tldCBpcyBhZnRlciBjaGFyYWN0ZXIgMFxuXHRcdFx0aWYgKCh0bXBCcmFja2V0U3RhcnRJbmRleCA+IDApIFxuXHRcdFx0Ly8gICAgMikgVGhlIGVuZCBicmFja2V0IGhhcyBzb21ldGhpbmcgYmV0d2VlbiB0aGVtXG5cdFx0XHRcdCYmICh0bXBCcmFja2V0U3RvcEluZGV4ID4gdG1wQnJhY2tldFN0YXJ0SW5kZXgpIFxuXHRcdFx0Ly8gICAgMykgVGhlcmUgaXMgZGF0YSBcblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggLSB0bXBCcmFja2V0U3RhcnRJbmRleCA+IDEpKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eU5hbWUgPSB0bXBTdWJPYmplY3ROYW1lLnN1YnN0cmluZygwLCB0bXBCcmFja2V0U3RhcnRJbmRleCkudHJpbSgpO1xuXG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdG1wU3ViT2JqZWN0TmFtZS5zdWJzdHJpbmcodG1wQnJhY2tldFN0YXJ0SW5kZXgrMSwgdG1wQnJhY2tldFN0b3BJbmRleCkudHJpbSgpO1xuXG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5TnVtYmVyID0gcGFyc2VJbnQodG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSwgMTApO1xuXG5cdFx0XHRcdC8vIEd1YXJkOiBJZiB0aGUgcmVmZXJyYW50IGlzIGEgbnVtYmVyIGFuZCB0aGUgYm94ZWQgcHJvcGVydHkgaXMgbm90IGFuIGFycmF5LCBvciB2aWNlIHZlcnNhLCByZXR1cm4gdW5kZWZpbmVkLlxuXHRcdFx0XHQvLyAgICAgICAgVGhpcyBzZWVtcyBjb25mdXNpbmcgdG8gbWUgYXQgZmlyc3QgcmVhZCwgc28gZXhwbGFpbmF0aW9uOlxuXHRcdFx0XHQvLyAgICAgICAgSXMgdGhlIEJveGVkIE9iamVjdCBhbiBBcnJheT8gIFRSVUVcblx0XHRcdFx0Ly8gICAgICAgIEFuZCBpcyB0aGUgUmVmZXJlbmNlIGluc2lkZSB0aGUgYm94ZWQgT2JqZWN0IG5vdCBhIG51bWJlcj8gVFJVRVxuXHRcdFx0XHQvLyAgICAgICAgLS0+ICBTbyB3aGVuIHRoZXNlIGFyZSBpbiBhZ3JlZW1lbnQsIGl0J3MgYW4gaW1wb3NzaWJsZSBhY2Nlc3Mgc3RhdGVcblx0XHRcdFx0Ly8gVGhpcyBjb3VsZCBiZSBhIGZhaWx1cmUgaW4gdGhlIHJlY3Vyc2lvbiBjaGFpbiBiZWNhdXNlIHRoZXkgcGFzc2VkIHNvbWV0aGluZyBsaWtlIHRoaXMgaW46XG5cdFx0XHRcdC8vICAgIFN0dWRlbnREYXRhLlNlY3Rpb25zLkFsZ2VicmEuU3R1ZGVudHNbMV0uVGFyZHlcblx0XHRcdFx0Ly8gICAgICAgQlVUXG5cdFx0XHRcdC8vICAgICAgICAgU3R1ZGVudERhdGEuU2VjdGlvbnMuQWxnZWJyYS5TdHVkZW50cyBpcyBhbiBvYmplY3QsIHNvIHRoZSBbMV0uVGFyZHkgaXMgbm90IHBvc3NpYmxlIHRvIGFjY2Vzc1xuXHRcdFx0XHQvLyBUaGlzIGNvdWxkIGJlIGEgZmFpbHVyZSBpbiB0aGUgcmVjdXJzaW9uIGNoYWluIGJlY2F1c2UgdGhleSBwYXNzZWQgc29tZXRoaW5nIGxpa2UgdGhpcyBpbjpcblx0XHRcdFx0Ly8gICAgU3R1ZGVudERhdGEuU2VjdGlvbnMuQWxnZWJyYS5TdHVkZW50c1tcIkphbmVEb2VcIl0uR3JhZGVcblx0XHRcdFx0Ly8gICAgICAgQlVUXG5cdFx0XHRcdC8vICAgICAgICAgU3R1ZGVudERhdGEuU2VjdGlvbnMuQWxnZWJyYS5TdHVkZW50cyBpcyBhbiBhcnJheSwgc28gdGhlIFtcIkphbmVEb2VcIl0uR3JhZGUgaXMgbm90IHBvc3NpYmxlIHRvIGFjY2Vzc1xuXHRcdFx0XHQvLyBUT0RPOiBTaG91bGQgdGhpcyBiZSBhbiBlcnJvciBvciBzb21ldGhpbmc/ICBTaG91bGQgd2Uga2VlcCBhIGxvZyBvZiBmYWlsdXJlcyBsaWtlIHRoaXM/XG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdKSA9PSBpc05hTih0bXBCb3hlZFByb3BlcnR5TnVtYmVyKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL1RoaXMgaXMgYSBicmFja2V0ZWQgdmFsdWVcblx0XHRcdFx0Ly8gICAgNCkgSWYgdGhlIG1pZGRsZSBwYXJ0IGlzICpvbmx5KiBhIG51bWJlciAobm8gc2luZ2xlLCBkb3VibGUgb3IgYmFja3RpY2sgcXVvdGVzKSBpdCBpcyBhbiBhcnJheSBlbGVtZW50LFxuXHRcdFx0XHQvLyAgICAgICBvdGhlcndpc2Ugd2Ugd2lsbCB0cnkgdG8gcmVhdCBpdCBhcyBhIGR5bmFtaWMgb2JqZWN0IHByb3BlcnR5LlxuXHRcdFx0XHRpZiAoaXNOYU4odG1wQm94ZWRQcm9wZXJ0eU51bWJlcikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBUaGlzIGlzbid0IGEgbnVtYmVyIC4uLiBsZXQncyB0cmVhdCBpdCBhcyBhIGR5bmFubWljIG9iamVjdCBwcm9wZXJ0eS5cblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKCdcIicsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoJ2AnLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKFwiJ1wiLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblxuXHRcdFx0XHRcdC8vIENvbnRpbnVlIHRvIG1hbmFnZSB0aGUgcGFyZW50IGFkZHJlc3MgZm9yIHJlY3Vyc2lvblxuXHRcdFx0XHRcdHRtcFBhcmVudEFkZHJlc3MgPSBgJHt0bXBQYXJlbnRBZGRyZXNzfSR7KHRtcFBhcmVudEFkZHJlc3MubGVuZ3RoID4gMCkgPyAnLicgOiAnJ30ke3RtcFN1Yk9iamVjdE5hbWV9YDtcblx0XHRcdFx0XHQvLyBSZWN1cnNlIGRpcmVjdGx5IGludG8gdGhlIHN1Ym9iamVjdFxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmdldFZhbHVlQXRBZGRyZXNzKHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdW3RtcEJveGVkUHJvcGVydHlSZWZlcmVuY2VdLCB0bXBOZXdBZGRyZXNzLCB0bXBQYXJlbnRBZGRyZXNzKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBDb250aW51ZSB0byBtYW5hZ2UgdGhlIHBhcmVudCBhZGRyZXNzIGZvciByZWN1cnNpb25cblx0XHRcdFx0XHR0bXBQYXJlbnRBZGRyZXNzID0gYCR7dG1wUGFyZW50QWRkcmVzc30keyh0bXBQYXJlbnRBZGRyZXNzLmxlbmd0aCA+IDApID8gJy4nIDogJyd9JHt0bXBTdWJPYmplY3ROYW1lfWA7XG5cdFx0XHRcdFx0Ly8gV2UgcGFyc2VkIGEgdmFsaWQgbnVtYmVyIG91dCBvZiB0aGUgYm94ZWQgcHJvcGVydHkgbmFtZSwgc28gcmVjdXJzZSBpbnRvIHRoZSBhcnJheVxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmdldFZhbHVlQXRBZGRyZXNzKHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdW3RtcEJveGVkUHJvcGVydHlOdW1iZXJdLCB0bXBOZXdBZGRyZXNzLCB0bXBQYXJlbnRBZGRyZXNzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gVGhlIHJlcXVpcmVtZW50cyB0byBkZXRlY3QgYSBib3hlZCBzZXQgZWxlbWVudCBhcmU6XG5cdFx0XHQvLyAgICAxKSBUaGUgc3RhcnQgYnJhY2tldCBpcyBhZnRlciBjaGFyYWN0ZXIgMFxuXHRcdFx0ZWxzZSBpZiAoKHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMCkgXG5cdFx0XHQvLyAgICAyKSBUaGUgZW5kIGJyYWNrZXQgaXMgYWZ0ZXIgdGhlIHN0YXJ0IGJyYWNrZXRcblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggPiB0bXBCcmFja2V0U3RhcnRJbmRleCkgXG5cdFx0XHQvLyAgICAzKSBUaGVyZSBpcyBub3RoaW5nIGluIHRoZSBicmFja2V0c1xuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCAtIHRtcEJyYWNrZXRTdGFydEluZGV4ID09IDEpKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eU5hbWUgPSBwQWRkcmVzcy5zdWJzdHJpbmcoMCwgdG1wQnJhY2tldFN0YXJ0SW5kZXgpLnRyaW0oKTtcblxuXHRcdFx0XHRpZiAoIUFycmF5LmlzQXJyYXkocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV0pKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gV2UgYXNrZWQgZm9yIGEgc2V0IGZyb20gYW4gYXJyYXkgYnV0IGl0IGlzbnQnIGFuIGFycmF5LlxuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFdlIG5lZWQgdG8gZW51bWVyYXRlIHRoZSBhcnJheSBhbmQgZ3JhYiB0aGUgYWRkcmVzc2VzIGZyb20gdGhlcmUuXG5cdFx0XHRcdGxldCB0bXBBcnJheVByb3BlcnR5ID0gcE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV07XG5cdFx0XHRcdC8vIE1hbmFnaW5nIHRoZSBwYXJlbnQgYWRkcmVzcyBpcyBhIGJpdCBtb3JlIGNvbXBsZXggaGVyZSAtLSB0aGUgYm94IHdpbGwgYmUgYWRkZWQgZm9yIGVhY2ggZWxlbWVudC5cblx0XHRcdFx0dG1wUGFyZW50QWRkcmVzcyA9IGAke3RtcFBhcmVudEFkZHJlc3N9JHsodG1wUGFyZW50QWRkcmVzcy5sZW5ndGggPiAwKSA/ICcuJyA6ICcnfSR7dG1wQm94ZWRQcm9wZXJ0eU5hbWV9YDtcblx0XHRcdFx0Ly8gVGhlIGNvbnRhaW5lciBvYmplY3QgaXMgd2hlcmUgd2UgaGF2ZSB0aGUgXCJBZGRyZXNzXCI6U09NRVZBTFVFIHBhaXJzXG5cdFx0XHRcdGxldCB0bXBDb250YWluZXJPYmplY3QgPSB7fTtcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0bXBBcnJheVByb3BlcnR5Lmxlbmd0aDsgaSsrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0bGV0IHRtcFByb3BlcnR5UGFyZW50QWRkcmVzcyA9IGAke3RtcFBhcmVudEFkZHJlc3N9WyR7aX1dYDtcblx0XHRcdFx0XHRsZXQgdG1wVmFsdWUgPSB0aGlzLmdldFZhbHVlQXRBZGRyZXNzKHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdW2ldLCB0bXBOZXdBZGRyZXNzLCB0bXBQcm9wZXJ0eVBhcmVudEFkZHJlc3MpOztcblx0XHRcdFx0XHR0bXBDb250YWluZXJPYmplY3RbYCR7dG1wUHJvcGVydHlQYXJlbnRBZGRyZXNzfS4ke3RtcE5ld0FkZHJlc3N9YF0gPSB0bXBWYWx1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiB0bXBDb250YWluZXJPYmplY3Q7XG5cdFx0XHR9XG5cblx0XHRcdC8vIE9CSkVDVCBTRVRcblx0XHRcdC8vIE5vdGUgdGhpcyB3aWxsIG5vdCB3b3JrIHdpdGggYSBicmFja2V0IGluIHRoZSBzYW1lIGFkZHJlc3MgYm94IHNldFxuXHRcdFx0bGV0IHRtcE9iamVjdFR5cGVNYXJrZXJJbmRleCA9IHBBZGRyZXNzLmluZGV4T2YoJ3t9Jyk7XG5cdFx0XHRpZiAodG1wT2JqZWN0VHlwZU1hcmtlckluZGV4ID4gMClcblx0XHRcdHtcblx0XHRcdFx0bGV0IHRtcE9iamVjdFByb3BlcnR5TmFtZSA9IHBBZGRyZXNzLnN1YnN0cmluZygwLCB0bXBPYmplY3RUeXBlTWFya2VySW5kZXgpLnRyaW0oKTtcblxuXHRcdFx0XHRpZiAodHlwZW9mKHBPYmplY3RbdG1wT2JqZWN0UHJvcGVydHlOYW1lXSkgIT0gJ29iamVjdCcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBXZSBhc2tlZCBmb3IgYSBzZXQgZnJvbSBhbiBhcnJheSBidXQgaXQgaXNudCcgYW4gYXJyYXkuXG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gV2UgbmVlZCB0byBlbnVtZXJhdGUgdGhlIE9iamVjdCBhbmQgZ3JhYiB0aGUgYWRkcmVzc2VzIGZyb20gdGhlcmUuXG5cdFx0XHRcdGxldCB0bXBPYmplY3RQcm9wZXJ0eSA9IHBPYmplY3RbdG1wT2JqZWN0UHJvcGVydHlOYW1lXTtcblx0XHRcdFx0bGV0IHRtcE9iamVjdFByb3BlcnR5S2V5cyA9IE9iamVjdC5rZXlzKHRtcE9iamVjdFByb3BlcnR5KTtcblx0XHRcdFx0Ly8gTWFuYWdpbmcgdGhlIHBhcmVudCBhZGRyZXNzIGlzIGEgYml0IG1vcmUgY29tcGxleCBoZXJlIC0tIHRoZSBib3ggd2lsbCBiZSBhZGRlZCBmb3IgZWFjaCBlbGVtZW50LlxuXHRcdFx0XHR0bXBQYXJlbnRBZGRyZXNzID0gYCR7dG1wUGFyZW50QWRkcmVzc30keyh0bXBQYXJlbnRBZGRyZXNzLmxlbmd0aCA+IDApID8gJy4nIDogJyd9JHt0bXBPYmplY3RQcm9wZXJ0eU5hbWV9YDtcblx0XHRcdFx0Ly8gVGhlIGNvbnRhaW5lciBvYmplY3QgaXMgd2hlcmUgd2UgaGF2ZSB0aGUgXCJBZGRyZXNzXCI6U09NRVZBTFVFIHBhaXJzXG5cdFx0XHRcdGxldCB0bXBDb250YWluZXJPYmplY3QgPSB7fTtcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0bXBPYmplY3RQcm9wZXJ0eUtleXMubGVuZ3RoOyBpKyspXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRsZXQgdG1wUHJvcGVydHlQYXJlbnRBZGRyZXNzID0gYCR7dG1wUGFyZW50QWRkcmVzc30uJHt0bXBPYmplY3RQcm9wZXJ0eUtleXNbaV19YDtcblx0XHRcdFx0XHRsZXQgdG1wVmFsdWUgPSB0aGlzLmdldFZhbHVlQXRBZGRyZXNzKHBPYmplY3RbdG1wT2JqZWN0UHJvcGVydHlOYW1lXVt0bXBPYmplY3RQcm9wZXJ0eUtleXNbaV1dLCB0bXBOZXdBZGRyZXNzLCB0bXBQcm9wZXJ0eVBhcmVudEFkZHJlc3MpOztcblx0XHRcdFx0XHR0bXBDb250YWluZXJPYmplY3RbYCR7dG1wUHJvcGVydHlQYXJlbnRBZGRyZXNzfS4ke3RtcE5ld0FkZHJlc3N9YF0gPSB0bXBWYWx1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiB0bXBDb250YWluZXJPYmplY3Q7XG5cdFx0XHR9XG5cblx0XHRcdC8vIElmIHRoZXJlIGlzIGFuIG9iamVjdCBwcm9wZXJ0eSBhbHJlYWR5IG5hbWVkIGZvciB0aGUgc3ViIG9iamVjdCwgYnV0IGl0IGlzbid0IGFuIG9iamVjdFxuXHRcdFx0Ly8gdGhlbiB0aGUgc3lzdGVtIGNhbid0IHNldCB0aGUgdmFsdWUgaW4gdGhlcmUuICBFcnJvciBhbmQgYWJvcnQhXG5cdFx0XHRpZiAocE9iamVjdC5oYXNPd25Qcm9wZXJ0eSh0bXBTdWJPYmplY3ROYW1lKSAmJiB0eXBlb2YocE9iamVjdFt0bXBTdWJPYmplY3ROYW1lXSkgIT09ICdvYmplY3QnKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAocE9iamVjdC5oYXNPd25Qcm9wZXJ0eSh0bXBTdWJPYmplY3ROYW1lKSlcblx0XHRcdHtcblx0XHRcdFx0Ly8gSWYgdGhlcmUgaXMgYWxyZWFkeSBhIHN1Ym9iamVjdCBwYXNzIHRoYXQgdG8gdGhlIHJlY3Vyc2l2ZSB0aGluZ3lcblx0XHRcdFx0Ly8gQ29udGludWUgdG8gbWFuYWdlIHRoZSBwYXJlbnQgYWRkcmVzcyBmb3IgcmVjdXJzaW9uXG5cdFx0XHRcdHRtcFBhcmVudEFkZHJlc3MgPSBgJHt0bXBQYXJlbnRBZGRyZXNzfSR7KHRtcFBhcmVudEFkZHJlc3MubGVuZ3RoID4gMCkgPyAnLicgOiAnJ30ke3RtcFN1Yk9iamVjdE5hbWV9YDtcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0VmFsdWVBdEFkZHJlc3MocE9iamVjdFt0bXBTdWJPYmplY3ROYW1lXSwgdG1wTmV3QWRkcmVzcywgdG1wUGFyZW50QWRkcmVzcyk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdC8vIENyZWF0ZSBhIHN1Ym9iamVjdCBhbmQgdGhlbiBwYXNzIHRoYXRcblx0XHRcdFx0Ly8gQ29udGludWUgdG8gbWFuYWdlIHRoZSBwYXJlbnQgYWRkcmVzcyBmb3IgcmVjdXJzaW9uXG5cdFx0XHRcdHRtcFBhcmVudEFkZHJlc3MgPSBgJHt0bXBQYXJlbnRBZGRyZXNzfSR7KHRtcFBhcmVudEFkZHJlc3MubGVuZ3RoID4gMCkgPyAnLicgOiAnJ30ke3RtcFN1Yk9iamVjdE5hbWV9YDtcblx0XHRcdFx0cE9iamVjdFt0bXBTdWJPYmplY3ROYW1lXSA9IHt9O1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5nZXRWYWx1ZUF0QWRkcmVzcyhwT2JqZWN0W3RtcFN1Yk9iamVjdE5hbWVdLCB0bXBOZXdBZGRyZXNzLCB0bXBQYXJlbnRBZGRyZXNzKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBTZXQgdGhlIHZhbHVlIG9mIGFuIGVsZW1lbnQgYXQgYW4gYWRkcmVzc1xuXHRzZXRWYWx1ZUF0QWRkcmVzcyAocE9iamVjdCwgcEFkZHJlc3MsIHBWYWx1ZSlcblx0e1xuXHRcdC8vIE1ha2Ugc3VyZSBwT2JqZWN0IGlzIGFuIG9iamVjdFxuXHRcdGlmICh0eXBlb2YocE9iamVjdCkgIT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcblx0XHQvLyBNYWtlIHN1cmUgcEFkZHJlc3MgaXMgYSBzdHJpbmdcblx0XHRpZiAodHlwZW9mKHBBZGRyZXNzKSAhPSAnc3RyaW5nJykgcmV0dXJuIGZhbHNlO1xuXG5cdFx0bGV0IHRtcFNlcGFyYXRvckluZGV4ID0gcEFkZHJlc3MuaW5kZXhPZignLicpO1xuXG5cdFx0aWYgKHRtcFNlcGFyYXRvckluZGV4ID09IC0xKVxuXHRcdHtcblx0XHRcdC8vIENoZWNrIGlmIGl0J3MgYSBib3hlZCBwcm9wZXJ0eVxuXHRcdFx0bGV0IHRtcEJyYWNrZXRTdGFydEluZGV4ID0gcEFkZHJlc3MuaW5kZXhPZignWycpO1xuXHRcdFx0bGV0IHRtcEJyYWNrZXRTdG9wSW5kZXggPSBwQWRkcmVzcy5pbmRleE9mKCddJyk7XG5cdFx0XHQvLyBCb3hlZCBlbGVtZW50cyBsb29rIGxpa2UgdGhpczpcblx0XHRcdC8vIFx0XHRNeVZhbHVlc1sxMF1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1snTmFtZSddXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbXCJBZ2VcIl1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1tgQ29zdGBdXG5cdFx0XHQvL1xuXHRcdFx0Ly8gV2hlbiB3ZSBhcmUgcGFzc2VkIFNvbWVPYmplY3RbXCJOYW1lXCJdIHRoaXMgY29kZSBiZWxvdyByZWN1cnNlcyBhcyBpZiBpdCB3ZXJlIFNvbWVPYmplY3QuTmFtZVxuXHRcdFx0Ly8gVGhlIHJlcXVpcmVtZW50cyB0byBkZXRlY3QgYSBib3hlZCBlbGVtZW50IGFyZTpcblx0XHRcdC8vICAgIDEpIFRoZSBzdGFydCBicmFja2V0IGlzIGFmdGVyIGNoYXJhY3RlciAwXG5cdFx0XHRpZiAoKHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMCkgXG5cdFx0XHQvLyAgICAyKSBUaGUgZW5kIGJyYWNrZXQgaGFzIHNvbWV0aGluZyBiZXR3ZWVuIHRoZW1cblx0XHRcdFx0JiYgKHRtcEJyYWNrZXRTdG9wSW5kZXggPiB0bXBCcmFja2V0U3RhcnRJbmRleCkgXG5cdFx0XHQvLyAgICAzKSBUaGVyZSBpcyBkYXRhIFxuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCAtIHRtcEJyYWNrZXRTdGFydEluZGV4ID4gMSkpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIFRoZSBcIk5hbWVcIiBvZiB0aGUgT2JqZWN0IGNvbnRhaW5lZCB0b28gdGhlIGxlZnQgb2YgdGhlIGJyYWNrZXRcblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlOYW1lID0gcEFkZHJlc3Muc3Vic3RyaW5nKDAsIHRtcEJyYWNrZXRTdGFydEluZGV4KS50cmltKCk7XG5cblx0XHRcdFx0Ly8gSWYgdGhlIHN1YnByb3BlcnR5IGRvZXNuJ3QgdGVzdCBhcyBhIHByb3BlciBPYmplY3QsIG5vbmUgb2YgdGhlIHJlc3Qgb2YgdGhpcyBpcyBwb3NzaWJsZS5cblx0XHRcdFx0Ly8gVGhpcyBpcyBhIHJhcmUgY2FzZSB3aGVyZSBBcnJheXMgdGVzdGluZyBhcyBPYmplY3RzIGlzIHVzZWZ1bFxuXHRcdFx0XHRpZiAodHlwZW9mKHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdKSAhPT0gJ29iamVjdCcpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBUaGUgXCJSZWZlcmVuY2VcIiB0byB0aGUgcHJvcGVydHkgd2l0aGluIGl0LCBlaXRoZXIgYW4gYXJyYXkgZWxlbWVudCBvciBvYmplY3QgcHJvcGVydHlcblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSBwQWRkcmVzcy5zdWJzdHJpbmcodG1wQnJhY2tldFN0YXJ0SW5kZXgrMSwgdG1wQnJhY2tldFN0b3BJbmRleCkudHJpbSgpO1xuXHRcdFx0XHQvLyBBdHRlbXB0IHRvIHBhcnNlIHRoZSByZWZlcmVuY2UgYXMgYSBudW1iZXIsIHdoaWNoIHdpbGwgYmUgdXNlZCBhcyBhbiBhcnJheSBlbGVtZW50XG5cdFx0XHRcdGxldCB0bXBCb3hlZFByb3BlcnR5TnVtYmVyID0gcGFyc2VJbnQodG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSwgMTApO1xuXG5cdFx0XHRcdC8vIEd1YXJkOiBJZiB0aGUgcmVmZXJyYW50IGlzIGEgbnVtYmVyIGFuZCB0aGUgYm94ZWQgcHJvcGVydHkgaXMgbm90IGFuIGFycmF5LCBvciB2aWNlIHZlcnNhLCByZXR1cm4gdW5kZWZpbmVkLlxuXHRcdFx0XHQvLyAgICAgICAgVGhpcyBzZWVtcyBjb25mdXNpbmcgdG8gbWUgYXQgZmlyc3QgcmVhZCwgc28gZXhwbGFpbmF0aW9uOlxuXHRcdFx0XHQvLyAgICAgICAgSXMgdGhlIEJveGVkIE9iamVjdCBhbiBBcnJheT8gIFRSVUVcblx0XHRcdFx0Ly8gICAgICAgIEFuZCBpcyB0aGUgUmVmZXJlbmNlIGluc2lkZSB0aGUgYm94ZWQgT2JqZWN0IG5vdCBhIG51bWJlcj8gVFJVRVxuXHRcdFx0XHQvLyAgICAgICAgLS0+ICBTbyB3aGVuIHRoZXNlIGFyZSBpbiBhZ3JlZW1lbnQsIGl0J3MgYW4gaW1wb3NzaWJsZSBhY2Nlc3Mgc3RhdGVcblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV0pID09IGlzTmFOKHRtcEJveGVkUHJvcGVydHlOdW1iZXIpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gICAgNCkgSWYgdGhlIG1pZGRsZSBwYXJ0IGlzICpvbmx5KiBhIG51bWJlciAobm8gc2luZ2xlLCBkb3VibGUgb3IgYmFja3RpY2sgcXVvdGVzKSBpdCBpcyBhbiBhcnJheSBlbGVtZW50LFxuXHRcdFx0XHQvLyAgICAgICBvdGhlcndpc2Ugd2Ugd2lsbCB0cnkgdG8gdHJlYXQgaXQgYXMgYSBkeW5hbWljIG9iamVjdCBwcm9wZXJ0eS5cblx0XHRcdFx0aWYgKGlzTmFOKHRtcEJveGVkUHJvcGVydHlOdW1iZXIpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gVGhpcyBpc24ndCBhIG51bWJlciAuLi4gbGV0J3MgdHJlYXQgaXQgYXMgYSBkeW5hbWljIG9iamVjdCBwcm9wZXJ0eS5cblx0XHRcdFx0XHQvLyBXZSB3b3VsZCBleHBlY3QgdGhlIHByb3BlcnR5IHRvIGJlIHdyYXBwZWQgaW4gc29tZSBraW5kIG9mIHF1b3RlcyBzbyBzdHJpcCB0aGVtXG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycygnXCInLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKCdgJywgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cdFx0XHRcdFx0dG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRoaXMuY2xlYW5XcmFwQ2hhcmFjdGVycyhcIidcIiwgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSk7XG5cblx0XHRcdFx0XHQvLyBSZXR1cm4gdGhlIHZhbHVlIGluIHRoZSBwcm9wZXJ0eVxuXHRcdFx0XHRcdHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdW3RtcEJveGVkUHJvcGVydHlSZWZlcmVuY2VdID0gcFZhbHVlO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdW3RtcEJveGVkUHJvcGVydHlOdW1iZXJdID0gcFZhbHVlO1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlXG5cdFx0XHR7XG5cdFx0XHRcdC8vIE5vdyBpcyB0aGUgdGltZSBpbiByZWN1cnNpb24gdG8gc2V0IHRoZSB2YWx1ZSBpbiB0aGUgb2JqZWN0XG5cdFx0XHRcdHBPYmplY3RbcEFkZHJlc3NdID0gcFZhbHVlO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdGxldCB0bXBTdWJPYmplY3ROYW1lID0gcEFkZHJlc3Muc3Vic3RyaW5nKDAsIHRtcFNlcGFyYXRvckluZGV4KTtcblx0XHRcdGxldCB0bXBOZXdBZGRyZXNzID0gcEFkZHJlc3Muc3Vic3RyaW5nKHRtcFNlcGFyYXRvckluZGV4KzEpO1xuXG5cdFx0XHQvLyBUZXN0IGlmIHRoZSB0bXBOZXdBZGRyZXNzIGlzIGFuIGFycmF5IG9yIG9iamVjdFxuXHRcdFx0Ly8gQ2hlY2sgaWYgaXQncyBhIGJveGVkIHByb3BlcnR5XG5cdFx0XHRsZXQgdG1wQnJhY2tldFN0YXJ0SW5kZXggPSB0bXBTdWJPYmplY3ROYW1lLmluZGV4T2YoJ1snKTtcblx0XHRcdGxldCB0bXBCcmFja2V0U3RvcEluZGV4ID0gdG1wU3ViT2JqZWN0TmFtZS5pbmRleE9mKCddJyk7XG5cdFx0XHQvLyBCb3hlZCBlbGVtZW50cyBsb29rIGxpa2UgdGhpczpcblx0XHRcdC8vIFx0XHRNeVZhbHVlc1s0Ml1cblx0XHRcdC8vIFx0XHRNeVZhbHVlc1snQ29sb3InXVxuXHRcdFx0Ly8gXHRcdE15VmFsdWVzW1wiV2VpZ2h0XCJdXG5cdFx0XHQvLyBcdFx0TXlWYWx1ZXNbYERpYW1ldGVyYF1cblx0XHRcdC8vXG5cdFx0XHQvLyBXaGVuIHdlIGFyZSBwYXNzZWQgU29tZU9iamVjdFtcIk5hbWVcIl0gdGhpcyBjb2RlIGJlbG93IHJlY3Vyc2VzIGFzIGlmIGl0IHdlcmUgU29tZU9iamVjdC5OYW1lXG5cdFx0XHQvLyBUaGUgcmVxdWlyZW1lbnRzIHRvIGRldGVjdCBhIGJveGVkIGVsZW1lbnQgYXJlOlxuXHRcdFx0Ly8gICAgMSkgVGhlIHN0YXJ0IGJyYWNrZXQgaXMgYWZ0ZXIgY2hhcmFjdGVyIDBcblx0XHRcdGlmICgodG1wQnJhY2tldFN0YXJ0SW5kZXggPiAwKSBcblx0XHRcdC8vICAgIDIpIFRoZSBlbmQgYnJhY2tldCBoYXMgc29tZXRoaW5nIGJldHdlZW4gdGhlbVxuXHRcdFx0XHQmJiAodG1wQnJhY2tldFN0b3BJbmRleCA+IHRtcEJyYWNrZXRTdGFydEluZGV4KSBcblx0XHRcdC8vICAgIDMpIFRoZXJlIGlzIGRhdGEgXG5cdFx0XHRcdCYmICh0bXBCcmFja2V0U3RvcEluZGV4IC0gdG1wQnJhY2tldFN0YXJ0SW5kZXggPiAxKSlcblx0XHRcdHtcblx0XHRcdFx0bGV0IHRtcEJveGVkUHJvcGVydHlOYW1lID0gdG1wU3ViT2JqZWN0TmFtZS5zdWJzdHJpbmcoMCwgdG1wQnJhY2tldFN0YXJ0SW5kZXgpLnRyaW0oKTtcblxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZSA9IHRtcFN1Yk9iamVjdE5hbWUuc3Vic3RyaW5nKHRtcEJyYWNrZXRTdGFydEluZGV4KzEsIHRtcEJyYWNrZXRTdG9wSW5kZXgpLnRyaW0oKTtcblxuXHRcdFx0XHRsZXQgdG1wQm94ZWRQcm9wZXJ0eU51bWJlciA9IHBhcnNlSW50KHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UsIDEwKTtcblxuXHRcdFx0XHQvLyBHdWFyZDogSWYgdGhlIHJlZmVycmFudCBpcyBhIG51bWJlciBhbmQgdGhlIGJveGVkIHByb3BlcnR5IGlzIG5vdCBhbiBhcnJheSwgb3IgdmljZSB2ZXJzYSwgcmV0dXJuIHVuZGVmaW5lZC5cblx0XHRcdFx0Ly8gICAgICAgIFRoaXMgc2VlbXMgY29uZnVzaW5nIHRvIG1lIGF0IGZpcnN0IHJlYWQsIHNvIGV4cGxhaW5hdGlvbjpcblx0XHRcdFx0Ly8gICAgICAgIElzIHRoZSBCb3hlZCBPYmplY3QgYW4gQXJyYXk/ICBUUlVFXG5cdFx0XHRcdC8vICAgICAgICBBbmQgaXMgdGhlIFJlZmVyZW5jZSBpbnNpZGUgdGhlIGJveGVkIE9iamVjdCBub3QgYSBudW1iZXI/IFRSVUVcblx0XHRcdFx0Ly8gICAgICAgIC0tPiAgU28gd2hlbiB0aGVzZSBhcmUgaW4gYWdyZWVtZW50LCBpdCdzIGFuIGltcG9zc2libGUgYWNjZXNzIHN0YXRlXG5cdFx0XHRcdC8vIFRoaXMgY291bGQgYmUgYSBmYWlsdXJlIGluIHRoZSByZWN1cnNpb24gY2hhaW4gYmVjYXVzZSB0aGV5IHBhc3NlZCBzb21ldGhpbmcgbGlrZSB0aGlzIGluOlxuXHRcdFx0XHQvLyAgICBTdHVkZW50RGF0YS5TZWN0aW9ucy5BbGdlYnJhLlN0dWRlbnRzWzFdLlRhcmR5XG5cdFx0XHRcdC8vICAgICAgIEJVVFxuXHRcdFx0XHQvLyAgICAgICAgIFN0dWRlbnREYXRhLlNlY3Rpb25zLkFsZ2VicmEuU3R1ZGVudHMgaXMgYW4gb2JqZWN0LCBzbyB0aGUgWzFdLlRhcmR5IGlzIG5vdCBwb3NzaWJsZSB0byBhY2Nlc3Ncblx0XHRcdFx0Ly8gVGhpcyBjb3VsZCBiZSBhIGZhaWx1cmUgaW4gdGhlIHJlY3Vyc2lvbiBjaGFpbiBiZWNhdXNlIHRoZXkgcGFzc2VkIHNvbWV0aGluZyBsaWtlIHRoaXMgaW46XG5cdFx0XHRcdC8vICAgIFN0dWRlbnREYXRhLlNlY3Rpb25zLkFsZ2VicmEuU3R1ZGVudHNbXCJKYW5lRG9lXCJdLkdyYWRlXG5cdFx0XHRcdC8vICAgICAgIEJVVFxuXHRcdFx0XHQvLyAgICAgICAgIFN0dWRlbnREYXRhLlNlY3Rpb25zLkFsZ2VicmEuU3R1ZGVudHMgaXMgYW4gYXJyYXksIHNvIHRoZSBbXCJKYW5lRG9lXCJdLkdyYWRlIGlzIG5vdCBwb3NzaWJsZSB0byBhY2Nlc3Ncblx0XHRcdFx0Ly8gVE9ETzogU2hvdWxkIHRoaXMgYmUgYW4gZXJyb3Igb3Igc29tZXRoaW5nPyAgU2hvdWxkIHdlIGtlZXAgYSBsb2cgb2YgZmFpbHVyZXMgbGlrZSB0aGlzP1xuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShwT2JqZWN0W3RtcEJveGVkUHJvcGVydHlOYW1lXSkgPT0gaXNOYU4odG1wQm94ZWRQcm9wZXJ0eU51bWJlcikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL1RoaXMgaXMgYSBicmFja2V0ZWQgdmFsdWVcblx0XHRcdFx0Ly8gICAgNCkgSWYgdGhlIG1pZGRsZSBwYXJ0IGlzICpvbmx5KiBhIG51bWJlciAobm8gc2luZ2xlLCBkb3VibGUgb3IgYmFja3RpY2sgcXVvdGVzKSBpdCBpcyBhbiBhcnJheSBlbGVtZW50LFxuXHRcdFx0XHQvLyAgICAgICBvdGhlcndpc2Ugd2Ugd2lsbCB0cnkgdG8gcmVhdCBpdCBhcyBhIGR5bmFtaWMgb2JqZWN0IHByb3BlcnR5LlxuXHRcdFx0XHRpZiAoaXNOYU4odG1wQm94ZWRQcm9wZXJ0eU51bWJlcikpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHQvLyBUaGlzIGlzbid0IGEgbnVtYmVyIC4uLiBsZXQncyB0cmVhdCBpdCBhcyBhIGR5bmFubWljIG9iamVjdCBwcm9wZXJ0eS5cblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKCdcIicsIHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UpO1xuXHRcdFx0XHRcdHRtcEJveGVkUHJvcGVydHlSZWZlcmVuY2UgPSB0aGlzLmNsZWFuV3JhcENoYXJhY3RlcnMoJ2AnLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblx0XHRcdFx0XHR0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlID0gdGhpcy5jbGVhbldyYXBDaGFyYWN0ZXJzKFwiJ1wiLCB0bXBCb3hlZFByb3BlcnR5UmVmZXJlbmNlKTtcblxuXHRcdFx0XHRcdC8vIFJlY3Vyc2UgZGlyZWN0bHkgaW50byB0aGUgc3Vib2JqZWN0XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMuc2V0VmFsdWVBdEFkZHJlc3MocE9iamVjdFt0bXBCb3hlZFByb3BlcnR5TmFtZV1bdG1wQm94ZWRQcm9wZXJ0eVJlZmVyZW5jZV0sIHRtcE5ld0FkZHJlc3MsIHBWYWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly8gV2UgcGFyc2VkIGEgdmFsaWQgbnVtYmVyIG91dCBvZiB0aGUgYm94ZWQgcHJvcGVydHkgbmFtZSwgc28gcmVjdXJzZSBpbnRvIHRoZSBhcnJheVxuXHRcdFx0XHRcdHJldHVybiB0aGlzLnNldFZhbHVlQXRBZGRyZXNzKHBPYmplY3RbdG1wQm94ZWRQcm9wZXJ0eU5hbWVdW3RtcEJveGVkUHJvcGVydHlOdW1iZXJdLCB0bXBOZXdBZGRyZXNzLCBwVmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIElmIHRoZXJlIGlzIGFuIG9iamVjdCBwcm9wZXJ0eSBhbHJlYWR5IG5hbWVkIGZvciB0aGUgc3ViIG9iamVjdCwgYnV0IGl0IGlzbid0IGFuIG9iamVjdFxuXHRcdFx0Ly8gdGhlbiB0aGUgc3lzdGVtIGNhbid0IHNldCB0aGUgdmFsdWUgaW4gdGhlcmUuICBFcnJvciBhbmQgYWJvcnQhXG5cdFx0XHRpZiAocE9iamVjdC5oYXNPd25Qcm9wZXJ0eSh0bXBTdWJPYmplY3ROYW1lKSAmJiB0eXBlb2YocE9iamVjdFt0bXBTdWJPYmplY3ROYW1lXSkgIT09ICdvYmplY3QnKVxuXHRcdFx0e1xuXHRcdFx0XHRpZiAoIXBPYmplY3QuaGFzT3duUHJvcGVydHkoJ19fRVJST1InKSlcblx0XHRcdFx0XHRwT2JqZWN0WydfX0VSUk9SJ10gPSB7fTtcblx0XHRcdFx0Ly8gUHV0IGl0IGluIGFuIGVycm9yIG9iamVjdCBzbyBkYXRhIGlzbid0IGxvc3Rcblx0XHRcdFx0cE9iamVjdFsnX19FUlJPUiddW3BBZGRyZXNzXSA9IHBWYWx1ZTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAocE9iamVjdC5oYXNPd25Qcm9wZXJ0eSh0bXBTdWJPYmplY3ROYW1lKSlcblx0XHRcdHtcblx0XHRcdFx0Ly8gSWYgdGhlcmUgaXMgYWxyZWFkeSBhIHN1Ym9iamVjdCBwYXNzIHRoYXQgdG8gdGhlIHJlY3Vyc2l2ZSB0aGluZ3lcblx0XHRcdFx0cmV0dXJuIHRoaXMuc2V0VmFsdWVBdEFkZHJlc3MocE9iamVjdFt0bXBTdWJPYmplY3ROYW1lXSwgdG1wTmV3QWRkcmVzcywgcFZhbHVlKTtcblx0XHRcdH1cblx0XHRcdGVsc2Vcblx0XHRcdHtcblx0XHRcdFx0Ly8gQ3JlYXRlIGEgc3Vib2JqZWN0IGFuZCB0aGVuIHBhc3MgdGhhdFxuXHRcdFx0XHRwT2JqZWN0W3RtcFN1Yk9iamVjdE5hbWVdID0ge307XG5cdFx0XHRcdHJldHVybiB0aGlzLnNldFZhbHVlQXRBZGRyZXNzKHBPYmplY3RbdG1wU3ViT2JqZWN0TmFtZV0sIHRtcE5ld0FkZHJlc3MsIHBWYWx1ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1hbnlmZXN0T2JqZWN0QWRkcmVzc1Jlc29sdmVyOyIsIi8qKlxuKiBAbGljZW5zZSBNSVRcbiogQGF1dGhvciA8c3RldmVuQHZlbG96by5jb20+XG4qL1xubGV0IGxpYlNpbXBsZUxvZyA9IHJlcXVpcmUoJy4vTWFueWZlc3QtTG9nVG9Db25zb2xlLmpzJyk7XG5cbi8qKlxuKiBTY2hlbWEgTWFuaXB1bGF0aW9uIEZ1bmN0aW9uc1xuKlxuKiBAY2xhc3MgTWFueWZlc3RTY2hlbWFNYW5pcHVsYXRpb25cbiovXG5jbGFzcyBNYW55ZmVzdFNjaGVtYU1hbmlwdWxhdGlvblxue1xuXHRjb25zdHJ1Y3RvcihwSW5mb0xvZywgcEVycm9yTG9nKVxuXHR7XG5cdFx0Ly8gV2lyZSBpbiBsb2dnaW5nXG5cdFx0dGhpcy5sb2dJbmZvID0gKHR5cGVvZihwSW5mb0xvZykgPT09ICdmdW5jdGlvbicpID8gcEluZm9Mb2cgOiBsaWJTaW1wbGVMb2c7XG5cdFx0dGhpcy5sb2dFcnJvciA9ICh0eXBlb2YocEVycm9yTG9nKSA9PT0gJ2Z1bmN0aW9uJykgPyBwRXJyb3JMb2cgOiBsaWJTaW1wbGVMb2c7XG5cdH1cblxuICAgIC8vIFRoaXMgdHJhbnNsYXRlcyB0aGUgZGVmYXVsdCBhZGRyZXNzIG1hcHBpbmdzIHRvIHNvbWV0aGluZyBkaWZmZXJlbnQuXG4gICAgLy9cbiAgICAvLyBGb3IgaW5zdGFuY2UgeW91IGNhbiBwYXNzIGluIG1hbnlmZXN0IHNjaGVtYSBkZXNjcmlwdG9yIG9iamVjdDpcbiAgICAvLyBcdHtcblx0Ly9cdCAgXCJBZGRyZXNzLk9mLmFcIjogeyBcIkhhc2hcIjogXCJhXCIsIFwiVHlwZVwiOiBcIk51bWJlclwiIH0sXG5cdC8vXHQgIFwiQWRkcmVzcy5PZi5iXCI6IHsgXCJIYXNoXCI6IFwiYlwiLCBcIlR5cGVcIjogXCJOdW1iZXJcIiB9XG5cdC8vICB9XG4gICAgLy9cbiAgICAvL1xuICAgIC8vIEFuZCB0aGVuIGFuIGFkZHJlc3MgbWFwcGluZyAoYmFzaWNhbGx5IGEgSGFzaC0+QWRkcmVzcyBtYXApXG4gICAgLy8gIHtcbiAgICAvLyAgICBcImFcIjogXCJOZXcuQWRkcmVzcy5PZi5hXCIsXG4gICAgLy8gICAgXCJiXCI6IFwiTmV3LkFkZHJlc3MuT2YuYlwiICBcbiAgICAvLyAgfVxuICAgIC8vXG4gICAgLy8gTk9URTogVGhpcyBtdXRhdGVzIHRoZSBzY2hlbWEgb2JqZWN0IHBlcm1hbmVudGx5LCBhbHRlcmluZyB0aGUgYmFzZSBoYXNoLlxuICAgIC8vICAgICAgIElmIHRoZXJlIGlzIGEgY29sbGlzaW9uIHdpdGggYW4gZXhpc3RpbmcgYWRkcmVzcywgaXQgY2FuIGxlYWQgdG8gb3ZlcndyaXRlcy5cbiAgICAvLyBUT0RPOiBEaXNjdXNzIHdoYXQgc2hvdWxkIGhhcHBlbiBvbiBjb2xsaXNpb25zLlxuXHRyZXNvbHZlQWRkcmVzc01hcHBpbmdzKHBNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzLCBwQWRkcmVzc01hcHBpbmcpXG5cdHtcblx0XHRpZiAodHlwZW9mKHBNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzKSAhPSAnb2JqZWN0Jylcblx0XHR7XG5cdFx0XHR0aGlzLmxvZ0Vycm9yKGBBdHRlbXB0ZWQgdG8gcmVzb2x2ZSBhZGRyZXNzIG1hcHBpbmcgYnV0IHRoZSBkZXNjcmlwdG9yIHdhcyBub3QgYW4gb2JqZWN0LmApO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YocEFkZHJlc3NNYXBwaW5nKSAhPSAnb2JqZWN0Jylcblx0XHR7XG5cdFx0XHQvLyBObyBtYXBwaW5ncyB3ZXJlIHBhc3NlZCBpblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gR2V0IHRoZSBhcnJheXMgb2YgYm90aCB0aGUgc2NoZW1hIGRlZmluaXRpb24gYW5kIHRoZSBoYXNoIG1hcHBpbmdcblx0XHRsZXQgdG1wTWFueWZlc3RBZGRyZXNzZXMgPSBPYmplY3Qua2V5cyhwTWFueWZlc3RTY2hlbWFEZXNjcmlwdG9ycyk7XG5cdFx0bGV0IHRtcEhhc2hNYXBwaW5nID0ge307XG5cdFx0dG1wTWFueWZlc3RBZGRyZXNzZXMuZm9yRWFjaChcblx0XHRcdChwQWRkcmVzcykgPT5cblx0XHRcdHtcblx0XHRcdFx0aWYgKHBNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzW3BBZGRyZXNzXS5oYXNPd25Qcm9wZXJ0eSgnSGFzaCcpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dG1wSGFzaE1hcHBpbmdbcE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnNbcEFkZHJlc3NdLkhhc2hdID0gcEFkZHJlc3M7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0bGV0IHRtcEFkZHJlc3NNYXBwaW5nU2V0ID0gT2JqZWN0LmtleXMocEFkZHJlc3NNYXBwaW5nKTtcblxuXHRcdHRtcEFkZHJlc3NNYXBwaW5nU2V0LmZvckVhY2goXG5cdFx0XHQocElucHV0QWRkcmVzcykgPT5cblx0XHRcdHtcblx0XHRcdFx0bGV0IHRtcE5ld0Rlc2NyaXB0b3JBZGRyZXNzID0gcEFkZHJlc3NNYXBwaW5nW3BJbnB1dEFkZHJlc3NdO1xuXHRcdFx0XHRsZXQgdG1wT2xkRGVzY3JpcHRvckFkZHJlc3MgPSBmYWxzZTtcblx0XHRcdFx0bGV0IHRtcERlc2NyaXB0b3IgPSBmYWxzZTtcblxuXHRcdFx0XHQvLyBTZWUgaWYgdGhlcmUgaXMgYSBtYXRjaGluZyBkZXNjcmlwdG9yIGVpdGhlciBieSBBZGRyZXNzIGRpcmVjdGx5IG9yIEhhc2hcblx0XHRcdFx0aWYgKHBNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzLmhhc093blByb3BlcnR5KHBJbnB1dEFkZHJlc3MpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dG1wT2xkRGVzY3JpcHRvckFkZHJlc3MgPSBwSW5wdXRBZGRyZXNzO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKHRtcEhhc2hNYXBwaW5nLmhhc093blByb3BlcnR5KHBJbnB1dEFkZHJlc3MpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dG1wT2xkRGVzY3JpcHRvckFkZHJlc3MgPSB0bXBIYXNoTWFwcGluZ1twSW5wdXRBZGRyZXNzXTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIElmIHRoZXJlIHdhcyBhIG1hdGNoaW5nIGRlc2NyaXB0b3IgaW4gdGhlIG1hbmlmZXN0LCBzdG9yZSBpdCBpbiB0aGUgdGVtcG9yYXJ5IGRlc2NyaXB0b3Jcblx0XHRcdFx0aWYgKHRtcE9sZERlc2NyaXB0b3JBZGRyZXNzKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dG1wRGVzY3JpcHRvciA9IHBNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzW3RtcE9sZERlc2NyaXB0b3JBZGRyZXNzXTtcblx0XHRcdFx0XHRkZWxldGUgcE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnNbdG1wT2xkRGVzY3JpcHRvckFkZHJlc3NdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIENyZWF0ZSBhIG5ldyBkZXNjcmlwdG9yISAgTWFwIGl0IHRvIHRoZSBpbnB1dCBhZGRyZXNzLlxuXHRcdFx0XHRcdHRtcERlc2NyaXB0b3IgPSB7IEhhc2g6cElucHV0QWRkcmVzcyB9O1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gTm93IHJlLWFkZCB0aGUgZGVzY3JpcHRvciB0byB0aGUgbWFueWZlc3Qgc2NoZW1hXG5cdFx0XHRcdHBNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzW3RtcE5ld0Rlc2NyaXB0b3JBZGRyZXNzXSA9IHRtcERlc2NyaXB0b3I7XG5cdFx0XHR9KTtcblxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0c2FmZVJlc29sdmVBZGRyZXNzTWFwcGluZ3MocE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnMsIHBBZGRyZXNzTWFwcGluZylcblx0e1xuXHRcdC8vIFRoaXMgcmV0dXJucyB0aGUgZGVzY3JpcHRvcnMgYXMgYSBuZXcgb2JqZWN0LCBzYWZlbHkgcmVtYXBwaW5nIHdpdGhvdXQgbXV0YXRpbmcgdGhlIG9yaWdpbmFsIHNjaGVtYSBEZXNjcmlwdG9yc1xuXHRcdGxldCB0bXBNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShwTWFueWZlc3RTY2hlbWFEZXNjcmlwdG9ycykpO1xuXHRcdHRoaXMucmVzb2x2ZUFkZHJlc3NNYXBwaW5ncyh0bXBNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzLCBwQWRkcmVzc01hcHBpbmcpO1xuXHRcdHJldHVybiB0bXBNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzO1xuXHR9XG5cblx0bWVyZ2VBZGRyZXNzTWFwcGluZ3MocE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnNEZXN0aW5hdGlvbiwgcE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnNTb3VyY2UpXG5cdHtcblx0XHRpZiAoKHR5cGVvZihwTWFueWZlc3RTY2hlbWFEZXNjcmlwdG9yc1NvdXJjZSkgIT0gJ29iamVjdCcpIHx8ICh0eXBlb2YocE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnNEZXN0aW5hdGlvbikgIT0gJ29iamVjdCcpKVxuXHRcdHtcblx0XHRcdHRoaXMubG9nRXJyb3IoYEF0dGVtcHRlZCB0byBtZXJnZSB0d28gc2NoZW1hIGRlc2NyaXB0b3JzIGJ1dCBib3RoIHdlcmUgbm90IG9iamVjdHMuYCk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0bGV0IHRtcFNvdXJjZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkocE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnNTb3VyY2UpKTtcblx0XHRsZXQgdG1wTmV3TWFueWZlc3RTY2hlbWFEZXNjcmlwdG9ycyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkocE1hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnNEZXN0aW5hdGlvbikpO1xuXG5cdFx0Ly8gVGhlIGZpcnN0IHBhc3NlZC1pbiBzZXQgb2YgZGVzY3JpcHRvcnMgdGFrZXMgcHJlY2VkZW5jZS5cblx0XHRsZXQgdG1wRGVzY3JpcHRvckFkZHJlc3NlcyA9IE9iamVjdC5rZXlzKHRtcFNvdXJjZSk7XG5cblx0XHR0bXBEZXNjcmlwdG9yQWRkcmVzc2VzLmZvckVhY2goXG5cdFx0XHQocERlc2NyaXB0b3JBZGRyZXNzKSA9PiBcblx0XHRcdHtcblx0XHRcdFx0aWYgKCF0bXBOZXdNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzLmhhc093blByb3BlcnR5KHBEZXNjcmlwdG9yQWRkcmVzcykpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHR0bXBOZXdNYW55ZmVzdFNjaGVtYURlc2NyaXB0b3JzW3BEZXNjcmlwdG9yQWRkcmVzc10gPSB0bXBTb3VyY2VbcERlc2NyaXB0b3JBZGRyZXNzXTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XG5cdFx0cmV0dXJuIHRtcE5ld01hbnlmZXN0U2NoZW1hRGVzY3JpcHRvcnM7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBNYW55ZmVzdFNjaGVtYU1hbmlwdWxhdGlvbjsiLCIvKipcbiogQGxpY2Vuc2UgTUlUXG4qIEBhdXRob3IgPHN0ZXZlbkB2ZWxvem8uY29tPlxuKi9cbmxldCBsaWJTaW1wbGVMb2cgPSByZXF1aXJlKCcuL01hbnlmZXN0LUxvZ1RvQ29uc29sZS5qcycpO1xuXG5sZXQgbGliSGFzaFRyYW5zbGF0aW9uID0gcmVxdWlyZSgnLi9NYW55ZmVzdC1IYXNoVHJhbnNsYXRpb24uanMnKTtcbmxldCBsaWJPYmplY3RBZGRyZXNzUmVzb2x2ZXIgPSByZXF1aXJlKCcuL01hbnlmZXN0LU9iamVjdEFkZHJlc3NSZXNvbHZlci5qcycpO1xubGV0IGxpYk9iamVjdEFkZHJlc3NHZW5lcmF0aW9uID0gcmVxdWlyZSgnLi9NYW55ZmVzdC1PYmplY3RBZGRyZXNzR2VuZXJhdGlvbi5qcycpO1xubGV0IGxpYlNjaGVtYU1hbmlwdWxhdGlvbiA9IHJlcXVpcmUoJy4vTWFueWZlc3QtU2NoZW1hTWFuaXB1bGF0aW9uLmpzJyk7XG5cblxuLyoqXG4qIE1hbnlmZXN0IG9iamVjdCBhZGRyZXNzLWJhc2VkIGRlc2NyaXB0aW9ucyBhbmQgbWFuaXB1bGF0aW9ucy5cbipcbiogQGNsYXNzIE1hbnlmZXN0XG4qL1xuY2xhc3MgTWFueWZlc3Rcbntcblx0Y29uc3RydWN0b3IocE1hbmlmZXN0LCBwSW5mb0xvZywgcEVycm9yTG9nLCBwT3B0aW9ucylcblx0e1xuXHRcdC8vIFdpcmUgaW4gbG9nZ2luZ1xuXHRcdHRoaXMubG9nSW5mbyA9ICh0eXBlb2YocEluZm9Mb2cpID09PSAnZnVuY3Rpb24nKSA/IHBJbmZvTG9nIDogbGliU2ltcGxlTG9nO1xuXHRcdHRoaXMubG9nRXJyb3IgPSAodHlwZW9mKHBFcnJvckxvZykgPT09ICdmdW5jdGlvbicpID8gcEVycm9yTG9nIDogbGliU2ltcGxlTG9nO1xuXG5cdFx0Ly8gQ3JlYXRlIGFuIG9iamVjdCBhZGRyZXNzIHJlc29sdmVyIGFuZCBtYXAgaW4gdGhlIGZ1bmN0aW9uc1xuXHRcdHRoaXMub2JqZWN0QWRkcmVzc1Jlc29sdmVyID0gbmV3IGxpYk9iamVjdEFkZHJlc3NSZXNvbHZlcih0aGlzLmxvZ0luZm8sIHRoaXMubG9nRXJyb3IpO1xuXG5cdFx0dGhpcy5vcHRpb25zID0gKFxuXHRcdFx0e1xuXHRcdFx0XHRzdHJpY3Q6IGZhbHNlLFxuXHRcdFx0XHRkZWZhdWx0VmFsdWVzOiBcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcIlN0cmluZ1wiOiBcIlwiLFxuXHRcdFx0XHRcdFx0XCJOdW1iZXJcIjogMCxcblx0XHRcdFx0XHRcdFwiRmxvYXRcIjogMC4wLFxuXHRcdFx0XHRcdFx0XCJJbnRlZ2VyXCI6IDAsXG5cdFx0XHRcdFx0XHRcIkJvb2xlYW5cIjogZmFsc2UsXG5cdFx0XHRcdFx0XHRcIkJpbmFyeVwiOiAwLFxuXHRcdFx0XHRcdFx0XCJEYXRlVGltZVwiOiAwLFxuXHRcdFx0XHRcdFx0XCJBcnJheVwiOiBbXSxcblx0XHRcdFx0XHRcdFwiT2JqZWN0XCI6IHt9LFxuXHRcdFx0XHRcdFx0XCJOdWxsXCI6IG51bGxcblx0XHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdHRoaXMuc2NvcGUgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5lbGVtZW50QWRkcmVzc2VzID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMuZWxlbWVudEhhc2hlcyA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLmVsZW1lbnREZXNjcmlwdG9ycyA9IHVuZGVmaW5lZDtcblxuXHRcdHRoaXMucmVzZXQoKTtcblxuXHRcdGlmICh0eXBlb2YocE1hbmlmZXN0KSA9PT0gJ29iamVjdCcpXG5cdFx0e1xuXHRcdFx0dGhpcy5sb2FkTWFuaWZlc3QocE1hbmlmZXN0KTtcblx0XHR9XG5cblx0XHR0aGlzLnNjaGVtYU1hbmlwdWxhdGlvbnMgPSBuZXcgbGliU2NoZW1hTWFuaXB1bGF0aW9uKHRoaXMubG9nSW5mbywgdGhpcy5sb2dFcnJvcik7XG5cdFx0dGhpcy5vYmplY3RBZGRyZXNzR2VuZXJhdGlvbiA9IG5ldyBsaWJPYmplY3RBZGRyZXNzR2VuZXJhdGlvbih0aGlzLmxvZ0luZm8sIHRoaXMubG9nRXJyb3IpO1xuXG5cdFx0dGhpcy5oYXNoVHJhbnNsYXRpb25zID0gbmV3IGxpYkhhc2hUcmFuc2xhdGlvbih0aGlzLmxvZ0luZm8sIHRoaXMubG9nRXJyb3IpO1xuXHR9XG5cblx0LyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblx0ICogU2NoZW1hIE1hbmlmZXN0IExvYWRpbmcsIFJlYWRpbmcsIE1hbmlwdWxhdGlvbiBhbmQgU2VyaWFsaXphdGlvbiBGdW5jdGlvbnNcblx0ICovXG5cblx0Ly8gUmVzZXQgY3JpdGljYWwgbWFuaWZlc3QgcHJvcGVydGllc1xuXHRyZXNldCgpXG5cdHtcblx0XHR0aGlzLnNjb3BlID0gJ0RFRkFVTFQnO1xuXHRcdHRoaXMuZWxlbWVudEFkZHJlc3NlcyA9IFtdO1xuXHRcdHRoaXMuZWxlbWVudEhhc2hlcyA9IHt9O1xuXHRcdHRoaXMuZWxlbWVudERlc2NyaXB0b3JzID0ge307XG5cdH1cblxuXHRjbG9uZSgpXG5cdHtcblx0XHQvLyBNYWtlIGEgY29weSBvZiB0aGUgb3B0aW9ucyBpbi1wbGFjZVxuXHRcdGxldCB0bXBOZXdPcHRpb25zID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0aGlzLm9wdGlvbnMpKTtcblxuXHRcdGxldCB0bXBOZXdNYW55ZmVzdCA9IG5ldyBNYW55ZmVzdCh0aGlzLmdldE1hbmlmZXN0KCksIHRoaXMubG9nSW5mbywgdGhpcy5sb2dFcnJvciwgdG1wTmV3T3B0aW9ucyk7XG5cblx0XHQvLyBJbXBvcnQgdGhlIGhhc2ggdHJhbnNsYXRpb25zXG5cdFx0dG1wTmV3TWFueWZlc3QuaGFzaFRyYW5zbGF0aW9ucy5hZGRUcmFuc2xhdGlvbih0aGlzLmhhc2hUcmFuc2xhdGlvbnMudHJhbnNsYXRpb25UYWJsZSk7XG5cblx0XHRyZXR1cm4gdG1wTmV3TWFueWZlc3Q7XG5cdH1cblxuXHQvLyBEZXNlcmlhbGl6ZSBhIE1hbmlmZXN0IGZyb20gYSBzdHJpbmdcblx0ZGVzZXJpYWxpemUocE1hbmlmZXN0U3RyaW5nKVxuXHR7XG5cdFx0Ly8gVE9ETzogQWRkIGd1YXJkcyBmb3IgYmFkIG1hbmlmZXN0IHN0cmluZ1xuXHRcdHJldHVybiB0aGlzLmxvYWRNYW5pZmVzdChKU09OLnBhcnNlKHBNYW5pZmVzdFN0cmluZykpO1xuXHR9XG5cblx0Ly8gTG9hZCBhIG1hbmlmZXN0IGZyb20gYW4gb2JqZWN0XG5cdGxvYWRNYW5pZmVzdChwTWFuaWZlc3QpXG5cdHtcblx0XHRpZiAodHlwZW9mKHBNYW5pZmVzdCkgIT09ICdvYmplY3QnKVxuXHRcdHtcblx0XHRcdHRoaXMubG9nRXJyb3IoYCgke3RoaXMuc2NvcGV9KSBFcnJvciBsb2FkaW5nIG1hbmlmZXN0OyBleHBlY3RpbmcgYW4gb2JqZWN0IGJ1dCBwYXJhbWV0ZXIgd2FzIHR5cGUgJHt0eXBlb2YocE1hbmlmZXN0KX0uYCk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0aWYgKHBNYW5pZmVzdC5oYXNPd25Qcm9wZXJ0eSgnU2NvcGUnKSlcblx0XHR7XG5cdFx0XHRpZiAodHlwZW9mKHBNYW5pZmVzdC5TY29wZSkgPT09ICdzdHJpbmcnKVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLnNjb3BlID0gcE1hbmlmZXN0LlNjb3BlO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLmxvZ0Vycm9yKGAoJHt0aGlzLnNjb3BlfSkgRXJyb3IgbG9hZGluZyBzY29wZSBmcm9tIG1hbmlmZXN0OyBleHBlY3RpbmcgYSBzdHJpbmcgYnV0IHByb3BlcnR5IHdhcyB0eXBlICR7dHlwZW9mKHBNYW5pZmVzdC5TY29wZSl9LmAsIHBNYW5pZmVzdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR0aGlzLmxvZ0Vycm9yKGAoJHt0aGlzLnNjb3BlfSkgRXJyb3IgbG9hZGluZyBzY29wZSBmcm9tIG1hbmlmZXN0IG9iamVjdC4gIFByb3BlcnR5IFwiU2NvcGVcIiBkb2VzIG5vdCBleGlzdCBpbiB0aGUgcm9vdCBvZiB0aGUgb2JqZWN0LmAsIHBNYW5pZmVzdCk7XG5cdFx0fVxuXG5cdFx0aWYgKHBNYW5pZmVzdC5oYXNPd25Qcm9wZXJ0eSgnRGVzY3JpcHRvcnMnKSlcblx0XHR7XG5cdFx0XHRpZiAodHlwZW9mKHBNYW5pZmVzdC5EZXNjcmlwdG9ycykgPT09ICdvYmplY3QnKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdG1wRGVzY3JpcHRpb25BZGRyZXNzZXMgPSBPYmplY3Qua2V5cyhwTWFuaWZlc3QuRGVzY3JpcHRvcnMpO1xuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHRtcERlc2NyaXB0aW9uQWRkcmVzc2VzLmxlbmd0aDsgaSsrKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGhpcy5hZGREZXNjcmlwdG9yKHRtcERlc2NyaXB0aW9uQWRkcmVzc2VzW2ldLCBwTWFuaWZlc3QuRGVzY3JpcHRvcnNbdG1wRGVzY3JpcHRpb25BZGRyZXNzZXNbaV1dKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLmxvZ0Vycm9yKGAoJHt0aGlzLnNjb3BlfSkgRXJyb3IgbG9hZGluZyBkZXNjcmlwdGlvbiBvYmplY3QgZnJvbSBtYW5pZmVzdCBvYmplY3QuICBFeHBlY3RpbmcgYW4gb2JqZWN0IGluICdNYW5pZmVzdC5EZXNjcmlwdG9ycycgYnV0IHRoZSBwcm9wZXJ0eSB3YXMgdHlwZSAke3R5cGVvZihwTWFuaWZlc3QuRGVzY3JpcHRvcnMpfS5gLCBwTWFuaWZlc3QpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0dGhpcy5sb2dFcnJvcihgKCR7dGhpcy5zY29wZX0pIEVycm9yIGxvYWRpbmcgb2JqZWN0IGRlc2NyaXB0aW9uIGZyb20gbWFuaWZlc3Qgb2JqZWN0LiAgUHJvcGVydHkgXCJEZXNjcmlwdG9yc1wiIGRvZXMgbm90IGV4aXN0IGluIHRoZSByb290IG9mIHRoZSBNYW5pZmVzdCBvYmplY3QuYCwgcE1hbmlmZXN0KTtcblx0XHR9XG5cdH1cblxuXHQvLyBTZXJpYWxpemUgdGhlIE1hbmlmZXN0IHRvIGEgc3RyaW5nXG5cdC8vIFRPRE86IFNob3VsZCB0aGlzIGFsc28gc2VyaWFsaXplIHRoZSB0cmFuc2xhdGlvbiB0YWJsZT9cblx0c2VyaWFsaXplKClcblx0e1xuXHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLmdldE1hbmlmZXN0KCkpO1xuXHR9XG5cblx0Z2V0TWFuaWZlc3QoKVxuXHR7XG5cdFx0cmV0dXJuIChcblx0XHRcdHtcblx0XHRcdFx0U2NvcGU6IHRoaXMuc2NvcGUsXG5cdFx0XHRcdERlc2NyaXB0b3JzOiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KHRoaXMuZWxlbWVudERlc2NyaXB0b3JzKSlcblx0XHRcdH0pO1xuXHR9XG5cblx0Ly8gQWRkIGEgZGVzY3JpcHRvciB0byB0aGUgbWFuaWZlc3Rcblx0YWRkRGVzY3JpcHRvcihwQWRkcmVzcywgcERlc2NyaXB0b3IpXG5cdHtcblx0XHRpZiAodHlwZW9mKHBEZXNjcmlwdG9yKSA9PT0gJ29iamVjdCcpXG5cdFx0e1xuXHRcdFx0Ly8gQWRkIHRoZSBBZGRyZXNzIGludG8gdGhlIERlc2NyaXB0b3IgaWYgaXQgZG9lc24ndCBleGlzdDpcblx0XHRcdGlmICghcERlc2NyaXB0b3IuaGFzT3duUHJvcGVydHkoJ0FkZHJlc3MnKSlcblx0XHRcdHtcblx0XHRcdFx0cERlc2NyaXB0b3IuQWRkcmVzcyA9IHBBZGRyZXNzO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIXRoaXMuZWxlbWVudERlc2NyaXB0b3JzLmhhc093blByb3BlcnR5KHBBZGRyZXNzKSlcblx0XHRcdHtcblx0XHRcdFx0dGhpcy5lbGVtZW50QWRkcmVzc2VzLnB1c2gocEFkZHJlc3MpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBBZGQgdGhlIGVsZW1lbnQgZGVzY3JpcHRvciB0byB0aGUgc2NoZW1hXG5cdFx0XHR0aGlzLmVsZW1lbnREZXNjcmlwdG9yc1twQWRkcmVzc10gPSBwRGVzY3JpcHRvcjtcblxuXHRcdFx0Ly8gQWx3YXlzIGFkZCB0aGUgYWRkcmVzcyBhcyBhIGhhc2hcblx0XHRcdHRoaXMuZWxlbWVudEhhc2hlc1twQWRkcmVzc10gPSBwQWRkcmVzcztcblxuXHRcdFx0aWYgKHBEZXNjcmlwdG9yLmhhc093blByb3BlcnR5KCdIYXNoJykpXG5cdFx0XHR7XG5cdFx0XHRcdC8vIFRPRE86IENoZWNrIGlmIHRoaXMgaXMgYSBnb29kIGlkZWEgb3Igbm90Li5cblx0XHRcdFx0Ly8gICAgICAgQ29sbGlzaW9ucyBhcmUgYm91bmQgdG8gaGFwcGVuIHdpdGggYm90aCByZXByZXNlbnRhdGlvbnMgb2YgdGhlIGFkZHJlc3MvaGFzaCBpbiBoZXJlIGFuZCBkZXZlbG9wZXJzIGJlaW5nIGFibGUgdG8gY3JlYXRlIHRoZWlyIG93biBoYXNoZXMuXG5cdFx0XHRcdHRoaXMuZWxlbWVudEhhc2hlc1twRGVzY3JpcHRvci5IYXNoXSA9IHBBZGRyZXNzO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHRwRGVzY3JpcHRvci5IYXNoID0gcEFkZHJlc3M7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRlbHNlXG5cdFx0e1xuXHRcdFx0dGhpcy5sb2dFcnJvcihgKCR7dGhpcy5zY29wZX0pIEVycm9yIGxvYWRpbmcgb2JqZWN0IGRlc2NyaXB0b3IgZm9yIGFkZHJlc3MgJyR7cEFkZHJlc3N9JyBmcm9tIG1hbmlmZXN0IG9iamVjdC4gIEV4cGVjdGluZyBhbiBvYmplY3QgYnV0IHByb3BlcnR5IHdhcyB0eXBlICR7dHlwZW9mKHBEZXNjcmlwdG9yKX0uYCk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVx0XG5cdH1cblxuXHRnZXREZXNjcmlwdG9yQnlIYXNoKHBIYXNoKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0RGVzY3JpcHRvcih0aGlzLnJlc29sdmVIYXNoQWRkcmVzcyhwSGFzaCkpO1xuXHR9XG5cblx0Z2V0RGVzY3JpcHRvcihwQWRkcmVzcylcblx0e1xuXHRcdHJldHVybiB0aGlzLmVsZW1lbnREZXNjcmlwdG9yc1twQWRkcmVzc107XG5cdH1cblxuXHQvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXHQgKiBCZWdpbm5pbmcgb2YgT2JqZWN0IE1hbmlwdWxhdGlvbiAocmVhZCAmIHdyaXRlKSBGdW5jdGlvbnNcblx0ICovXG5cdC8vIENoZWNrIGlmIGFuIGVsZW1lbnQgZXhpc3RzIGJ5IGl0cyBoYXNoXG5cdGNoZWNrQWRkcmVzc0V4aXN0c0J5SGFzaCAocE9iamVjdCwgcEhhc2gpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5jaGVja0FkZHJlc3NFeGlzdHMocE9iamVjdCx0aGlzLnJlc29sdmVIYXNoQWRkcmVzcyhwSGFzaCkpO1xuXHR9XG5cblx0Ly8gQ2hlY2sgaWYgYW4gZWxlbWVudCBleGlzdHMgYXQgYW4gYWRkcmVzc1xuXHRjaGVja0FkZHJlc3NFeGlzdHMgKHBPYmplY3QsIHBBZGRyZXNzKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMub2JqZWN0QWRkcmVzc1Jlc29sdmVyLmNoZWNrQWRkcmVzc0V4aXN0cyhwT2JqZWN0LCBwQWRkcmVzcyk7XG5cdH1cblxuXHQvLyBUdXJuIGEgaGFzaCBpbnRvIGFuIGFkZHJlc3MsIGZhY3RvcmluZyBpbiB0aGUgdHJhbnNsYXRpb24gdGFibGUuXG5cdHJlc29sdmVIYXNoQWRkcmVzcyhwSGFzaClcblx0e1xuXHRcdGxldCB0bXBBZGRyZXNzID0gdW5kZWZpbmVkO1xuXG5cdFx0bGV0IHRtcEluRWxlbWVudEhhc2hUYWJsZSA9IHRoaXMuZWxlbWVudEhhc2hlcy5oYXNPd25Qcm9wZXJ0eShwSGFzaCk7XG5cdFx0bGV0IHRtcEluVHJhbnNsYXRpb25UYWJsZSA9IHRoaXMuaGFzaFRyYW5zbGF0aW9ucy50cmFuc2xhdGlvblRhYmxlLmhhc093blByb3BlcnR5KHBIYXNoKTtcblxuXHRcdC8vIFRoZSBtb3N0IHN0cmFpZ2h0Zm9yd2FyZDogdGhlIGhhc2ggZXhpc3RzLCBubyB0cmFuc2xhdGlvbnMuXG5cdFx0aWYgKHRtcEluRWxlbWVudEhhc2hUYWJsZSAmJiAhdG1wSW5UcmFuc2xhdGlvblRhYmxlKVxuXHRcdHtcblx0XHRcdHRtcEFkZHJlc3MgPSB0aGlzLmVsZW1lbnRIYXNoZXNbcEhhc2hdO1xuXHRcdH1cblx0XHQvLyBUaGVyZSBpcyBhIHRyYW5zbGF0aW9uIGZyb20gb25lIGhhc2ggdG8gYW5vdGhlciwgYW5kLCB0aGUgZWxlbWVudEhhc2hlcyBjb250YWlucyB0aGUgcG9pbnRlciBlbmRcblx0XHRlbHNlIGlmICh0bXBJblRyYW5zbGF0aW9uVGFibGUgJiYgdGhpcy5lbGVtZW50SGFzaGVzLmhhc093blByb3BlcnR5KHRoaXMuaGFzaFRyYW5zbGF0aW9ucy50cmFuc2xhdGUocEhhc2gpKSlcblx0XHR7XG5cdFx0XHR0bXBBZGRyZXNzID0gdGhpcy5lbGVtZW50SGFzaGVzW3RoaXMuaGFzaFRyYW5zbGF0aW9ucy50cmFuc2xhdGUocEhhc2gpXTtcblx0XHR9XG5cdFx0Ly8gVXNlIHRoZSBsZXZlbCBvZiBpbmRpcmVjdGlvbiBvbmx5IGluIHRoZSBUcmFuc2xhdGlvbiBUYWJsZSBcblx0XHRlbHNlIGlmICh0bXBJblRyYW5zbGF0aW9uVGFibGUpXG5cdFx0e1xuXHRcdFx0dG1wQWRkcmVzcyA9IHRoaXMuaGFzaFRyYW5zbGF0aW9ucy50cmFuc2xhdGUocEhhc2gpO1xuXHRcdH1cblx0XHQvLyBKdXN0IHRyZWF0IHRoZSBoYXNoIGFzIGFuIGFkZHJlc3MuXG5cdFx0Ly8gVE9ETzogRGlzY3VzcyB0aGlzIC4uLiBpdCBpcyBtYWdpYyBidXQgY29udHJvdmVyc2lhbFxuXHRcdGVsc2Vcblx0XHR7XG5cdFx0XHR0bXBBZGRyZXNzID0gcEhhc2g7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRtcEFkZHJlc3M7XG5cdH1cblxuXHQvLyBHZXQgdGhlIHZhbHVlIG9mIGFuIGVsZW1lbnQgYnkgaXRzIGhhc2hcblx0Z2V0VmFsdWVCeUhhc2ggKHBPYmplY3QsIHBIYXNoKVxuXHR7XG5cdFx0bGV0IHRtcFZhbHVlID0gdGhpcy5nZXRWYWx1ZUF0QWRkcmVzcyhwT2JqZWN0LCB0aGlzLnJlc29sdmVIYXNoQWRkcmVzcyhwSGFzaCkpO1xuXG5cdFx0aWYgKHR5cGVvZih0bXBWYWx1ZSkgPT0gJ3VuZGVmaW5lZCcpXG5cdFx0e1xuXHRcdFx0Ly8gVHJ5IHRvIGdldCBhIGRlZmF1bHQgaWYgaXQgZXhpc3RzXG5cdFx0XHR0bXBWYWx1ZSA9IHRoaXMuZ2V0RGVmYXVsdFZhbHVlKHRoaXMuZ2V0RGVzY3JpcHRvckJ5SGFzaChwSGFzaCkpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0bXBWYWx1ZTtcblx0fVxuXG5cdC8vIEdldCB0aGUgdmFsdWUgb2YgYW4gZWxlbWVudCBhdCBhbiBhZGRyZXNzXG5cdGdldFZhbHVlQXRBZGRyZXNzIChwT2JqZWN0LCBwQWRkcmVzcylcblx0e1xuXHRcdGxldCB0bXBWYWx1ZSA9IHRoaXMub2JqZWN0QWRkcmVzc1Jlc29sdmVyLmdldFZhbHVlQXRBZGRyZXNzKHBPYmplY3QsIHBBZGRyZXNzKTtcblxuXHRcdGlmICh0eXBlb2YodG1wVmFsdWUpID09ICd1bmRlZmluZWQnKVxuXHRcdHtcblx0XHRcdC8vIFRyeSB0byBnZXQgYSBkZWZhdWx0IGlmIGl0IGV4aXN0c1xuXHRcdFx0dG1wVmFsdWUgPSB0aGlzLmdldERlZmF1bHRWYWx1ZSh0aGlzLmdldERlc2NyaXB0b3IocEFkZHJlc3MpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdG1wVmFsdWU7XG5cdH1cblxuXHQvLyBTZXQgdGhlIHZhbHVlIG9mIGFuIGVsZW1lbnQgYnkgaXRzIGhhc2hcblx0c2V0VmFsdWVCeUhhc2gocE9iamVjdCwgcEhhc2gsIHBWYWx1ZSlcblx0e1xuXHRcdHJldHVybiB0aGlzLnNldFZhbHVlQXRBZGRyZXNzKHBPYmplY3QsIHRoaXMucmVzb2x2ZUhhc2hBZGRyZXNzKHBIYXNoKSwgcFZhbHVlKTtcblx0fVxuXG5cblx0Ly8gU2V0IHRoZSB2YWx1ZSBvZiBhbiBlbGVtZW50IGF0IGFuIGFkZHJlc3Ncblx0c2V0VmFsdWVBdEFkZHJlc3MgKHBPYmplY3QsIHBBZGRyZXNzLCBwVmFsdWUpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5vYmplY3RBZGRyZXNzUmVzb2x2ZXIuc2V0VmFsdWVBdEFkZHJlc3MocE9iamVjdCwgcEFkZHJlc3MsIHBWYWx1ZSk7XG5cdH1cblxuXHQvLyBWYWxpZGF0ZSB0aGUgY29uc2lzdGVuY3kgb2YgYW4gb2JqZWN0IGFnYWluc3QgdGhlIHNjaGVtYVxuXHR2YWxpZGF0ZShwT2JqZWN0KVxuXHR7XG5cdFx0bGV0IHRtcFZhbGlkYXRpb25EYXRhID1cblx0XHR7XG5cdFx0XHRFcnJvcjogbnVsbCxcblx0XHRcdEVycm9yczogW10sXG5cdFx0XHRNaXNzaW5nRWxlbWVudHM6W11cblx0XHR9O1xuXG5cdFx0aWYgKHR5cGVvZihwT2JqZWN0KSAhPT0gJ29iamVjdCcpXG5cdFx0e1xuXHRcdFx0dG1wVmFsaWRhdGlvbkRhdGEuRXJyb3IgPSB0cnVlO1xuXHRcdFx0dG1wVmFsaWRhdGlvbkRhdGEuRXJyb3JzLnB1c2goYEV4cGVjdGVkIHBhc3NlZCBpbiBvYmplY3QgdG8gYmUgdHlwZSBvYmplY3QgYnV0IHdhcyBwYXNzZWQgaW4gJHt0eXBlb2YocE9iamVjdCl9YCk7XG5cdFx0fVxuXG5cdFx0bGV0IGFkZFZhbGlkYXRpb25FcnJvciA9IChwQWRkcmVzcywgcEVycm9yTWVzc2FnZSkgPT5cblx0XHR7XG5cdFx0XHR0bXBWYWxpZGF0aW9uRGF0YS5FcnJvciA9IHRydWU7XG5cdFx0XHR0bXBWYWxpZGF0aW9uRGF0YS5FcnJvcnMucHVzaChgRWxlbWVudCBhdCBhZGRyZXNzIFwiJHtwQWRkcmVzc31cIiAke3BFcnJvck1lc3NhZ2V9LmApO1xuXHRcdH07XG5cblx0XHQvLyBOb3cgZW51bWVyYXRlIHRocm91Z2ggdGhlIHZhbHVlcyBhbmQgY2hlY2sgZm9yIGFub21hbGllcyBiYXNlZCBvbiB0aGUgc2NoZW1hXG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmVsZW1lbnRBZGRyZXNzZXMubGVuZ3RoOyBpKyspXG5cdFx0e1xuXHRcdFx0bGV0IHRtcERlc2NyaXB0b3IgPSB0aGlzLmdldERlc2NyaXB0b3IodGhpcy5lbGVtZW50QWRkcmVzc2VzW2ldKTtcblx0XHRcdGxldCB0bXBWYWx1ZUV4aXN0cyA9IHRoaXMuY2hlY2tBZGRyZXNzRXhpc3RzKHBPYmplY3QsIHRtcERlc2NyaXB0b3IuQWRkcmVzcyk7XG5cdFx0XHRsZXQgdG1wVmFsdWUgPSB0aGlzLmdldFZhbHVlQXRBZGRyZXNzKHBPYmplY3QsIHRtcERlc2NyaXB0b3IuQWRkcmVzcyk7XG5cblx0XHRcdGlmICgodHlwZW9mKHRtcFZhbHVlKSA9PSAndW5kZWZpbmVkJykgfHwgIXRtcFZhbHVlRXhpc3RzKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBUaGlzIHdpbGwgdGVjaG5pY2FsbHkgbWVhbiB0aGF0IGBPYmplY3QuU29tZS5WYWx1ZSA9IHVuZGVmaW5lZGAgd2lsbCBlbmQgdXAgc2hvd2luZyBhcyBcIm1pc3NpbmdcIlxuXHRcdFx0XHQvLyBUT0RPOiBEbyB3ZSB3YW50IHRvIGRvIGEgZGlmZmVyZW50IG1lc3NhZ2UgYmFzZWQgb24gaWYgdGhlIHByb3BlcnR5IGV4aXN0cyBidXQgaXMgdW5kZWZpbmVkP1xuXHRcdFx0XHR0bXBWYWxpZGF0aW9uRGF0YS5NaXNzaW5nRWxlbWVudHMucHVzaCh0bXBEZXNjcmlwdG9yLkFkZHJlc3MpO1xuXHRcdFx0XHRpZiAodG1wRGVzY3JpcHRvci5SZXF1aXJlZCB8fCB0aGlzLm9wdGlvbnMuc3RyaWN0KVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YWRkVmFsaWRhdGlvbkVycm9yKHRtcERlc2NyaXB0b3IuQWRkcmVzcywgJ2lzIGZsYWdnZWQgUkVRVUlSRUQgYnV0IGlzIG5vdCBzZXQgaW4gdGhlIG9iamVjdCcpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIE5vdyBzZWUgaWYgdGhlcmUgaXMgYSBkYXRhIHR5cGUgc3BlY2lmaWVkIGZvciB0aGlzIGVsZW1lbnRcblx0XHRcdGlmICh0bXBEZXNjcmlwdG9yLkRhdGFUeXBlKVxuXHRcdFx0e1xuXHRcdFx0XHRsZXQgdG1wRWxlbWVudFR5cGUgPSB0eXBlb2YodG1wVmFsdWUpO1xuXHRcdFx0XHRzd2l0Y2godG1wRGVzY3JpcHRvci5EYXRhVHlwZS50b1N0cmluZygpLnRyaW0oKS50b0xvd2VyQ2FzZSgpKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y2FzZSAnc3RyaW5nJzpcblx0XHRcdFx0XHRcdGlmICh0bXBFbGVtZW50VHlwZSAhPSAnc3RyaW5nJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YWRkVmFsaWRhdGlvbkVycm9yKHRtcERlc2NyaXB0b3IuQWRkcmVzcywgYGhhcyBhIERhdGFUeXBlICR7dG1wRGVzY3JpcHRvci5EYXRhVHlwZX0gYnV0IGlzIG9mIHRoZSB0eXBlICR7dG1wRWxlbWVudFR5cGV9YCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRcdGNhc2UgJ251bWJlcic6XG5cdFx0XHRcdFx0XHRpZiAodG1wRWxlbWVudFR5cGUgIT0gJ251bWJlcicpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGFkZFZhbGlkYXRpb25FcnJvcih0bXBEZXNjcmlwdG9yLkFkZHJlc3MsIGBoYXMgYSBEYXRhVHlwZSAke3RtcERlc2NyaXB0b3IuRGF0YVR5cGV9IGJ1dCBpcyBvZiB0aGUgdHlwZSAke3RtcEVsZW1lbnRUeXBlfWApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlICdpbnRlZ2VyJzpcblx0XHRcdFx0XHRcdGlmICh0bXBFbGVtZW50VHlwZSAhPSAnbnVtYmVyJylcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0YWRkVmFsaWRhdGlvbkVycm9yKHRtcERlc2NyaXB0b3IuQWRkcmVzcywgYGhhcyBhIERhdGFUeXBlICR7dG1wRGVzY3JpcHRvci5EYXRhVHlwZX0gYnV0IGlzIG9mIHRoZSB0eXBlICR7dG1wRWxlbWVudFR5cGV9YCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGxldCB0bXBWYWx1ZVN0cmluZyA9IHRtcFZhbHVlLnRvU3RyaW5nKCk7XG5cdFx0XHRcdFx0XHRcdGlmICh0bXBWYWx1ZVN0cmluZy5pbmRleE9mKCcuJykgPiAtMSlcblx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdC8vIFRPRE86IElzIHRoaXMgYW4gZXJyb3I/XG5cdFx0XHRcdFx0XHRcdFx0YWRkVmFsaWRhdGlvbkVycm9yKHRtcERlc2NyaXB0b3IuQWRkcmVzcywgYGhhcyBhIERhdGFUeXBlICR7dG1wRGVzY3JpcHRvci5EYXRhVHlwZX0gYnV0IGhhcyBhIGRlY2ltYWwgcG9pbnQgaW4gdGhlIG51bWJlci5gKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlICdmbG9hdCc6XG5cdFx0XHRcdFx0XHRpZiAodG1wRWxlbWVudFR5cGUgIT0gJ251bWJlcicpXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGFkZFZhbGlkYXRpb25FcnJvcih0bXBEZXNjcmlwdG9yLkFkZHJlc3MsIGBoYXMgYSBEYXRhVHlwZSAke3RtcERlc2NyaXB0b3IuRGF0YVR5cGV9IGJ1dCBpcyBvZiB0aGUgdHlwZSAke3RtcEVsZW1lbnRUeXBlfWApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlICdEYXRlVGltZSc6XG5cdFx0XHRcdFx0XHRsZXQgdG1wVmFsdWVEYXRlID0gbmV3IERhdGUodG1wVmFsdWUpO1xuXHRcdFx0XHRcdFx0aWYgKHRtcFZhbHVlRGF0ZS50b1N0cmluZygpID09ICdJbnZhbGlkIERhdGUnKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRhZGRWYWxpZGF0aW9uRXJyb3IodG1wRGVzY3JpcHRvci5BZGRyZXNzLCBgaGFzIGEgRGF0YVR5cGUgJHt0bXBEZXNjcmlwdG9yLkRhdGFUeXBlfSBidXQgaXMgbm90IHBhcnNhYmxlIGFzIGEgRGF0ZSBieSBKYXZhc2NyaXB0YCk7XG5cdFx0XHRcdFx0XHR9XG5cdFxuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHQvLyBDaGVjayBpZiB0aGlzIGlzIGEgc3RyaW5nLCBpbiB0aGUgZGVmYXVsdCBjYXNlXG5cdFx0XHRcdFx0XHQvLyBOb3RlIHRoaXMgaXMgb25seSB3aGVuIGEgRGF0YVR5cGUgaXMgc3BlY2lmaWVkIGFuZCBpdCBpcyBhbiB1bnJlY29nbml6ZWQgZGF0YSB0eXBlLlxuXHRcdFx0XHRcdFx0aWYgKHRtcEVsZW1lbnRUeXBlICE9ICdzdHJpbmcnKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRhZGRWYWxpZGF0aW9uRXJyb3IodG1wRGVzY3JpcHRvci5BZGRyZXNzLCBgaGFzIGEgRGF0YVR5cGUgJHt0bXBEZXNjcmlwdG9yLkRhdGFUeXBlfSAod2hpY2ggYXV0by1jb252ZXJ0ZWQgdG8gU3RyaW5nIGJlY2F1c2UgaXQgd2FzIHVucmVjb2duaXplZCkgYnV0IGlzIG9mIHRoZSB0eXBlICR7dG1wRWxlbWVudFR5cGV9YCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0bXBWYWxpZGF0aW9uRGF0YTtcblx0fVxuXG5cdC8vIFJldHVybnMgYSBkZWZhdWx0IHZhbHVlLCBvciwgdGhlIGRlZmF1bHQgdmFsdWUgZm9yIHRoZSBkYXRhIHR5cGUgKHdoaWNoIGlzIG92ZXJyaWRhYmxlIHdpdGggY29uZmlndXJhdGlvbilcblx0Z2V0RGVmYXVsdFZhbHVlKHBEZXNjcmlwdG9yKVxuXHR7XG5cdFx0aWYgKHR5cGVvZihwRGVzY3JpcHRvcikgIT0gJ29iamVjdCcpXG5cdFx0e1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHRpZiAocERlc2NyaXB0b3IuaGFzT3duUHJvcGVydHkoJ0RlZmF1bHQnKSlcblx0XHR7XG5cdFx0XHRyZXR1cm4gcERlc2NyaXB0b3IuRGVmYXVsdDtcblx0XHR9XG5cdFx0ZWxzZVxuXHRcdHtcblx0XHRcdC8vIERlZmF1bHQgdG8gYSBudWxsIGlmIGl0IGRvZXNuJ3QgaGF2ZSBhIHR5cGUgc3BlY2lmaWVkLlxuXHRcdFx0Ly8gVGhpcyB3aWxsIGVuc3VyZSBhIHBsYWNlaG9sZGVyIGlzIGNyZWF0ZWQgYnV0IGlzbid0IG1pc2ludGVycHJldGVkLlxuXHRcdFx0bGV0IHRtcERhdGFUeXBlID0gKHBEZXNjcmlwdG9yLmhhc093blByb3BlcnR5KCdEYXRhVHlwZScpKSA/IHBEZXNjcmlwdG9yLkRhdGFUeXBlIDogJ1N0cmluZyc7XG5cdFx0XHRpZiAodGhpcy5vcHRpb25zLmRlZmF1bHRWYWx1ZXMuaGFzT3duUHJvcGVydHkodG1wRGF0YVR5cGUpKVxuXHRcdFx0e1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5vcHRpb25zLmRlZmF1bHRWYWx1ZXNbdG1wRGF0YVR5cGVdO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBnaXZlIHVwIGFuZCByZXR1cm4gbnVsbFxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBFbnVtZXJhdGUgdGhyb3VnaCB0aGUgc2NoZW1hIGFuZCBwb3B1bGF0ZSBkZWZhdWx0IHZhbHVlcyBpZiB0aGV5IGRvbid0IGV4aXN0LlxuXHRwb3B1bGF0ZURlZmF1bHRzKHBPYmplY3QsIHBPdmVyd3JpdGVQcm9wZXJ0aWVzKVxuXHR7XG5cdFx0cmV0dXJuIHRoaXMucG9wdWxhdGVPYmplY3QocE9iamVjdCwgcE92ZXJ3cml0ZVByb3BlcnRpZXMsXG5cdFx0XHQvLyBUaGlzIGp1c3Qgc2V0cyB1cCBhIHNpbXBsZSBmaWx0ZXIgdG8gc2VlIGlmIHRoZXJlIGlzIGEgZGVmYXVsdCBzZXQuXG5cdFx0XHQocERlc2NyaXB0b3IpID0+XG5cdFx0XHR7XG5cdFx0XHRcdHJldHVybiBwRGVzY3JpcHRvci5oYXNPd25Qcm9wZXJ0eSgnRGVmYXVsdCcpO1xuXHRcdFx0fSk7XG5cdH1cblxuXHQvLyBGb3JjZWZ1bGx5IHBvcHVsYXRlIGFsbCB2YWx1ZXMgZXZlbiBpZiB0aGV5IGRvbid0IGhhdmUgZGVmYXVsdHMuXG5cdC8vIEJhc2VkIG9uIHR5cGUsIHRoaXMgY2FuIGRvIHVuZXhwZWN0ZWQgdGhpbmdzLlxuXHRwb3B1bGF0ZU9iamVjdChwT2JqZWN0LCBwT3ZlcndyaXRlUHJvcGVydGllcywgZkZpbHRlcilcblx0e1xuXHRcdC8vIEF1dG9tYXRpY2FsbHkgY3JlYXRlIGFuIG9iamVjdCBpZiBvbmUgaXNuJ3QgcGFzc2VkIGluLlxuXHRcdGxldCB0bXBPYmplY3QgPSAodHlwZW9mKHBPYmplY3QpID09PSAnb2JqZWN0JykgPyBwT2JqZWN0IDoge307XG5cdFx0Ly8gRGVmYXVsdCB0byAqTk9UIE9WRVJXUklUSU5HKiBwcm9wZXJ0aWVzXG5cdFx0bGV0IHRtcE92ZXJ3cml0ZVByb3BlcnRpZXMgPSAodHlwZW9mKHBPdmVyd3JpdGVQcm9wZXJ0aWVzKSA9PSAndW5kZWZpbmVkJykgPyBmYWxzZSA6IHBPdmVyd3JpdGVQcm9wZXJ0aWVzO1xuXHRcdC8vIFRoaXMgaXMgYSBmaWx0ZXIgZnVuY3Rpb24sIHdoaWNoIGlzIHBhc3NlZCB0aGUgc2NoZW1hIGFuZCBhbGxvd3MgY29tcGxleCBmaWx0ZXJpbmcgb2YgcG9wdWxhdGlvblxuXHRcdC8vIFRoZSBkZWZhdWx0IGZpbHRlciBmdW5jdGlvbiBqdXN0IHJldHVybnMgdHJ1ZSwgcG9wdWxhdGluZyBldmVyeXRoaW5nLlxuXHRcdGxldCB0bXBGaWx0ZXJGdW5jdGlvbiA9ICh0eXBlb2YoZkZpbHRlcikgPT0gJ2Z1bmN0aW9uJykgPyBmRmlsdGVyIDogKHBEZXNjcmlwdG9yKSA9PiB7IHJldHVybiB0cnVlOyB9O1xuXG5cdFx0dGhpcy5lbGVtZW50QWRkcmVzc2VzLmZvckVhY2goXG5cdFx0XHQocEFkZHJlc3MpID0+XG5cdFx0XHR7XG5cdFx0XHRcdGxldCB0bXBEZXNjcmlwdG9yID0gdGhpcy5nZXREZXNjcmlwdG9yKHBBZGRyZXNzKTtcblx0XHRcdFx0Ly8gQ2hlY2sgdGhlIGZpbHRlciBmdW5jdGlvbiB0byBzZWUgaWYgdGhpcyBpcyBhbiBhZGRyZXNzIHdlIHdhbnQgdG8gc2V0IHRoZSB2YWx1ZSBmb3IuXG5cdFx0XHRcdGlmICh0bXBGaWx0ZXJGdW5jdGlvbih0bXBEZXNjcmlwdG9yKSlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIElmIHdlIGFyZSBvdmVyd3JpdGluZyBwcm9wZXJ0aWVzIE9SIHRoZSBwcm9wZXJ0eSBkb2VzIG5vdCBleGlzdFxuXHRcdFx0XHRcdGlmICh0bXBPdmVyd3JpdGVQcm9wZXJ0aWVzIHx8ICF0aGlzLmNoZWNrQWRkcmVzc0V4aXN0cyh0bXBPYmplY3QsIHBBZGRyZXNzKSlcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHR0aGlzLnNldFZhbHVlQXRBZGRyZXNzKHRtcE9iamVjdCwgcEFkZHJlc3MsIHRoaXMuZ2V0RGVmYXVsdFZhbHVlKHRtcERlc2NyaXB0b3IpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0cmV0dXJuIHRtcE9iamVjdDtcblx0fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYW55ZmVzdDsiXX0=
