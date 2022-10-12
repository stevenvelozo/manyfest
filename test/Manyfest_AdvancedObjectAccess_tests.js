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

let _SampleDataArchiveOrgFrankenberry = require('./Data-Archive-org-Frankenberry.json');
let _SampleDataWeather = require('./Data-Yahoo-Weather.json');

suite
(
	'Advanced Object Access',
	function()
	{
		setup (()=> {} );

		suite
		(
			'Advanced Object Reading (with Arrays and Boxed Property addresses)',
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
