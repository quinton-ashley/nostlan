// DEVELOPMENT USE ONLY!
// This code is not for end users, it's for creating the
// game art database files. These files find direct download
// links to images so that end users will not have to
// individually scrape for images.
// Even though I have decided to open source these files please
// do not run them yourself.
//
// If you have any questions email me:
// qashto@gmail.com
//
module.exports = async function(arg) {
	global.path = require('path');
	arg.__root = path.join(__dirname, '/../..').replace(/\\/g, '/');
	await require(arg.__root + '/core/setup.js')(arg);

	let scrapers = ['gfs', 'fly', 'tcp', 'dec'];
	let scrape = arg.scrape;
	if (!scrapers.includes(scrape)) {
		er('invalid scraper use one of the following: ' + scrapers.toString());
		return;
	}

	let prefsMan = require(__root + '/prefs/prefsManager.js');
	prefsMan.prefsPath = __root + '/scrape/cli/prefs.json';
	global.prefs = {};
	prefs = await prefsMan.load();

	global.browser = require('./browser.js');
	await browser.load({
		user: 'qashto@gmail.com'
	});
	await prefsMan.save();

	const deepExtend = require('deep-extend');
	let scraper = require(`../${scrape}.js`);
	global.sys = arg.sys || 'snes'; // sys default
	if (scrape == 'fly') sys = 'mame';

	if (/(tcp|gfs|dec)/.test(scrape)) {
		await scraper.load(sys);
	}
	let name = 'cover';
	if (/(mame|gba)/.test(sys) || scrape == 'dec') name = 'box';
	if (scrape == 'tcp') name = 'coverFull';

	let games = [];
	let dbPath = `${__root}/db/${sys}DB.json`;
	games = JSON.parse(await fs.readFile(dbPath)).games;

	let found = 0;
	let saved = 0;
	for (let i = (arg.skip || 0); i < games.length; i++) {
		if (arg.test && found >= arg.test) {
			log('test done!');
			break;
		}
		let game = games[i];
		log(game.title);
		if (arg.override || !game.img || !game.img[name]) {
			let img = await scraper.getImgUrls(game, name);
			if (img && Object.keys(img).length) {
				if (!game.img) {
					game.img = img;
				} else if (!arg.override) {
					deepExtend(game.img, img);
				} else {
					// TODO deep extend doesn't work, do it manually
					deepExtend(game.img, img);
					game.img = img;
				}
				log('image found!');
				found++;
			} else {
				log('image not found');
			}
		} else {
			log('game already has an image');
			found++;
		}
		log(`found: ${found}/${i+1-(arg.skip||0)} ${Number(found/(i+1-(arg.skip||0))*100).toFixed(2)}%`);
		log(`completed: ${i+1}/${games.length} ${Number((i+1)/games.length*100).toFixed(2)}%`);
		if (found && found % 10 == 0 && found != saved) {
			await save();
			saved = found;
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
		log('scrape completed!');
	}
	await quit();
}
