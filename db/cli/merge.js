module.exports = async function(arg) {
	global.path = require('path');
	arg.__root = path.join(__dirname, '/../..').replace(/\\/g, '/');
	await require(arg.__root + '/core/setup.js')(arg);

	if (!arg.db) return er('missing arg: --db {database}');

	let deepExtend = require('deep-extend');

	let f = path.parse(arg.db);
	let db0 = JSON.parse(await fs.readFile(arg.db));
	let db1 = JSON.parse(await fs.readFile(f.dir + '/' + f.name + '1.json'));

	let merged = 0;
	for (let game of db0.games) {
		let match = db1.games.find(x => x.title === game.title);
		if (!match) continue;
		log(match.title);
		deepExtend(game, match);
		merged++;
	}

	let file = f.dir + '/' + f.name + 'x.json';
	await fs.outputFile(file, JSON.stringify(db0, null, '\t'));
	log('finished!');
	log('merged: ' + (merged / Math.max(db0.games.length, db1.games.length)).toFixed(2) * 100 + '%');
};
