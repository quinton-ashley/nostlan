/*
 * renderer.js handles responses to user interactions with the menu and app UI
 * authors: quinton-ashley
 * copyright 2018
 */
module.exports = async function(opt) {
	const err = console.error;
	const log = console.log;
	global.__rootDir = opt.__rootDir;

	const remote = require('electron').remote;
	const {
		app,
		dialog,
		Menu
	} = remote;
	const deepExtend = require('deep-extend');
	const delay = require('delay');
	const fs = require('fs-extra');
	const Fuse = require('fuse.js');
	const klawSync = require('klaw-sync');
	const os = require('os');
	const path = require('path');
	const pug = require('pug');
	const $ = require('jquery');
	const osType = os.type();
	const linux = (osType == 'Linux');
	const mac = (osType == 'Darwin');
	const win = (osType == 'Windows_NT');
	const botDir = path.join(os.homedir(), '/Documents/bottlenose');
	log(botDir);

	window.$ = window.jQuery = $;
	window.Tether = require('tether');
	window.Bootstrap = require('bootstrap');
	// var jQueryBridget = require('jquery-bridget');
	// var Masonry = require('masonry-layout');
	// // make Masonry a jQuery plugin
	// jQueryBridget('masonry', Masonry, $);
	const viewer = require('../js/gameLibViewer.js');

	const gcnIntroHTML = pug.compileFile(path.join(__dirname,
		'../pug/gcnLoad.pug'));
	const gcnIntro = function() {
		$('body').prepend(gcnIntroHTML());
		require('../js/gcnLoad.js')();
	}
	gcnIntro();
	// await delay(4000);

	// get the default prefrences
	let prefsDefaultPath = path.join(__rootDir, '/prefs/prefsDefault.json');
	let prefsDefault = JSON.parse(await fs.readFile(prefsDefaultPath));
	let prefsPath = botDir + '/usr/prefs.json';
	let prefs = prefsDefault;
	prefs.ui.mouse.wheel.multi = ((!mac) ? 1 : 0.25);
	prefs.ui.mouse.wheel.smooth = ((!mac) ? false : true);
	let sys = '';
	let emuDir = '';
	let games = [];

	// make UI changes
	$('#update').hide();


	String.prototype.replaceAt = function(index, replacement) {
		return this.substr(0, index) + replacement + this.substr(index + replacement.length);
	}

	function openLib() {
		let dir = dialog.showOpenDialog({
			properties: ['openDirectory'],
			title: `open ${sys} game library`,
			message: `choose the ${sys} game library`
		});
		return dir[0];
	}

	function chooseEmulatorsDir() {
		let dir = dialog.showOpenDialog({
			properties: ['openDirectory'],
			title: 'choose emulators folder',
			message: `choose the root emulators dir for bottlenose`
		});
		return dir[0];
	}

	async function reset() {
		games = [];
		let gameDB = [];
		let DBPath = path.join(__rootDir, `/db/${sys}DB.json`);
		gameDB = JSON.parse(await fs.readFile(DBPath)).games;
		log(gameDB);

		let options = {
			shouldSort: true,
			threshold: 0.4,
			location: 0,
			distance: 100,
			maxPatternLength: 32,
			minMatchCharLength: 1,
			keys: [
				"id",
				"title"
			]
		};
		let fuse = new Fuse(gameDB, options);

		function addGame(searchTerm) {
			let results = fuse.search(searchTerm);
			let region = prefs.region;
			for (let i = 0; i < results.length; i++) {
				if (results[i].title.length > searchTerm.length + 6) {
					continue;
				}
				// if the search term doesn't contain demo or trial
				// skip the demo/trial version of the game
				let demoRegex = /(Demo|Preview|Review|Trial)/i;
				if (demoRegex.test(results[i].title) != demoRegex.test(searchTerm)) {
					continue;
				}
				if (sys == 'wii' || sys == 'ds' || sys == 'wiiu' || sys == '3ds') {
					let gRegion = results[i].id[3];
					// TODO: this is a temporary region filter
					if (/[KWXDZIFSHYVRAC]/.test(gRegion)) {
						continue;
					}
					if (gRegion == 'E' && (region == 'P' || region == 'J')) {
						continue;
					}
					if (gRegion == 'P' && (region == 'E' || region == 'J')) {
						continue;
					}
					if (gRegion == 'J' && (region == 'E' || region == 'P')) {
						continue;
					}
				} else if (sys == 'switch') {
					let gRegion = results[i].id[4];
					if (gRegion == 'A' && (region == 'P' || region == 'J')) {
						continue;
					}
					if (gRegion == 'B' && (region == 'E' || region == 'J')) {
						continue;
					}
					if (gRegion == 'C' && (region == 'E' || region == 'P')) {
						continue;
					}
				}
				$('#loadDialog0').text('loading ' + results[i].title);
				return results[i];
			}
			return false;
		}

		let files = klawSync(prefs[sys].libs[0], {
			depthLimit: 0
		});
		let file;
		// a lot of pruning is required to get good search results
		for (let i = 0; i < files.length; i++) {
			file = files[i].path;
			log(file);
			let term = path.parse(file);
			if (sys != 'wiiu' && sys != 'ps3') {
				term = term.name;
			} else {
				term = term.base;
			}
			if (mac && term.includes('DS_Store')) {
				continue;
			}
			// eliminations part 1
			term = term.replace(/[\[\(](USA|World)[\]\)]/gi, '');
			term = term.replace(/[\[\(]*(NTSC)+(-U)*[\]\)]*/gi, '');
			term = term.replace(/[\[\(]*(N64|GCN)[,]*[\]\)]*/gi, '');
			term = term.replace(/[\[\(,](En|Ja|Eu)[^\]\)]*[\]\)]*/gi, '');
			// special complete subs part 1
			term = term.replace(/ssbm/gi, 'Super Smash Bros. Melee');
			term = term.replace(/lego/gi, 'lego');
			// special check for ids
			log(term);
			let id = term.match(/[\[\(][A-Z0-9][A-Z0-9][A-Z0-9][A-Z][A-Z0-9]*/g);
			if (id) {
				id = id[0].substr(1);
				let game = gameDB.find(x => x.id === id);
				if (game) {
					log(id);
					log(game.title);
					game.file = file;
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
			} else if (sys == 'switch') {
				term = term.replace(/Nintendo Labo/gi, 'Nintendo Labo -');
			}
			// special subs part 3
			term = term.replace(/sm *64/gi, 'Super Mario 64')
			term = term.replace(/mk(\d+)/gi, 'Mario Kart $1');
			term = term.replace(/warioware,*/gi, 'Wario Ware');
			term = term.replace(/ bros( |$)/gi, ' Bros. ');
			term = term.replace(/(papermario|paper mario[^\: ])/gi, 'Paper Mario');
			// eliminations part 3
			term = term.replace(/[\[\(]*(v\d]\.|\d+\.|rev \d).*/gi, '');
			term = term.replace(/\[[^\]]*\]/g, '');
			term = term.replace(/ *decrypted */gi, '');

			term = term.trim();
			// TODO: strings must be less than 32 chars
			log(term);
			let game = addGame(term);
			if (game) {
				log(game.title);
				game.file = file;
				games.push(game);
			}
		}
		let gamesPath = `${botDir}/usr/${sys}Games.json`;
		await fs.outputFile(gamesPath, JSON.stringify({
			games: games
		}));
		prefs.session.sys = sys;
		await fs.outputFile(prefsPath, JSON.stringify(prefs, null, '\t'));
	}

	async function reload() {
		$('#openSel .' + sys).prop('selected');
		$('body').removeClass();
		$('body').addClass(sys + ' ' + (prefs[sys].style || sys));
		$('#dialogs').show();
		let gamesPath = `${botDir}/usr/${sys}Games.json`;
		// if prefs exist load them if not copy the default prefs
		if (await fs.exists(gamesPath)) {
			games = JSON.parse(await fs.readFile(gamesPath)).games;
		} else {
			let emuDirExisted;
			if (!emuDir) {
				emuDir = chooseEmulatorsDir();
			} else {
				emuDirExisted = true;
			}
			let emu = prefs[sys].emu;
			let gameDir = path.join(emuDir, `../${emu}/GAMES`);
			if (!(await fs.exists(gameDir))) {
				gameDir = path.join(emuDir, `../${emu.toLowerCase()}/GAMES`);
			}
			log(gameDir);
			if (!(await fs.exists(gameDir))) {
				gameDir = path.join(emuDir, `../${emu.toUpperCase()}/GAMES`);
			}
			log(gameDir);
			if (await fs.exists(gameDir)) {
				if (!prefs[sys].libs) {
					prefs[sys].libs = [];
				}
				if (!prefs[sys].libs.includes(gameDir)) {
					prefs[sys].libs.push(gameDir);
				}
				if (!emuDirExisted) {
					emuDir += '/bottlenose';
				}
				await fs.ensureDir(emuDir);
				prefs.emuDir = emuDir;
			} else {
				log(`choose emulation folder with directory structure:
{root folder can have any name}
├─┬ Dolphin
│ ├─┬ BIN
│ │ ├── Languages
│ │ ├── Sys
│ │ ├── User
│ │ ├── portable.txt
│ │ ├── Dolphin.exe
│ │ └── ...
│ └─┬ GAMES
│   └── ...
├── Cemu
└── Yuzu`);
				prefs[sys].libs.push(openLib(sys));
			}
			await reset();
			prefs.session.sys = sys;
		}
	}

	async function load() {
		if (await fs.exists(prefsPath)) {
			let prefs1 = JSON.parse(await fs.readFile(prefsPath));
			log(prefs);
			deepExtend(prefs, prefs1);
			log(prefs);
			emuDir = prefs.emuDir;
		}
		// currently supported systems
		let systems = ['wii', 'ds', 'wiiu', '3ds', 'switch'];
		for (let i = 0; i < systems.length; i++) {
			sys = systems[i];
			$('#openSel').append(`
				<option class="${sys}" value="${sys}">${sys}</option>
				`);
		}
		sys = prefs.session.sys;
		await reload();
	}

	await load();
	await viewer.load(games, prefs, sys);
	$('#cvs').remove();

	async function powerBtn() {
		await viewer.powerBtn();
		gcnIntro();
		await viewer.load(games, prefs, sys);
		$('#cvs').remove();
	}

	async function resetBtn() {
		viewer.remove();
		gcnIntro();
		await reset();
		await viewer.load(games, prefs, sys);
		$('#cvs').remove();
	}

	async function openSel() {
		if (!viewer) {
			return;
		}
		viewer.remove();
		sys = $(this).val();
		gcnIntro();
		await reload();
		await viewer.load(games, prefs, sys);
		$('#cvs').remove();
	}

	$('#powerBtn').click(powerBtn);
	$('#resetBtn').click(resetBtn);
	$('#openSel').change(openSel);

	// $(document).keydown(function(e) {
	//   switch (e.which) {
	//     case 13: // Enter
	//       log('enter');
	//       break;
	//     case 27: // Escape
	//       remote.getCurrentWindow().close();
	//       break;
	//     default:
	//       return;
	//   }
	//   e.preventDefault();
	// });
};
