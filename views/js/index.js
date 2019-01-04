/*
 * index.js handles responses to user interactions with the menu and app UI
 * authors: quinton-ashley
 * copyright 2018
 */
module.exports = async function(opt) {
	const log = console.log;
	global.__rootDir = opt.__rootDir;
	opt.v = false;

	const remote = require('electron').remote;
	const {
		app,
		dialog
	} = remote;
	const spawn = require('await-spawn');
	const deepExtend = require('deep-extend');
	const delay = require('delay');
	const fs = require('fs-extra');
	const Fuse = require('fuse.js');
	const os = require('os');
	const opn = require('opn');
	const path = require('path');
	const probe = require('probe-image-size');
	const req = require('requisition');
	var Mousetrap = require('mousetrap');
	const puppeteer = require('puppeteer-core');
	let browser;
	let page;

	// const sevenBin = require('7zip-bin');
	// const {
	// 	extractFull
	// } = require('node-7z');
	// const extract = (input, output, opt) => {
	// 	return new Promise((resolve, reject) => {
	// 		opt.$bin = sevenBin.path7za;
	// 		extractFull(input, output, opt)
	// 			.on('end', () => resolve())
	// 			.on('error', (err) => reject(err));
	// 	});
	// };

	let osType = os.type();
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

	const $ = require('jquery');
	window.$ = window.jQuery = $;
	window.Tether = require('tether');
	window.Bootstrap = require('bootstrap');
	String.prototype.insert = function(insert, index) {
		return this.substr(0, index) + insert + this.substr(index);
	}

	const markdown = require('markdown-it')();
	global.md = (str) => {
		return markdown.render(str);
	};
	const pDog = require('pug');
	global.pug = (str, locals, insert) => {
		str = pDog.compile(str)(locals);
		if (insert) {
			str = str.insert(insert, str.lastIndexOf('<'));
		}
		return str;
	};
	const klaw = function(dir, options) {
		return new Promise((resolve, reject) => {
			let items = [];
			let i = 0;
			require('klaw')(dir, options)
				.on('data', item => {
					if (i > 0) {
						items.push(item.path);
					}
					i++;
				})
				.on('end', () => resolve(items))
				.on('error', (err, item) => reject(err, item));
		});
	};

	// bottlenose dir location cannot be changed
	// only used to store small files, no images
	// the user's preferences and game libs json databases
	const usrDir = path.join(os.homedir(), '/Documents/emu/bottlenose');
	log(usrDir);
	global.cui = require('./contro-ui.js');
	const elec = require('./electronWrap.js');

	// get the default prefrences
	let prefsDefaultPath = path.join(__rootDir, '/prefs/prefsDefault.json');
	let prefsDefault = JSON.parse(await fs.readFile(prefsDefaultPath));
	let prefsPath = usrDir + '/_usr/prefs.json';
	let prefs = prefsDefault;
	// I assume the user is using a smooth scroll trackpad
	// or apple mouse with their Mac
	prefs.ui.mouse.wheel.multi = ((!mac) ? 1 : 0.25);
	prefs.ui.mouse.wheel.smooth = ((!mac) ? false : true);
	let systems = ['wii', 'ds', 'wiiu', '3ds', 'switch', 'ps3', 'ps2'];
	if (win) {
		systems.push('xbox360');
	} else if (mac) {
		systems = ['wii', 'ds', '3ds', 'switch', 'ps2'];
	}
	let sys;
	let sysStyle = '';
	let emuDir = '';
	let btlDir = '';
	let outLog = '';
	let games = [];
	let themes;
	let theme;
	let emu;
	let defaultCoverImg;
	let templateAmt = 4;

	let normalizeButtonLayout = {
		map: {
			x: 'y',
			y: 'x'
		},
		disable: 'nintendo'
	};

	const olog = (msg) => {
		log(msg.replace(/[\t\r\n]/gi, '').replace(':', ': '));
		outLog += '\r\n' + msg + '\r\n';
	};

	let introFiles = {
		css: {},
		html: {}
	};

	// retrieves the loading sequence files, some are pug not plain html
	async function getIntroFile(type) {
		let fType = ((type == 'css') ? 'css' : 'html');
		if (!introFiles[fType][sysStyle]) {
			let introFile = path.join(__dirname, `../${type}/${sysStyle}Load.${type}`);
			if (await fs.exists(introFile)) {
				if (type == 'css') {
					introFiles[fType][sysStyle] = `
					<link class="introStyle" rel="stylesheet" type="text/css" href="${introFile}">
					`;
				} else {
					introFile = await fs.readFile(introFile, 'utf8');
					if (type == 'pug') {
						introFile = pug(introFile);
					}
					introFiles[fType][sysStyle] = introFile;
				}
			} else {
				if (type == 'pug') {
					getIntroFile('html');
				} else {
					introFiles[fType][sysStyle] = '';
				}
			}
		}
		$('body').prepend(introFiles[fType][sysStyle]);
	}

	async function intro() {
		await getIntroFile('pug');
		await getIntroFile('css');
		let hasJS = await fs.exists(path.join(__dirname, `../js/${sysStyle}Load.js`));
		if (hasJS) {
			require(`../js/${sysStyle}Load.js`)();
		}
		$('#dialogs').show();
	}

	function addGame(fuse, searchTerm) {
		let results = fuse.search(searchTerm.substr(0, 32));
		if (opt.v) {
			log(results);
		}
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
		return;
	}

	async function reset() {
		let _games = games;
		games = [];
		let gameDB = [];
		let DBPath = path.join(__rootDir, `/db/${sys}DB.json`);
		gameDB = JSON.parse(await fs.readFile(DBPath)).games;
		if (opt.v) {
			log(gameDB);
		}

		let idRegex;
		if (sys == 'switch') {
			idRegex = /(?:^|[\[\(])([A-Z0-9]{3}[A-Z](?:|[A-Z0-9]))(?:[\]\)]|$)/;
		} else if (sys == 'ps3') {
			idRegex = /(?:^|[\[\(])(\w{9})(?:[\]\)]|_INSTALL|$)/;
		} else if (sys == 'wii' || sys == 'wiiu') {
			idRegex = /(?:^|[\[\(])([A-Z0-9]{3}[A-Z](?:|[A-Z0-9]{2}))(?:[\]\)]|$)/;
		} else if (sys == '3ds' || sys == 'ds') {
			idRegex = /(?:^|[\[\(])([A-Z][A-Z0-9]{2}[A-Z])(?:[\]\)]|$)/;
		} else if (sys == 'gba') {
			idRegex = /(?:^|[\[\(])([A-Z0-9]{8})(?:[\]\)]|$)/;
		} else if (sys == 'ps2') {
			idRegex = /(?:^|[\[\(])([A-Z]{4}-[0-9]{5})(?:[\]\)]|$)/;
		} else if (sys == 'xbox360') {
			idRegex = /(?:^|[\[\(])([0-9A-FGLZ]{8})(?:[\]\)]|$)/;
		}

		let searchOpt = {
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
		let fuse = new Fuse(gameDB, searchOpt);
		for (let h = 0; h < prefs[sys].libs.length; h++) {
			let files = await klaw(prefs[sys].libs[h], {
				depthLimit: 0
			});
			let file;
			// a lot of pruning is required to get good search results
			for (let i = 0; i < files.length; i++) {
				file = files[i];
				let term = path.parse(file);
				if (term.base[0] == '.') {
					continue;
				}
				// fixes an issue where folder names were split by periods
				// wiiu and ps3 store games in folders not single file .iso, .nso, etc.
				if (sys != 'wiiu' && sys != 'ps3') {
					term = term.name;
				} else {
					term = term.base;
				}
				olog('file:\t\t\t' + term);
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
					term = term.replace(/thousand year/gi, 'Thousand-Year');
				}
				term = term.replace(/s*m *64n*/gi, 'Super Mario 64');
				term = term.replace(/mk(\d+)/gi, 'Mario Kart $1');
				// special check for ids
				let id;
				if (idRegex) {
					id = term.match(idRegex);
				}
				if (id) {
					id = id[1];
					let game = gameDB.find(x => x.id === id);
					if (game) {
						if (sys == 'ps3') {
							let dup = games.find(x => x.title === game.title);
							if (dup) {
								continue;
							}
						}
						olog('id:\t\t\t\t' + id);
						olog('found match:\t\t' + game.title + '\r\n');
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
				} else if (sys == 'switch') {
					term = term.replace(/Nintendo Labo/gi, 'Nintendo Labo -');
				}
				// special subs part 3
				term = term.replace(/lego/gi, 'lego');
				term = term.replace(/warioware,*/gi, 'Wario Ware');
				term = term.replace(/ bros( |$)/gi, ' Bros. ');
				term = term.replace(/(papermario|paper mario[^\: ])/gi, 'Paper Mario');
				// eliminations part 3
				term = term.replace(/[\[\(]*(v*\d+\.|rev *\d).*/gi, '');
				term = term.replace(/\[[^\]]*\]/g, '');
				term = term.replace(/ *decrypted */gi, '');

				term = term.trim();
				let game = addGame(fuse, term);
				olog('search term:\t\t' + term);
				if (game) {
					olog('found match:\t\t' + game.title + '\r\n');
					game.file = '$' + h + '/' + path.relative(prefs[sys].libs[h], file);
					games.push(game);
				} else {
					olog('no match found\r\n');
				}
			}
		}
		let outLogPath = `${usrDir}/_usr/${sys}Log.log`;
		await fs.outputFile(outLogPath, outLog);
		outLog = '';
		for (let i in games) {
			let id = games[i].id;
			let _game = _games.find(x => x.id === id);
			if (_game && _game.gf) {
				games[i].gf = _game.gf;
			} else {
				$('#loadDialog0').text('indexing ' + games[i].title);
				let gf = await getGamefaqsURL(sys, games[i]);
				if (!gf) {
					continue;
				}
				gf = gf.substr(30).split(/[/-]/);
				if (sys == 'wii') {
					if (gf[0] == 'gamecube') {
						gf[0] = 'gcn';
					}
					games[i].sys = gf[0];
				}
				games[i].gf = gf[1];
			}
		}
		await outputGamesJSON();
	}

	async function outputGamesJSON() {
		let gamesPath = `${usrDir}/_usr/${sys}Games.json`;
		await fs.outputFile(gamesPath, JSON.stringify({
			games: games
		}));
	}

	async function reload() {
		cui.uiStateChange('loading');
		$('body').removeClass();
		sysStyle = (prefs[sys].style || sys);
		$('body').addClass(sys + ' ' + sysStyle);

		await intro();
		let gamesPath = `${usrDir}/_usr/${sys}Games.json`;
		// if prefs exist load them if not copy the default prefs
		if (await fs.exists(gamesPath)) {
			games = JSON.parse(await fs.readFile(gamesPath)).games;
		} else {
			if (!emuDir) {
				cui.uiStateChange('setupMenu');
				await removeIntro(0);
				return;
			}
			let gameLibDir = `${emuDir}/${prefs[sys].emu}/GAMES`;
			if (sys == 'ps3') {
				gameLibDir = `${emuDir}/${prefs[sys].emu}/BIN/dev_hdd0/game`;
			}

			for (let i = 0; !gameLibDir || !(await fs.exists(gameLibDir)); i++) {
				if (i >= 1) {
					cui.uiStateChange('setupMenu');
					await removeIntro(0);
					cui.err(`Game library does not exist`);
					return;
				}
				gameLibDir = elec.selectDir(`select ${sys} game directory`);
			}
			let files = await klaw(gameLibDir);
			for (let i = 0; !files.length || (files.length == 1 &&
					path.parse(files[0]).base == '.DS_Store'); i++) {
				if (i >= 1) {
					await removeIntro(0);
					cui.uiStateChange('setupMenu');
					cui.err(`Game library has no game files`);
					return;
				}
				gameLibDir = elec.selectDir(`select ${sys} game directory`);
				files = await klaw(gameLibDir);
			}
			gameLibDir = gameLibDir.replace(/\\/g, '/');
			if (await fs.exists(gameLibDir)) {
				if (!prefs[sys].libs) {
					prefs[sys].libs = [];
				}
				if (!prefs[sys].libs.includes(gameLibDir)) {
					prefs[sys].libs.push(gameLibDir);
				}
			} else {
				cui.err(`Couldn't load game library`);
				await reload();
				return;
			}
			$('#loadDialog2').text('this may take a few minutes, sit back and relax!');
			await reset();
		}
		btlDir = emuDir + '/bottlenose';
		btlDir = btlDir.replace(/\\/g, '/');
		await fs.ensureDir(btlDir);
		prefs.btlDir = btlDir;
		prefs.session.sys = sys;
		cui.mapButtons(prefs.ui.gamepad, prefs.session, normalizeButtonLayout);
		await fs.outputFile(prefsPath, JSON.stringify(prefs, null, '\t'));
		await viewerLoad();
		await removeIntro();
		cui.uiStateChange('libMain', sysStyle);
	}

	async function load() {
		let files = await klaw(path.join(__rootDir, '/views/md'));
		log(files);
		for (let file of files) {
			file = file;
			log(file);
			let html = await fs.readFile(file, 'utf8');
			let fileName = path.parse(file).name;
			if (fileName == 'setupMenu') {
				if (win) {
					html += `
Windows users should not store emulator apps or games in \`Program Files\` or any other folder that Bottlenose will not have read/write access to.  On Windows, Bottlenose will look for emulator executables in the \`BIN\` folder or the default install location of that emulator.
\`\`\`
	emu (root folder can have any name)
	└─┬ Dolphin
		├─┬ BIN
		│ ├── User/...
		│ ├── portable.txt
		│ └── Dolphin.exe
		└─┬ GAMES
			├── Super Mario Sunshine.gcz
			├── Super Smash Bros Melee.iso
			└── sm64.wad
\`\`\`
`;
				} else {
					if (mac) {
						html += 'On macOS, Bottlenose will look for emulator apps in `/Applications/`';
					} else {
						html += 'On Linux, Bottlenose will look for emulator apps in their default install locations.';
					}
					html += `
\`\`\`
	emu (root folder can have any name)
	└─┬ Dolphin
		└─┬ GAMES
			├── Super Mario Sunshine.gcz
			├── Super Smash Bros Melee.iso
			└── sm64.wad
\`\`\`
`;
				}
				html += 'Choose "continue" when you\'re ready.';
				html = html.replace(/\t/g, '  ');
			}
			if (fileName == 'welcomeMenu') {
				html = pug('.md', null, md(html) + pug(`img(src="../img/icon.png")`));
			} else {
				html = pug('.md', null, md(html));
			}
			file = path.parse(file);
			$('#' + file.name).prepend(html);
		}
		if (await fs.exists(prefsPath)) {
			let prefs1 = JSON.parse(await fs.readFile(prefsPath));
			deepExtend(prefs, prefs1);
			emuDir = path.join(prefs.btlDir, '..');

			// clean up previous versions of the prefs file
			if (prefs.ui.gamepad.mapping) {
				delete prefs.ui.gamepad.mapping;
			}
		}
		// currently supported systems
		let sysMenuHTML = '.row-y\n';
		for (let i = 0; i < systems.length; i++) {
			sys = systems[i];
			let text = ((prefs[sys].style || '') + ' ' + sys).trim();
			sysMenuHTML += `\t.uie(name="${sys}") ${text}\n`;
		}
		$('#sysMenu').append(pug(sysMenuHTML));
		if (prefs.ui.autoHideCover) {
			$('nav').toggleClass('hide');
		}
		$('nav').hover(function() {
			if (prefs.ui.autoHideCover) {
				$('nav').toggleClass('hide');
				if (!$('nav').hasClass('hide')) {
					cui.resize(true);
				}
			}
		});
		sys = prefs.session.sys;
		cui.mapButtons(prefs.ui.gamepad, prefs.session, normalizeButtonLayout);
	}

	cui.setResize((adjust) => {
		if (!$('nav').hasClass('hide')) {
			let $cv = $('.cover.view');
			let $cvSel = $cv.find('#view');
			let cvHeight = $cv.height();
			let cpHeight = $('.cover.power').height();
			if (adjust || cvHeight != cpHeight) {
				$cvSel.css('margin-top', (cpHeight + 24) * .5);
				$('nav').height(cpHeight + 24);
			}
		}
	});

	cui.setUIOnChange((state, subState, gamepadConnected) => {
		let labels = ['', '', ''];
		if (state == 'coverSelect' || state == 'infoSelect') {
			labels = ['Play', '', 'Back'];
			cui.getCur().toggleClass('no-outline');
		} else if (state == 'libMain') {
			labels = ['Power', 'Reset', 'Open'];
			cui.getCur().removeClass('no-outline');
		} else if (state == 'sysMenu' || state == 'pauseMenu' || (/game/i).test(state)) {
			labels = ['', '', 'Back'];
		}
		if (subState == 'gcn') {
			for (let i = 0; i < labels.length; i++) {
				labels[i] = labels[i].toLowerCase();
			}
		}
		$('.text.power').text(labels[0]);
		$('.text.reset').text(labels[1]);
		$('.text.open').text(labels[2]);

		function adjust(flip) {
			if (flip && $('nav.fixed-top').find('#view').length) {
				$('.cover.open').css({
					"border-radius": "0 0 0 32px",
					"border-width": "0 0 8px 0"
				}).appendTo('nav.fixed-top');
				$('.cover.view').css({
					"border-radius": "32px 0 0 0",
					"border-width": "8px 0 0 0"
				}).appendTo('nav.fixed-bottom');
			} else if (!flip && $('nav.fixed-top').find('#open').length) {
				$('.cover.open').css({
					"border-radius": "32px 0 0 0",
					"border-width": "8px 0 0 0"
				}).appendTo('nav.fixed-bottom');
				$('.cover.view').css({
					"border-radius": "0 0 0 32px",
					"border-width": "0 0 8px 0"
				}).appendTo('nav.fixed-top');
			}
		}
		let buttons = ['X', 'Y', 'B'];
		if ((/xbox/i).test(subState)) {
			buttons = ['Y', 'X', 'B'];
			adjust(true);
		} else if ((/ps/i).test(subState)) {
			buttons = ['', '', ''];
			adjust(true);
		} else {
			adjust(false);
		}

		if (!gamepadConnected || !subState) {
			return;
		}
		$('#power span').text(buttons[0]);
		$('#reset span').text(buttons[1]);
		$('#open span').text(buttons[2]);
	});

	async function removeIntro(time) {
		if (cui.ui != 'errMenu') {
			await delay(time || 2000);
		}
		$('#intro').remove();
		$('link.introStyle').prop('disabled', true);
		$('link.introStyle').remove();
		$('#dialogs').hide();
		$('#loadDialog2').text('');
	}

	async function powerBtn() {
		let id = cui.getCur('libMain').attr('id');
		if (!id && cui.ui == 'coverSelect') {
			cui.err('cursor was not on a game');
			return;
		}
		let emuAppPath = await getEmuAppPath();
		if (!emuAppPath) {
			return;
		}
		let gameFile;
		let args = [];
		emuDirPath = path.join(emuAppPath, '..');
		if (linux) {
			if (emu == 'citra') {
				emuAppPath = 'org.citra.citra-canary'
			}
		}
		if (cui.ui == 'coverSelect') {
			gameFile = games.find(x => x.id === id);
			if (gameFile) {
				gameFile = getAbsolutePath(gameFile.file);
			} else {
				cui.err('game not found: ' + id);
				return;
			}
			if (emu == 'rpcs3') {
				gameFile += '/USRDIR/EBOOT.BIN';
			}
			if (emu == 'cemu') {
				let files = await klaw(gameFile + '/code');
				log(files);
				let ext, file;
				for (let i = 0; i < files.length; i++) {
					file = files[i];
					ext = path.parse(file).ext;
					if (ext == '.rpx') {
						gameFile = file;
						break;
					}
				}
			}
		}
		log(emu);
		let cmdArray = prefs[sys].cmd[osType];
		for (let arg of cmdArray) {
			if (arg == '${app}') {
				args.push(emuAppPath);
				if (cui.ui == 'libMain') {
					return;
				}
			} else if (arg == '${game}') {
				args.push(gameFile);
			} else {
				args.push(arg);
			}
		}

		if (cui.ui != 'libMain') {
			cui.removeView('libMain');
			cui.uiStateChange('playingBack');
		}
		log(args);
		log(emuDirPath);
		try {
			// animatePlay();
			await spawn(args[0], args.slice(1) || [], {
				cwd: emuDirPath,
				stdio: 'inherit'
			});
		} catch (ror) {
			cui.err(`${prefs[sys].emu} was unable to start the game or crashed.  This is probably not an issue with Bottlenose.  If you were unable to start the game, setup ${emu} if you haven't already.  Make sure it will boot the game and try again.  \n${args.toString()}\n${ror}`);
		}
		remote.getCurrentWindow().focus();
		remote.getCurrentWindow().setFullScreen(true);
		if (cui.ui != 'libMain') {
			await intro();
			await viewerLoad();
			await removeIntro();
			if (cui.ui == 'playingBack') {
				cui.uiStateChange('libMain');
			}
		}
	}

	async function resetBtn() {
		cui.removeView('libMain');
		cui.uiStateChange('resetting');
		await intro();
		await reset();
		await viewerLoad();
		await removeIntro();
		cui.uiStateChange('libMain');
		cui.scrollToCursor(0);
	}

	async function createTemplate(emuDir) {
		for (let i = 0; i < systems.length; i++) {
			let emu = prefs[systems[i]].emu;
			if (win) {
				await fs.ensureDir(`${emuDir}/${emu}/BIN`);
			}
			await fs.ensureDir(`${emuDir}/${emu}/GAMES`);
		}
	}

	async function doHeldAction(act, isBtn, timeHeld) {
		log(act + " held for " + timeHeld);
		if (ui == 'playingBack') {
			if (act == start && timeHeld > 3000) {
				// TODO quit emulator app
			}
		}
	}

	function coverClicked(select) {
		let $cur = cui.getCur();
		let classes = $cur.attr('class').split(' ');
		if (classes.includes('uie-disabled')) {
			return false;
		}
		let $reel = $cur.parent();
		cui.scrollToCursor(1000, 0);
		$cur.toggleClass('selected');
		$reel.toggleClass('selected');
		$('.reel').toggleClass('bg');
		// $('nav').toggleClass('gamestate');
		if ($cur.hasClass('selected')) {
			$reel.css('left', `${$(window).width()*.5-$cur.width()*.5}px`);
			$cur.css('transform', `scale(${$(window).height()/$cur.height()})`);
		} else {
			$reel.css('left', '');
			$cur.css('transform', '');
		}
	}

	async function loadBrowser() {
		if (!browser) {
			if (!prefs.chromium || !(await fs.exists(prefs.chromium))) {
				prefs.chromium = require('chrome-finder')();
			}
			if (!prefs.chromium) {
				prefs.chromium = elec.selectFile('select chromium or chrome');
			}
			try {
				browser = await puppeteer.launch({
					executablePath: prefs.chromium
				});
			} catch (ror) {
				log(ror);
			}
		}
	}

	async function doAction(act, isBtn) {
		log(act);
		let ui = cui.ui;
		if (ui == 'playingBack') {
			return;
		}
		let onMenu = (/menu/gi).test(ui);
		if (act == 'quit') {
			await fs.outputFile(prefsPath, JSON.stringify(prefs, null, '\t'));
			app.quit();
			process.exit(0);
		}
		if (ui == 'libMain' || ui == 'coverSelect') {
			if (act == 'x') {
				await powerBtn();
			}
		}
		if (act == 'start' && !onMenu) {
			cui.uiStateChange('pauseMenu');
		} else if (act == 'b' && onMenu &&
			ui != 'donateMenu' && ui != 'setupMenu') {
			cui.doAction('back');
		} else if (act == 'view') {
			$('nav').toggleClass('hide');
			prefs.ui.autoHideCover = $('nav').hasClass('hide');
			if (!prefs.ui.autoHideCover) {
				cui.resize(true);
			}
		} else if (ui == 'libMain') {
			if (act == 'a') {
				coverClicked();
				cui.uiStateChange('coverSelect');
			} else if (act == 'b' && !onMenu) {
				cui.uiStateChange('sysMenu');
			} else if (act == 'y') {
				await resetBtn();
			}
		} else if (ui == 'coverSelect') {
			if (act == 'a') {
				return;
				// TODO finish open box menu
				let id = cui.getCur('libMain').attr('id');
				let game = games.find(x => x.id === id);
				let template = getTemplate();

				$('#gameBoxOpen').prop('src', await imgExists(template, 'boxOpen'));
				$('#gameBoxOpenMask').prop('src', await imgExists(template, 'boxOpenMask'));
				$('#gameMemory').prop('src', await imgExists(template, 'memoryFront'));
				$('#gameManual').prop('src', await imgExists(template, 'manual0'));

				let mediaName = 'disc';
				if (sys == 'switch' || sys == '3ds') {
					mediaName = 'cart';
				}
				let mediaImg = await imgExists(game, mediaName);
				if (!mediaImg) {
					mediaImg = await imgExists(template, mediaName);
				}
				$('#gameMedia').prop('src', mediaImg);
				cui.uiStateChange('infoSelect');
			} else if (act == 'b') {
				cui.uiStateChange('libMain');
				coverClicked();
			} else if (act == 'y' || act == 'flip') {
				log('flip cover not enabled yet');
			}
		} else if (ui == 'infoSelect') {
			if (act == 'texp') {
				await loadBrowser();
			}
			if (act != 'back' && !isBtn) {
				let state = 'game' + act[0].toUpperCase() + act.substr(1) + 'Select';
				$('#infoSelect').addClass('zoom-' + state);
				cui.uiStateChange(state);
			} else if (act == 'b') {
				cui.uiStateChange('libMain');
				coverClicked();
			}
		} else if ((/game/i).test(ui)) {
			if (act == 'b') {
				$('#infoSelect').removeClass('zoom-' + ui);
				cui.doAction('back');
			}
		} else if (ui == 'sysMenu' && !isBtn) {
			// if (!emu) {
			// 	return;
			// }
			cui.removeView('libMain');
			sys = act;
			cui.removeCursor();
			await reload();
		} else if (ui == 'pauseMenu' && !isBtn) {
			if (act == 'minimize') {
				remote.getCurrentWindow().minimize();
			} else if (act == 'fullscreen') {
				remote.getCurrentWindow().focus();
				remote.getCurrentWindow().setFullScreen(true);
			} else if (act == 'toggleCover') {
				cui.buttonPressed('view');
			} else if (act == 'openLog') {
				opn(`${usrDir}/_usr/${sys}Log.log`);
			} else if (act == 'prefs') {
				opn(prefsPath);
			}
		} else if (ui == 'donateMenu') {
			if (act == 'donate-monthly') {
				opn('https://www.patreon.com/qashto');
			} else if (act == 'donate-single') {
				opn('https://www.paypal.me/qashto/25');
			} else if (act == 'donate-later') {
				await reload();
			} else if (act == 'donated') {
				cui.uiStateChange('checkDonationMenu');
			}
		} else if (ui == 'checkDonationMenu') {
			let password = '\u0074\u0068\u0061\u006e\u006b\u0079\u006f\u0075\u0034\u0064\u006f\u006e\u0061\u0074\u0069\u006e\u0067\u0021';
			let usrDonorPass = $('#donorPassword').val();
			if (usrDonorPass == unicodeToChar(password)) {
				prefs.donor = true;
				await reload();
			} else {
				cui.uiStateChange('donateMenu');
				cui.err('incorrect donor password');
			}
		} else if (ui == 'welcomeMenu') {
			if (act == 'demo') {
				emuDir = os.homedir() + '/Documents/emu';
				let templatePath = path.join(__rootDir, '/demo');
				await fs.copy(templatePath, emuDir);
				await createTemplate(emuDir);
				await reload();
			} else if (act == 'full') {
				cui.uiStateChange('setupMenu');
			}
		} else if (ui == 'setupMenu') {
			if (act == 'new' || act == 'new-in-docs' || act == 'old') {
				let msg = `choose the folder you want to template to go in`;
				if (act == 'old') {
					msg = `choose the folder EMULATORS from your WiiUSBHelper file structure`;
				}
				if (act == 'new-in-docs') {
					emuDir = os.homedir() + '/Documents';
				} else {
					emuDir = elec.selectDir(msg);
				}
				if (!emuDir) {
					return false;
				}
				if (act != 'old') {
					emuDir += '/emu';
				}
				await createTemplate(emuDir);
				if (act != 'old') {
					opn(emuDir);
				}
			}
			if (act == 'continue' || act == 'old') {
				if (!(await fs.exists(emuDir))) {
					emuDir = os.homedir() + '/Documents/emu';
				}
				await createTemplate(emuDir);
				cui.uiStateChange('sysMenu');
			}
		}
	}
	cui.setCustomActions(doAction);

	function unicodeToChar(text) {
		return text.replace(/\\u[\dA-F]{4}/gi,
			function(match) {
				return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
			});
	}

	Mousetrap.bind(['command+n', 'ctrl+n'], function() {
		cui.buttonPressed('view');
		return false;
	});
	Mousetrap.bind(['command+option+i', 'ctrl+shift+i'], function() {
		remote.getCurrentWindow().toggleDevTools();
		return false;
	});
	Mousetrap.bind(['command+w', 'ctrl+w', 'command+q', 'ctrl+q'], function() {
		cui.doAction('quit');
		return false;
	});
	Mousetrap.bind(['space'], function() {
		return false;
	});
	Mousetrap.bind(['up', 'down', 'left', 'right'], function() {
		return false;
	});

	$('#power').click(function() {
		cui.buttonPressed('x');
	});
	$('#view').click(function() {
		cui.buttonPressed('start');
	});
	$('#reset').click(function() {
		cui.buttonPressed('y');
	});
	$('#open').click(function() {
		cui.buttonPressed('b');
	});

	async function dl(url, file) {
		if (!(await fs.exists(file))) {
			let res = await req(url);
			if (res.status == 404) {
				return;
			}
			$('#loadDialog1').text(url.replace(/\%20/g, ' '));
			log('loading image: ' + url);
			log('saving to: ' + file);
			await res.saveTo(file);
			$('#loadDialog1').text(' ');
		}
		return file;
	}

	async function dlNoExt(url, file) {
		let res;
		for (let i = 0; i < 2; i++) {
			if (i == 0) {
				res = await dl(url + '.jpg', file + '.jpg');
			} else if (i == 1) {
				res = await dl(url + '.png', file + '.png');
			}
			if (res) {
				return res;
			}
		}
		return;
	}

	function unwrapGFUrl(title, game) {
		let system = game.sys || sys;
		if (system == 'wiiu') {
			system = 'wii-u';
		} else if (system == 'gcn') {
			system = 'gamecube';
		}
		return `${sys}/${game.gf}-${title.replace(/ /g, '-')}`
	}

	async function dlFromGamefaqs(title, dir, name, game) {
		if (!browser) {
			await loadBrowser();
		}
		if (!browser) {
			return;
		}
		let $gf, url, res, ext;
		if (!game.gf) {
			return;
		}
		urlBase = 'https://gamefaqs.gamespot.com';
		url = urlBase + '/' + unwrapGFUrl(title, game);
		log(url);
		$gf = await goTo(url + '/images');
		url = $gf.find('#content .region:contains("US")').eq(0).prev().attr('href');
		if (!url) {
			return;
		}
		url = urlBase + url;
		log(url);
		$gf = await goTo(url);
		$gf = $gf.find('#content .img img');
		url = $gf.eq(0).attr('src');
		if (!url) {
			return;
		}
		ext = url.substr(-4);
		log(ext);
		if (name != 'coverSide') {
			res = await dl(url, dir + '/cover' + ext);
		}
		if (res || name == 'coverSide') {
			await dl(url.replace('front', 'side'), dir + '/coverSide' + ext);
		}
		if (res && prefs.ui.getBackCoverHQ) {
			await dl(url.replace('front', 'back'), dir + '/coverBack' + ext);
		}
		return res;
	}

	async function getGamefaqsURL(system, game) {
		if (!browser) {
			await loadBrowser();
		}
		if (!browser) {
			return;
		}
		let $gf, url;
		if (system == 'wiiu') {
			system = 'wii-u';
		} else if (system == 'gcn') {
			system = 'gamecube';
		}
		$gf = await goTo(`https://sitemap.gamefaqs.com/game/${system}/${game.title[0].toUpperCase()}/`);
		url = $gf.find(`a:contains("${game.title}")`).eq(0).attr('href');
		if (!url && system == 'wii') {
			if (game.id.length > 4) {
				url = await getGamefaqsURL('gcn', game);
			} else {
				url = await getGamefaqsURL('n64', game);
				if (!url) {
					url = await getGamefaqsURL('snes', game);
				}
				if (!url) {
					url = await getGamefaqsURL('nes', game);
				}
			}
		}
		return url;
	}

	let systemsMapForAndy = {
		wiiu: 'Nintendo Wii U',
		'3ds': 'Nintendo 3DS',
		ds: 'Nintendo DS',
		ps3: 'Sony PlayStation 3',
		ps2: 'Sony PlayStation 2',
		xbox360: 'Xbox 360',
		gba: 'Game Boy Advance',
		wii: 'Nintendo Wii',
		gcn: 'Nintendo Game Cube',
		n64: 'Nintendo 64',
		snes: 'Super Nintendo',
		nes: 'Nintendo'
	};

	async function dlFromAndy(title, dir, system) {
		system = systemsMapForAndy[system];
		let url = `http://andydecarli.com/Video Games/Collection/${system}/Scans/Full Size/${system} ${title}`;
		url = url.replace(/ /g, '%20');
		log(url);
		let res = await dl(url + `%20Front%20Cover.jpg`, dir + '/box.jpg');
		if (res && prefs.ui.getBackCoverHQ) {
			await dl(url + `%20Back%20Cover.jpg`, dir + '/boxBack.jpg');
		}
		return res;
	}

	let gb = {
		key: '77fc79812677f482659ce5f0f4e53b936eafda23',
		base: 'https://www.giantbomb.com/api',
		regex: {}
	};
	gb.params = `api_key=${gb.key}&format=json`;
	gb.search = `${gb.base}/search/?${gb.params}&resources=game&query=`;

	async function dlFromGiant(query) {
		if (!gb.regex['ps3']) {
			let regexStr = '(packag|disc|back|JP|Japan';
			let elminSystems = [
				'wii', 'ds', '3ds', 'switch', 'xbox',
				'ps3', 'ps2', 'pc', 'gamecube', 'gcn'
			];
			for (let elimSys of elminSystems) {
				regexStr += '|' + elimSys;
			}
			regexStr += ')';
			regexStr.replace('\|ps3', '');
			gb.regex['ps3'] = new RegExp(regexStr, 'i');
		}
		let url = gb.search + query;
		let res = await (await req(url)).json();
		let tags = res.results[0].image_tags;
		url = tags.find(x => x.name === 'Box Art').api_detail_url;
		url += '&' + gb.params;
		res = await (await req(url)).json();
		let images = res.results;
		let largestImgUrl = '';
		let largest = 0;
		for (let i in images) {
			images[i] = images[i].original_url;
			let size = (await probe(images[i]));
			log(images[i]);
			log(size.width + 'x' + size.height);
			if (size.height > largest) {
				let name = images[i].split('-')[1];
				if (!gb.regex['ps3'].test(name)) {
					largest = size.height;
					largestImgUrl = images[i];
				}
			}
		}
		opn(largestImgUrl);
	}

	async function getImgFileLocation(game, name) {
		let dir = `${prefs.btlDir}/${sys}/${game.id}/img`;
		let file;

	}

	async function getImg(game, name, skip) {
		let res = await imgExists(game, name);
		if (res) {
			return res;
		}
		let dir = `${prefs.btlDir}/${sys}/${game.id}/img`;
		let file, url;
		// check if game img is specified in the gamesDB
		if (game.img && game.img[name]) {
			url = game.img[name].split(/ \\ /);
			if (url[1]) {
				ext = url[1];
				url = url[0];
			} else {
				url = url[0];
				ext = url.substr(-3);
			}
			file = `${dir}/${name}.${ext}`;
			res = await dl(url, file);
			if (res) {
				return res;
			}
		}
		$('#loadDialog0').html(md(`scraping for the  \n${name}  \nof  \n${game.title}`));

		let title = game.title.replace(/[\:]/g, '');
		let systemsMap = {};
		// get high quality box from Andy Decarli's site
		if (sys != 'switch' && name == 'box') {
			if (sys != 'wii') {
				res = await dlFromAndy(title, dir, sys);
			} else if (game.id.length > 4) {
				res = await dlFromAndy(title, dir, 'gcn');
				if (!res) {
					res = await dlFromAndy(title, dir, 'wii');
				}
			} else {
				res = await dlFromAndy(title, dir, 'n64');
				if (!res) {
					res = await dlFromAndy(title, dir, 'snes');
				}
				if (!res) {
					res = await dlFromAndy(title, dir, 'nes');
				}
			}
			if (res) {
				return res;
			}
		}
		if (skip) {
			return;
		}

		if (sys != 'ps2' && sys != 'xbox360' && sys != 'gba' && name != 'coverSide') {
			// get image from gametdb
			file = `${dir}/${name}`;
			let id = game.id;
			for (let i = 0; i < 3; i++) {
				if (sys != 'switch' && i == 1) {
					break;
				}
				if (i == 1) {
					id = id.substr(0, id.length - 1) + 'B';
				}
				if (i == 2) {
					id = id.substr(0, id.length - 1) + 'C';
				}
				let locale = 'US';
				if (sys == 'ps3') {
					if (id[2] == 'E') {
						locale = 'EN';
					}
				}
				url = `https://art.gametdb.com/${sys}/${((name!='coverFull')?name:'coverfull')}HQ/${locale}/${id}`;
				log(url);
				res = await dlNoExt(url, file);
				if (res) {
					return res;
				}
				url = url.replace(name + 'HQ', name + 'M');
				res = await dlNoExt(url, file);
				if (res) {
					return res;
				}
				url = url.replace(name + 'M', name);
				res = await dlNoExt(url, file);
				if (res) {
					return res;
				}
			}
		}

		if (name == 'cover' || name == 'coverSide') {
			res = await dlFromGamefaqs(title, dir, name, game);
			if (res) {
				return res;
			}
		}

		return;
	}

	function getTemplate() {
		if (!theme.template.box) {
			theme.template.box = '';
		}
		return {
			id: '_TEMPLATE',
			title: 'Template',
			img: theme.template
		};
	}

	async function loadImages() {
		let imgDir;
		for (let i = 0; i < games.length + 1; i++) {
			let res;
			let game;
			if (i == games.length) {
				game = getTemplate();
			} else {
				game = games[i];
			}
			imgDir = `${prefs.btlDir}/${sys}/${game.id}/img`;
			if (prefs.ui.recheckImgs || !(await fs.exists(imgDir))) {
				await getImg(game, 'box', 'highQuality');
				res = await getImg(game, 'coverFull');
				if (!res) {
					await getImg(game, 'coverSide');
				}
				if (!res && !(await imgExists(game, 'box'))) {
					res = await getImg(game, 'cover');
					if (!res) {
						await getImg(game, 'box');
					}
				}
				if (sys != 'switch' && sys != '3ds') {
					await getImg(game, 'disc');
				} else {
					await getImg(game, 'cart');
				}
			}
		}
		defaultCoverImg = await getImg(theme.default, 'box');
		if (!defaultCoverImg) {
			log('ERROR: No default cover image found');
			return;
		}

		games = games.sort((a, b) => a.title.localeCompare(b.title));
	}

	async function imgExists(game, name) {
		let file = `${prefs.btlDir}/${sys}/${game.id}/img/${name}.png`;
		if (!(await fs.exists(file))) {
			file = file.substr(0, file.length - 3) + 'jpg';
			if (!(await fs.exists(file))) {
				return;
			}
			return file;
		}
		return file;
	}

	async function addCover(game, reelNum) {
		let cl1 = '';
		let file = await imgExists(game, 'box');
		if (!file) {
			file = await imgExists(game, 'coverFull');
			cl1 = 'front-cover-crop ' + sys;
			if (!file) {
				file = await imgExists(game, 'cover');
				cl1 = 'front-cover ' + sys;
				if (!file) {
					log(`no images found for game: ${game.id} ${game.title}`);
					await fs.remove(`${prefs.btlDir}/${sys}/${game.id}`);
					return;
				}
			}
		}
		$('.reel.r' + reelNum).append(pug(`
#${game.id}.uie${((game.id != '_TEMPLATE')?'':'.uie-disabled')}
	${((cl1)?`img.box(src="${defaultCoverImg}")`:'')}
	section${((cl1)?'.'+cl1: '')}
		img${((cl1)?'.cov': '.box')}(src="${file}")
		${((cl1)?'.shade.p-0.m-0':'')}
		`));
	}

	async function animatePlay() {
		await delay(10000);
		remote.getCurrentWindow().minimize();
	}

	function getAbsolutePath(file) {
		if (!file) {
			return '';
		}
		let lib = file.match(/\$\d+/g);
		if (lib) {
			lib = lib[0].substr(1);
			log(lib);
			file = file.replace(/\$\d+/g, prefs[sys].libs[lib]);
		}
		let tags = file.match(/\$[a-zA-Z]+/g);
		if (!tags) {
			return file;
		}
		let replacement = '';
		for (tag of tags) {
			tag = tag.substr(1);
			if (tag == 'home') {
				replacement = os.homedir().replace(/\\/g, '/');;
			}
			file = file.replace('$' + tag, replacement);
		}
		return file;
	}

	async function getEmuAppPath() {
		let emuAppPath = getAbsolutePath(prefs[sys].app[osType]);
		if (emuAppPath && await fs.exists(emuAppPath)) {
			return emuAppPath;
		}
		emuAppPath = '';
		let emuDirPath = '';
		if (win || (linux && (/(cemu|yuzu|rpcs3)/).test(emu))) {
			emuDirPath = path.join(prefs.btlDir,
				`../${prefs[sys].emu}/BIN`);
			if (emu == 'citra') {
				if (await fs.exists(emuDirPath + '/nightly-mingw')) {
					emuDirPath += '/nightly-mingw';
				} else {
					emuDirPath += '/canary-mingw';
				}
			}
			if (win && emu == 'yuzu') {
				emuDirPath = os.homedir() + '/AppData/Local/yuzu';
				if (await fs.exists(emuDirPath + '/canary')) {
					emuDirPath += '/canary';
				} else {
					emuDirPath += '/nightly';
				}
			}
		} else if (mac) {
			emuDirPath = '/Applications';
		}
		let emuNameCases = [
			prefs[sys].emu,
			prefs[sys].emu.toLowerCase(),
			prefs[sys].emu.toUpperCase()
		];
		for (let i = 0; i < emuNameCases.length; i++) {
			if (emuDirPath) {
				emuAppPath = emuDirPath + '/';
			}
			emuAppPath += emuNameCases[i];
			if (win) {
				if (emu == 'citra') {
					emuAppPath += '-qt';
				}
				emuAppPath += '.exe';
			} else if (mac) {
				if (emu == 'citra') {
					emuAppPath += `/nightly/${emuNameCases[1]}-qt`;
				} else if (emu == 'yuzu') {
					emuAppPath += '/' + emuNameCases[1];
				}
				emuAppPath += '.app/Contents/MacOS';
				if (emu == 'desmume') {
					emuAppPath += '/' + emuNameCases[0];
				} else {
					emuAppPath += '/' + emuNameCases[1];
				}
				if (emu == 'citra') {
					emuAppPath += '-qt-bin';
				} else if (emu == 'yuzu') {
					emuAppPath += '-bin';
				}
			} else if (linux) {
				if (emu == 'dolphin') {
					emuAppPath = 'dolphin-emu';
				} else if (emu == 'cemu') {
					emuAppPath += '.exe';
				} else if (emu == 'rpcs3') {
					emuAppPath += '.AppImage';
				}
			}
			if ((linux && !(/(cemu|yuzu|rpcs3)/).test(emu)) || await fs.exists(emuAppPath)) {
				prefs[sys].app[osType] = emuAppPath;
				return emuAppPath;
			}
		}
		emuAppPath = elec.selectFile('select emulator app');
		if (mac) {
			emuAppPath += '/Contents/MacOS/' + emuNameCases[1];
			if (emu == 'citra') {
				emuAppPath += '-qt-bin';
			} else if (emu == 'yuzu') {
				emuAppPath += '-bin';
			}
		}
		if (!(await fs.exists(emuAppPath))) {
			cui.err('app path not valid: ' + emuAppPath);
			return '';
		}
		prefs[sys].app[osType] = emuAppPath;
		return emuAppPath;
	}

	async function addTemplates(template, rows, num) {
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < num; j++) {
				await addCover(template, i);
			}
		}
	}

	async function viewerLoad() {
		cui.resize(true);
		let shouldRebindMouse;
		if (emu) {
			shouldRebindMouse = true;
		}
		emu = prefs[sys].emu.toLowerCase();
		if (!themes) {
			let themesPath = path.join(global.__rootDir, '/prefs/themes.json');
			themes = JSON.parse(await fs.readFile(themesPath));
		}
		theme = themes[prefs[sys].style || sys];
		theme.style = prefs[sys].style || sys;
		cui.setMouse(prefs.ui.mouse, 100 * prefs.ui.mouse.wheel.multi);
		await loadImages();
		let rows = 8;
		if (games.length < 18) {
			rows = 4;
		}
		if (games.length < 8) {
			rows = 2;
		}
		$('style.gameViewerRowsStyle').remove();
		let $glv = $('#libMain');
		let dynRowStyle = `<style class="gameViewerRowsStyle" type="text/css">.reel {width: ${1 / rows * 100}%;}`
		for (let i = 0; i < rows; i++) {
			$glv.append(pug(`.reel.r${i}.row-y.${((i % 2 == 0)?'reverse':'normal')}`));
			dynRowStyle += `.reel.r${i} {left:  ${i / rows * 100}%;}`
		}
		dynRowStyle += `.cui-gamepadConnected .reel .uie.cursor {
	outline: ${Math.abs(7-rows)}px dashed white;
	outline-offset: ${ 9-rows}px;
}`;
		dynRowStyle += '</style>';
		$('body').append(dynRowStyle);
		let template = getTemplate();
		await addTemplates(template, rows, templateAmt);
		for (let i = 0, j = 0; i < games.length; i++) {
			try {
				for (let k = 0; k < rows; k++) {
					if (i < games.length * (k + 1) / rows) {
						await addCover(games[i], k);
						break;
					}
				}
				j++;
			} catch (ror) {
				log(ror);
			}
		}
		await addTemplates(template, rows, templateAmt);
		cui.addView('libMain');
		$('#dialogs').hide();
		$('#view').css('margin-top', '20px');
		if (!shouldRebindMouse) {
			cui.rebind('mouse');
		}
	}

	async function goTo(url) {
		// if a page is already open, then close it
		if (page) {
			await page.close();
		}
		page = await browser.newPage();
		await page.setRequestInterception(true);
		page.on('request', request => {
			if (request.resourceType === 'image' || request.resourceType === 'media' || request.resourceType === 'font') {
				request.abort();
			} else {
				request.continue();
			}
		});
		await page.goto(url);
		return $('<div/>').append(await page.content());
	}

	remote.getCurrentWindow().setFullScreen(true);
	await load();
	if (prefs.donor) {
		await reload();
	} else if (await fs.exists(prefsPath) && !prefs.donor) {
		cui.uiStateChange('donateMenu');
	} else {
		cui.uiStateChange('welcomeMenu');
	}
	cui.start({
		v: true
	});
	await delay(1000);
	cui.resize(true);
};
