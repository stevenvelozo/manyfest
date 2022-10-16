/**
* Unit tests for Manyfest
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/

var Chai = require("chai");
var Expect = Chai.expect;

let libManyfest = require('../source/Manyfest.js');

let _SampleDataArchiveOrgFrankenberry = require('./Data-Archive-org-Frankenberry.json');

suite
(
	'Manyfest Schema Manipulation',
	function()
	{
		setup (()=> {} );

		suite
		(
			'Address Mapping Resolution',
			()=>
			{
				test
				(
					'We should be able to remap properties in place.',
					(fTestComplete)=>
					{
						let tmpSchemaDescriptors = (
							{
								"a": { "Hash": "a", "Type": "Number" },
								"b": { "Hash": "b", "Type": "Number" }
							});

						let tmpTranslationTable = (
							{
								"a": "CarrotCost",
								"b": "AppleCost"
							});
						
						Expect(tmpSchemaDescriptors.a.Hash).to.equal('a');

						let _Manyfest = new libManyfest();
						// Now remap the schema (in-place)
						_Manyfest.schemaManipulations.resolveAddressMappings(tmpSchemaDescriptors, tmpTranslationTable);

						// The schema should be fundamentally altered to point these addresses to the old hashes
						Expect(tmpSchemaDescriptors.CarrotCost.Hash).to.equal('a');
						Expect(tmpSchemaDescriptors.AppleCost.Hash).to.equal('b');

						fTestComplete();
					}
				);
				test
				(
					'We should be able to remap properties safely.',
					(fTestComplete)=>
					{
						let tmpSchemaDescriptors = (
							{
								"a": { "Hash": "a", "Type": "Number" },
								"b": { "Hash": "b", "Type": "Number" }
							});

						let tmpTranslationTable = (
							{
								"a": "CarrotCost",
								"b": "AppleCost"
							});
						
						Expect(tmpSchemaDescriptors.a.Hash).to.equal('a');

						let _Manyfest = new libManyfest();
						// Now remap the schema (in-place)
						let tmpNewSchemaDescriptors = _Manyfest.schemaManipulations.safeResolveAddressMappings(tmpSchemaDescriptors, tmpTranslationTable);

						// The schema should be safe
						Expect(tmpSchemaDescriptors.a.Hash).to.equal('a');
						// And a new schema should have been created with the alterations
						Expect(tmpNewSchemaDescriptors.CarrotCost.Hash).to.equal('a');
						Expect(tmpNewSchemaDescriptors.AppleCost.Hash).to.equal('b');

						fTestComplete();
					}
				);
			}
		);
	}
);
