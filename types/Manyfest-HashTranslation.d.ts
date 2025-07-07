export = ManyfestHashTranslation;
/**
* Hash Translation
*
* This is a very simple translation table for hashes, which allows the same schema to resolve
* differently based on a loaded translation table.
*
* This is to prevent the requirement for mutating schemas over and over again when we want to
* reuse the structure but look up data elements by different addresses.
*
* One side-effect of this is that a translation table can "override" the built-in hashes, since
* this is always used to resolve hashes before any of the functionCallByHash(pHash, ...) perform
* their lookups by hash.
*
* @class ManyfestHashTranslation
*/
declare class ManyfestHashTranslation {
    constructor(pInfoLog: any, pErrorLog: any);
    logInfo: any;
    logError: any;
    translationTable: {};
    translationCount(): number;
    addTranslation(pTranslation: any): boolean;
    removeTranslationHash(pTranslationHash: any): void;
    removeTranslation(pTranslation: any): boolean;
    clearTranslations(): void;
    translate(pTranslation: any): any;
}
//# sourceMappingURL=Manyfest-HashTranslation.d.ts.map