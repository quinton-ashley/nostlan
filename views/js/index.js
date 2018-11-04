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
	const deepExtend = require('deep-extend');
	const delay = require('delay');
	const fs = require('fs-extra');
	const Fuse = require('fuse.js');
	const klawSync = require('klaw-sync');
	const os = require('os');
	const opn = require('opn');
	const path = require('path');
	var Mousetrap = require('mousetrap');
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
	global.pug = (str, insert) => {
		str = pDog.compile(str)();
		if (insert) {
			str = str.insert(insert, str.lastIndexOf('<'));
		}
		return str;
	};

	// bottlenose dir location cannot be changed
	// only used to store small files, no images
	// the user's preferences and game libs json databases
	const usrDir = path.join(os.homedir(), '/Documents/emu/bottlenose');
	log(usrDir);
	global.cui = require('../js/contro-ui.js');
	const viewer = require('../js/gameLibViewer.js');

	// get the default prefrences
	let prefsDefaultPath = path.join(__rootDir, '/prefs/prefsDefault.json');
	let prefsDefault = JSON.parse(await fs.readFile(prefsDefaultPath));
	let prefsPath = usrDir + '/_usr/prefs.json';
	let prefs = prefsDefault;
	// I assume the user is using a smooth scroll trackpad
	// or apple mouse with their Mac
	prefs.ui.mouse.wheel.multi = ((!mac) ? 1 : 0.25);
	prefs.ui.mouse.wheel.smooth = ((!mac) ? false : true);
	let systems = ['wii', 'ds', 'wiiu', '3ds', 'switch', 'ps3'];
	if (mac) {
		systems = ['wii', 'ds', '3ds', 'switch'];
	}
	let sys;
	let sysStyle = '';
	let emuDir = '';
	let btlDir = '';
	let games = [];

	let introFiles = {
		css: {},
		html: {}
	};

	// retrieves the loading sequence files, some are pug not plain html
	async function getIntroFile(type) {
		let fType = ((type == 'css') ? 'css' : 'html');
		if (!introFiles[fType][sysStyle]) {
			let introFile = path.join(__dirname,
				`../${type}/${sysStyle}Load.${type}`);
			if (fs.existsSync(introFile)) {
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
		let hasJS = fs.existsSync(path.join(__dirname, `../js/${sysStyle}Load.js`));
		if (hasJS) {
			require(`../js/${sysStyle}Load.js`)();
		}
		$('#dialogs').show();
		// await delay(1000);
	}

	// function openLib() {
	// 	let dir = dialog.showOpenDialog({
	// 		properties: ['openDirectory'],
	// 		title: `open ${sys} game library`,
	// 		message: `choose the ${sys} game library`
	// 	});
	// 	return dir[0];
	// }

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
		games = [];
		let gameDB = [];
		let DBPath = path.join(__rootDir, `/db/${sys}DB.json`);
		gameDB = JSON.parse(await fs.readFile(DBPath)).games;
		if (opt.v) {
			log(gameDB);
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
			let files = klawSync(prefs[sys].libs[h], {
				depthLimit: 0
			});
			let file;
			// a lot of pruning is required to get good search results
			for (let i = 0; i < files.length; i++) {
				file = files[i].path;
				log(file);
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
				// eliminations part 1
				term = term.replace(/[\[\(](USA|World)[\]\)]/gi, '');
				term = term.replace(/[\[\(]*(NTSC)+(-U)*[\]\)]*/gi, '');
				term = term.replace(/[\[\(]*(N64|GCN)[,]*[\]\)]*/gi, '');
				term = term.replace(/[\[\(,](En|Ja|Eu)[^\]\)]*[\]\)]*/gi, '');
				// special complete subs part 1
				if (sys == 'wii') {
					term = term.replace(/ssbm/gi, 'Super Smash Bros. Melee');
					term = term.replace(/thousand year/gi, 'Thousand-Year');
				}
				term = term.replace(/sm *64/gi, 'Super Mario 64');
				term = term.replace(/mk(\d+)/gi, 'Mario Kart $1');
				// special check for ids
				log(term);
				let id;
				if (sys == 'switch') {
					id = term.match(/(?:^|[\[\(])([A-Z0-9]{3}[A-Z](?:|[A-Z0-9]))(?:[\]\)]|$)/);
				} else if (sys == 'ps3') {
					id = term.match(/(?:^|[\[\(])(\w{9})(?:[\]\)]|_INSTALL|$)/);
				} else {
					id = term.match(/(?:^|[\[\(])([A-Z0-9]{3}[A-Z](?:|[A-Z0-9]{2}))(?:[\]\)]|$)/);
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
						log('id: ' + id);
						log(game.title);
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
				log(term);
				let game = addGame(fuse, term);
				if (game) {
					log(game.title);
					game.file = '$' + h + '/' + path.relative(prefs[sys].libs[h], file);
					games.push(game);
				}
			}
		}
		let gamesPath = `${usrDir}/_usr/${sys}Games.json`;
		await fs.outputFile(gamesPath, JSON.stringify({
			games: games
		}));
	}

	async function reload() {
		cui.uiStateChange('loading');
		$('.menu').hide();
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
			if (!(await fs.exists(gameLibDir))) {
				gameLibDir = cui.selectDir(`select ${sys} game directory`);
			}
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
			await reset();
		}
		btlDir = emuDir + '/bottlenose';
		btlDir = btlDir.replace(/\\/g, '/');
		await fs.ensureDir(btlDir);
		prefs.btlDir = btlDir;
		prefs.session.sys = sys;
		await fs.outputFile(prefsPath, JSON.stringify(prefs, null, '\t'));
		await viewer.load(games, prefs, sys);
		await removeIntro();
		cui.uiStateChange('libMain', sysStyle);
	}

	async function load() {
		$('#update').hide();
		$('.menu').hide();
		let files = klawSync(path.join(__rootDir, '/views/md'));
		for (let file of files) {
			file = file.path;
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
				html = pug('.md', md(html) + pug('img(src="https://raw.githubusercontent.com/quinton-ashley/bottlenose/master/build/icon.png")'));
			} else {
				html = pug('.md', md(html));
			}
			file = path.parse(file);
			$('#' + file.name).prepend(html);
		}
		if (await fs.exists(prefsPath)) {
			let prefs1 = JSON.parse(await fs.readFile(prefsPath));
			deepExtend(prefs, prefs1);
			emuDir = path.join(prefs.btlDir, '..');
		}
		// currently supported systems
		let sysMenuHTML = '.row-y\n';
		for (let i = 0; i < systems.length; i++) {
			sys = systems[i];
			let text = ((prefs[sys].style || '') + ' ' + sys).trim();
			sysMenuHTML += `\t.uie(name="${sys}") ${text}\n`;
		}
		$('#sysMenu').append(pug(sysMenuHTML));
		sys = prefs.session.sys;
	}

	cui.setResize((adjust) => {
		let $cv = $('.cover.view');
		let $cvSel = $cv.find('#view');
		let cvHeight = $cv.height();
		let cpHeight = $('.cover.power').height();
		if (adjust || cvHeight != cpHeight) {
			$cvSel.css('margin-top', (cpHeight + 24) * .5);
			$('nav').height(cpHeight + 24);
		}
	});

	cui.setUIOnChange((state, subState) => {
		let labels = ['', '', ''];
		if (state == 'cover') {
			labels = ['Play', '', 'Back'];
		} else if (state == 'libMain') {
			labels = ['Power', 'Reset', 'Open'];
		} else if (state == 'sysMenu' || state == 'pauseMenu') {
			labels = ['', '', 'Back'];
		}
		if (subState == 'gcn') {
			for (let i = 0; i < labels.length; i++) {
				labels[i] = labels[i].toLowerCase();
			}
		}
		$('.cover.power .text').text(labels[0]);
		$('.cover.reset .text').text(labels[1]);
		$('.cover.open .text').text(labels[2]);
	});

	async function removeIntro(time) {
		await delay(time || 2000);
		$('#intro').remove();
		$('link.introStyle').prop('disabled', true);
		$('link.introStyle').remove();
		$('#dialogs').hide();
	}

	async function powerBtn() {
		await viewer.powerBtn();
		await intro();
		await viewer.load(games, prefs, sys);
		await removeIntro();
		cui.uiStateChange('libMain');
	}

	async function resetBtn() {
		cui.removeView('libMain');
		cui.uiStateChange('resetting');
		await intro();
		await reset();
		await viewer.load(games, prefs, sys);
		await removeIntro();
		cui.uiStateChange('libMain');
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

	async function doAction(act) {
		log(act);
		let ui = cui.ui;
		let onMenu = (/menu/gi).test(ui);
		let res = await viewer.doAction(act);
		if (res) {
			return res;
		}
		if (act == 'start' && !onMenu) {
			cui.uiStateChange('pauseMenu');
		} else if (act == 'b' && onMenu &&
			ui != 'donateMenu' && ui != 'setupMenu') {
			cui.uiStateChange('libMain');
		} else if (act == 'view') {
			$('nav').toggleClass('hide');
		} else if (ui == 'libMain') {
			if (act == 'x') {
				await powerBtn();
			} else if (act == 'y') {
				await resetBtn();
			} else {
				return false;
			}
		} else if (ui == 'cover') {
			if (act == 'x') {
				await powerBtn();
			} else if (act == 'y') {
				await resetBtn();
			} else {
				return false;
			}
		} else if (ui == 'sysMenu') {
			if (!viewer) {
				return;
			}
			cui.removeView('libMain');
			sys = act;
			cui.removeCursor();
			await reload();
		} else if (ui == 'pauseMenu') {
			if (act == 'fullscreen' || act == 'x') {
				remote.getCurrentWindow().focus();
				remote.getCurrentWindow().setFullScreen(true);
			} else if (act == 'prefs') {
				opn(prefsPath);
			} else if (act == 'quit') {
				app.quit();
			} else {
				return false;
			}
		} else if (ui == 'donateMenu') {
			if (act == 'donate-monthly') {
				opn('https://www.patreon.com/qashto');
			} else if (act == 'donate-single') {
				opn('https://www.paypal.me/qashto/25');
			} else if (act == 'donated' || act == 'donate-later') {
				await reload();
			} else {
				return false;
			}
		} else if (ui == 'welcomeMenu') {
			if (act == 'demo') {
				emuDir = cui.selectDir(`choose the folder you want the demo folder to go in`);
				if (!emuDir) {
					return false;
				}
				let templatePath = path.join(__rootDir, '/demo');
				await fs.copy(templatePath, emuDir);
				emuDir += '/emu';
				await createTemplate(emuDir);
				emuDir += '/bottlenose';
				await reload();
			} else if (act == 'full') {
				$('.menu').hide();
				cui.uiStateChange('setupMenu');
			} else {
				return false;
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
					emuDir = cui.selectDir(msg);
				}
				if (!emuDir) {
					return false;
				}
				if (path.parse(emuDir).name != 'EMULATORS') {
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
				await reload();
			}
		} else {
			return false;
		}
		return true;
	}
	cui.setCustomActions(doAction);

	Mousetrap.bind(['command+n', 'ctrl+n'], function() {
		buttonPressed('view');
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

	await load();
	if (await fs.exists(prefsPath)) {
		cui.uiStateChange('donateMenu');
	} else {
		cui.uiStateChange('welcomeMenu');
	}
	cui.start({
		v: true
	});
};
