// Given a string, parse out any conditional expressions and set whether or not to keep the record.
//
// For instance:
// 		'files[]<<~?format,==,Thumbnail?~>>'
//      'files[]<<~?format,==,Metadata?~>>'
//      'files[]<<~?size,>,4000?~>>'
//
// The wrapping parts are the <<~? and ?~>> megabrackets.
//
// The function does not need to alter the string -- just check the conditionals within.

// Let's use indexOf since it is apparently the fastest.
const _ConditionalStanzaStart = '<<~?';
const _ConditionalStanzaStartLength = _ConditionalStanzaStart.length;
const _ConditionalStanzaEnd = '?~>>';
const _ConditionalStanzaEndLength = _ConditionalStanzaEnd.length;

// Test the condition of a value in a record
const testCondition = (pManyfest, pRecord, pSearchAddress, pSearchComparator, pValue) =>
{
	switch(pSearchComparator)
	{
		case '!=':
			return (pManyfest.getValueAtAddress(pRecord, pSearchAddress) != pValue);
			break;
		case '<':
			return (pManyfest.getValueAtAddress(pRecord, pSearchAddress) < pValue);
			break;
		case '>':
			return (pManyfest.getValueAtAddress(pRecord, pSearchAddress) > pValue);
			break;
		case '<=':
			return (pManyfest.getValueAtAddress(pRecord, pSearchAddress) <= pValue);
			break;
		case '>=':
			return (pManyfest.getValueAtAddress(pRecord, pSearchAddress) >= pValue);
			break;
		case '===':
			return (pManyfest.getValueAtAddress(pRecord, pSearchAddress) === pValue);
			break;
		case '==':
		default:
			return (pManyfest.getValueAtAddress(pRecord, pSearchAddress) == pValue);
			break;
	}
};

const parseConditionals = (pManyfest, pAddress, pRecord) =>
{
	let tmpKeepRecord = true;

	/*
		Algorithm is simple:

		1.  Enuerate start points

		2.  Find stop points within each start point
		3. Check the conditional
	*/

	let tmpStartIndex = pAddress.indexOf(_ConditionalStanzaStart);

	while (tmpStartIndex != -1)
	{
		let tmpStopIndex = pAddress.indexOf(_ConditionalStanzaEnd, tmpStartIndex+_ConditionalStanzaStartLength);

		if (tmpStopIndex != -1)
		{
			let tmpMagicComparisonPatternSet = pAddress.substring(tmpStartIndex+_ConditionalStanzaStartLength, tmpStopIndex).split(',');

			let tmpSearchAddress = tmpMagicComparisonPatternSet[0];
			let tmpSearchComparator = tmpMagicComparisonPatternSet[1];
			let tmpSearchValue = tmpMagicComparisonPatternSet[2];

			// Process the piece
			tmpKeepRecord = tmpKeepRecord && testCondition(pManyfest, pRecord, tmpSearchAddress, tmpSearchComparator, tmpSearchValue);
			tmpStartIndex = pAddress.indexOf(_ConditionalStanzaStart, tmpStopIndex+_ConditionalStanzaEndLength);
		}
		else
		{
			tmpStartIndex = -1;
		}
		
	}

	return tmpKeepRecord;
}

module.exports = parseConditionals;