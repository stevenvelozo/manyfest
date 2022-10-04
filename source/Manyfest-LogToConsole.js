/**
* @license MIT
* @author <steven@velozo.com>
*/

/**
* Manyfest simple logging shim (for browser and dependency-free running)
*/

const logToConsole = (pLogLine, pLogObject) =>
{
    let tmpLogLine = (typeof(pLogLine) === 'string') ? pLogLine : '';

    console.log(`[Manyfest] ${tmpLogLine}`);

    if (pLogObject) console.log(JSON.stringify(tmpLogObject,null,4)+"\n");
};

module.exports = logToConsole;