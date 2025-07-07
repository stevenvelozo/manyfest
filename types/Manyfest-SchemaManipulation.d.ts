export = ManyfestSchemaManipulation;
/**
* Schema Manipulation Functions
*
* @class ManyfestSchemaManipulation
*/
declare class ManyfestSchemaManipulation {
    constructor(pInfoLog: any, pErrorLog: any);
    logInfo: any;
    logError: any;
    resolveAddressMappings(pManyfestSchemaDescriptors: any, pAddressMapping: any): boolean;
    safeResolveAddressMappings(pManyfestSchemaDescriptors: any, pAddressMapping: any): any;
    mergeAddressMappings(pManyfestSchemaDescriptorsDestination: any, pManyfestSchemaDescriptorsSource: any): any;
}
//# sourceMappingURL=Manyfest-SchemaManipulation.d.ts.map