/**
* @author <steven@velozo.com>
*/
let libSimpleLog = require('./Manyfest-LogToConsole.js');
let fCleanWrapCharacters = require('./Manyfest-CleanWrapCharacters.js');

let _MockFable = { DataFormat: require('./Manyfest-ObjectAddress-Parser.js') };

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
class ManyfestObjectAddressSetValue
{
	/**
	 * @param {function} [pInfoLog] - (optional) A logging function for info messages
	 * @param {function} [pErrorLog] - (optional) A logging function for error messages
	 */
	constructor(pInfoLog, pErrorLog)
	{
		// Wire in logging
		this.logInfo = (typeof(pInfoLog) == 'function') ? pInfoLog : libSimpleLog;
		this.logError = (typeof(pErrorLog) == 'function') ? pErrorLog : libSimpleLog;

		this.cleanWrapCharacters = fCleanWrapCharacters;
	}

	/**
	 * Set the value of an element at an address
	 *
	 * @param {object} pObject - The object to set the value in
	 * @param {string} pAddress - The address to set the value at
	 * @param {any} pValue - The value to set at the address
	 *
	 * @return {boolean} True if the value was set, false otherwise
	 */
	setValueAtAddress (pObject, pAddress, pValue)
	{
		// Make sure pObject is an object
		if (typeof(pObject) != 'object') return false;
		// Make sure pAddress is a string
		if (typeof(pAddress) != 'string') return false;

		// Use enclosure-aware parser to find the first segment separator
		let tmpAddressPartBeginning = _MockFable.DataFormat.stringGetFirstSegment(pAddress);

		if (tmpAddressPartBeginning.length == pAddress.length)
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
			//
			// Chained bracket elements look like this:
			// 		MyValues[SubObject]['Property']
			// 		MyValues[0]['Name']
			//
			// When we encounter chained brackets, resolve the first bracket pair and recurse with the remainder.
			//
			// Bracket-at-zero elements look like this (from chained bracket recursion):
			// 		['Property']
			// 		[0]
			//
			// The requirements to detect a boxed element are:
			//    1) The start bracket exists
			if ((tmpBracketStartIndex >= 0)
			//    2) The end bracket has something between them
				&& (tmpBracketStopIndex > tmpBracketStartIndex)
			//    3) There is data
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 1))
			{
				// Check for any remaining address after the closing bracket (chained brackets or dot paths)
				let tmpRemainingAddress = pAddress.substring(tmpBracketStopIndex + 1);
				if (tmpRemainingAddress.length > 0 && tmpRemainingAddress.charAt(0) === '.')
				{
					// Strip leading dot separator (e.g. [SubObject].Property --> Property)
					tmpRemainingAddress = tmpRemainingAddress.substring(1);
				}

				// The "Reference" to the property within it, either an array element or object property
				let tmpBoxedPropertyReference = pAddress.substring(tmpBracketStartIndex+1, tmpBracketStopIndex).trim();
				// Attempt to parse the reference as a number, which will be used as an array element
				let tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);
				let tmpIndexIsNumeric = !isNaN(tmpBoxedPropertyNumber);

				// When the bracket is at position 0, there is no property name prefix -- we are
				// accessing a property or index directly on the current object.  This happens when
				// chained bracket resolution recurses with a remainder like ['Property'].
				if (tmpBracketStartIndex === 0)
				{
					if (tmpIndexIsNumeric)
					{
						// Array access at position 0: [0], [1], etc.
						if (!Array.isArray(pObject))
						{
							return false;
						}
						while (pObject.length < (tmpBoxedPropertyNumber + 1))
						{
							pObject.push({});
						}
						if (tmpRemainingAddress.length > 0)
						{
							return this.setValueAtAddress(pObject[tmpBoxedPropertyNumber], tmpRemainingAddress, pValue);
						}
						pObject[tmpBoxedPropertyNumber] = pValue;
						return true;
					}
					else
					{
						// Named property access at position 0: ['Property'], ["Name"], etc.
						tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
						tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
						tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

						if (tmpRemainingAddress.length > 0)
						{
							if (!(tmpBoxedPropertyReference in pObject) || typeof(pObject[tmpBoxedPropertyReference]) !== 'object')
							{
								pObject[tmpBoxedPropertyReference] = {};
							}
							return this.setValueAtAddress(pObject[tmpBoxedPropertyReference], tmpRemainingAddress, pValue);
						}
						pObject[tmpBoxedPropertyReference] = pValue;
						return true;
					}
				}

				// The "Name" of the Object contained to the left of the bracket
				let tmpBoxedPropertyName = pAddress.substring(0, tmpBracketStartIndex).trim();

				if (pObject[tmpBoxedPropertyName] == null)
				{
					if (tmpIndexIsNumeric)
					{
						pObject[tmpBoxedPropertyName] = [];
					}
					else
					{
						pObject[tmpBoxedPropertyName] = {};
					}
				}

				// If the subproperty doesn't test as a proper Object, none of the rest of this is possible.
				// This is a rare case where Arrays testing as Objects is useful
				if (typeof(pObject[tmpBoxedPropertyName]) !== 'object')
				{
					return false;
				}

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

