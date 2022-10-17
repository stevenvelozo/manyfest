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
	'Manyfest Object Read',
	function()
	{
		setup (()=> {} );

		suite
		(
			'Basic Read',
			()=>
			{
				test
				(
					'It should be trivial to access subproperties without a schema.',
					(fTestComplete)=>
					{
						let _Manyfest = new libManyfest({ Scope:'Archive.org', Descriptors: {'metadata.creator': {Name:'Creator', Hash:'Creator'}}});
						// Property not in schema:
						let tmpTitle = _Manyfest.getValueAtAddress(_SampleDataArchiveOrgFrankenberry, 'metadata.title');
						Expect(tmpTitle)
							.to.equal('Franken Berry / Count Chocula : Tevevision Commercial 1971');
						Expect(tmpTitle)
							.to.equal(_SampleDataArchiveOrgFrankenberry.metadata.title);
						fTestComplete();
					}
				);
				test
				(
					'It should be trivial to access subproperties with a schema by hash.',
					(fTestComplete)=>
					{
						let _Manyfest = new libManyfest({ Scope:'Archive.org', Descriptors: {'metadata.creator': {Name:'Creator', Hash:'Creator'}}});
						// Property not schema, accessed by hash:
						let tmpCreator = _Manyfest.getValueByHash(_SampleDataArchiveOrgFrankenberry, 'Creator');
						Expect(_SampleDataArchiveOrgFrankenberry.metadata.creator)
							.to.equal(tmpCreator);
						Expect(tmpCreator)
							.to.equal('General Mills');
						fTestComplete();
					}
				);
				test
				(
					'Return default values when none are supplied.',
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
												"Description":"The most comfortable temperature for this animal to survive in.",
												"Default": "96.8"
											}
									}
							});

							Expect(animalManyfest.getValueByHash({MedicalStats: { Temps: { CET:200 }},Name:'Froggy'}, 'ComfET')).to.equal(200);
							Expect(animalManyfest.getValueByHash({MedicalStats: { Temps: { MinET:200 }},Name:'Froggy'}, 'ComfET')).to.equal('96.8');
							Expect(animalManyfest.getValueByHash({MedicalStats: { Temps: { MinET:200 }},Name:'Froggy'}, 'CurrentTemperature')).to.equal(undefined);

							Expect(animalManyfest.getValueAtAddress({MedicalStats: { Temps: { CET:200 }},Name:'Froggy'}, 'MedicalStats.Temps.CET')).to.equal(200);
							Expect(animalManyfest.getValueAtAddress({MedicalStats: { Temps: { MinET:200 }},Name:'Froggy'}, 'MedicalStats.Temps.CET')).to.equal('96.8');
							Expect(animalManyfest.getValueAtAddress({MedicalStats: { Temps: { MinET:200 }},Name:'Froggy'}, 'MedicalStats.Temps.HighET')).to.equal(undefined);

						fTestComplete();
					}
				);			
			}
		);
		suite
		(
			'Advanced Read (with Arrays and Boxed Property addresses)',
			()=>
			{
				test
				(
					'Access specific array elements',
					(fTestComplete)=>
					{
						let _Manyfest = new libManyfest();
						let tmpDog = _Manyfest.getValueAtAddress({Dogs:['Fido','Spot','Trinity']}, 'Dogs[1]');
						Expect(tmpDog)
							.to.equal('Spot');
						fTestComplete();
					}
				);
				test
				(
					'Access specific boxed properties',
					(fTestComplete)=>
					{
						let _Manyfest = new libManyfest();
						let tmpDog = _Manyfest.getValueAtAddress({Dogs:{RunnerUp:'Fido',Loser:'Spot',Winner:'Trinity'}}, 'Dogs["Winner"]');
						Expect(tmpDog)
							.to.equal('Trinity');
						fTestComplete();
					}
				);
				test
				(
					'Attempt to access specific boxed properties that do not exist',
					(fTestComplete)=>
					{
						let _Manyfest = new libManyfest();
						let tmpDog = _Manyfest.getValueAtAddress({Dogs:{RunnerUp:'Fido',Loser:'Spot',Winner:'Trinity'}}, 'Dogs["Disqualified"]');
						Expect(tmpDog)
							.to.be.an('undefined');
						let tmpWinner = _Manyfest.getValueAtAddress({Dogs:{RunnerUp:'Fido',Loser:'Spot',Winner:'Trinity'}}, 'Dogs["Winner"]');
						Expect(tmpWinner)
							.to.equal('Trinity');
						fTestComplete();
					}
				);
				test
				(
					'Access nested box properties',
					(fTestComplete)=>
					{
						let _Manyfest = new libManyfest();
						let tmpDog = _Manyfest.getValueAtAddress({Dogs:{RunnerUp:{Name:'Fido',Speed:100},Loser:{Name:'Spot'},Winner:{Name:'Trinity'}}}, 'Dogs["RunnerUp"].Name');
						Expect(tmpDog)
							.to.equal('Fido');
						fTestComplete();
					}
				);
				test
				(
					'Access nested array properties',
					(fTestComplete)=>
					{
						let _Manyfest = new libManyfest();
						let tmpDog = _Manyfest.getValueAtAddress({Kennel:[{Name:'Fido',Speed:100},{Name:'Spot'},{Name:'Trinity'}]}, 'Kennel[1].Name');
						Expect(tmpDog)
							.to.equal('Spot');
						fTestComplete();
					}
				);
			}
		);
	}
);
