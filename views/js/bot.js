/*
 * Bot has methods that type, copy/paste, and open files
 * authors: quinton-ashley
 * copyright 2018
 */
const Bot = function() {
	const log = console.log;
	const err = console.err;

	const ncp = require('copy-paste');
	const open = require('opn');
	const os = require('os');
	const {
		promisify
	} = require('util');
	const path = require('path');
	const awaitCopy = promisify(ncp.copy);
	const osType = os.type();
	const linux = (osType == 'Linux');
	const mac = (osType == 'Darwin');
	const win = (osType == 'Windows_NT');
	if (win) {
		osType = 'win';
	} else if (mac) {
		osType = 'mac';
	} else if (linux) {
		osType = 'linux';
	}
	// robot.setKeyboardDelay(10);

	this.copy = async function(text) {
		await awaitCopy(text);
	};
}

module.exports = new Bot();