					if (!(tmpBoxedPropertyReference in pObject[tmpBoxedPropertyName]))
					{
						// If the subobject doesn't exist, create it
						pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference] = {};
					}

					// If there is remaining address after this bracket pair, recurse into the resolved subobject
					if (tmpRemainingAddress.length > 0)
					{
						return this.setValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference], tmpRemainingAddress, pValue);
					}

					// No remaining address -- set the value directly
					pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference] = pValue;
					return true;
				}
				else
				{
					while(pObject[tmpBoxedPropertyName].length < (tmpBoxedPropertyNumber + 1))
					{
						// If the subobject doesn't exist, create it
						pObject[tmpBoxedPropertyName].push({});
					}

					// If there is remaining address after this bracket pair, recurse into the resolved element
					if (tmpRemainingAddress.length > 0)
					{
						return this.setValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber], tmpRemainingAddress, pValue);
					}

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
			let tmpSubObjectName = tmpAddressPartBeginning;
			let tmpNewAddress = pAddress.substring(tmpAddressPartBeginning.length+1);

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
			//    1) The start bracket exists
			if ((tmpBracketStartIndex >= 0)
			//    2) The end bracket has something between them
				&& (tmpBracketStopIndex > tmpBracketStartIndex)
			//    3) There is data
				&& (tmpBracketStopIndex - tmpBracketStartIndex > 1))
			{
				// When the bracket is at position 0, there is no property name prefix -- we are
				// accessing a property or index directly on the current object.  This happens when
				// chained bracket resolution recurses with a segment like ['Nested'].
				if (tmpBracketStartIndex === 0)
				{
					let tmpBoxedPropertyReference = tmpSubObjectName.substring(1, tmpBracketStopIndex).trim();
					let tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);

					if (!isNaN(tmpBoxedPropertyNumber))
					{
						// Array access: [0], [1], etc.
						if (!Array.isArray(pObject))
						{
							return false;
						}
						while (pObject.length < (tmpBoxedPropertyNumber + 1))
						{
							pObject.push({});
						}
						return this.setValueAtAddress(pObject[tmpBoxedPropertyNumber], tmpNewAddress, pValue);
					}
					else
					{
						// Named property access: ['Nested'], ["Name"], etc.
						tmpBoxedPropertyReference = this.cleanWrapCharacters('"', tmpBoxedPropertyReference);
						tmpBoxedPropertyReference = this.cleanWrapCharacters('`', tmpBoxedPropertyReference);
						tmpBoxedPropertyReference = this.cleanWrapCharacters("'", tmpBoxedPropertyReference);

						if (!(tmpBoxedPropertyReference in pObject) || typeof(pObject[tmpBoxedPropertyReference]) !== 'object')
						{
							pObject[tmpBoxedPropertyReference] = {};
						}
						return this.setValueAtAddress(pObject[tmpBoxedPropertyReference], tmpNewAddress, pValue);
					}
				}

				let tmpBoxedPropertyName = tmpSubObjectName.substring(0, tmpBracketStartIndex).trim();

				let tmpBoxedPropertyReference = tmpSubObjectName.substring(tmpBracketStartIndex+1, tmpBracketStopIndex).trim();

				let tmpBoxedPropertyNumber = parseInt(tmpBoxedPropertyReference, 10);
				let tmpIndexIsNumeric = !isNaN(tmpBoxedPropertyNumber);

				// Check for chained brackets within this segment (e.g. _Object[SubObject]['Nested'])
				// Any remaining address after the first ] within the segment name needs to be
				// prepended to tmpNewAddress so it is not lost during recursion.
				let tmpSegmentRemainder = tmpSubObjectName.substring(tmpBracketStopIndex + 1);
				if (tmpSegmentRemainder.length > 0)
				{
					// Prepend the remainder to the new address
					// e.g. if segment was _Object[SubObject]['Nested'] and newAddress was Deep,
					//      then combined address becomes ['Nested'].Deep
					if (tmpNewAddress.length > 0)
					{
						tmpNewAddress = tmpSegmentRemainder + '.' + tmpNewAddress;
					}
					else
					{
						tmpNewAddress = tmpSegmentRemainder;
					}
					// Strip leading dot if present
					if (tmpNewAddress.charAt(0) === '.')
					{
						tmpNewAddress = tmpNewAddress.substring(1);
					}
				}

				//if (typeof(pObject[tmpBoxedPropertyName]) !== 'object')
				if (pObject[tmpBoxedPropertyName] == null)
				{
					if (tmpIndexIsNumeric)
					{
						pObject[tmpBoxedPropertyName] = [];
					}
					else
					{
						pObject[tmpBoxedPropertyName] = {};
					}
				}

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
				if (Array.isArray(pObject[tmpBoxedPropertyName]) != tmpIndexIsNumeric)
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

					if (!(tmpBoxedPropertyReference in pObject[tmpBoxedPropertyName]))
					{
						// If the subobject doesn't exist, create it
						pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference] = {};
					}

					// Recurse directly into the subobject
					return this.setValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyReference], tmpNewAddress, pValue);
				}
				else
				{
					while(pObject[tmpBoxedPropertyName].length < (tmpBoxedPropertyNumber + 1))
					{
						// If the subobject doesn't exist, create it
						pObject[tmpBoxedPropertyName].push({});
					}

					// We parsed a valid number out of the boxed property name, so recurse into the array
					return this.setValueAtAddress(pObject[tmpBoxedPropertyName][tmpBoxedPropertyNumber], tmpNewAddress, pValue);
				}
			}

			// If there is an object property already named for the sub object, but it isn't an object
			// then the system can't set the value in there.  Error and abort!
			if ((tmpSubObjectName in pObject) && typeof(pObject[tmpSubObjectName]) !== 'object')
			{
				if (!('__ERROR' in pObject))
					pObject['__ERROR'] = {};
				// Put it in an error object so data isn't lost
				pObject['__ERROR'][pAddress] = pValue;
				return false;
			}
			else if (tmpSubObjectName in pObject)
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

module.exports = ManyfestObjectAddressSetValue;
