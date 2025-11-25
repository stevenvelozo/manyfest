export = ManyfestObjectAddressResolverDeleteValue;
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
declare class ManyfestObjectAddressResolverDeleteValue {
    /**
     * @param {function} [pInfoLog] - (optional) A logging function for info messages
     * @param {function} [pErrorLog] - (optional) A logging function for error messages
     */
    constructor(pInfoLog?: Function, pErrorLog?: Function);
    logInfo: Function;
    logError: Function;
    cleanWrapCharacters: (pCharacter: string, pString: string) => string;
    /**
     * @param {string} pAddress - The address being evaluated
     * @param {object} pRecord - The record being evaluated
     *
     * @return {boolean} True if the record passes the filters, false if it does not
     */
    checkRecordFilters(pAddress: string, pRecord: object): boolean;
    /**
     * Delete the value of an element at an address
     *
     * @param {object} pObject - The object to delete the value from
     * @param {string} pAddress - The address to delete the value at
     * @param {string} [pParentAddress] - (optional) The parent address for recursion
     *
     * @return {boolean|object|undefined} - True if the value was deleted, false if it could not be deleted, undefined on error
     */
    deleteValueAtAddress(pObject: object, pAddress: string, pParentAddress?: string): boolean | object | undefined;
}
//# sourceMappingURL=Manyfest-ObjectAddress-DeleteValue.d.ts.map