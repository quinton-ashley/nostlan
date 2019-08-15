module.exports = async function(arg) {
	global.path = require('path');
	arg.__rootDir = path.join(__dirname, '/..').replace(/\\/g, '/');
	await require(arg.__rootDir + '/core/setup.js')(arg);
	const usrDir = __rootDir;

	let prefsMan = require(__rootDir + '/prefs/prefsManager.js');
	prefsMan.prefsPath = usrDir + '/scrape/prefs.json';
	global.prefs = await prefsMan.loadDefaultPrefs();

	global.browser = require('./browser.js');
	await browser.load({
		user: 'qashto@gmail.com'
	});

	let scrapers = ['gfs', 'fly'];
	if (!scrapers.includes(arg.scrape)) {
		er('invalid scraper use one of the following: ' + scrapers.toString());
		return;
	}
	let scraper = require(`./${arg.scrape}.js`);
	let sys = 'ps2';
	if (arg.scrape == 'fly') sys = 'mame';
	sys = arg.sys || sys;
	if (arg.gfs) await scraper.load(sys);
	let name = 'cover';
	if (sys == 'gba') name = 'box';

	let games = [];
	let dbPath = `${__rootDir}/scrape/db/${sys}DB.json`;
	games = JSON.parse(await fs.readFile(dbPath)).games;

	let found = 0;
	for (let i = 0; i < games.length; i++) {
		if (arg.test && found >= arg.test) {
			log('test done!');
			break;
		}
		let game = games[i];
		log(game.title);
		if (!game.img || !game.img[name]) {
			let img = await scraper.getImgUrls(sys, game, name);
			if (img) {
				if (!game.img) game.img = img;
				log('image found!');
				found++;
			} else {
				log('image not found');
			}
		} else {
			log('game already has an image');
			found++;
		}
		log(`found: ${found}/${i+1} ${Number(found/(i+1)*100).toFixed(2)}%`);
		log(`completed: ${i+1}/${games.length} ${Number((i+1)/games.length*100).toFixed(2)}%`);
		if (found && found % 10 == 0) {
			await save();
		}
	}

	await save();

	async function save() {
		log('saving to file... DO NOT QUIT');
		await fs.outputFile(dbPath, JSON.stringify({
			games: games
		}));
		log('file saved: ' + dbPath);
	}

	async function quit() {
		await prefsMan.save();
		log('scrape completed!');
	}
	await quit();
}
