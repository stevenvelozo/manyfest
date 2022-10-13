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

suite
(
	'Manyfest Object Check Element Existence',
	function()
	{
		setup (()=> {} );

		suite
		(
			'Basic Check Existence',
			()=>
			{
				test
				(
					'It should be easy to check if an element exists by address.',
					(fTestComplete)=>
					{
						let _Manyfest = new libManyfest({ Scope:'Archive.org', Descriptors: {'metadata.creator': {Name:'Creator', Hash:'Creator'}}});
						// Property not in schema:
						let tmpTitleExists = _Manyfest.checkAddressExists(_SampleDataArchiveOrgFrankenberry, 'metadata.title');
						Expect(tmpTitleExists)
							.to.equal(true);
						fTestComplete();
					}
				);
				test
				(
					'If an element does not exist, checkAddressExists should return false.',
					(fTestComplete)=>
					{
						let _Manyfest = new libManyfest({ Scope:'Archive.org', Descriptors: {'metadata.creator': {Name:'Creator', Hash:'Creator'}}});
						// Property not in schema:
						let tmpTitleExists = _Manyfest.checkAddressExists(_SampleDataArchiveOrgFrankenberry, 'metadata.someStrangeProperty');
						Expect(tmpTitleExists)
							.to.equal(false);
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
						let tmpCreator = _Manyfest.checkAddressExistsByHash(_SampleDataArchiveOrgFrankenberry, 'Creator');
						Expect(tmpCreator)
							.to.equal(true);
						fTestComplete();
					}
				);
			}
		);
	}
);
