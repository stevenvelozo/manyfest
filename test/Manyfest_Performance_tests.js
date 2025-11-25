/**
* Unit tests for Manyfest
*
* @license     MIT
*
* @author      Steven Velozo <steven@velozo.com>
*/

var Chai = require('chai');
var Expect = Chai.expect;

let libManyfest = require('../source/Manyfest.js');

suite
(
	'Manyfest Performance',
	function()
	{
		suite
		(
			'Brute Force Performance Tests',
			()=>
			{
				test
				(
					'Deep Address Performance Test',
					()=>
					{
						let _Manyfest = new libManyfest();
						const tmpData = {};
						const tmpValueAddress = 'level1.level2.level3.level4.level5';
						const tmpNumIterations = 200000;
						// start timing
						console.time('Brute Force Initial Load Performance Test');
						for (let i = 0; i < tmpNumIterations; i++)
						{
							const tmpUpdatedValue = (_Manyfest.getValueAtAddress(tmpData, tmpValueAddress) || 0) + 1;
							_Manyfest.setValueAtAddress(tmpData, tmpValueAddress, tmpUpdatedValue);
						}
						// stop timing
						console.timeEnd('Brute Force Initial Load Performance Test', { tmpData });
						Expect(_Manyfest.getValueAtAddress(tmpData, tmpValueAddress)).to.equal(tmpNumIterations);
					}
				);
			}
		);
	}
);
