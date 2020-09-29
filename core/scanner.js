/*
 * scanner.js : Nostlan : quinton-ashley
 *
 * Attempts to automatically indentify games in the user's game
 * libraries, creates a games array, and saves array to a json file.
 */
const Fuse = require('fuse.js');
const crc32 = require('crc').crc32;
const cryptog = require('crypto');

const idRegex = {
	arcade: /(\S+)/,
	ds: /(?:^|[\[\(])([A-Z][A-Z0-9]{2}[A-Z])(?:[\]\)]|$)/,
	gba: /(?:^|[\[\(])([A-Z0-9]{8})(?:[\]\)]|$)/,
	ps2: /(?:^|[\[\(])([A-Z]{4}-[0-9]{5})(?:[\]\)]|$)/,
	ps3: /(?:^|[\[\(])(\w{9})(?:[\]\)]|_INSTALL|$)/,
	switch: /(?:^|[\[\(])([0-9A-F]{16})(?:[\]\)]|$)/,
	wii: /(?:^|[\[\(])([A-Z0-9]{3}[A-Z](?:|[A-Z0-9]{2}))(?:[\]\)]|$)/,
	wiiu: /(?:^|[\[\(])([A-Z0-9]{3}[A-Z](?:|[A-Z0-9]{2}))(?:[\]\)]|$)/,
	xbox360: /(?:^|[\[\(])([0-9A-FGLZ]{8})(?:[\]\)]|$)/,
};

let searcharg = {
	shouldSort: true,
	threshold: 0.4,
	location: 0,
	distance: 5,
	maxPatternLength: 64,
	minMatchCharLength: 1,
	keys: [
		'id',
		'title'
	]
};

class Scanner {
	constructor() {
		this.outLog = '';
	}

