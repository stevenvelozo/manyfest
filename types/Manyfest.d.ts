export = Manyfest;
/**
 * @typedef {{
 *   Hash?: string,
 *   Name?: string,
 *   DataType?: string,
 *   Required?: boolean,
 *   Address?: string,
 *   Description?: string,
 *   [key: string]: any,
 * }} ManifestDescriptor
 */
/**
* Manyfest object address-based descriptions and manipulations.
*
* @class Manyfest
*/
declare class Manyfest {
    constructor(pFable: any, pManifest: any, pServiceHash: any);
    /** @type {Record<string, any>} */
    options: Record<string, any>;
    serviceType: string;
    logInfo: (pLogLine: any, pLogObject: any) => void;
    logError: (pLogLine: any, pLogObject: any) => void;
    objectAddressCheckAddressExists: libObjectAddressCheckAddressExists;
    objectAddressGetValue: libObjectAddressGetValue;
    objectAddressSetValue: libObjectAddressSetValue;
    objectAddressDeleteValue: libObjectAddressDeleteValue;
    scope: any;
    elementAddresses: any[];
    elementHashes: {};
    elementDescriptors: {};
    schemaManipulations: libSchemaManipulation;
    objectAddressGeneration: libObjectAddressGeneration;
    hashTranslations: libHashTranslation;
    numberRegex: RegExp;
    /*************************************************************************
     * Schema Manifest Loading, Reading, Manipulation and Serialization Functions
     */
    reset(): void;
    clone(): import("./Manyfest.js");
    deserialize(pManifestString: any): void;
    loadManifest(pManifest: any): void;
    serialize(): string;
    getManifest(): {
        Scope: any;
        Descriptors: any;
        HashTranslations: any;
    };
    /**
     * Add a descriptor to the manifest
     *
     * @param {string} pAddress - The address of the element to add the descriptor for.
     * @param {ManifestDescriptor} pDescriptor - The descriptor object to add.
     */
    addDescriptor(pAddress: string, pDescriptor: ManifestDescriptor): boolean;
    /**
     * @param {string} pHash - The hash of the address to resolve.
     *
     * @return {ManifestDescriptor} The descriptor for the address
     */
    getDescriptorByHash(pHash: string): ManifestDescriptor;
    /**
     * @param {string} pAddress - The address of the element to get the descriptor for.
     *
     * @return {ManifestDescriptor} The descriptor for the address
     */
    getDescriptor(pAddress: string): ManifestDescriptor;
    /**
     * execute an action function for each descriptor
     * @param {(d: ManifestDescriptor) => void} fAction - The action function to execute for each descriptor.
     */
    eachDescriptor(fAction: (d: ManifestDescriptor) => void): void;
    /*************************************************************************
     * Beginning of Object Manipulation (read & write) Functions
     */
    checkAddressExistsByHash(pObject: any, pHash: any): any;
    checkAddressExists(pObject: any, pAddress: any): any;
    resolveHashAddress(pHash: any): any;
    getValueByHash(pObject: any, pHash: any): any;
    getValueAtAddress(pObject: any, pAddress: any): any;
    setValueByHash(pObject: any, pHash: any, pValue: any): any;
    setValueAtAddress(pObject: any, pAddress: any, pValue: any): any;
    deleteValueByHash(pObject: any, pHash: any, pValue: any): any;
    deleteValueAtAddress(pObject: any, pAddress: any, pValue: any): any;
    validate(pObject: any): {
        Error: any;
        Errors: any[];
        MissingElements: any[];
    };
    /**
     * Returns a default value, or, the default value for the data type (which is overridable with configuration)
     *
     * @param {ManifestDescriptor} pDescriptor - The descriptor definition.
     */
    getDefaultValue(pDescriptor: ManifestDescriptor): any;
    populateDefaults(pObject: any, pOverwriteProperties: any): any;
    populateObject(pObject: any, pOverwriteProperties: any, fFilter: any): any;
}
declare namespace Manyfest {
    export { ManifestDescriptor };
}
import libObjectAddressCheckAddressExists = require("./Manyfest-ObjectAddress-CheckAddressExists.js");
import libObjectAddressGetValue = require("./Manyfest-ObjectAddress-GetValue.js");
import libObjectAddressSetValue = require("./Manyfest-ObjectAddress-SetValue.js");
import libObjectAddressDeleteValue = require("./Manyfest-ObjectAddress-DeleteValue.js");
import libSchemaManipulation = require("./Manyfest-SchemaManipulation.js");
import libObjectAddressGeneration = require("./Manyfest-ObjectAddressGeneration.js");
import libHashTranslation = require("./Manyfest-HashTranslation.js");
type ManifestDescriptor = {
    Hash?: string;
    Name?: string;
    DataType?: string;
    Required?: boolean;
    Address?: string;
    Description?: string;
    [key: string]: any;
};
//# sourceMappingURL=Manyfest.d.ts.map