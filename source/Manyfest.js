/**
* @license MIT
* @author <steven@velozo.com>
*/
let libSimpleLog = require('./Manyfest-LogToConsole.js');

/**
* Manyfest object address-based descriptions and manipulations.
*
* @class Manyfest
*/
class Manyfest
{
	constructor(pManifest, pInfoLog, pErrorLog)
	{
		// Wire in logging
		this.logInfo = (typeof(pInfoLog) === 'function') ? pInfoLog : libSimpleLog;
		this.logError = (typeof(pErrorLog) === 'function') ? pErrorLog : libSimpleLog;

		this.options = (
			{
				strict: false
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
				this.logError(`(${this.scope}) Error loading scope from manifest; expecting a string but property was type ${typeof(pManifest.Scope)}.`);
			}
		}
		else
		{
			this.logError(`(${this.scope}) Error loading scope from manifest object.  Property "Scope" does not exist in the root of the object.`);
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
				this.logError(`(${this.scope}) Error loading description object from manifest object.  Expecting an object in 'Manifest.Descriptors' but the property was type ${typeof(pManifest.Description)}.`);
			}
		}
		else
		{
			this.logError(`(${this.scope}) Error loading object description from manifest object.  Property "Descriptors" does not exist in the root of the object.`);
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
			// TODO: Check if this is a good idea or not.
			//       Collisions are bound to happen with both representations of the address/hash in here.
			this.elementHashes[pAddress] = pAddress;

			if (pDescriptor.hasOwnProperty('Hash'))
			{
				this.elementHashes[pDescriptor.Hash] = pAddress;
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
		if (this.elementHashes.hasOwnProperty(pHash))
		{
			return this.getDescriptor(this.elementHashes[pHash]);
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
	// Get the value of an element by its hash
	getValueByHash (pObject, pHash)
	{
		if (this.elementHashes.hasOwnProperty(pHash))
		{
			return this.getValueAtAddress(pObject, this.elementHashes[pHash]);
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
		// Make sure pObject is an object
		if (!typeof(pObject) === 'object') return undefined;
		// Make sure pAddress is a string
		if (!typeof(pAddress) === 'string') return undefined;

		let tmpSeparatorIndex = pAddress.indexOf('.');

		if (tmpSeparatorIndex === -1)
		{
			// Now is the point in recursion to return the value in the address
			return pObject[pAddress];
		}
		else
		{
			let tmpSubObjectName = pAddress.substring(0, tmpSeparatorIndex);
			let tmpNewAddress = pAddress.substring(tmpSeparatorIndex+1);

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

	// Set the value of an element by its hash
	setValueByHash(pObject, pHash, pValue)
	{
		if (this.elementHashes.hasOwnProperty(pHash))
		{
			return this.setValueAtAddress(pObject, this.elementHashes[pHash], pValue);
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
		// Make sure pObject is an object
		if (!typeof(pObject) === 'object') return false;
		// Make sure pAddress is a string
		if (!typeof(pAddress) === 'string') return false;

		let tmpSeparatorIndex = pAddress.indexOf('.');

		if (tmpSeparatorIndex === -1)
		{
			// Now is the time to set the value in the object
			pObject[pAddress] = pValue;
			return true;
		}
		else
		{
			let tmpSubObjectName = pAddress.substring(0, tmpSeparatorIndex);
			let tmpNewAddress = pAddress.substring(tmpSeparatorIndex+1);

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

	setValueAtAddressInContainer(pRecordObject, pFormContainerAddress, pFormContainerIndex, pFormValueAddress, pFormValue)
	{
		// First see if there *is* a container object
		let tmpContainerObject = this.getValueAtAddress(pRecordObject, pFormContainerAddress);

		if (typeof(pFormContainerAddress) !== 'string') return false;

		let tmpFormContainerIndex = parseInt(pFormContainerIndex, 10);
		if (isNaN(tmpFormContainerIndex)) return false;

		if ((typeof(tmpContainerObject) !== 'object') || (!Array.isArray(tmpContainerObject)))
		{
			// Check if there is a value here and we want to store it in the "__OverwrittenData" thing
			tmpContainerObject = [];
			this.setValueAtAddress(pRecordObject, pFormContainerAddress, tmpContainerObject);
		}

		for (let i = 0; (tmpContainerObject.length + i) <= (tmpFormContainerIndex+1); i++)
		{
			// Add objects to this container until it has enough
			tmpContainerObject.push({});
		}

		// Now set the value *in* the container object
		return this.setValueAtAddress(tmpContainerObject[tmpFormContainerIndex], pFormValueAddress, pFormValue);
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

		// Now enumerate through the values and check for anomalies
		for (let i = 0; i < this.elementAddresses.length; i++)
		{
			let tmpDescriptor = this.getDescriptor(this.elementAddresses[i]);
			let tmpValue = this.getValueAtAddress(pObject, tmpDescriptor.Address);

			if (typeof(tmpValue) == 'undefined')
			{
				tmpValidationData.MissingElements.push(tmpDescriptor.Address);

				if (tmpDescriptor.Required || this.options.strict)
				{
					tmpValidationData.Error = true;
					tmpValidationData.Errors.push(`Element at address '${tmpDescriptor.Address}' is flagged Required but is not present.`);
				}
			}
		}

		return tmpValidationData;
	}
};

module.exports = Manyfest;