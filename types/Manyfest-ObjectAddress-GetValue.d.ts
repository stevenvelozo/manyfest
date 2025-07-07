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
    constructor(pInfoLog: any, pErrorLog: any);
    logInfo: any;
    logError: any;
    cleanWrapCharacters: (pCharacter: any, pString: any) => any;
    checkRecordFilters(pAddress: any, pRecord: any): boolean;
    getValueAtAddress(pObject: any, pAddress: any, pParentAddress: any, pRootObject: any): any;
}
//# sourceMappingURL=Manyfest-ObjectAddress-GetValue.d.ts.map