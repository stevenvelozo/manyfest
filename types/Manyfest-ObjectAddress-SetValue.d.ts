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
    constructor(pInfoLog: any, pErrorLog: any);
    logInfo: any;
    logError: any;
    cleanWrapCharacters: (pCharacter: any, pString: any) => any;
    setValueAtAddress(pObject: any, pAddress: any, pValue: any): any;
}
//# sourceMappingURL=Manyfest-ObjectAddress-SetValue.d.ts.map