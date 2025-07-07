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
    constructor(pInfoLog: any, pErrorLog: any);
    logInfo: any;
    logError: any;
    generateAddressses(pObject: any, pBaseAddress: any, pSchema: any): any;
}
//# sourceMappingURL=Manyfest-ObjectAddressGeneration.d.ts.map