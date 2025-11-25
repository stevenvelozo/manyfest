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
    /**
     * @param {function} [pInfoLog] - (optional) A logging function for info messages
     * @param {function} [pErrorLog] - (optional) A logging function for error messages
     */
    constructor(pInfoLog?: Function, pErrorLog?: Function);
    logInfo: Function;
    logError: Function;
    translationTable: {};
    /**
     * @return {number} The number of translations in the table
     */
    translationCount(): number;
    /**
     * @param {object} pTranslation - An object containing source:destination hash pairs to add to the translation table
     */
    addTranslation(pTranslation: object): boolean;
    /**
     * @param {string} pTranslationHash - The source hash to remove from the translation table
     */
    removeTranslationHash(pTranslationHash: string): void;
    /**
     * This removes translations.
     * If passed a string, just removes the single one.
     * If passed an object, it does all the source keys.
     *
     * @param {string|object} pTranslation - Either a source hash string to remove, or an object containing source:destination hash pairs to remove
     *
     * @return {boolean} True if the removal was successful, false otherwise
     */
    removeTranslation(pTranslation: string | object): boolean;
    clearTranslations(): void;
    /**
     * @param {string} pTranslation - The source hash to translate
     *
     * @return {string} The translated hash, or the original if no translation exists
     */
    translate(pTranslation: string): string;
}
//# sourceMappingURL=Manyfest-HashTranslation.d.ts.map