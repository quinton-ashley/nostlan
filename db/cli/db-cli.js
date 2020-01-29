module.exports = async function(arg) {
	global.path = require('path');
	arg.__root = path.join(__dirname, '/../..').replace(/\\/g, '/');
	await require(arg.__root + '/core/setup.js')(arg);

	const db = require(__root + '/db/db.js');

	global.sys = arg.sys;

	db.generate();
}