	async gameLib() {
		$('#loadDialog0').text('Indexing your game library');
		this.outLog = '';
		let unidentifiedAmt = 0;
		let games = [];
		let gameDB = [];
		let dbPath = `${__root}/db/${sys}DB.json`;
		gameDB = JSON.parse(await fs.readFile(dbPath)).games;

		// TODO exact match indexing for wii games with Dolphin using kb
		// if (sys == 'wii' && kb) {
		if (false) {
			let app = await launcher.getEmuApp();
			let dir = path.join(app, '../User');
			if (mac && !(await fs.exists(dir))) {
				dir = util.absPath('$home') + '/Library/Application Support/Dolphin';
			}
			if (!(await fs.exists(dir))) {
				cui.err(`"User" folder not found. "User" folder needs to be in the same folder as "Dolphin.exe". To make a build use a local user directory, create a text file named "portable" next to the executable files of the build (Dolphin.exe). With the extension it should be named "portable.txt". Dolphin will check if that file exists in the same directory, then it will not use the global user directory, instead it will create and use the local user directory in the same directory.`);
				return;
			}
			let config = await fs.readFile(dir + '/Config/Dolphin.ini');
			let ogConfig = config;
			config.replace(/(Column[^ ]*)[^\n]*/g, '$1 = False');
			config.replace(/ColumnTitle[^\n]*/, 'ColumnTitle = True');
			config.replace(/ColumnFileName[^\n]*/, 'ColumnFileName = True');
			config.replace(/ColumnID[^\n]*/, 'ColumnID = True');
			await fs.outputFile(dir + '/Config/Dolphin.ini', config);

			$('#loadDialog0').text('Do not close Dolphin while game indexing is in progress');
			// TODO
			await delay(1000);
			await this.outputUsersGamesDB(games);
			cui.clearDialogs();
			launcher.state = 'closed';
			return games;
		}

		let fuse, searcher;
		fuse = new Fuse(gameDB, searcharg);
		searcher = function(term) {
			return new Promise((resolve, reject) => {
				resolve(fuse.search(term));
			});
		};
		for (let h = 0; h < prefs[sys].libs.length; h++) {
			let files = await klaw(prefs[sys].libs[h], {
				depthLimit: 0
			});
			let file;
			// a lot of pruning is required to get good search results
			for (let i = 0; i < files.length; i++) {
				let id;
				$('#loadDialog2').text(`${i+1}/${files.length + 1} files matched`);
				file = files[i];
				let term = path.parse(file);
				// if it's a hidden file like '.DS_STORE' on macOS, skip it
				if (term.base[0] == '.') continue;
				// if it's the dir.txt in the mame roms folder skip it
				if (term.base == 'dir.txt') continue;
				// if the file is not a game file, skip it
				if (term.ext == '.sav') continue;
				if (syst.gameExts) {
					let isGame = false;
					for (let ext of syst.gameExts) {
						if ('.' + ext == term.ext) {
							isGame = true;
						}
					}
					if (!isGame) continue;
				}
				// fixes an issue where folder names were split by periods
				// wiiu and ps3 store games in folders not single file .iso, .nso, etc.
				let isDir = (await fs.stat(file)).isDirectory();
				if (sys != 'wiiu' && sys != 'ps3' && !isDir) {
					term = term.name;
				} else {
					term = term.base;
				}
				let fileName = term;
				this.olog('file:   ' + term);
				$('#loadDialog1').text(term);
				await delay(1);

				if (/(snes|nes)/.test(sys)) {
					let data = await fs.readFile(file);
					let game, hash;
					if (sys == 'nes') {
						hash = crc32(data).toString(16);
						game = gameDB.find(x => x.id.split('-')[0] == hash);
					} else if (sys == 'snes') {
						hash = cryptog.createHash('sha256').update(data).digest('hex');
						game = gameDB.find(x => x.sha256 == hash);
					}
					if (game) {
						this.olog(`exact match:  ${game.title}\r\n`);
						log(game);
						game.file = '$' + h + '/' +
							path.relative(prefs[sys].libs[h], file);
						games.push(game);
						continue;
					}
				}

				// rpcs3 ignore games with these ids
				if (term == 'TEST12345' || term == 'RPSN00001') continue;
				// eliminations part 1
				term = term.replace(/[\[\(](USA|World)[\]\)]/gi, '');
				term = term.replace(/[\[\(]*(NTSC)+(-U)*[\]\)]*/gi, '');
				term = term.replace(/[\[\(]*(N64|GCN)[,]*[\]\)]*/gi, '');
				term = term.replace(/[\[\(] *Torrent[^\]\)]*[\]\)]/gi, '');
				if ((/Disc *[^1A ]/gi).test(term)) {
					log('additional disc: ' + term);
					continue;
				}
				term = term.replace(/[\[\(,](En|Ja|Eu|Disc)[^\]\)]*[\]\)]*/gi, '');
				// special complete substitutions part 1
				if (sys == 'wii') {
					term = term.replace(/ssbm/gi, 'Super Smash Bros. Melee');
				}
				term = term.replace(/s*m *64n*/gi, 'Super Mario 64');
				term = term.replace(/mk(\d+)/gi, 'Mario Kart $1');
				// exact match by checking if the id is in the file name
				if (idRegex[sys]) id = term.match(idRegex[sys]);
				if (id) id = id[1];
				if (sys == 'wii') {
					if (term == 'Super_Mario_Sunshine_Stardust-trimmed') {
						id = 'AVP3A';
					}
				}
				if (id) {
					log('id: ' + id);
					let game;
					if (sys != 'switch') {
						game = gameDB.find(x => x.id === id);
					} else {
						game = gameDB.find(x => x.tid === id);
					}
					if (game) {
						if (sys == 'ps3') {
							let dup = games.find(x => x.title === game.title);
							if (dup) continue;
						}
						this.olog(`exact match:  ${game.title}\r\n`);
						log(game);
						game.file = '$' + h + '/' + path.relative(prefs[sys].libs[h], file);
						games.push(game);
						continue;
					}
				}
				// exact match identification by retreiving the id
				// from the game file
				if (sys == 'switch') {
					let game = {
						title: term,
						file: file
					};
					// gives the game an id or not if it fails
					try {
						game = await launcher.identifyGame(game);
					} catch (ror) {}
					if (game.id || (sys == 'switch' && game.tid)) {
						let res;
						if (sys != 'switch') {
							log('id: ' + game.id);
							res = gameDB.find(x => x.id === game.id);
						} else {
							log('id: ' + game.tid);
							res = gameDB.find(x => x.tid === game.tid);
						}
						if (res) {
							game = res;
							this.olog(`exact match:  ${game.title}\r\n`);
							log(game);
							game.file = '$' + h + '/' +
								path.relative(prefs[sys].libs[h], file);
							games.push(game);
							continue;
						}
					}
				}
				// replacements
				term = term.replace(/_/g, ' ');
				term = term.replace(/ -/g, ':');
				let temp = term.replace(/, The/gi, '');
				if (term != temp) {
					term = 'The ' + temp;
				}
				// eliminations part 2
				term = term.replace(/,/g, '');
				term = term.replace(/[\[\(](E|J|P|U)[\]\)].*/g, '');
				// special subs part 2
				if (sys == 'wii') {
					term = term.replace(/ 20XX.*/gi, ': 20XX Training Pack');
					term = term.replace(/Nickelodeon SpongeBob/gi, 'SpongeBob');
					term = term.replace(/thousand year/gi, 'Thousand-Year');
					term = term.replace(/kirby *64.*/gi, 'Kirby 64: The Crystal Shards');
				} else if (sys == 'switch') {
					term = term.replace(/Nintendo Labo/gi, 'Nintendo Labo -');
				} else if (sys == 'gba') {
					term = term.replace(/ # GBA/gi, '');
				} else if (sys == 'ps2') {
					term = term.replace(/Marvel Vs.*/gi, 'Marvel Vs Capcom 2');
				} else if (sys == 'ds') {
					term = term.replace(/^\w\d\d\d: /, '');
				}
				// special subs part 3
				term = term.replace(/jak *a*n*d* *daxter *the/gi, 'Jak and Daxter: The');
				term = term.replace(/pes *(\d\d\d\d).*/gi, 'Pro Evolution Soccer $1');
				term = term.replace(/Dragonball/gi, 'Dragon Ball');
				term = term.replace(/Goku 2/gi, 'Goku II');
				term = term.replace(/Yu-Gi-Oh /gi, 'Yu-Gi-Oh! ');
				term = term.replace(/lego/gi, 'lego');
				term = term.replace(/warioware,*/gi, 'Wario Ware');
				term = term.replace(/ bros( |$)/gi, ' Bros. ');
				term = term.replace(/paper *mario[^\: ]/gi, 'Paper Mario');
				term = term.replace(/paper *mario *the/gi, 'Paper Mario: The');
				// eliminations part 3
				term = term.replace(/[\[\(]*((v|ver|version)* *\d+\.|rev *\d).*/gi, '');
				term = term.replace(/[\[\(](v|ver|version) *[\d\.]+.*/gi, '');
				term = term.replace(/\[[^\]]*\]/g, '');
				term = term.replace(/ *decrypted */gi, '');

				term = term.trim();
				let game = await this.searchForGame(searcher, games, term, fileName);

				if (!game) {
					// some games use parenthesis in the game title so this
					// is a last resort if the game isn't found
					term = term.replace(/[\[\(].*/gi, '');
					game = await this.searchForGame(searcher, games, term, fileName);
				}

				if (game) {
					this.olog(`potential match:  ${game.title}\r\n`);
				} else {
					this.olog('game could not be identified in the database\r\n');
					game = {
						id: '_UNIDENTIFIED_' + sys + '_' + unidentifiedAmt,
						title: term
					};
					unidentifiedAmt++;
				}
				game.file = '$' + h + '/' + path.relative(prefs[sys].libs[h], file);
				games.push(game);
				log(game);
			}
		}
		let outLogPath = `${systemsDir}/${sys}/${sys}GameLibScanLog.txt`;
		try {
			await fs.outputFile(outLogPath, this.outLog);
		} catch (ror) {
			er(ror);
		}
		this.outLog = '';
		await this.outputUsersGamesDB(games);
		cui.clearDialogs();
		launcher.state = 'closed';
		return games;
	}

	async searchForGame(searcher, games, term, fileName) {
		log('term:  ' + term);
		let results = await searcher(term.slice(0, 64));
		if (arg.v) log(results);
		let region = prefs.region;
		if (/USA/i.test(fileName)) {
			region = 'E';
		} else if (/Japan/i.test(fileName)) {
			region = 'J';
		} else if (/Europe/i.test(fileName)) {
			region = 'P';
		}
		for (let i = 0; i < results.length; i++) {
			let game = results[i].item;
			if (game.title.length > term.length + 6) continue;
			// if the search term doesn't contain demo or trial
			// skip the demo/trial version of the game
			let demoRegex = /(Demo|Preview|Review|Trial)/i;
			if (demoRegex.test(game.title) != demoRegex.test(term)) {
				continue;
			}
			if (sys == 'wii' || sys == 'ds' || sys == 'wiiu' || sys == 'n3ds') {
				let gRegion = game.id[3];
				// TODO: this is a temporary region filter
				if (/[KWXDZIFSHYVRAC]/.test(gRegion)) continue;
				if (region != gRegion) continue;
			} else if (sys == 'switch') {
				let gRegion = game.id[4];
				if (gRegion == 'B' && (region == 'E' || region == 'J')) continue;
				if (gRegion == 'C' && (region == 'E' || region == 'P')) continue;
			}
			// skip if it's already in the games array
			if (games.find(x => x.id == game.id)) continue;
			return game;
		}
		return;
	}

	olog(msg) {
		log(msg.replace(/[\t\r\n]/gi, '').replace(':', ': '));
		this.outLog += msg + '\r\n';
	}

	async outputUsersGamesDB(games) {
		if (!games) return;
		let gamesPath = `${systemsDir}/${sys}/${sys}Games.json`;
		log('game library saved to: ');
		log(gamesPath);
		try {
			await fs.outputFile(gamesPath, JSON.stringify({
				games: games
			}, null, '\t'));
		} catch (ror) {
			er(ror);
		}
	}
}

module.exports = new Scanner();
