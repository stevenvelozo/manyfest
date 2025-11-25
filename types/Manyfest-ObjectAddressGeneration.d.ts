export = ManyfestObjectAddressGeneration;
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
declare class ManyfestObjectAddressGeneration {
    /**
     * @param {function} [pInfoLog] - (optional) A logging function for info messages
     * @param {function} [pErrorLog] - (optional) A logging function for error messages
     */
    constructor(pInfoLog?: Function, pErrorLog?: Function);
    logInfo: Function;
    logError: Function;
    /**
     * generateAddressses
     *
     * This flattens an object into a set of key:value pairs for *EVERY SINGLE
     * POSSIBLE ADDRESS* in the object.  It can get ... really insane really
     * quickly.  This is not meant to be used directly to generate schemas, but
     * instead as a starting point for scripts or UIs.
     *
     * This will return a mega set of key:value pairs with all possible schema
     * permutations and default values (when not an object) and everything else.
     *
     * @param {any} pObject - The object to generate addresses for
     * @param {string} [pBaseAddress] - (optional) The base address to start from
     * @param {object} [pSchema] - (optional) The schema object to append to
     *
     * @return {object} The generated schema object
     */
    generateAddressses(pObject: any, pBaseAddress?: string, pSchema?: object): object;
}
//# sourceMappingURL=Manyfest-ObjectAddressGeneration.d.ts.map