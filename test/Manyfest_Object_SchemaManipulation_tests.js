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
				test
				(
					'Cloning should work.',
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
						
						let _Manyfest = new libManyfest({ Scope:'Archive.org', Descriptors: {'metadata.creator': {Name:'Creator', Hash:'Creator'}}});
						// Property not schema, accessed by hash:
						let tmpCreator = _Manyfest.getValueByHash(_SampleDataArchiveOrgFrankenberry, 'Creator');
						Expect(tmpCreator).to.equal('General Mills');
						let _ClonedManyfest = _Manyfest.clone();
						Expect(_ClonedManyfest.getValueByHash(_SampleDataArchiveOrgFrankenberry, 'Creator')).to.equal('General Mills');
	
						fTestComplete();
					}
				);
				test
				(
					'Cloning should take into account translation.',
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
						
						let _Manyfest = new libManyfest({ Scope:'Archive.org', Descriptors: {'metadata.creator': {Name:'Creator', Hash:'Creator'}}});
						// Property not schema, accessed by hash:
						let tmpCreator = _Manyfest.getValueByHash(_SampleDataArchiveOrgFrankenberry, 'Creator');
						Expect(tmpCreator).to.equal('General Mills');
						// Create a translation between "Creator" and "Director" as well as "Author"
						_Manyfest.hashTranslations.addTranslation({"Director":"Creator", "Author":"Creator", "Songwriter":"Creator"});
						Expect(tmpCreator).to.equal('General Mills');
						// Director should also work
						Expect(_Manyfest.getValueByHash(_SampleDataArchiveOrgFrankenberry, 'Director')).to.equal('General Mills');
						// And Author!
						Expect(_Manyfest.getValueByHash(_SampleDataArchiveOrgFrankenberry, 'Author')).to.equal('General Mills');
						// Now remove Director
						_Manyfest.hashTranslations.clearTranslations();
						Expect(_Manyfest.getValueByHash(_SampleDataArchiveOrgFrankenberry, 'Author')).to.equal(undefined);
						Expect(_Manyfest.getValueByHash(_SampleDataArchiveOrgFrankenberry, 'Director')).to.equal(undefined);
						Expect(_Manyfest.getValueByHash(_SampleDataArchiveOrgFrankenberry, 'Songwriter')).to.equal(undefined);
						Expect(_Manyfest.getValueByHash(_SampleDataArchiveOrgFrankenberry, 'Creator')).to.equal('General Mills');

						let _ClonedManyfest = _Manyfest.clone();
						Expect(_ClonedManyfest.getValueByHash(_SampleDataArchiveOrgFrankenberry, 'Author')).to.equal(undefined);
						Expect(_ClonedManyfest.getValueByHash(_SampleDataArchiveOrgFrankenberry, 'Director')).to.equal(undefined);
						Expect(_ClonedManyfest.getValueByHash(_SampleDataArchiveOrgFrankenberry, 'Songwriter')).to.equal(undefined);
						Expect(_ClonedManyfest.getValueByHash(_SampleDataArchiveOrgFrankenberry, 'Creator')).to.equal('General Mills');

						// New translations should not affect the old manyfest
						_ClonedManyfest.hashTranslations.addTranslation({"Director":"Creator", "Author":"Creator", "Songwriter":"Creator"});
						Expect(_ClonedManyfest.getValueByHash(_SampleDataArchiveOrgFrankenberry, 'Director')).to.equal('General Mills');
						Expect(_Manyfest.getValueByHash(_SampleDataArchiveOrgFrankenberry, 'Director')).to.equal(undefined);
	
						fTestComplete();
					}
				);
			}
		);
	}
);
