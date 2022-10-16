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

let _AnimalManyfestSchema = (
	{
		"Scope": "Animal",
		"Descriptors":
			{
				"IDAnimal": { "Name":"Database ID", "Description":"The unique integer-based database identifier for an Animal record.", "DataType":"Integer" },
				"Name": { "Required":true, "Description":"The animal's colloquial species name (e.g. Rabbit, Dog, Bear, Mongoose)." }
			}
	});

suite
(
	'Manyfest Object Validation',
	function()
	{
		setup (()=> {} );

		suite
		(
			'Basic Validation',
			()=>
			{
				test
				(
					'Validate should not error when all required elements exist.',
					(fTestComplete)=>
					{
						let animalManyfest = new libManyfest(_AnimalManyfestSchema);
						let tmpValidationResults = animalManyfest.validate({IDAnimal: 100, MedicalStats: { Temps: { CET:200 }},Name:'Froggy'});

						Expect(tmpValidationResults.Error)
							.to.equal(null);

						fTestComplete();
					}
				);
				test
				(
					'Validate should error when required elements do not exist.',
					(fTestComplete)=>
					{
						let animalManyfest = new libManyfest(_AnimalManyfestSchema);
						let tmpValidationResults = animalManyfest.validate({MedicalStats: { Temps: { CET:200 }}});

						Expect(tmpValidationResults.Error)
							.to.equal(true);

						fTestComplete();
					}
				);				
				test
				(
					'Validate should be able to test for dates.',
					(fTestComplete)=>
					{
						let animalManyfest = new libManyfest(_AnimalManyfestSchema);
						let tmpValidationResults = animalManyfest.validate({IDAnimal: 100, MedicalStats: { Temps: { CET:200 }}});

						Expect(tmpValidationResults.Error)
							.to.equal(true);

						fTestComplete();
					}
				);

			}
		);
	}
);
