export = ManyfestSchemaManipulation;
/**
* Schema Manipulation Functions
*
* @class ManyfestSchemaManipulation
*/
declare class ManyfestSchemaManipulation {
    /**
     * @param {function} [pInfoLog] - (optional) A logging function for info messages
     * @param {function} [pErrorLog] - (optional) A logging function for error messages
     */
    constructor(pInfoLog?: Function, pErrorLog?: Function);
    logInfo: Function;
    logError: Function;
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
    resolveAddressMappings(pManyfestSchemaDescriptors: object, pAddressMapping: object): boolean;
    /**
     * @param {object} pManyfestSchemaDescriptors - The manyfest schema descriptors to resolve address mappings for
     * @param {object} pAddressMapping - The address mapping object to use for remapping
     *
     * @return {object} A new object containing the remapped schema descriptors
     */
    safeResolveAddressMappings(pManyfestSchemaDescriptors: object, pAddressMapping: object): object;
    /**
     * @param {object} pManyfestSchemaDescriptorsDestination - The destination manyfest schema descriptors
     * @param {object} pManyfestSchemaDescriptorsSource - The source manyfest schema descriptors
     *
     * @return {object} A new object containing the merged schema descriptors
     */
    mergeAddressMappings(pManyfestSchemaDescriptorsDestination: object, pManyfestSchemaDescriptorsSource: object): object;
}
//# sourceMappingURL=Manyfest-SchemaManipulation.d.ts.map