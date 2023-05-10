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
	'Embedded Solvers',
	function()
	{
		setup (()=> {} );

		suite
		(
			'Set Filtration',
			()=>
			{
				test
				(
					'Magic filters should be magic.',
					(fTestComplete)=>
					{
						let _Manyfest = new libManyfest(
							{
								Scope:'Archive.org',
								Descriptors:
									{
										'files[]': {Name:'Files', Hash:'FileSet'},
                                        'files[]<<~?format,==,Thumbnail?~>>': {Name:'Thumbnail Files', Hash:'ThumbnailFiles'},
                                        'files[]<<~?format,==,Metadata?~>>': {Name:'Metadata Files', Hash:'MetadataFiles'},
										'metadata.creator': {Name:'Creator', Hash:'Creator'}
									}
							});

						// Grab magic filtered thumbnails
						let tmpThumbnailFiles = _Manyfest.getValueByHash(_SampleDataArchiveOrgFrankenberry, 'ThumbnailFiles');
						Expect(tmpThumbnailFiles).to.be.an('array');
						// There are 7 thumbnail files in the set.
						Expect(tmpThumbnailFiles.length).to.equal(7);

						// Grab magic filtered etadataFiles
						let tmpMetadataFiles = _Manyfest.getValueByHash(_SampleDataArchiveOrgFrankenberry, 'MetadataFiles');
						Expect(tmpMetadataFiles).to.be.an('array');
						// There are 3 metadata files in the set.
						Expect(tmpMetadataFiles.length).to.equal(3);

						let tmpFiles = _Manyfest.getValueByHash(_SampleDataArchiveOrgFrankenberry, 'FileSet');
						Expect(tmpFiles).to.be.an('array');
						// There are 17 total files in the set.
						Expect(tmpFiles.length).to.equal(17);

						fTestComplete();
					}
				);
			}
		);
	}
);
