/**
* Unit tests for Meadow
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/

var Chai = require("chai");
var Expect = Chai.expect;

let libManyfest = require('../source/Manyfest.js');

suite
(
	'Manyfest Basic',
	function()
	{
		setup
		(
			()=>
			{
				// No custom per-test spool-up required
			}
		);

		suite
		(
			'Object Sanity',
			()=>
			{
				test
				(
					'The class should initialize itself into a happy little object.',
					(fTestComplete)=>
					{
						let _Manyfest = new libManyfest({});
						Expect(_Manyfest)
							.to.be.an('object', 'Manyfest should initialize as an object with no parameters.');
						fTestComplete();
					}
				);
				test
				(
					'Default properties should be automatically set.',
					(fTestComplete)=>
					{
						let _Manyfest = new libManyfest({});
						Expect(_Manyfest.scope)
							.to.be.a('string', 'Manyfest should have a scope.');
						Expect(_Manyfest.scope)
							.to.equal('DEFAULT', 'Manyfest should default to the Scope DEFAULT.');
						fTestComplete();
					}
				);
			}
		);

		suite
		(
			'Object Access',
			()=>
			{
				test
				(
					'Properties should be gettable and settable without a schema.',
					(fTestComplete)=>
					{
						let _Manyfest = new libManyfest({});
						let _SimpleObject = {Name:'Bob',Age:31,Pets:{Fido:'Dog',Spot:'Cat'}};

						Expect(_Manyfest.getValueAtAddress(_SimpleObject,'Name'))
							.to.equal('Bob');

						_Manyfest.setValueAtAddress(_SimpleObject,'Name','Jim');

						Expect(_Manyfest.getValueAtAddress(_SimpleObject,'Name'))
							.to.equal('Jim');

						fTestComplete();
					}
				);
				test
				(
					'Properties should be accessible via Hash.',
					(fTestComplete)=>
					{
						let animalManyfest = new libManyfest(
							{
								"Scope": "Animal",
								"Descriptors":
									{
										"IDAnimal": { "Name":"Database ID", "Description":"The unique integer-based database identifier for an Animal record.", "DataType":"Integer" },
										"Name": { "Description":"The animal's colloquial species name (e.g. Rabbit, Dog, Bear, Mongoose)." },
										"Type": { "Description":"Whether or not the animal is wild, domesticated, agricultural, in a research lab or a part of a zoo.." },
										"MedicalStats": 
											{
												"Name":"Medical Statistics", "Description":"Basic medical statistics for this animal"
											},
										"MedicalStats.Temps.MinET": { "Name":"Minimum Environmental Temperature", "NameShort":"MinET", "Description":"Safest minimum temperature for this animal to survive in."},
										"MedicalStats.Temps.MaxET": { "Name":"Maximum Environmental Temperature", "NameShort":"MaxET", "Description":"Safest maximum temperature for this animal to survive in."},
										"MedicalStats.Temps.CET":
											{
												"Name":"Comfortable Environmental Temperature",
												"NameShort":"Comf Env Temp",
												"Hash":"ComfET",
												"Description":"The most comfortable temperature for this animal to survive in."
											}
									}
							});

						Expect(animalManyfest.getValueByHash({MedicalStats: { Temps: { CET:200 }},Name:'Froggy'}, 'ComfET'))
							.to.equal(200);

						fTestComplete();
					}
				);
				test
				(
					'Validate should check that required elements exist',
					(fTestComplete)=>
					{
						let animalManyfest = new libManyfest(
							{
								"Scope": "Animal",
								"Descriptors":
									{
										"IDAnimal": { "Name":"Database ID", "Description":"The unique integer-based database identifier for an Animal record.", "DataType":"Integer" },
										"Name": { "Required":true, "Description":"The animal's colloquial species name (e.g. Rabbit, Dog, Bear, Mongoose)." }
									}
							});

						let tmpValidationResults = animalManyfest.validate({MedicalStats: { Temps: { CET:200 }},Name:'Froggy'});

						Expect(tmpValidationResults.Error)
							.to.equal(null);

						fTestComplete();
					}
				);				
				test
				(
					'Validate should error when required elements do not exist',
					(fTestComplete)=>
					{
						let animalManyfest = new libManyfest(
							{
								"Scope": "Animal",
								"Descriptors":
									{
										"IDAnimal": { "Name":"Database ID", "Description":"The unique integer-based database identifier for an Animal record.", "DataType":"Integer" },
										"Name": { "Required":true, "Description":"The animal's colloquial species name (e.g. Rabbit, Dog, Bear, Mongoose)." }
									}
							});

						let tmpValidationResults = animalManyfest.validate({MedicalStats: { Temps: { CET:200 }}});

						Expect(tmpValidationResults.Error)
							.to.equal(true);

						fTestComplete();
					}
				);				
			}
		);
	}
);
