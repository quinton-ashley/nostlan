/*
 * index.js : Nostlan : quinton-ashley
 *
 * Main file. Handles user interaction with the UI.
 */
module.exports = async function(arg) {
	await require(arg.__root + '/core/setup.js')(arg);
	log('version: ' + pkg.version);
	global.util = require(__root + '/core/util.js');

	// Nostlan dir location cannot be changed.
	// Only used to store small config files, no images,
	// so that it doesn't take much space on the user's
	// main hard drive.  I don't give users a choice
	// to move this folder elsewhere because it needs to be
	// in a set location.
	// Only the user's preferences and game libs json databases
	// are stored here.
	global.usrDir = '$home/Documents/emu/bottlenose'; // deprecated path
	usrDir = util.absPath(usrDir);
	if (usrDir && (await fs.exists(usrDir))) {
		await fs.move(usrDir, path.join(usrDir, '..') + '/nostlan');
	}
	usrDir = path.join(usrDir, '..') + '/nostlan';
	log(usrDir);

	// get the default prefrences
	let prefsMng = require(__root + '/prefs/prefsManager.js')
	prefsMng.update = require(__root + '/prefs/prefsUpdate.js');
	prefsMng.prefsPath = usrDir + '/_usr/prefs.json';
	global.prefs = await prefsMng.loadDefaultPrefs();

	global.sys = ''; // current system (name)
	global.syst = {}; // current system (object)
	global.sysStyle = ''; // style of that system
	global.emu = ''; // current emulator (name)
	global.offline = false;

	global.systems = {
		arcade: {
			name: 'Arcade',
			fullName: 'Arcade',
			emus: ['mame'],
			mediaType: 'pcb'
		},
		ds: {
			name: 'DS',
			fullName: 'Nintendo DS',
			emus: ['desmume', 'melonds'],
			mediaType: 'cart'
		},
		gba: {
			name: 'GBA',
			fullName: 'Nintendo Game Boy Advance',
			emus: ['mgba', 'vba'],
			mediaType: 'cart'
		},
		gcn: {
			name: 'GameCube',
			fullName: 'Nintendo GameCube',
			mediaType: 'disc'
		},
		n3ds: {
			name: '3DS',
			fullName: 'Nintendo 3DS',
			emus: ['citra'],
			mediaType: 'cart'
		},
		nes: {
			name: 'NES',
			fullname: 'Nintendo Entertainment System',
			emus: ['mesen'],
			mediaType: 'cart'
		},
		ps2: {
			name: 'PS2',
			fullName: 'Sony PlayStation 2',
			emus: ['pcsx2'],
			mediaType: 'disc'
		},
		ps3: {
			name: 'PS3',
			fullName: 'Sony PlayStation 3',
			emus: ['rpcs3'],
			mediaType: 'disc'
		},
		snes: {
			name: 'SNES',
			fullName: 'Super Nintendo',
			emus: ['bsnes', 'snes9x'],
			mediaType: 'cart'
		},
		switch: {
			name: 'Switch',
			fullName: 'Nintendo Switch',
			emus: ['yuzu', 'ryujinx'],
			mediaType: 'cart'
		},
		wii: {
			name: 'Wii',
			fullName: 'Nintendo Wii',
			emus: ['dolphin'],
			mediaType: 'disc'
		},
		wiiu: {
			name: 'Wii U',
			fullName: 'Nintendo Wii U',
			emus: ['cemu'],
			mediaType: 'disc'
		},
		xbox360: {
			name: 'Xbox 360',
			fullName: 'Microsoft Xbox 360',
			emus: ['xenia'],
			mediaType: 'disc'
		}
	};

	let games = []; // array of current games from the systems' db
	global.emuDir = ''; // nostlan dir is stored here

	let searchTerm = '';
	let searchTimeout = 0;
	setInterval(function() {
		if (searchTimeout > 1000) {
			searchTimeout -= 1000;
		} else {
			searchTimeout = 0;
		}
	}, 1000);

	// I assume the user is using a smooth scroll trackpad
	// or apple mouse with their Mac.
	if (mac) {
		prefs.ui.mouse.wheel.multi = 0.5;
		prefs.ui.mouse.wheel.smooth = true;
	}

	// only Patreon supporters can use premium features
	let premium;
	if (!arg.dev) {
		premium = require(__root + '/dev/premium.js');
	} else {
		premium = {
			verify: () => {}
		};
	}
	const saves = require(__root + '/core/saves.js');
	global.launcher = require(__root + '/core/launcher.js');
	const updater = require(__root + '/core/updater.js');
	const themes = require(__root + '/core/themes.js');
	const scan = require(__root + '/core/scanner.js');
	const scraper = require(__root + '/core/scraper.js');

	try {
		global.kb = require('robotjs');
		kb.setKeyboardDelay(0);
	} catch (ror) {
		er(ror);
	}

	global.sharp = require('sharp');

	document.body.addEventListener('mousemove', function(e) {
		document.exitPointerLock();
	});

	async function intro() {
		$('#dialogs').show();
		await themes.loadFrame('intro');
		$('#themeStyles link').remove();
		await themes.applyStyle('colors');
		await themes.applyStyle('theme');
	}

	async function removeIntro(time) {
		time = arg.testIntro || time || prefs.load.delay;
		log('removing intro: ' + time);
		await delay(time);
		$('#intro').remove();
		cui.hideDialogs();
	}

	async function load() {
		let files = await klaw(__root + '/views/md');
		for (let file of files) {
			let data = await fs.readFile(file, 'utf8');
			let fileName = path.parse(file).name;
			if (fileName == 'setupMenu_1') {
				data = util.osmd(data);
			}
			data = data.replace(/\t/g, '  ');
			data = pug('.md', null, md(data));
			file = path.parse(file);
			$('#' + file.name).prepend(data);
		}
		if (await prefsMng.canLoad()) {
			await prefsMng.load();
			emuDir = path.join(prefs.nlaDir, '..');
			await prefsMng.update();
			await createTemplate();
		}
		// currently supported systems
		let sysMenu_5 = 'h1 Select a System\n';
		let i = 0;
		for (let _sys in systems) {
			let _syst = systems[_sys];
			if (!_syst.emus) continue;
			if (i % 2 == 0) sysMenu_5 += `.row.row-x\n`;
			sysMenu_5 += `\t.col.uie(name="${_sys}") ${_syst.name}\n`;
			i++;
		}
		delete i;
		$('#sysMenu_5').append(pug(sysMenu_5));
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
		sys = arg.sys || prefs.session.sys;
		// deprecated system id, change to 'n3ds'
		if (sys == '3ds') sys = 'n3ds';
		syst = systems[sys];
		cui.mapButtons(sys);
	}

	async function loadGameLib() {
		// sysStyle = prefs[sys].style || sys;
		sysStyle = sys;
		cui.change('loading_1', sysStyle);
		let ld0 = `loading your ${syst.fullName} game library`;
		$('#loadDialog0').text(ld0);
		emu = syst.emus[0];
		if (mac && sys == 'ds') emu = 'desmume';
		await intro();
		let gamesPath = `${emuDir}/${sys}/${sys}Games.json`;
		// if prefs exist load them if not copy the default prefs
		games = [];
		if (await fs.exists(gamesPath)) {
			games = JSON.parse(await fs.readFile(gamesPath)).games || [];

			// user is possibly using a read only file system
			// if prefs[sys] doesn't exist but a user
			// game db file does
			if (!prefs[sys] || !prefs[sys].libs) {
				prefs[sys] = {
					libs: [`${emuDir}/${sys}/games`]
				};
			}
		}
		if (games.length == 0) {
			if (!emuDir) {
				cui.change('setupMenu_1');
				await removeIntro(0);
				return;
			}
			log(emu);
			let gameLibDir = `${emuDir}/${sys}/games`;
			if (emu == 'rpcs3') {
				gameLibDir = `${emuDir}/${sys}/rpcs3/dev_hdd0/game`;
			} else if (emu == 'mame') {
				gameLibDir = `${emuDir}/${sys}/mame/roms`;
			}

			log(gameLibDir);

			for (let i = 0; !gameLibDir || !(await fs.exists(gameLibDir)); i++) {
				if (i >= 1) {
					await removeIntro(0);
					cui.err(`Game library does not exist: \n` + gameLibDir, 404, 'sysMenu_5');
					return;
				}
				gameLibDir = await dialog.selectDir(`select ${sys} game directory`);
			}
			let files = await klaw(gameLibDir);
			for (let i = 0; !files.length || (
					files.length == 1 &&
					(['.DS_Store', 'dir.txt'].includes(
						path.parse(files[0]).base))
				); i++) {
				if (i >= 1) {
					await removeIntro(0);
					cui.err(`Game library has no game files`, 404, 'sysMenu_5');
					return;
				}
				gameLibDir = await dialog.selectDir(`select ${syst.name} game directory`);
				log(gameLibDir);
				if (!gameLibDir) continue;
				files = await klaw(gameLibDir);
			}
			gameLibDir = gameLibDir.replace(/\\/g, '/');
			if (await fs.exists(gameLibDir)) {
				if (!prefs[sys]) prefs[sys] = {};
				if (!prefs[sys].libs) {
					prefs[sys].libs = [];
				}
				if (!prefs[sys].libs.includes(gameLibDir)) {
					prefs[sys].libs.push(gameLibDir);
				}
			} else {
				cui.err(`Couldn't load game library`, 404, 'sysMenu_5');
				await loadGameLib();
				return;
			}
			games = await scan.gameLib();
			if (!games.length) {
				await removeIntro(0);
				let note = 'Game files must have the file extension: ';
				if (sys == 'ds') note += '.nds';
				if (sys == 'gba') note += '.gba';
				if (sys == 'snes') note += '.sfc or .smc';
				if (sys == 'wii') {
					note += '.gcm, .iso, .tgc, .gcz, .wbfs, .wad, .elf, or .dol';
				}
				cui.err('Game library has no game files. ' + note, 404, 'sysMenu_5');
				return;
			}
		}
		emuDir = emuDir.replace(/\\/g, '/');
		prefs.nlaDir = emuDir + '/nostlan';
		try {
			await fs.ensureDir(prefs.nlaDir);
		} catch (ror) {
			er(ror);
		}
		prefs.session.sys = sys;
		cui.mapButtons(sys);
		await prefsMng.save();
		if (premium.verify()) {
			await saves.update();
		}
		await viewerLoad();

		cui.removeView('playMenu_5');
		cui.removeView('emuMenu_5');
		let playMenu = 'h1 Play game with\n';
		let emuMenu = 'h1 Emulator Menu\n';
		for (let _emu of syst.emus) {
			playMenu += `.col.uie(name="${_emu}") ${prefs[_emu].name}\n`;
			emuMenu += `.col.uie(name="${_emu}-config") ` +
				`Configure ${prefs[_emu].name}\n`;

			if (prefs[_emu].update) {
				emuMenu += `.col.uie(name="${_emu}-update") ` +
					`Update ${prefs[_emu].name}\n`;
			}
		}
		$('#playMenu_5').append(pug(playMenu));
		$('#emuMenu_5').append(pug(emuMenu));
		cui.addView('playMenu_5');
		cui.addView('emuMenu_5');

		await loadSharedAssets();

		await removeIntro();
		cui.change('libMain', sysStyle);
		cui.resize(true);
	}

	async function loadSharedAssets() {
		cui.clearDialogs();
		$('#loadDialog0').text('Loading additional image assets');
		let gh = 'https://github.com/quinton-ashley/nostlan-img/raw/master/shared';
		let dir = prefs.nlaDir + '/images';

		let assetPacks = ['discSleeve', 'wraps'];

		for (let pack of assetPacks) {
			$('#loadDialog1').text(pack);
			let url = gh + `/${pack}.zip`;
			let file = dir + `/${pack}.zip`;
			if (!(await fs.exists(dir + '/' + pack))) {
				if (!(await fs.exists(file))) await scraper.dl(url, file, {
					timeout: 10000
				});
				await fs.ensureDir(dir);
				let res = await fs.extract(file, dir);
				log(res);
			}
		}

	}

	cui.onResize = (adjust) => {
		if (!$('nav').hasClass('hide')) {
			let $nav1 = $('#nav1');
			let $nav1Btn = $nav1.find('#nav1Btn');
			let nav1Height = $nav1.height();
			let nav0Height = $('#nav0').height();
			let mod = 24;
			if ((/ps/i).test(sys)) mod = -8;
			if (adjust || nav1Height != nav0Height) {
				$nav1Btn.css('margin-top', (nav0Height + mod) * .5 - nav1Height * .5 - 4);
				$('nav').height(nav0Height + 24);
			}
		}
	};

	cui.onChange = (state, subState) => {
		let labels = [' ', ' ', ' '];
		if (state == 'boxSelect_1') {
			labels = ['Play', 'Flip', 'Back'];
			$('#libMain').show();
		} else if (state == 'boxOpenMenu_2') {
			labels = ['Manual', 'Memory', 'Back'];
			$('#boxOpenMenu_2').removeClass('zoom-gameManual');
			$('#boxOpenMenu_2').removeClass('zoom-gameMedia');
			$('#boxOpenMenu_2').removeClass('zoom-gameMemory');
		} else if (state == 'libMain') {
			labels = ['Play', 'Emu', 'Sys'];
			$('#libMain').css('transform', '');
			$('#libMain').removeClass('no-outline');
		} else if (state == 'gameMediaSelect_3') {
			labels = ['ImgDir', 'File', 'Back'];
		} else if (state == 'pauseMenu_10') {
			labels = ['Quit', 'Mini', 'Back'];
		} else if (/(game|menu)/i.test(state)) {
			labels = [' ', ' ', 'Back'];
		}
		$('#nav0 .text').text(labels[0]);
		$('#nav2 .text').text(labels[1]);
		$('#nav3 .text').text(labels[2]);

		function adjust(flip) {
			if (flip && $('nav.fixed-top').find('#nav1Btn').length) {
				$('#nav3').css({
					'border-radius': '0 0 0 32px',
					'border-width': '0 0 8px 0'
				}).appendTo('nav.fixed-top');
				$('#nav1').css({
					'border-radius': '32px 0 0 0',
					'border-width': '8px 0 0 0'
				}).appendTo('nav.fixed-bottom');
			} else if (!flip && $('nav.fixed-top').find('#nav3Btn').length) {
				$('#nav3').css({
					'border-radius': '32px 0 0 0',
					'border-width': '8px 0 0 0'
				}).appendTo('nav.fixed-bottom');
				$('#nav1').css({
					'border-radius': '0 0 0 32px',
					'border-width': '0 0 8px 0'
				}).appendTo('nav.fixed-top');
			}
		}
		let buttons = ['X', 'Y', 'B'];
		if ((/(xbox|arcade)/i).test(subState)) {
			buttons = ['Y', 'X', 'B'];
			adjust(true);
		} else if ((/ps/i).test(subState)) {
			buttons = ['', '', ''];
			adjust(true);
		} else {
			adjust(false);
		}

		if (!(cui.gamepadConnected || cui.gca.connected) || !subState) {
			return;
		}
		$('#nav0Btn span').text(buttons[0]);
		$('#nav2Btn span').text(buttons[1]);
		$('#nav3Btn span').text(buttons[2]);
	}

	cui.afterChange = async () => {
		if (cui.uiPrev == 'loading_1' && cui.ui == 'libMain' && prefs.session[sys] && prefs.session[sys].gameID) {
			let $cur = $('#' + prefs.session[sys].gameID).eq(0);
			if (!$cur.length) $cur = $('#' + games[0].id).eq(0);
			cui.makeCursor($cur);
			cui.scrollToCursor(250, 0);
		}
		if (cui.ui == 'boxOpenMenu_2') {
			cui.makeCursor($('#gameMedia'));
		} else if (cui.uiPrev == 'boxSelect_1' && cui.ui == 'libMain') {
			changeImageResolution(cui.getCur());
		}
	}

	cui.clearDialogs = () => {
		$('#loadDialog0').text('');
		$('#loadDialog1').text('');
		$('#loadDialog2').text('');
	}

	cui.hideDialogs = () => {
		$('#dialogs').hide();
		cui.clearDialogs();
	}

	cui.onHeldAction = (act, timeHeld) => {
		if (timeHeld < 2000) {
			return;
		}
		log(act + ' held for ' + timeHeld);
		if (launcher.state == 'running') {
			if (
				act == prefs.inGame.quit.hold &&
				timeHeld > prefs.inGame.quit.time
			) {
				log('shutting down emulator');
				launcher.close();
			} else if (
				act == prefs.inGame.reset.hold &&
				timeHeld > prefs.inGame.reset.time
			) {
				log('resetting emulator');
				launcher.reset();
				return true;
			}
		}
	}

	async function createTemplate() {
		for (let _sys in systems) {
			let _syst = systems[_sys];
			if (!_syst.emus) continue;
			for (let _emu of _syst.emus) {
				// emu dir
				await fs.ensureDir(`${emuDir}/${_sys}/${_emu}`);
				// games dir
				if (!/(rpcs3|mame)/.test(_emu)) {
					await fs.ensureDir(`${emuDir}/${_sys}/games`);
				}
			}
		}
	}

	function fitCoverToScreen($cur) {
		let $reel = $cur.parent();
		let $menu = $reel.parent();
		let idx = $menu.children().index($reel);
		let scale = $(window).height() / $cur.height();
		$menu.css('transform', `scale(${scale}) translate(${-($reel.width()*idx + $cur.width()*.5 - $(window).width()*.5)}px, 0)`);
	}

	async function changeImageResolution($cur, changeToFullRes) {
		let $images = $cur.find('img');
		for (let i = 0; i < 2; i++) {
			if ($images.eq(i).hasClass('hide')) continue;
			let img = $images.eq(i).prop('src');
			if (!img) continue;
			img = path.parse(img);
			img.name = img.name.replace('Thumb', '');
			if (!changeToFullRes) {
				img.name += 'Thumb';
			}
			let src = img.dir + '/' + img.name + img.ext;
			let sliceAmt = (win) ? 8 : 7;
			if (!(await fs.exists(src.slice(sliceAmt)))) {
				src = img.dir + '/' + img.name;
				if (img.ext != '.jpg') {
					src += '.jpg';
				} else {
					src += '.png';
				}
			}
			$images.eq(i).prop('src', src);
		}
	}

	cui.beforeMove = ($cur, state) => {
		if (state == 'boxSelect_1') {
			changeImageResolution($cur);
		}
	}

	cui.afterMove = ($cur, state) => {
		if (state == 'boxSelect_1') {
			changeImageResolution($cur, 'full');
			fitCoverToScreen($cur);
			cui.makeCursor($cur, 'libMain');
		}
	}

	function getCurGame() {
		let id = cui.getCur('libMain').attr('id');
		if (/^_TEMPLATE/.test(id)) return;
		let game = games.find(x => x.id === id);
		if (game && game.file) {
			game.file = util.absPath(game.file);
			return game;
		}
		cui.err('game not found: ' + id);
	}

	async function saveSync(act) {
		if (!premium.verify()) {
			cui.err('You must be a Patreon supporter to access this feature.  Restart Nostlan and enter your donor verfication password.');
			return;
		}
		if (!prefs.saves) {
			cui.change('addSavesPathMenu_2');
			return;
		}
		await intro();
		cui.change('syncingSaves');
		if (act == 'syncBackup') {
			await saves.backup();
		} else if (act == 'quit') {
			await saves.backup('quit');
		} else if (act == 'forceUpdate') {
			await saves.update('forced');
		} else {
			await saves.update();
		}
		await removeIntro();
		cui.change('libMain');
	}

	cui.onAction = async function(act) {
		let ui = cui.ui;
		let $cur = cui.getCur();
		if (act == 'a' || act == 'enter') {
			act = $cur.attr('name') || 'a';
		}
		log(act + ' on ' + ui);
		if (act == 'quit') {
			cui.opt.haptic = false;
			// don't try to sync saves on quit
			// if there was an error
			// if developing nostlan
			// if user is not a patreon supporter
			if (ui != 'errorMenu_9999' && !arg.dev && premium.verify()) {
				await saveSync('quit');
			}
			// save the prefs file
			if (prefs.nlaDir) await prefsMng.save();
			app.quit();
			return;
		}
		let isBtn = cui.isButton(act);
		let onMenu = /menu/i.test(ui);
		let onSelect = /select/i.test(ui);
		if (launcher.state == 'running') {
			return;
		}

		// letter by letter search for game
		if (/char-\w/.test(act)) {
			if (cui.ui != 'libMain') return;
			if (searchTimeout == 0) {
				searchTerm = '';
			}
			searchTimeout = 2000;
			let char = act.slice(5);
			if (char == '_') char = ' ';
			searchTerm += char;
			log('search for: ' + searchTerm);
			for (let game of games) {
				let titleSlice = game.title.slice(0, searchTerm.length);
				if (searchTerm == titleSlice.toLowerCase()) {
					let $cur = $('#' + game.id).eq(0);
					if (!$cur.length) continue;
					log('cursor to game: ' + game.title);
					cui.makeCursor($cur);
					cui.scrollToCursor();
					break;
				}
			}
			return;
		}

		if (act == 'x' && (ui == 'libMain' || ui == 'boxSelect_1')) {
			if ($cur.hasClass('uie-disabled')) return false;
			if (syst.emus.length > 1) {
				cui.change('playMenu_5');
			} else {
				await launcher.launch(getCurGame());
			}
			return;
		}
		if (act == 'start') {
			cui.change('pauseMenu_10');
		} else if (act == 'b' && (onMenu || onSelect) &&
			ui != 'donateMenu' && ui != 'setupMenu_1') {
			cui.doAction('back');
		} else if (act == 'select') {
			$('nav').toggleClass('hide');
			prefs.ui.autoHideCover = $('nav').hasClass('hide');
			let $elem = $('#interfaceMenu_11 .uie[name="toggleCover"] .text');
			if (!prefs.ui.autoHideCover) {
				cui.resize(true);
				$elem.text('auto-hide cover overlay');
			} else {
				$elem.text('show cover overlay');
			}
		} else if (ui == 'libMain') {
			if (act == 'b' && !onMenu) {
				cui.change('sysMenu_5');
			}
			if ($cur.hasClass('uie-disabled')) return false;
			if (act == 'y') {
				cui.change('emuMenu_5');
			} else if (act == 'a' || !isBtn) {
				let gameSys = $cur.attr('class');
				if (gameSys) gameSys = gameSys.split(/\s+/)[0];
				fitCoverToScreen($cur);
				changeImageResolution($cur, 'full');
				cui.scrollToCursor(500, 0);
				cui.change('boxSelect_1', gameSys);
			}
		} else if (ui == 'boxSelect_1') {
			if ($cur.hasClass('uie-disabled')) return false;

			// TODO not working, fix this!
			if ((act == 'a' || !isBtn) && $cur[0].id != cui.getCur('libMain')[0].id) {
				fitCoverToScreen($cur);
				cui.makeCursor($cur, 'libMain');
				cui.scrollToCursor();
			} else if ((act == 'a' || !isBtn) && $cur.attr('class') &&
				(await scraper.getExtraImgs(themes[$cur.attr('class').split(/\s+/)[0] || sysStyle].template))) {
				// TODO finish open box menu
				let game = getCurGame();
				if (!game) return;
				let template = themes[game.sys || sys].template;

				$('#gameManual').prop('src', '');
				$('#gameMedia').prop('src', '');
				$('#gameMemory').prop('src', '');
				$('#gameWiki').html('');

				$('#gameBoxOpen').prop('src', await scraper.imgExists(template, 'boxOpen'));
				$('#gameBoxOpenMask').prop('src',
					await scraper.imgExists(template, 'boxOpenMask'));
				$('#gameMemory').prop('src', await scraper.imgExists(template, 'memory'));
				$('#gameManual').prop('src', await scraper.imgExists(template, 'manual'));
				$('#gameWiki').html();

				let mediaImg = await scraper.imgExists(game, syst.mediaType);
				if (!mediaImg) {
					mediaImg = await scraper.imgExists(template, syst.mediaType);
				}
				if (!mediaImg && syst.mediaType == 'disc') {
					mediaImg = prefs.nlaDir + '/images/discSleeve/disc.png';
				}
				$('#gameMedia').prop('src', mediaImg);
				cui.change('boxOpenMenu_2');
				$('#libMain').hide();
			} else if (act == 'y') { // flip
				let ogHeight = $cur.height();
				await flipGameBox($cur);
				if (Math.abs(ogHeight - $cur.height()) > 10) {
					cui.resize();
					cui.scrollToCursor(0, 0);
				}
			}
		} else if (ui == 'boxOpenMenu_2') {
			if (act == 'x') act = 'manual';
			if (act == 'y') act = 'memory';
			if (act == 'a') act = 'media';
			if (act == 'manual') {
				themes.loadGameWiki(getCurGame());
			}
			if (!(/(memory|manual|media)/gi).test(act)) return;
			act = act[0].toUpperCase() + act.substr(1);
			act = 'game' + act;
			$('#boxOpenMenu_2').addClass('zoom-' + act);
			cui.change(act + 'Select_3');
		} else if (ui == 'gameMediaSelect_3') {
			if (act == 'a' || act == 'media') {
				if (syst.emus.length > 1) {
					cui.change('playMenu_5');
				} else {
					await launcher.launch(getCurGame());
				}
			} else if (act == 'y') { // imgdir
				opn(await scraper.getImgDir(getCurGame()));
			} else if (act == 'x') { // file
				opn(path.parse(getCurGame().file).dir);
			}
		} else if (ui == 'sysMenu_5' && !isBtn) {
			// if (!emu) {
			// 	return;
			// }
			cui.removeView('libMain');
			sys = act;
			syst = systems[sys];
			cui.removeCursor();
			await loadGameLib();
		} else if (ui == 'interfaceMenu_11') {
			if (act == 'toggleCover') {
				cui.buttonPressed('select');
			} else if (act == 'theme') {
				if (!premium.verify()) {
					cui.err('You must be a Patreon supporter to access this feature.  Restart Nostlan and enter your donor verfication password.');
					return;
				}
				cui.removeView('themeMenu_12');
				let themeMenu = 'h1 Change Theme\n';
				for (let palette of (await themes.getColorPalettes())) {
					let p = palette.sys + ' ' + palette.name;
					if (!palette.name) palette.name = 'default';
					palette = systems[palette.sys].name + ' ' + palette.name;
					themeMenu += `.col.uie(name="${p}") ${palette}\n`;
				}
				$('#themeMenu_12').append(pug(themeMenu));
				cui.addView('themeMenu_12');
				cui.change('themeMenu_12');
			}
		} else if (ui == 'themeMenu_12') {
			act = act.split(' ');
			$('body').removeClass();
			cui.change('interfaceMenu_11', act[0]);
			$('body').addClass(act[1]);
			prefs[sys].colorPalette = act[1];
		} else if (ui == 'addSavesPathMenu_2') {
			if (act == 'add') {
				let save = {
					name: $('#saveName').val(),
					backups: $('#saveNumOfBackups').val()
				}
				if (!save.name || !save.backups) {
					cui.err('name and number of backups required');
					return;
				}
				save.backups = Number(save.backups);
				if (save.backups < 1) {
					cui.err('1 save backup required');
					return;
				}

				let msg = 'Select a save sync location';
				save.dir = await dialog.selectDir(msg);

				if (!(await fs.exists(save.dir))) {
					cui.err('Not a valid folder.');
					return;
				}
				if (!prefs.saves) prefs.saves = [];
				prefs.saves.push(save);
				await saveSync('syncUpdate');
			}
		} else if (ui == 'pauseMenu_10') {
			if (act == 'start') {
				cui.doAction('back');
			} else if (act == 'syncBackup' || act == 'forceUpdate') {
				await saveSync(act);
			} else if (act == 'fullscreen') {
				electron.getCurrentWindow().focus();
				electron.getCurrentWindow().setFullScreen(true);
			} else if (act == 'editAppearance') {
				cui.change('interfaceMenu_11');
			} else if (act == 'scanForImages' || act == 'scanForGames') {
				let recheckImgs = false;
				if (act == 'scanForImages') {
					recheckImgs = true;
					await fs.remove(`${emuDir}/${sys}/${sys}Games.json`);
				}
				cui.removeView('libMain');
				cui.change('rescanning');
				await intro();
				games = await scan.gameLib();
				await viewerLoad(recheckImgs);
				await removeIntro();
				cui.change('libMain');
				cui.scrollToCursor(0);
			} else if (act == 'showConsole') {
				electron.getCurrentWindow().toggleDevTools();
				let $elem = $('#pauseMenu_10 .uie[name="showConsole"] .text');
				if ($elem.text().includes('show')) {
					$elem.text('hide console');
				} else {
					$elem.text('show console');
				}
			} else if (act == 'editPrefs') {
				opn(prefsMng.prefsPath);
			} else if (act == 'x') {
				cui.doAction('quit');
			}
			if (act == 'minimize' ||
				act == 'prefs' || act == 'y') {
				electron.getCurrentWindow().minimize();
			}
		} else if (ui == 'donateMenu') {
			if (act == 'donate-monthly') {
				opn('https://www.patreon.com/qashto');
			} else if (act == 'donate-single') {
				opn('https://www.paypal.me/qashto/20');
			} else if (act == 'donate-later') {
				await loadGameLib();
			} else if (act == 'donated') {
				cui.change('checkDonationMenu_1');
			}
		} else if (ui == 'checkDonationMenu_1') {
			if (act == 'continue') {
				let pass = $('#donorPassword').val();
				if (premium.verify(pass)) {
					await loadGameLib();
					if (premium.verify() && !prefs.saves) {
						cui.change('addSavesPathMenu_2');
					}
				} else {
					cui.change('donateMenu');
					cui.err('incorrect donor password');
				}
			}
		} else if (ui == 'welcomeMenu') {
			if (act == 'full') {
				cui.change('setupMenu_1');
			}
		} else if (ui == 'setupMenu_1') {
			if (act == 'continue') {
				if (!(await fs.exists(emuDir))) {
					cui.err('you must choose an install location!');
					return false;
				}
				cui.change('sysMenu_5');
				return;
			}
			if (act == 'new-in-docs') {
				emuDir = util.absPath('$home') + '/Documents';
			} else {
				let msg = 'choose the folder you want the template to go in';
				emuDir = await dialog.selectDir(msg);
			}
			emuDir += '/emu';
			if (!emuDir) return false;
			await createTemplate();
			opn(emuDir);
			if (!(await fs.exists(emuDir))) return false;
		} else if (ui == 'emuMenu_5' || ui == 'playMenu_5') {
			// change emu to the selected emu
			// or run with the previously selected emu
			// by double clicking/pressing x or y
			let acts = act.split('-');
			if (syst.emus.includes(acts[0])) {
				emu = acts[0];
			} else if (act != 'x' && act != 'y') {
				return;
			}
			if (acts[1] == 'update') {
				await launcher.updateEmu();
			} else if (acts[1] == 'config' || ui == 'emuMenu_5') {
				await launcher.configEmu();
			} else {
				await launcher.launch(getCurGame());
			}
		}
	}

	cui.click('#nav0', 'x');
	cui.click('#nav1', 'start');
	cui.click('#nav2', 'y');
	cui.click('#nav3', 'b');

	async function editImgSrc($cur, $img, game, name) {
		if (!game) return;
		let img = await scraper.imgExists(game, name);
		// log(img);
		if (!img) return;
		$img.prop('src', img);
		let prevClass = $img.attr('class');
		if (prevClass) prevClass.replace('crop ', '');
		let $elems;
		if (prevClass && prevClass != 'hide') {
			$elems = [
				$cur.find('.' + prevClass)
			];
		} else {
			$elems = [
				$cur.find('section'),
				$cur.find('section img')
			];
		}
		for (let $elem of $elems) {
			$elem.removeClass(prevClass);
			$elem.addClass(name);
		}
		return img;
	}

	async function flipGameBox($cur) {
		let game = getCurGame();
		let template = themes[game.sys || sys].template;
		let dflt = themes[game.sys || sys].default;
		if (!$cur.hasClass('flip')) {
			$cur.addClass('flip');
			let $box = $cur.find('.box').eq(0);
			if (!(await editImgSrc($cur, $box, game, 'boxBack'))) {
				if (!(await editImgSrc($cur, $box, dflt, 'boxBack'))) {
					await editImgSrc($cur, $box, dflt, 'box');
				}
			} else {
				return;
			}
			$cur.find('.shade').removeClass('hide');
			let $cover = $cur.find('img.cover');
			if (!$cover.length) {
				$cover = $cur.find('img.coverFull');
				if ($cover.length) {
					$cover.eq(0).removeClass('hide');
					return;
				}
				$cover = $cur.find('section img');
			}
			$cover = $cover.eq(0);
			for (let name of ['coverFull', 'coverBack']) {
				for (let g of [game, template]) {
					if (await editImgSrc($cur, $cover, g, name)) break;
				}
			}
			$cover.removeClass('hide');
		} else {
			$cur.removeClass('flip');
			let $box = $cur.find('img.boxBack');
			log($box);
			if (!$box.length) $box = $cur.find('img.box');
			if (!$box.length) return;
			$box = $box.eq(0);
			log($box);
			let hasBox = true;
			for (let g of [game, dflt, template]) {
				if (await editImgSrc($cur, $box, g, 'box')) break;
				hasBox = false;
			}
			if ((game.sys || sys) != 'switch') $cur.find('.shade').addClass('hide');
			let $cover = $cur.find('img.coverBack');
			if (!$cover.length) $cover = $cur.find('img.coverFull');
			if (!$cover.length) $cover = $cur.find('section img');
			$cover = $cover.eq(0);
			if (hasBox) {
				$cover.addClass('hide');
			} else {
				let name = '';
				for (name of ['coverFull', 'cover']) {
					if (await editImgSrc($cur, $cover, game, name)) break;
				}
				if (name == 'coverFull') $cur.find('.shade').removeClass('hide');
			}
		}
	}

	async function addGameBox(game, column) {
		$('#loadDialog1').text(game.title);
		let _sys = game.sys || sys;
		let isTemplate = (game.id.slice(1, 9) == 'TEMPLATE');
		let isUnidentified = (game.id.slice(1, 13) == 'UNIDENTIFIED');
		let hasNoImages = isUnidentified;

		let noBox;
		let boxImg = '';
		let coverImg = '';
		let coverType = '';

		async function getBoxImg() {
			boxImg = await scraper.imgExists(game, 'box');
			// if box img is found
			noBox = (!boxImg);
			// if template and a default exists (soon to be deprecated in favor of
			// just using the template to store default box)
			if (noBox && themes[_sys].default) {
				boxImg = await scraper.imgExists(themes[_sys].default, 'box');
			} else if (noBox) {
				boxImg = await scraper.imgExists(themes[_sys].template, 'box');
			}
		}

		async function getCoverImg() {
			coverImg = await scraper.imgExists(game, 'coverFull');
			coverType = '.coverFull';
			if (!coverImg) {
				coverImg = await scraper.imgExists(game, 'cover');
				coverType = '.cover';
			}
			if (!coverImg) {
				if (!isTemplate) {
					log(`no images found for game: ${game.id} ${game.title}`);
					hasNoImages = true;
				}
				coverImg = '';
				coverType = '';
			}
		}

		await getBoxImg();
		if ((noBox && !isUnidentified) || isTemplate) {
			await getCoverImg();
		}
		if (hasNoImages) {
			if (prefs[sys].onlyShowGamesWithImages) return;
			let id = game.id;
			game.id = '_TEMPLATE_' + _sys;
			await getBoxImg();
			await getCoverImg();
			game.id = id;
		}
		boxImg = await scraper.genThumb(boxImg);
		if (coverImg) coverImg = await scraper.genThumb(coverImg);
		if (coverType != '.coverFull') {
			let img = await scraper.imgExists(game, 'coverFull');
			if (img) {
				await scraper.genThumb(img);
			}
		}
		let box = `game#${game.id}.${_sys}.uie`;
		// if game is a template don't let the user select it
		if (isTemplate) {
			box += '.uie-disabled';
		}
		box += '\n';
		box += `  img.box(src="${boxImg}")\n`;
		// used to crop the cover/coverfull image
		box += `  section.crop${coverType}\n`;
		box += `    img${coverType}`;
		if (!coverType) box += '.hide';
		box += `(src="${coverImg}")\n`;
		box += `    .shade.p-0.m-0`;
		if (!(coverType || _sys == 'switch' || _sys == 'gba')) {
			box += '.hide';
		}
		if (hasNoImages) {
			if (game.title == '') game.title = ' ';
			if (!game.lblColor) game.lblColor = randomColor();
			box += `\n  .title.label.editable(contenteditable="true" style="background-color: #${game.lblColor}") ${game.title}`;
			box += `\n  .file.label(style="background-color: #${game.lblColor}") ${path.parse(game.file).base}`;
		}
		$('.reel.r' + column).append(pug(box));
	}

	function randomColor() {
		// creates random saturated colors, no grays
		let color = '';
		let brighter = Math.floor(Math.random() * 3);
		for (let i = 0; i < 3; i++) {
			let num;
			if (i != brighter) {
				num = Math.random() * 155 + 100;
			} else {
				num = Math.random() * 200 + 55;
			}
			let hex = Math.floor(num).toString(16);
			color += hex;
		}
		return color;
	}

	async function addTemplateBoxes(cols) {
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < 4; j++) {
				await addGameBox(themes[sysStyle].template, i);
			}
		}
	}

	async function addGameBoxes(cols) {
		let mameSetRegex = /set [2-9]/i;
		for (let i = 0, col = 0; i < games.length; i++) {
			try {
				while (col < cols) {
					if (i < games.length * (col + 1) / cols) {
						// TODO temp code for hiding other game versions
						// the ability to select different versions of MAME games
						// aka "sets" will be added in the future
						if (sys == 'arcade') {
							if (mameSetRegex.test(games[i].title)) break;
							if (i != 0 && games[i - 1].img && games[i].img &&
								games[i - 1].img.box == games[i].img.box) break;
						}
						await addGameBox(games[i], col);
						$('#loadDialog2').text(`${i+1}/${games.length} games`);
						break;
					}
					col++;
				}
			} catch (ror) {
				er(ror);
			}
		}
	}

	async function viewerLoad(recheckImgs) {
		cui.resize(true);
		cui.setMouse(prefs.ui.mouse, 100 * prefs.ui.mouse.wheel.multi);
		games = await scraper.loadImages(games, themes, recheckImgs);
		// determine the amount of columns based on the amount of games
		let cols = prefs.ui.maxColumns || 8;
		if (sys == 'snes') {
			if (games.length < 500) cols = 4;
		} else {
			if (games.length < 42) cols = 8;
			if (games.length < 18) cols = 4;
		}
		$('style.gameViewerColsStyle').remove();
		let $glv = $('#libMain');
		// the column style must change based on the number of columns
		let dynColStyle = '<style class="gameViewerColsStyle" type="text/css">' +
			`.reel {width: ${1 / cols * 100}%;}`
		for (let i = 0; i < cols; i++) {
			$glv.append(pug(
				`.reel.r${i}.row-y.${((i % 2 == 0)?'reverse':'normal')}`
			));
			dynColStyle += `.reel.r${i} {left:  ${i / cols * 100}%;}`;
		}
		dynColStyle += `
.reel .uie.cursor {
	outline: ${Math.abs(7-cols)}px dashed white;
	outline-offset: ${ 9-cols}px;
}`;
		dynColStyle += '</style>';
		$('body').append(dynColStyle);

		await addTemplateBoxes(cols);
		await addGameBoxes(cols);
		await addTemplateBoxes(cols);

		$('#libMain game .label').click(function(e) {
			e.stopPropagation();
			if ($(this).hasClass('file')) {
				let game = getCurGame();
				opn(path.parse(game.file).dir);
			}
		});

		$('#libMain game .title.label').on('keydown', function(e) {
			if (e.key == 'Enter') {
				e.preventDefault();
				let game = getCurGame();
				game.title = $(this).text();
				log('user edited game title: ');
				log(game);
				scan.outputUsersGamesDB(games);
			}
		});

		cui.addView('libMain', {
			hoverCurDisabled: true
		});
		if (prefs[sys].colorPalette) {
			$('body').addClass(prefs[sys].colorPalette);
		}
		cui.editView('boxOpenMenu_2', {
			keepBackground: true,
			hoverCurDisabled: true
		});
		$('#nav1Btn').css('margin-top', '20px');
	}

	async function start() {
		electron.getCurrentWindow().setFullScreen(true);
		await load();
		// physical layout always matches the on screen postion of x and y
		// in the cover menu
		cui.start({
			v: true,
			haptic: prefs.ui.gamepad.haptic,
			gca: prefs.ui.gamepad.gca,
			gamepadMaps: prefs.ui.gamepad,
			normalize: {
				map: {
					x: 'y',
					y: 'x'
				},
				disable: 'nintendo'
			}
		});
		process.on('uncaughtException', cui.err);
		cui.bind('wheel');
		for (let char of 'abcdefghijklmnopqrstuvwxyz1234567890') {
			cui.bind(char, 'char-' + char);
		}
		cui.bind('space', 'char-_');
		if (prefs.load.online) {
			try {
				if (await updater.check()) {
					app.quit();
				}
			} catch (ror) {
				log('running in offline mode');
				offline = true;
			}
		}
		if ((arg.dev && !arg.setup) || premium.verify()) {
			await loadGameLib();
			if (!arg.dev && !prefs.saves) {
				cui.change('addSavesPathMenu_2');
			}
		} else if (await prefsMng.canLoad() && !premium.status) {
			cui.change('donateMenu');
		} else {
			prefs.version = pkg.version;
			cui.change('welcomeMenu');
		}
		await delay(1000);
		cui.resize(true);
	}

	await start();
};
