/**
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
	/**
	 * @param {function} [pInfoLog] - (optional) A logging function for info messages
	 * @param {function} [pErrorLog] - (optional) A logging function for error messages
	 */
	constructor(pInfoLog, pErrorLog)
	{
		// Wire in logging
		this.logInfo = (typeof(pInfoLog) === 'function') ? pInfoLog : libSimpleLog;
		this.logError = (typeof(pErrorLog) === 'function') ? pErrorLog : libSimpleLog;
	}

	/**
     * This translates the default address mappings to something different.
     *
     * For instance you can pass in manyfest schema descriptor object:
     * 	{
	 *	  "Address.Of.a": { "Hash": "a", "Type": "Number" },
	 *	  "Address.Of.b": { "Hash": "b", "Type": "Number" }
	 *  }
     *
     *
     * And then an address mapping (basically a Hash->Address map)
     *  {
     *    "a": "New.Address.Of.a",
     *    "b": "New.Address.Of.b"
     *  }
     *
     * NOTE: This mutates the schema object permanently, altering the base hash.
     *       If there is a collision with an existing address, it can lead to overwrites.
     * TODO: Discuss what should happen on collisions.
	 *
	 * @param {object} pManyfestSchemaDescriptors - The manyfest schema descriptors to resolve address mappings for
	 * @param {object} pAddressMapping - The address mapping object to use for remapping
	 *
	 * @return {boolean} True if successful, false if there was an error
	 */
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
				if ('Hash' in pManyfestSchemaDescriptors[pAddress])
				{
					tmpHashMapping[pManyfestSchemaDescriptors[pAddress].Hash] = pAddress;
				}
			});

		let tmpAddressMappingSet = Object.keys(pAddressMapping);

		tmpAddressMappingSet.forEach(
			(pInputAddress) =>
			{
				let tmpNewDescriptorAddress = pAddressMapping[pInputAddress];
				let tmpOldDescriptorAddress = null;
				let tmpDescriptor;

				// See if there is a matching descriptor either by Address directly or Hash
				if (pInputAddress in pManyfestSchemaDescriptors)
				{
					tmpOldDescriptorAddress = pInputAddress;
				}
				else if (pInputAddress in tmpHashMapping)
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

	/**
	 * @param {object} pManyfestSchemaDescriptors - The manyfest schema descriptors to resolve address mappings for
	 * @param {object} pAddressMapping - The address mapping object to use for remapping
	 *
	 * @return {object} A new object containing the remapped schema descriptors
	 */
	safeResolveAddressMappings(pManyfestSchemaDescriptors, pAddressMapping)
	{
		// This returns the descriptors as a new object, safely remapping without mutating the original schema Descriptors
		let tmpManyfestSchemaDescriptors = JSON.parse(JSON.stringify(pManyfestSchemaDescriptors));
		this.resolveAddressMappings(tmpManyfestSchemaDescriptors, pAddressMapping);
		return tmpManyfestSchemaDescriptors;
	}

	/**
	 * @param {object} pManyfestSchemaDescriptorsDestination - The destination manyfest schema descriptors
	 * @param {object} pManyfestSchemaDescriptorsSource - The source manyfest schema descriptors
	 *
	 * @return {object} A new object containing the merged schema descriptors
	 */
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
				if (!(pDescriptorAddress in tmpNewManyfestSchemaDescriptors))
				{
					tmpNewManyfestSchemaDescriptors[pDescriptorAddress] = tmpSource[pDescriptorAddress];
				}
			});

		return tmpNewManyfestSchemaDescriptors;
	}
}

module.exports = ManyfestSchemaManipulation;
