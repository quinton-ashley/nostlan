const Fuse = require('fuse.js');

const idRegex = {
	switch: /(?:^|[\[\(])([A-Z0-9]{3}[A-Z](?:|[A-Z0-9]))(?:[\]\)]|$)/,
	ps3: /(?:^|[\[\(])(\w{9})(?:[\]\)]|_INSTALL|$)/,
	wii: /(?:^|[\[\(])([A-Z0-9]{3}[A-Z](?:|[A-Z0-9]{2}))(?:[\]\)]|$)/,
	wiiu: /(?:^|[\[\(])([A-Z0-9]{3}[A-Z](?:|[A-Z0-9]{2}))(?:[\]\)]|$)/,
	ds: /(?:^|[\[\(])([A-Z][A-Z0-9]{2}[A-Z])(?:[\]\)]|$)/,
	gba: /(?:^|[\[\(])([A-Z0-9]{8})(?:[\]\)]|$)/,
	ps2: /(?:^|[\[\(])([A-Z]{4}-[0-9]{5})(?:[\]\)]|$)/,
	xbox360: /(?:^|[\[\(])([0-9A-FGLZ]{8})(?:[\]\)]|$)/,
	mame: /(\S+)/
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
		let noMatch = 0;
		let games = [];
		let gameDB = [];
		let dbPath = `${__root}/db/${sys}DB.json`;
		gameDB = JSON.parse(await fs.readFile(dbPath)).games;
		let fuse, searcher;
		if (sys != 'snes') {
			fuse = new Fuse(gameDB, searcharg);
			searcher = function(searchTerm) {
				return new Promise((resolve, reject) => {
					resolve(fuse.search(searchTerm));
				});
			};
		}
		for (let h = 0; h < prefs[sys].libs.length; h++) {
			let files = await klaw(prefs[sys].libs[h], {
				depthLimit: 0
			});
			let file;
			// a lot of pruning is required to get good search results
			for (let i = 0; i < files.length; i++) {
				$('#loadDialog2').text(`${i+1}/${files.length + 1} files matched`);
				file = files[i];
				let term = path.parse(file);
				// if it's a hidden file like '.DS_STORE' on macOS, skip it
				if (term.base[0] == '.') continue;
				// if it's the dir.txt in the mame roms folder skip it
				if (term.base == 'dir.txt') continue;
				// if the file is a save file skip it
				if (term.ext == '.sav') continue;
				// fixes an issue where folder names were split by periods
				// wiiu and ps3 store games in folders not single file .iso, .nso, etc.
				let isDir = (await fs.stat(file)).isDirectory();
				if (sys != 'wiiu' && sys != 'ps3' && !isDir) {
					term = term.name;
				} else {
					term = term.base;
				}
				this.olog('file:   ' + term);
				$('#loadDialog1').text(term);
				await delay(1);
				if (sys == 'snes') {
					let game = {
						title: term,
						file: file
					};
					game = await launcher.identifyGame(game);
					if (!game) continue;
					this.olog(`match:  ${game.title}\r\n`);
					log(game);
					game.file = '$' + h + '/' + path.relative(prefs[sys].libs[h], file);
					games.push(game);
					continue;
				}
				// rpcs3 ignore games with these ids
				if (term == 'TEST12345' || term == 'RPSN00001') continue;
				// eliminations part 1
				term = term.replace(/[\[\(](USA|World)[\]\)]/gi, '');
				term = term.replace(/[\[\(]*(NTSC)+(-U)*[\]\)]*/gi, '');
				term = term.replace(/[\[\(]*(N64|GCN)[,]*[\]\)]*/gi, '');
				if ((/Disc *[^1A ]/gi).test(term)) {
					log('additional disc: ' + term);
					continue;
				}
				term = term.replace(/[\[\(,](En|Ja|Eu|Disc)[^\]\)]*[\]\)]*/gi, '');
				// special complete subs part 1
				if (sys == 'wii') {
					term = term.replace(/ssbm/gi, 'Super Smash Bros. Melee');
				} else if (sys == 'switch') {
					if (/Banana Blitz HD/gi.test(term)) term = 'AT6CB';
					if (/Link[^s]*s Awakening/gi.test(term)) term = 'AR3NA';
				}
				term = term.replace(/s*m *64n*/gi, 'Super Mario 64');
				term = term.replace(/mk(\d+)/gi, 'Mario Kart $1');
				// special check for ids
				let id;
				if (idRegex[sys]) id = term.match(idRegex[sys]);
				if (id) {
					id = id[1];
					log(id);
					let game = gameDB.find(x => x.id === id);
					if (game) {
						if (sys == 'ps3') {
							let dup = games.find(x => x.title === game.title);
							if (dup) continue;
						}
						this.olog(`match:  ${game.title}\r\n`);
						log(game);
						game.file = '$' + h + '/' + path.relative(prefs[sys].libs[h], file);
						games.push(game);
						continue;
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
				term = term.replace(/[\[\(]*(v*\d+\.|rev *\d).*/gi, '');
				term = term.replace(/\[[^\]]*\]/g, '');
				term = term.replace(/ *decrypted */gi, '');

				term = term.trim();
				let game = await this.searchForGame(searcher, term);
				let gameFound = false;
				if (game) gameFound = true;
				if (!game) game = {};
				game.file = '$' + h + '/' + path.relative(prefs[sys].libs[h], file);
				if (game) {
					this.olog(`match:  ${game.title}\r\n`);
					games.push(game);
				} else {
					this.olog('no match found\r\n');
					game.id = 'NOMATCH' + noMatch;
					game.title = term;
					noMatch++;
				}
				log(game);
			}
		}
		let outLogPath = `${usrDir}/_usr/${sys}Log.log`;
		await fs.outputFile(outLogPath, this.outLog);
		this.outLog = '';
		await this.outputUsersGamesDB(games);
		cui.clearDialogs();
		return games;
	}

	async searchForGame(searcher, searchTerm) {
		let results = await searcher(searchTerm.substr(0, 64));
		if (arg.v) log(results);
		let region = prefs.region;
		for (let i = 0; i < results.length; i++) {
			if (results[i].title.length > searchTerm.length + 6) continue;
			// if the search term doesn't contain demo or trial
			// skip the demo/trial version of the game
			let demoRegex = /(Demo|Preview|Review|Trial)/i;
			if (demoRegex.test(results[i].title) != demoRegex.test(searchTerm)) {
				continue;
			}
			if (sys == 'wii' || sys == 'ds' || sys == 'wiiu' || sys == 'n3ds') {
				let gRegion = results[i].id[3];
				// TODO: this is a temporary region filter
				if (/[KWXDZIFSHYVRAC]/.test(gRegion)) continue;
				if (gRegion == 'E' && (region == 'P' || region == 'J')) continue;
				if (gRegion == 'P' && (region == 'E' || region == 'J')) continue;
				if (gRegion == 'J' && (region == 'E' || region == 'P')) continue;
			} else if (sys == 'switch') {
				let gRegion = results[i].id[4];
				if (gRegion == 'A' && (region == 'P' || region == 'J')) continue;
				if (gRegion == 'B' && (region == 'E' || region == 'J')) continue;
				if (gRegion == 'C' && (region == 'E' || region == 'P')) continue;
			} else if (sys == 'bsnes') {
				let gRegion = results[i].id.split('-').splice(-2)[0];
				log(gRegion)
				await delay(100000);
				if (gRegion != 'USA') continue;
			}
			return results[i];
		}
		return;
	}

	olog(msg) {
		log(msg.replace(/[\t\r\n]/gi, '').replace(':', ': '));
		this.outLog += msg + '\r\n';
	}

	async outputUsersGamesDB(games) {
		let gamesPath = `${usrDir}/_usr/${sys}Games.json`;
		log('game library saved to: ');
		log(gamesPath);
		await fs.outputFile(gamesPath, JSON.stringify({
			games: games
		}));
	}
}

module.exports = new Scanner();
