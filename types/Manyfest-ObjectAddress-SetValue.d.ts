export = ManyfestObjectAddressSetValue;
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
declare class ManyfestObjectAddressSetValue {
    /**
     * @param {function} [pInfoLog] - (optional) A logging function for info messages
     * @param {function} [pErrorLog] - (optional) A logging function for error messages
     */
    constructor(pInfoLog?: Function, pErrorLog?: Function);
    logInfo: Function;
    logError: Function;
    cleanWrapCharacters: (pCharacter: string, pString: string) => string;
    /**
     * Set the value of an element at an address
     *
     * @param {object} pObject - The object to set the value in
     * @param {string} pAddress - The address to set the value at
     * @param {any} pValue - The value to set at the address
     *
     * @return {boolean} True if the value was set, false otherwise
     */
    setValueAtAddress(pObject: object, pAddress: string, pValue: any): boolean;
}
//# sourceMappingURL=Manyfest-ObjectAddress-SetValue.d.ts.map