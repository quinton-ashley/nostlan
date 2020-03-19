/*
 * index.js
 * authors: quinton-ashley
 */
module.exports = async function(arg) {
	await require(arg.__root + '/core/setup.js')(arg);
	log('version: ' + pkg.version);

	// extract compressed folders using 7zip
	global.fs.extract = (input, output, opt) => {
		opt = opt || {};
		return new Promise(async (resolve, reject) => {
			opt.$bin = require('7zip-bin').path7za;
			require('node-7z').extractFull(input, output, opt)
				.on('end', () => {
					fs.remove(input);
					resolve(output);
				})
				.on('error', (ror) => {
					// er(ror);
					resolve();
				});
		});
	};

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
	let prefsMng = require(__root + '/prefs/prefsManager.js');
	prefsMng.prefsPath = usrDir + '/_usr/prefs.json';
	global.prefs = await prefsMng.loadDefaultPrefs();

	global.sys = ''; // current system
	global.syst = {};
	global.sysStyle = ''; // style of that system
	global.emu = ''; // current emulator
	global.offline = false;

	const saves = require(__root + '/core/saves.js');
	const premium = require(__root + '/dev/premium.js');
	global.launcher = require(__root + '/core/launcher.js');
	const updater = require(__root + '/core/updater.js');
	const themes = require(__root + '/themes/themes.js');
	const scan = require(__root + '/db/scanner.js');
	const scraper = require(__root + '/scrape/scraper.js');

	try {
		global.kb = require('robotjs');
		kb.setKeyboardDelay(0);
	} catch (ror) {
		er(ror);
	}

	global.systems = {
		arcade: {
			name: 'MAME',
			fullName: 'Multiple Arcade Machine Emulator',
			emus: ['mame']
		},
		ds: {
			name: 'DS',
			fullName: 'Nintendo DS',
			emus: ['melonds', 'desmume']
		},
		gba: {
			name: 'GBA',
			fullName: 'Nintendo Game Boy Advance',
			emus: ['mgba']
		},
		n3ds: {
			name: '3DS',
			fullName: 'Nintendo 3DS',
			emus: ['citra']
		},
		ps2: {
			name: 'PS2',
			fullName: 'Sony PlayStation 2',
			emus: ['pcsx2']
		},
		ps3: {
			name: 'PS3',
			fullName: 'Sony PlayStation 3',
			emus: ['rpcs3']
		},
		snes: {
			name: 'SNES',
			fullName: 'Super Nintendo',
			emus: ['bsnes']
		},
		switch: {
			name: 'Switch',
			fullName: 'Nintendo Switch',
			emus: ['yuzu']
		},
		wii: {
			name: 'Wii',
			fullName: 'Nintendo Wii',
			emus: ['dolphin']
		},
		wiiu: {
			name: 'Wii U',
			fullName: 'Nintendo Wii U',
			emus: ['cemu']
		},
		xbox360: {
			name: 'Xbox 360',
			fullName: 'Microsoft Xbox 360',
			emus: ['xenia']
		}
	};
	if (mac && !arg.dev) {
		delete systems.xbox360;
		delete systems.wiiu;
		delete systems.ps3;
		delete systems.switch;
	}

	let games = []; // array of current games from the systems' db
	global.emuDir = ''; // nostlan dir is stored here

	// I assume the user is using a smooth scroll trackpad
	// or apple mouse with their Mac.
	if (mac) {
		prefs.ui.mouse.wheel.multi = 0.5;
		prefs.ui.mouse.wheel.smooth = true;
	}

	async function intro() {
		$('#dialogs').show();
		await themes.loadFrame('intro');
		await themes.applyStyle('colors');
		await themes.applyStyle('theme');
	}

	async function reload() {
		// sysStyle = prefs[sys].style || sys;
		sysStyle = sys;
		cui.change('loading', sysStyle);
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
		}
		if (games.length == 0) {
			if (!emuDir) {
				cui.change('setupMenu');
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
					cui.err(`Game library does not exist: \n` + gameLibDir, 404, 'sysMenu');
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
					cui.err(`Game library has no game files`, 404, 'sysMenu');
					return;
				}
				gameLibDir = await dialog.selectDir(`select ${syst.name} game directory`);
				log(gameLibDir);
				if (!gameLibDir) continue;
				files = await klaw(gameLibDir);
			}
			gameLibDir = gameLibDir.replace(/\\/g, '/');
			if (await fs.exists(gameLibDir)) {
				if (!prefs[emu].libs) {
					prefs[emu].libs = [];
				}
				if (!prefs[emu].libs.includes(gameLibDir)) {
					prefs[emu].libs.push(gameLibDir);
				}
			} else {
				cui.err(`Couldn't load game library`, 404, 'sysMenu');
				await reload();
				return;
			}
			games = await scan.gameLib();
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
		await removeIntro();
		cui.change('libMain', sysStyle);
		cui.resize(true);
	}

	function osmd(data) {
		let arr = data.split(/\n(# os [^\n]*)/gm);
		data = '';
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].slice(0, 5) == '# os ') {
				if (win && arr[i].includes('win')) {
					data += arr[i + 1];
				} else if (linux && arr[i].includes('linux')) {
					data += arr[i + 1];
				} else if (mac && arr[i].includes('mac')) {
					data += arr[i + 1];
				}
				i++;
			} else {
				data += arr[i];
			}
		}
		return data;
	}

	async function updatePrefs() {

		// only keeps the app path for the current os
		for (let _sys in systems) {
			let _syst = systems[_sys];
			for (let _emu of _syst.emus) {
				if (typeof prefs[_emu].app == 'string') continue;
				if (prefs[_emu].app[osType]) {
					prefs[_emu].app = prefs[_emu].app[osType];
				} else {
					delete prefs[_emu].app;
				}
			}
		}

		// prefs version added in 1.8.x
		if (prefs.version) {
			prefs.version = pkg.version;
			return;
		}
		// update older versions of the prefs file
		if (prefs.ui.gamepad.mapping) delete prefs.ui.gamepad.mapping;
		if (prefs.ui.recheckImgs) delete prefs.ui.recheckImgs;
		if (prefs.ui.gamepad.profile) {
			prefs.ui.gamepad.default.profile = prefs.ui.gamepad.profile;
			delete prefs.ui.gamepad.profile;
		}
		if (prefs.ui.gamepad.map) {
			prefs.ui.gamepad.default.map = prefs.ui.gamepad.map;
			delete prefs.ui.gamepad.map;
		}
		if (prefs['3ds']) prefs.n3ds = prefs['3ds'];
		delete prefs['3ds'];
		if (prefs.ui.maxRows) {
			prefs.ui.maxColumns = prefs.ui.maxRows;
			delete prefs.ui.maxRows;
		}
		// move old bottlenose directory
		if (prefs.btlDir) {
			prefs.nlaDir = path.join(prefs.btlDir, '..') + '/nostlan';
			if (await fs.exists(prefs.btlDir)) {
				await fs.move(prefs.btlDir, prefs.nlaDir);
			}
			delete prefs.btlDir;
			emuDir = path.join(prefs.nlaDir, '..');
		}
		if (typeof prefs.donor == 'boolean') prefs.donor = {};
		if (prefs.saves) {
			for (let save of prefs.saves) {
				if (!save.noSaveOnQuit) save.noSaveOnQuit = false;
			}
		}
		for (let _sys in systems) {
			if (prefs[_sys]) {
				delete prefs[_sys].style;
				if (prefs[_sys].emu) prefs[_sys].name = prefs[_sys].emu;
				delete prefs[_sys].emu;
				if (_sys == 'arcade') continue;
				let _emu = prefs[_sys].name.toLowerCase();
				prefs[_emu] = prefs[_sys];
				delete prefs[_sys];
			}
		}

		// in 1.8.x the file structure of emuDir was changed
		for (let _sys in systems) {
			// TODO fix moving MAME folder
			if (_sys == 'arcade') continue;
			let _syst = systems[_sys];
			let _emu = _syst.emus[0];
			let moveDirs = [{
				src: `${emuDir}/${prefs[_emu].name}`,
				dest: `${emuDir}/${_sys}`
			}, {
				src: `${emuDir}/nostlan/${_sys}`,
				dest: `${emuDir}/${_sys}/images`
			}, {
				src: `${emuDir}/${_sys}/BIN`,
				dest: `${emuDir}/${_sys}/${_emu}`
			}, {
				src: `${emuDir}/${_sys}/GAMES`, // make lowercase
				dest: `${emuDir}/${_sys}/_games` // temp folder
			}, {
				src: `${emuDir}/${_sys}/temp/_games`,
				dest: `${emuDir}/${_sys}/games`
			}];
			// remove old game lib files, rescanning must be done
			await fs.remove(`${usrDir}/_usr/${_sys}Games.json`);

			for (let moveDir of moveDirs) {
				let srcExists = await fs.exists(moveDir.src);
				let destExists = await fs.exists(moveDir.dest);

				if (srcExists && !destExists) {
					try {
						await fs.move(moveDir.src, moveDir.dest);
					} catch (ror) {
						er(ror);
						continue;
					}
					delete prefs[_emu].libs;
					if (prefs[_emu].saves) {
						delete prefs[_emu].saves.dirs;
					}
					await fs.remove(moveDir.src);
				}
			}
			await fs.remove(`${emuDir}/nostlan/${_sys}`);

			if (prefs[_emu].app) {
				let emuApp = util.absPath(prefs[_emu].app);
				if (emuApp &&
					!(await fs.exists(emuApp))) {
					delete prefs[_emu].app;
				}
			}
		}

		prefs.version = pkg.version;
	}

	async function load() {
		let files = await klaw(__root + '/views/md');
		for (let file of files) {
			let data = await fs.readFile(file, 'utf8');
			let fileName = path.parse(file).name;
			if (fileName == 'setupMenu') {
				data = osmd(data);
			}
			data = data.replace(/\t/g, '  ');
			data = pug('.md', null, md(data));
			file = path.parse(file);
			$('#' + file.name).prepend(data);
		}
		if (await prefsMng.canLoad()) {
			await prefsMng.load();
			emuDir = path.join(prefs.nlaDir, '..');
			await updatePrefs();
			await createTemplate();
		}
		// currently supported systems
		let sysMenuHTML = '';
		let i = 0;
		for (let _sys in systems) {
			if (i % 2 == 0) sysMenuHTML += `.row.row-x\n`;
			sysMenuHTML += `\t.col.uie(name="${_sys}") ${systems[_sys].name}\n`;
			i++;
		}
		delete i;
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
		sys = arg.sys || prefs.session.sys;
		// deprecated system id, change to 'n3ds'
		if (sys == '3ds') sys = 'n3ds';
		syst = systems[sys];
		cui.mapButtons(sys);
	}

	cui.onResize = (adjust) => {
		if (!$('nav').hasClass('hide')) {
			let $cv = $('.console.view');
			let $cvSel = $cv.find('#view');
			let cvHeight = $cv.height();
			let cpHeight = $('.console.power').height();
			let mod = 24;
			if ((/ps/i).test(sys)) mod = -8;
			if (adjust || cvHeight != cpHeight) {
				$cvSel.css('margin-top', (cpHeight + mod) * .5 - cvHeight * .5 - 4);
				$('nav').height(cpHeight + 24);
			}
		}
		let $cur = cui.getCur();
		if ($cur.hasClass('selected')) {
			fitCoverToScreen($cur, $cur.parent());
		}
	};

	cui.onChange = (state, subState, gamepadConnected) => {
		let labels = [' ', ' ', ' '];
		if (state == 'coverSelect') {
			labels = ['Play', 'Flip', 'Back'];
			cui.getCur().addClass('no-outline');
		} else if (state == 'infoSelect') {
			labels = ['Manual', 'ImgDir', 'Back'];
			cui.getCur().addClass('no-outline');
		} else if (state == 'libMain') {
			labels = ['Power', 'Reset', 'Open'];
			cui.getCur(state).removeClass('no-outline');
		} else if (state == 'gameMediaSelect') {
			labels = ['Texp', 'File', 'Back'];
		} else if (
			state == 'sysMenu' ||
			(/game/i).test(state) ||
			state == 'themeMenu') {
			labels = [' ', ' ', 'Back'];
		} else if (state == 'pauseMenu') {
			labels = ['Quit', 'Mini', 'Back'];
		}
		$('.text.power').text(labels[0]);
		$('.text.reset').text(labels[1]);
		$('.text.open').text(labels[2]);

		function adjust(flip) {
			if (flip && $('nav.fixed-top').find('#view').length) {
				$('.console.open').css({
					'border-radius': '0 0 0 32px',
					'border-width': '0 0 8px 0'
				}).appendTo('nav.fixed-top');
				$('.console.view').css({
					'border-radius': '32px 0 0 0',
					'border-width': '8px 0 0 0'
				}).appendTo('nav.fixed-bottom');
			} else if (!flip && $('nav.fixed-top').find('#open').length) {
				$('.console.open').css({
					'border-radius': '32px 0 0 0',
					'border-width': '8px 0 0 0'
				}).appendTo('nav.fixed-bottom');
				$('.console.view').css({
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

		if (!gamepadConnected || !subState) {
			return;
		}
		$('#power span').text(buttons[0]);
		$('#reset span').text(buttons[1]);
		$('#open span').text(buttons[2]);
	}

	cui.afterChange = () => {
		if ((cui.uiPrev == 'loading' || cui.uiPrev == 'playingBack' || cui.uiPrev == 'errMenu') && cui.ui == 'libMain' && prefs.session[sys] && prefs.session[sys].gameID) {
			let $cur = $('#' + prefs.session[sys].gameID).eq(0);
			cui.makeCursor($cur);
			cui.scrollToCursor(250, 0);
		}
		if (cui.ui == 'infoSelect') {
			cui.makeCursor($('#gameMedia').eq(0));
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

	async function removeIntro(time) {
		time = arg.testLoadingTheme || time || prefs.load.delay;
		log('removing intro: ' + time);
		await delay(time);
		$('#intro').remove();
		cui.hideDialogs();
	}

	async function createTemplate() {
		for (let _sys in systems) {
			let _syst = systems[_sys];
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

	cui.onHeldAction = (act, isBtn, timeHeld) => {
		if (timeHeld < 2000) {
			return;
		}
		// log(act + ' held for ' + timeHeld);
		if (cui.ui == 'playingBack' && launcher.state == 'running') {
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

	function fitCoverToScreen($cur, $reel) {
		$reel.css('position', 'fixed');
		$reel.css('transform', `scale(${$(window).height()/$cur.height()})`);
		$reel.css('left', `${$(window).width()*.5-$cur.width()*.5}px`);
	}

	async function coverClicked() {
		let $cur = cui.getCur('libMain');
		if ($cur.hasClass('uie-disabled')) return false;
		let $reel = $cur.parent();
		$cur.toggleClass('selected');
		$reel.toggleClass('selected');
		$('.reel').toggleClass('bg');
		// $('nav').toggleClass('gamestate');
		if ($cur.hasClass('selected')) {
			let gameSys = $cur.attr('class').split(/\s+/)[0];
			cui.change('coverSelect', gameSys);
			cui.scrollToCursor(500, 0);
			fitCoverToScreen($cur, $reel);
		} else {
			cui.change('libMain', sysStyle);
			$reel.css('position', '');
			$reel.css('left', '');
			$reel.css('transform', '');
		}
		cui.resize(true);
	}

	function getCurGame() {
		let id = cui.getCur('libMain').attr('id');
		let game = games.find(x => x.id === id);
		if (game.file) {
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
			cui.change('addSavesPathMenu');
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

	cui.onAction = async function(act, isBtn) {
		log(act);
		let ui = cui.ui;
		if (ui == 'playingBack' || launcher.state == 'running') {
			return;
		}
		let onMenu = (/menu/gi).test(ui);
		if (act == 'quit') {
			if (premium.verify()) {
				for (let save of prefs.saves) {
					if (arg.dev || !save.noSaveOnQuit) {
						await saveSync('quit');
						break;
					}
				}
			}
			if (prefs.nlaDir) await prefsMng.save();
			app.quit();
			process.kill('SIGINT');
			return;
		}
		if (ui == 'libMain' || ui == 'coverSelect') {
			if (act == 'x') {
				await launcher.launch(getCurGame());
			}
		}
		if (act == 'start' && !onMenu) {
			cui.change('pauseMenu');
		} else if (act == 'b' && onMenu &&
			ui != 'donateMenu' && ui != 'setupMenu') {
			cui.doAction('back');
		} else if (act == 'select') {
			$('nav').toggleClass('hide');
			prefs.ui.autoHideCover = $('nav').hasClass('hide');
			let $elem = $('#themeMenu .uie[name="toggleCover"] .text');
			if (!prefs.ui.autoHideCover) {
				cui.resize(true);
				$elem.text('auto-hide cover overlay');
			} else {
				$elem.text('show cover overlay');
			}
		} else if (ui == 'libMain') {
			if (act == 'b' && !onMenu) {
				cui.change('sysMenu');
			} else if (act == 'y') {
				// launch without a game
				await launcher.launch();
			} else if (act == 'a' || !isBtn) {
				await coverClicked();
			}
		} else if (ui == 'coverSelect') {
			if ((act == 'a' || !isBtn) && cui.getCur('libMain').attr('class') &&
				(await scraper.imgExists(themes[cui.getCur('libMain').attr('class').split(/\s+/)[0] || sysStyle].template, 'boxOpen'))) {
				// return;
				// TODO finish open box menu
				let game = getCurGame();
				let template = themes[game.sys || sys].template;

				$('#gameBoxOpen').prop('src', await scraper.imgExists(template, 'boxOpen'));
				$('#gameBoxOpenMask').prop('src',
					await scraper.imgExists(template, 'boxOpenMask'));
				$('#gameMemory').prop('src', await scraper.imgExists(template, 'memory'));
				$('#gameManual').prop('src', await scraper.imgExists(template, 'manual'));

				let mediaName = 'disc';
				if (sys == 'snes' || sys == 'nes' || sys == 'switch' || sys == 'n3ds' || sys == 'ds' || sys == 'gba') {
					mediaName = 'cart';
				}
				let mediaImg = await scraper.imgExists(game, mediaName);
				if (!mediaImg) {
					mediaImg = await scraper.imgExists(template, mediaName);
				}
				$('#gameMedia').prop('src', mediaImg);
				cui.change('infoSelect');
				$('#libMain').hide();
			} else if (act == 'b') {
				await coverClicked();
			} else if (act == 'y') { // flip
				let $cur = cui.getCur();
				let ogHeight = $cur.height();
				await flipGameBox($cur);
				if (Math.abs(ogHeight - $cur.height()) > 10) {
					cui.resize();
					cui.scrollToCursor(0, 0);
				}
			}
		} else if (ui == 'infoSelect') {
			if (act != 'b') {
				if (act == 'x') act = 'Manual';
				if (act == 'y') {
					opn(await scraper.getImgDir(getCurGame()));
					return;
				}
				if (act == 'a') act = 'Media';
				if (!(/(memory|manual|media)/gi).test(act)) return;
				act = act[0].toUpperCase() + act.substr(1);
				act = 'game' + act + 'Select';
				$('#infoSelect').addClass('zoom-' + act);
				cui.change(act);
			} else {
				await coverClicked();
			}
		} else if ((/game/i).test(ui)) {
			if (act != 'back' && act != 'b' && ui == 'gameMediaSelect') {
				if (act == 'a' || act == 'media') {
					$('#infoSelect').removeClass('zoom-' + ui);
					cui.doAction('back');
					cui.change('libMain');
					await launcher.launch(getCurGame());
				} else if (act == 'y') { // Texp

				} else if (act == 'x') { // File
					opn(getCurGame().file);
				}
			} else if (act == 'b') {
				$('#infoSelect').removeClass('zoom-' + ui);
				cui.doAction('back');
			}
		} else if (ui == 'sysMenu' && !isBtn) {
			// if (!emu) {
			// 	return;
			// }
			cui.removeView('libMain');
			sys = act;
			syst = systems[sys];
			cui.removeCursor();
			await reload();
		} else if (ui == 'themeMenu') {
			if (act == 'toggleCover') {
				cui.buttonPressed('select');
			} else if (act == 'colors') {
				// TODO
			}
		} else if (ui == 'addSavesPathMenu') {
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
		} else if (ui == 'pauseMenu') {
			if (act == 'start') {
				cui.doAction('back');
			} else if (act == 'syncBackup' || act == 'forceUpdate') {
				await saveSync(act);
			} else if (act == 'fullscreen') {
				electron.getCurrentWindow().focus();
				electron.getCurrentWindow().setFullScreen(true);
			} else if (act == 'editAppearance') {
				cui.change('themeMenu');
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
				let $elem = $('#pauseMenu .uie[name="showConsole"] .text');
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
				await reload();
			} else if (act == 'donated') {
				cui.change('checkDonationMenu');
			}
		} else if (ui == 'checkDonationMenu') {
			if (act == 'continue') {
				let pass = $('#donorPassword').val();
				if (premium.verify(pass)) {
					await reload();
					if (premium.verify() && !prefs.saves) {
						cui.change('addSavesPathMenu');
					}
				} else {
					cui.change('donateMenu');
					cui.err('incorrect donor password');
				}
			}
		} else if (ui == 'welcomeMenu') {
			if (act == 'full') {
				cui.change('setupMenu');
			}
		} else if (ui == 'setupMenu') {
			if (act == 'continue') {
				if (!(await fs.exists(emuDir))) {
					cui.err('you must choose an install location!');
					return false;
				}
				cui.change('sysMenu');
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
		}
	}

	cui.click('#powerBtn', 'x');
	cui.click('#viewBtn', 'start');
	cui.click('#resetBtn', 'y');
	cui.click('#openBtn', 'b');

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

	async function addCover(game, column) {
		let boxSys = game.sys || sys;
		let imgType = '';
		let boxImgSrc = await scraper.imgExists(game, 'box');
		let coverImgSrc = '';
		// if box isn't found or if template
		if (!boxImgSrc || (themes[boxSys].default && game.id.substring(0, 9) == '_TEMPLATE')) {
			boxImgSrc = await scraper.imgExists(themes[boxSys].default, 'box');
			coverImgSrc = await scraper.imgExists(game, 'coverFull');
			imgType = '.coverFull';
			if (!coverImgSrc) {
				coverImgSrc = await scraper.imgExists(game, 'cover');
				imgType = '.cover';
				if (!coverImgSrc) {
					log(`no images found for game: ${game.id} ${game.title}`);
					return;
				}
			}
		}
		let box = `game#${game.id}.${boxSys}.uie`;
		// if game is a template don't let the user select it
		if (game.id.includes('_TEMPLATE')) {
			box += '.uie-disabled';
		}
		box += '\n';
		box += `  img.box(src="${boxImgSrc}")\n`;
		// used to crop the cover/coverfull image
		box += `  section.crop${imgType}\n`;
		box += `    img${imgType}`;
		if (!imgType) box += '.hide';
		box += `(src="${coverImgSrc}")\n`;
		box += `    .shade.p-0.m-0`;
		if (!(imgType || boxSys == 'switch' || boxSys == 'gba')) {
			box += '.hide';
		}
		$('.reel.r' + column).append(pug(box));
		return true;
	}

	async function addTemplates(cols) {
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < 4; j++) {
				await addCover(themes[sysStyle].template, i);
			}
		}
	}

	async function viewerLoad(recheckImgs) {
		cui.resize(true);
		cui.setMouse(prefs.ui.mouse, 100 * prefs.ui.mouse.wheel.multi);
		games = await scraper.loadImages(games, themes, recheckImgs);
		let cols = prefs.ui.maxColumns || 8;
		if (games.length < 42) cols = 8;
		if (games.length < 18) cols = 4;
		if (games.length < 4) cols = 2;
		$('style.gameViewerColsStyle').remove();
		let $glv = $('#libMain');
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

		await addTemplates(cols);
		await addGames(cols);
		await addTemplates(cols);

		cui.addView('libMain', {
			hoverCurDisabled: true
		});
		$('#view').css('margin-top', '20px');
	}

	async function addGames(cols) {
		let mameSetRegex = /set [2-9]/i;
		for (let i = 0, col = 0; i < games.length; i++) {
			try {
				while (col < cols) {
					if (i < games.length * (col + 1) / cols) {
						// temp code for hiding other game versions
						// the ability to select different versions of MAME games
						// aka "sets" will be added in the future
						if (sys == 'arcade') {
							if (mameSetRegex.test(games[i].title)) break;
							if (i != 0 && games[i - 1].img && games[i].img &&
								games[i - 1].img.box == games[i].img.box) break;
						}
						await addCover(games[i], col);
						break;
					}
					col++;
				}
			} catch (ror) {
				er(ror);
			}
		}
	}

	async function start() {
		electron.getCurrentWindow().setFullScreen(true);
		await load();
		// physical layout always matches the on screen postion of x and y
		// in the cover menu
		cui.start({
			v: true,
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
		if (premium.verify()) {
			await reload();
			if (!prefs.saves) {
				cui.change('addSavesPathMenu');
			}
		} else if (await prefsMng.canLoad() && !premium.status) {
			cui.change('donateMenu');
		} else {
			cui.change('welcomeMenu');
		}
		await delay(1000);
		cui.resize(true);
	}

	await start();
};
