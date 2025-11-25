export = ManyfestObjectAddressResolverGetValue;
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
declare class ManyfestObjectAddressResolverGetValue {
    /**
     * @param {function} [pInfoLog] - (optional) A logging function for info messages
     * @param {function} [pErrorLog] - (optional) A logging function for error messages
     */
    constructor(pInfoLog?: Function, pErrorLog?: Function);
    logInfo: Function;
    logError: Function;
    cleanWrapCharacters: (pCharacter: string, pString: string) => string;
    /**
     * @param {string} pAddress - The address of the record to check
     * @param {object} pRecord - The record to check against the filters
     *
     * @return {boolean} - True if the record passes the filters, false otherwise
     */
    checkRecordFilters(pAddress: string, pRecord: object): boolean;
    /**
     * Get the value of an element at an address
     *
     * @param {object} pObject - The object to resolve the address against
     * @param {string} pAddress - The address to resolve
     * @param {string} [pParentAddress] - (optional) The parent address for back-navigation
     * @param {object} [pRootObject] - (optional) The root object for function argument resolution
     *
     * @return {any} The value at the address, or undefined if not found
     */
    getValueAtAddress(pObject: object, pAddress: string, pParentAddress?: string, pRootObject?: object): any;
}
//# sourceMappingURL=Manyfest-ObjectAddress-GetValue.d.ts.map