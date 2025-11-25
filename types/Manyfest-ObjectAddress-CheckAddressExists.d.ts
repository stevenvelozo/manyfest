export = ManyfestObjectAddressResolverCheckAddressExists;
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
* @class ManyfestObjectAddressResolverCheckAddressExists
*/
declare class ManyfestObjectAddressResolverCheckAddressExists {
    /**
     * @param {function} [pInfoLog] - (optional) Function to use for info logging
     * @param {function} [pErrorLog] - (optional) Function to use for error logging
     */
    constructor(pInfoLog?: Function, pErrorLog?: Function);
    logInfo: Function;
    logError: Function;
    getObjectValueClass: libGetObjectValue;
    cleanWrapCharacters: (pCharacter: string, pString: string) => string;
    /**
     * Check if an address exists.
     *
     * This is necessary because the getValueAtAddress function is ambiguous on
     * whether the element/property is actually there or not (it returns
     * undefined whether the property exists or not).  This function checks for
     * existance and returns true or false dependent.
     *
     * @param {object} pObject - The object to check within
     * @param {string} pAddress - The address to check for
     * @param {object} [pRootObject] - (optional) The root object for function resolution context
     *
     * @return {boolean} - True if the address exists, false if it does not
     */
    checkAddressExists(pObject: object, pAddress: string, pRootObject?: object): boolean;
}
import libGetObjectValue = require("./Manyfest-ObjectAddress-GetValue.js");
//# sourceMappingURL=Manyfest-ObjectAddress-CheckAddressExists.d.ts.map