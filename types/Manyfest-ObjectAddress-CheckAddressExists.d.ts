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
    constructor(pInfoLog: any, pErrorLog: any);
    logInfo: any;
    logError: any;
    getObjectValueClass: libGetObjectValue;
    checkAddressExists(pObject: any, pAddress: any, pRootObject: any): any;
}
import libGetObjectValue = require("./Manyfest-ObjectAddress-GetValue.js");
//# sourceMappingURL=Manyfest-ObjectAddress-CheckAddressExists.d.ts.map