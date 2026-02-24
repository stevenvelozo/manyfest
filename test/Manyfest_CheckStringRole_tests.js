/**
* Unit tests for Manyfest checkStringRole
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
	'Manyfest checkStringRole',
	function()
	{
		setup (() => {} );

		suite
		(
			'checkStringRole',
			() =>
			{
				test
				(
					'Should return IsHash:false, IsAddress:false for an empty string.',
					(fTestComplete) =>
					{
						let _Manyfest = new libManyfest(
							{
								Scope: 'Test',
								Descriptors:
								{
									'Name': { Hash: 'PersonName', DataType: 'String' }
								}
							});
						let tmpResult = _Manyfest.checkStringRole('');
						Expect(tmpResult.IsHash).to.equal(false);
						Expect(tmpResult.IsAddress).to.equal(false);
						Expect(tmpResult.ResolvedAddress).to.equal(undefined);
						fTestComplete();
					}
				);
				test
				(
					'Should return IsHash:false, IsAddress:false for a non-string.',
					(fTestComplete) =>
					{
						let _Manyfest = new libManyfest(
							{
								Scope: 'Test',
								Descriptors:
								{
									'Name': { Hash: 'PersonName', DataType: 'String' }
								}
							});
						let tmpResult = _Manyfest.checkStringRole(42);
						Expect(tmpResult.IsHash).to.equal(false);
						Expect(tmpResult.IsAddress).to.equal(false);
						fTestComplete();
					}
				);
				test
				(
					'Should return IsHash:false, IsAddress:false for an unknown string.',
					(fTestComplete) =>
					{
						let _Manyfest = new libManyfest(
							{
								Scope: 'Test',
								Descriptors:
								{
									'Name': { Hash: 'PersonName', DataType: 'String' }
								}
							});
						let tmpResult = _Manyfest.checkStringRole('SomethingUnknown');
						Expect(tmpResult.IsHash).to.equal(false);
						Expect(tmpResult.IsAddress).to.equal(false);
						Expect(tmpResult.ResolvedAddress).to.equal(undefined);
						fTestComplete();
					}
				);
				test
				(
					'Should identify a string that is only a Hash (not an Address).',
					(fTestComplete) =>
					{
						let _Manyfest = new libManyfest(
							{
								Scope: 'Test',
								Descriptors:
								{
									'Full.Name.Path': { Hash: 'PersonName', DataType: 'String' }
								}
							});
						let tmpResult = _Manyfest.checkStringRole('PersonName');
						Expect(tmpResult.IsHash).to.equal(true);
						Expect(tmpResult.IsAddress).to.equal(false);
						Expect(tmpResult.ResolvedAddress).to.equal('Full.Name.Path');
						fTestComplete();
					}
				);
				test
				(
					'Should identify a string that is only an Address (not a custom Hash).',
					(fTestComplete) =>
					{
						let _Manyfest = new libManyfest(
							{
								Scope: 'Test',
								Descriptors:
								{
									'Full.Name.Path': { Hash: 'PersonName', DataType: 'String' }
								}
							});
						// The address is always added as a hash too (mapping to itself), so it's both
						let tmpResult = _Manyfest.checkStringRole('Full.Name.Path');
						Expect(tmpResult.IsHash).to.equal(true);
						Expect(tmpResult.IsAddress).to.equal(true);
						Expect(tmpResult.ResolvedAddress).to.equal('Full.Name.Path');
						fTestComplete();
					}
				);
				test
				(
					'Should identify a string that is both Hash and Address (same string).',
					(fTestComplete) =>
					{
						// When Hash is not specified, it defaults to the address
						let _Manyfest = new libManyfest(
							{
								Scope: 'Test',
								Descriptors:
								{
									'ValueArray': { DataType: 'Array' }
								}
							});
						let tmpResult = _Manyfest.checkStringRole('ValueArray');
						Expect(tmpResult.IsHash).to.equal(true);
						Expect(tmpResult.IsAddress).to.equal(true);
						Expect(tmpResult.ResolvedAddress).to.equal('ValueArray');
						fTestComplete();
					}
				);
				test
				(
					'Should handle multiple descriptors with distinct hashes and addresses.',
					(fTestComplete) =>
					{
						let _Manyfest = new libManyfest(
							{
								Scope: 'Test',
								Descriptors:
								{
									'DataTableAddress': { Hash: 'DataTable', DataType: 'Array' },
									'DataTableAddress[].ValueAddress': { Hash: 'ValueArray', DataType: 'Array' },
									'AggregateValueAddress': { Hash: 'AggregateValue', DataType: 'PreciseNumber' }
								}
							});
						// DataTable is a hash only
						let tmpDataTable = _Manyfest.checkStringRole('DataTable');
						Expect(tmpDataTable.IsHash).to.equal(true);
						Expect(tmpDataTable.IsAddress).to.equal(false);
						Expect(tmpDataTable.ResolvedAddress).to.equal('DataTableAddress');

						// DataTableAddress is both (always added as hash mapping to itself)
						let tmpAddr = _Manyfest.checkStringRole('DataTableAddress');
						Expect(tmpAddr.IsHash).to.equal(true);
						Expect(tmpAddr.IsAddress).to.equal(true);
						Expect(tmpAddr.ResolvedAddress).to.equal('DataTableAddress');

						// ValueArray is a hash only
						let tmpValueArray = _Manyfest.checkStringRole('ValueArray');
						Expect(tmpValueArray.IsHash).to.equal(true);
						Expect(tmpValueArray.IsAddress).to.equal(false);
						Expect(tmpValueArray.ResolvedAddress).to.equal('DataTableAddress[].ValueAddress');

						// Unknown string
						let tmpUnknown = _Manyfest.checkStringRole('NotInManifest');
						Expect(tmpUnknown.IsHash).to.equal(false);
						Expect(tmpUnknown.IsAddress).to.equal(false);

						fTestComplete();
					}
				);
			}
		);
	}
);
