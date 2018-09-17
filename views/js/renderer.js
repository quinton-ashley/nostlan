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
	const delay = require('delay');
	const fs = require('fs-extra');
	const Fuse = require('fuse.js');
	const klawSync = require('klaw-sync');
	const path = require('path');
	const pug = require('pug');
	const $ = require('jquery');

	window.$ = window.jQuery = $;
	window.Tether = require('tether');
	window.Bootstrap = require('bootstrap');
	// var jQueryBridget = require('jquery-bridget');
	// var Masonry = require('masonry-layout');
	// // make Masonry a jQuery plugin
	// jQueryBridget('masonry', Masonry, $);
	const viewer = require('../js/gameLibViewer.js');

	const gcnIntroHTML = pug.compileFile(path.join(__dirname, '../pug/gcnIntro.pug'));
	const gcnIntro = function() {
		$('body').prepend(gcnIntroHTML());
		require('../js/gcnIntro.js')();
	}
	gcnIntro();
	// await delay(4000);

	// make UI changes
	$('#update').hide();

	// get the default prefrences
	let prefsDefaultPath = path.join(__rootDir, '/prefs/prefsDefault.json');
	let prefsDefault = JSON.parse(await fs.readFile(prefsDefaultPath));
	let prefsPath = path.join(__rootDir, '/usr/prefs.json');
	let prefs = prefsDefault;
	let sys = 'switch';
	let usrDir = '';
	let games = [];

	String.prototype.replaceAt = function(index, replacement) {
		return this.substr(0, index) + replacement + this.substr(index + replacement.length);
	}

	function openLib(sys) {
		let dir = dialog.showOpenDialog({
			properties: ['openDirectory'],
			title: `open ${sys} game library`,
			message: `choose the ${sys} game library`
		});
		return dir[0];
	}

	function chooseBottlenoseDir() {
		let dir = dialog.showOpenDialog({
			properties: ['openDirectory'],
			title: 'choose bottlenose folder',
			message: `choose the root dir for bottlenose`
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
				if (sys == 'wii' || sys == 'wiiu') {
					let gRegion = results[i].id[3];
					if (gRegion == 'E' && (region == 'P' || region == 'J')) {
						continue;
					}
					if (gRegion == 'P' && (region == 'E' || region == 'J')) {
						continue;
					}
					if (gRegion == 'J' && (region == 'E' || region == 'P')) {
						continue;
					}
					$('#loadDialog0').text('loading ' + results[i].title);
					return results[i];
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
					$('#loadDialog0').text('loading ' + results[i].title);
					return results[i];
				}
			}
			return false;
		}

		let files = klawSync(prefs[sys].libs[0], {
			depthLimit: true
		});
		for (let i = 0; i < files.length; i++) {
			let file = files[i].path;
			log(file);
			let term = path.parse(file).name;
			if (term.includes('DS_Store')) {
				log('hi');
				continue;
			}
			// eliminations
			term = term.replace(/[\[\(](USA|World)[\]\)]/gi, '');
			term = term.replace(/[\[\(]*(NTSC)+(-U)*[\]\)]*/gi, '');
			term = term.replace(/[\[\(]*(N64|GCN)[,]*[\]\)]*/gi, '');
			term = term.replace(/[\[\(,](En|Ja|Eu)[^\]\)]*[\]\)]*/gi, '');
			// special complete subs
			term = term.replace(/ssbm/gi, 'Super Smash Bros. Melee');
			term = term.replace(/lego/gi, 'lego');
			// special check for ids
			let id = term.match(/[A-Z1-9][A-Z1-9][A-Z1-9][A-Z]([A-Z1-9][A-Z1-9])*/g);
			if (id) {
				let game = gameDB.find(x => x.id === id[0]);
				if (game) {
					log(id[0]);
					log(game.title);
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
			// special subs part 2
			term = term.replace(/ 20XX.*/gi, ': 20XX Training Pack');
			term = term.replace(/sm *64/gi, 'Super Mario 64')
			term = term.replace(/mk(\d+)/gi, 'Mario Kart $1');
			term = term.replace(/warioware,*/gi, 'Wario Ware');
			term = term.replace(/ bros /gi, ' Bros. ');
			term = term.replace(/Nickelodeon SpongeBob/gi, 'SpongeBob');
			term = term.replace(/(papermario|paper mario[^\: ])/gi, 'Paper Mario');
			term = term.replace(/Nintendo Labo/gi, 'Nintendo Labo -');
			// eliminations part 3
			term = term.replace(/[\[\(]*(v\d.|\d+\.|rev \d).*/gi, '');
			term = term.replace(/\[[^\]]*\]/g, '');

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
		await fs.outputFile(`${__rootDir}/usr/${sys}Games.json`, JSON.stringify({
			games: games
		}));
		await fs.outputFile(prefsPath, JSON.stringify(prefs));
	}

	async function load() {
		if (await fs.exists(prefsPath)) {
			prefs = JSON.parse(await fs.readFile(prefsPath));
			usrDir = prefs.usrDir;
		}
		let gamesPath = `${__rootDir}/usr/${sys}Games.json`;
		// if prefs exist load them if not copy the default prefs
		if (await fs.exists(gamesPath)) {
			games = JSON.parse(await fs.readFile(gamesPath)).games;
		} else {
			let usrDirExisted;
			if (!usrDir) {
				usrDir = chooseBottlenoseDir();
			} else {
				usrDirExisted = true;
			}
			let emu = prefs[sys].emu;
			let gameDir = path.join(usrDir, `../${emu}/GAMES`);
			if (!(await fs.exists(gameDir))) {
				gameDir = path.join(usrDir, `../${emu.toLowerCase()}/GAMES`);
			}
			log(gameDir);
			if (!(await fs.exists(gameDir))) {
				gameDir = path.join(usrDir, `../${emu.toUpperCase()}/GAMES`);
			}
			log(gameDir);
			if (await fs.exists(gameDir)) {
				prefs[sys].libs.push(gameDir);
				if (!usrDirExisted) {
					usrDir += '/bottlenose';
				}
				await fs.ensureDir(usrDir);
				prefs.usrDir = usrDir;
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
			await reset(sys);
		}
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

	async function openBtn() {

	}

	$('#powerBtn').click(powerBtn);
	$('#openBtn').click(openBtn);
	$('#resetBtn').click(resetBtn);

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
