/*
 * index.js : Nostlan : quinton-ashley
 *
 * Main file. Handles user interaction with the UI.
 */
module.exports = async function(arg) {
	await require(arg.__root + '/core/setup.js')(arg);
	log('version: ' + pkg.version);
	global.util = require(__root + '/core/util.js');
	require(__root + '/core/jquery.textfill.min.js')();

	// Users can put their emu folder with all their games
	// emulator apps, and box art images anywhere they want but
	// the preferences file must be located at:
	// $home/Documents/emu/nostlan/_usr/prefs.json
	global.usrDir = util.absPath('$home/Documents/emu/nostlan');
	log(usrDir);

	global.ConfigEditor = require(__root + '/core/ConfigEditor.js');
	global.prefsMng = new ConfigEditor();
	prefsMng.configPath = usrDir + '/_usr/prefs.json';
	prefsMng.configDefaultsPath = __root + '/prefs/prefsDefaults.json';
	prefsMng.update = require(__root + '/prefs/prefsUpdate.js');
	global.prefs = await prefsMng.getDefaults();

	global.sys = ''; // current system (name)
	global.syst = {}; // current system (object)
	global.sysStyle = ''; // style of that system
	global.emu = ''; // current emulator (name)
	global.offline = false;
	global.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	// get the built-in supported systems + emulators
	global.systems = require(__root + '/core/systems.js');

	let games = []; // array of current games from the systems' db
	global.systemsDir = ''; // nostlan dir is stored here

	// Set default settings for scrolling on a Mac.
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
	let core = __root + '/core';
	global.launcher = require(core + '/launcher.js');
	const installer = require(core + '/installer.js');
	const saves = require(core + '/saves.js');
	const scan = require(core + '/scanner.js');
	const scraper = require(core + '/scraper.js');
	const themes = require(core + '/themes.js');
	const updater = require(core + '/updater.js');
	delete core;

	try {
		global.kb = require('robotjs');
		kb.setKeyboardDelay(0);
	} catch (ror) {
		er(ror);
	}

	global.sharp = require('sharp');

	// if the mouse moves show it
	// mouse is hidden when the user starts using a gamepad
	document.body.addEventListener('mousemove', function(e) {
		document.exitPointerLock();
	});

	// https://www.geeksforgeeks.org/drag-and-drop-files-in-electronjs/
	document.addEventListener('drop', (event) => {
		event.preventDefault();
		event.stopPropagation();

		for (const f of event.dataTransfer.files) {
			// Using the path attribute to get absolute file path
			console.log('File Path of dragged files: ', f.path)
		}
	});

	document.addEventListener('dragover', (e) => {
		e.preventDefault();
		e.stopPropagation();
	});

	document.addEventListener('dragenter', (event) => {
		console.log('File is in the Drop Space');
	});

	document.addEventListener('dragleave', (event) => {
		console.log('File has left the Drop Space');
	});


	async function intro() {
		$('#dialogs').show();
		await themes.loadFrame('intro');
		$('#themeStyles link').remove();
		await themes.applyStyle('colors');
		await themes.applyStyle('theme');
	}

	async function removeIntro(time) {
		time = time || prefs.load.delay;
		if (arg.testIntro) time = 1000000;
		log('removing intro: ' + time);
		await delay(time);
		$('#intro').remove();
		cui.hideDialogs();
	}

	async function setup() {
		// after the user uses the app for the first time
		// a preferences file is created
		// if it exists load it
		if (await prefsMng.canLoad()) {
			prefs = await prefsMng.load(prefs);
		} else if (arg.dev) {
			arg.testSetup = true;
		}
		electron.getCurrentWindow().setFullScreen(
			prefs.ui.launchFullScreen);

		let sysMenu_5 = `h1.title0\n`;
		let i = 0;
		for (let _sys in systems) {
			let _syst = systems[_sys];
			if (!_syst.emus) continue;
			if (i % 2 == 0) sysMenu_5 += `.row.row-x\n`;
			sysMenu_5 += `\t.col.cui(name="${_sys}") ${_syst.name}\n`;
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

		if (!prefs.ui.lang) {
			await createLanguageMenu();
		}

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
		process.on('uncaughtException', (ror) => {
			console.error(ror);
			cui.err(`<textarea rows=8>${ror.stack}</textarea>`,
				'Nostlan crashed :(', 'quit');
		});
		cui.bindWheel($('.reels'));

		// keyboard controls
		for (let char of 'abcdefghijklmnopqrstuvwxyz') {
			cui.keyPress(char, 'key-' + char);
			char = char.toUpperCase();
			cui.keyPress(char, 'key-' + char);
		}
		for (let char of '1234567890!@#$%^&*()') {
			cui.keyPress(char, 'key-' + char);
		}
		cui.keyPress('space', 'key- ');

		cui.keyPress('[', 'x');
		cui.keyPress(']', 'y');
		cui.keyPress('\\', 'b');
		cui.keyPress('|', 'start');

		await start();
	}

	async function createLanguageMenu() {
		let iso_639_1 = require('iso-639').iso_639_1;
		let langFolders = await klaw(__root + '/lang');
		let title = 'Language Menu';
		if (global.lang) title = lang.languageMenu.title0;
		let elems = `h1 ${title}\n`;
		for (let x of langFolders) {
			x = path.parse(x).base;
			if (!iso_639_1[x]) continue;
			elems += `.cui(name='${x}') `;
			elems += iso_639_1[x].name + '\n';
		}
		log(elems);
		$('#languageMenu').empty();
		$('#languageMenu').append(pug(elems));
	}

	async function loadGameLib(gameLibDir) {
		// sysStyle = prefs[sys].style || sys;
		sysStyle = sys;
		cui.change('loading_1', sysStyle);
		// 'loading your game library'
		let ld0 = lang.loading_1.msg0_0 + ' ';
		ld0 += syst.fullName + ' ';
		ld0 += lang.loading_1.msg0_1;
		$('#loadDialog0').text(ld0);
		// set emu to the default for the current OS
		for (let _emu of syst.emus) {
			if (!prefs[_emu].cmd && !prefs[_emu].jsEmu) continue;
			emu = _emu;
			break;
		}
		await intro();
		let gamesPath = `${systemsDir}/${sys}/${sys}Games.json`;
		// if prefs exist load them if not copy the default prefs
		games = [];
		if (await fs.exists(gamesPath)) {
			games = JSON.parse(await fs.readFile(gamesPath)).games || [];

			// user possibly has a fresh prefs.json file
			// if prefs[sys] doesn't exist but a
			// gameLib file does
			if (!prefs[sys] || !prefs[sys].libs) {
				prefs[sys] = {
					libs: []
				};
			}
		}
		if (games.length == 0) {
			if (!systemsDir) {
				await removeIntro(0);
				cui.change('setupMenu_1');
				return;
			}

			gameLibDir = gameLibDir ||
				`${systemsDir}/${sys}/games`;
			log('searching for games in: ' + gameLibDir);

			if (!(await fs.exists(gameLibDir))) {
				await removeIntro(0);
				await cui.change('sysMenu_5');
				// 'game library does not exist: '
				cui.err(syst.name + ' ' +
					lang.sysMenu_5.msg0 + ': ' +
					gameLibDir, 404, 'emptyGameLibMenu_6');
				return;
			}
			let files = await klaw(gameLibDir);
			if (!files.length || (
					files.length == 1 &&
					(['.DS_Store', 'dir.txt'].includes(
						path.parse(files[0]).base))
				)) {
				await removeIntro(0);
				await cui.change('sysMenu_5');
				// 'game library has no game files'
				cui.err(syst.name + ' ' +
					lang.sysMenu_5.msg1 + ': ' +
					gameLibDir, 404, 'emptyGameLibMenu_6');
				return;
			}
			if (!prefs[sys]) prefs[sys] = {};
			if (!prefs[sys].libs) prefs[sys].libs = [];
			if (!prefs[sys].libs.includes(gameLibDir)) {
				prefs[sys].libs.push(gameLibDir);
			}
			games = await scan.gameLib();
			if (!games.length) {
				await removeIntro(0);
				await cui.change('sysMenu_5');
				cui.change('emptyGameLibMenu_6');
				return;
			}
		}
		systemsDir = systemsDir.replace(/\\/g, '/');
		prefs.nlaDir = systemsDir + '/nostlan';
		try {
			await fs.ensureDir(prefs.nlaDir);
		} catch (ror) {
			er(ror);
		}
		prefs.session.sys = sys;
		cui.mapButtons(sys);
		await prefsMng.save(prefs);
		if (premium.verify()) {
			await saves.update();
		}
		await viewerLoad();

		cui.removeView('playMenu_5');
		cui.removeView('emuMenu_5');
		let playMenu = 'h1.title0\n';
		let emuMenu = 'h1.title0\n';
		for (let _emu of syst.emus) {
			// if cmd not found emulator is not available
			// for the operating system
			if (!prefs[_emu].cmd && !prefs[_emu].jsEmu) continue;

			playMenu += `.col.cui(name="${_emu}") ${prefs[_emu].name}\n`;

			// TODO check if user has the emulator
			// if they do add the configure and update buttons
			// else add a button to install
			emuMenu += `.col.cui(name="${_emu}_config") ` +
				`${lang.emuMenu_5.msg0} ${prefs[_emu].name}\n`;

			if (prefs[_emu].update) {
				emuMenu += `.col.cui(name="${_emu}_update") ` +
					`${lang.emuMenu_5.msg1} ${prefs[_emu].name}\n`;
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
		// 'loading additional images'
		$('#loadDialog0').text(lang.loading_1.msg1);
		let gh = 'https://github.com/quinton-ashley/nostlan-img/raw/master/shared';
		let dir = prefs.nlaDir + '/images';

		let assetPacks = ['discSleeve', 'wraps'];

		for (let pack of assetPacks) {
			$('#loadDialog1').text(pack);
			let url = gh + `/${pack}.zip`;
			let file = dir + `/${pack}.zip`;
			if (!(await fs.exists(dir + '/' + pack))) {
				await fs.ensureDir(dir);
				file = await scraper.dl(url, file, {
					timeout: 10000
				});
				if (!file) break;
				await fs.extract(file, dir);
			}
		}
		$('#loadDialog1').text('');
		// 'loading complete!'
		$('#loadDialog0').text(lang.loading_1.msg2);
	}

	cui.passthrough = (contro) => {
		if (!launcher.jsEmu) return;

		launcher.jsEmu.executeJavaScript(
			`jsEmu.controIn(${JSON.stringify(contro)})`
		);
	};

	cui.onResize = (adjust) => {};

	cui.clearDialogs = () => {
		$('#loadDialog0').text('');
		$('#loadDialog1').text('');
		$('#loadDialog2').text('');
	}

	cui.hideDialogs = () => {
		$('#dialogs').hide();
		cui.clearDialogs();
	}

	async function createTemplate() {
		for (let _sys in systems) {
			let _syst = systems[_sys];
			if (!_syst.emus) continue;
			for (let i in _syst.emus) {
				let _emu = _syst.emus[i];
				let templateDir = `${systemsDir}/${_sys}/${_emu}`;

				let emuAppDirs = prefs[_emu].appDirs || [];
				for (let dir of emuAppDirs) {
					dir = util.absPath(dir);
					if (!(await fs.exists(dir))) continue;
					if (linux) {
						let testDir = dir + '/nostlanTest';
						try {
							await fs.ensureDir(testDir);
							await fs.remove(testDir);
						} catch (ror) {
							if (!prefs.load.readOnlyFS) {
								opn(dir);
								await cui.error(lang.setupMenu_1.err2 + '\n' + dir,
									lang.setupMenu_1.err1, 'quit');
							}
						}
					}
					try {
						await fs.ensureSymlink(dir, templateDir, 'dir');
					} catch (ror) {
						er(ror);
					}
					break;
				}
				if (!(await fs.exists(templateDir))) {
					await fs.ensureDir(templateDir);
				}
				if (i > 0) continue;
				// games and/or images dirs might be in a special place
				// for example the 'roms' folder of MAME
				async function ensureSysDirs(dirType) {
					let defaultDir = `${systemsDir}/${_sys}/${dirType}`;
					dirType += 'Dir';
					if (!prefs[_emu][dirType]) {
						await fs.ensureDir(defaultDir);
					} else if (!(await fs.exists(defaultDir))) {
						// look for dedicated games dir
						let dir = templateDir + '/' + prefs[_emu][dirType];
						await fs.ensureDir(dir);
						if (linux) {
							let testDir = dir + '/nostlanTest';
							try {
								await fs.ensureDir(testDir);
								await fs.remove(testDir);
							} catch (ror) {
								if (!prefs.load.readOnlyFS) {
									opn(dir);
									await cui.error(lang.setupMenu_1.err2 + '\n' + dir,
										lang.setupMenu_1.err1, 'quit');
								}
							}
						}
						try {
							await fs.ensureSymlink(dir, defaultDir, 'dir');
						} catch (ror) {
							er(ror);
						}
					}
				}

				await ensureSysDirs('games');
				await ensureSysDirs('images');
			}
		}
	}

	function fitCoverToScreen($cursor) {
		let $reel = $cursor.parent();
		let $menu = $reel.parent();
		let idx = $menu.children().index($reel);
		let scale = $(window).height() / $cursor.height();
		$menu[0].style.transform = `scale(${scale}) translate(${-($reel.width()*idx + $cursor.width()*.5 - $(window).width()*.5)}px, 0)`;
	}

	async function changeImageResolution($cursor, changeToFullRes) {
		let $images = $cursor.find('img');
		for (let i = 0; i < 4; i += 2) {
			if ($images.eq(i).hasClass('hide')) continue;
			if ((changeToFullRes &&
					$images.eq(i).css('display') == 'none') ||
				(!changeToFullRes &&
					$images.eq(i).css('display') == 'block')) {
				continue;
			}
			let img = $images.eq(i).prop('src');
			if (!img) continue;
			img = path.parse(img);
			img.name = img.name.replace('Thumb', '');
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
			let $img = $images.eq(i + 1);
			if ($img.prop('src') != src) {
				$img.prop('src', src);
			}

			function swap() {
				let showIdx = i + 1;
				let hideIdx = i;
				if (!changeToFullRes) {
					showIdx = i;
					hideIdx = i + 1;
				}
				$images.eq(showIdx).css('display', 'block');
				$images.eq(hideIdx).css('display', 'none');
				$img[0].onload = () => {};
			};
			if (!$img[0].complete) {
				$img[0].onload = swap;
			} else {
				swap();
			}
		}
	}

	cui.beforeMove = ($cursor, state) => {
		if (state == 'boxSelect_1') {
			changeImageResolution($cursor);
		}
	}

	cui.afterMove = ($cursor, state) => {
		if (state == 'boxSelect_1') {
			changeImageResolution($cursor, 'full');
			fitCoverToScreen($cursor);
			cui.makeCursor($cursor, 'libMain');
		}
	}

	function getCurGame() {
		let id = cui.getCursor('libMain').attr('id');
		if (/^_TEMPLATE/.test(id)) return;
		let game = games.find(x => x.id === id);
		if (game && game.file) {
			game.file = util.absPath(game.file);
			return game;
		}
		cui.err(lang.libMain.err0 + ': ' + id);
	}

	async function saveSync(act) {
		if (!premium.verify()) {
			// 'You must be a Patreon supporter to access
			// this feature.  Restart Nostlan and enter your // donor verfication password.'
			cui.err(lang.premium.msg0);
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



	quit() {
		cui.opt.haptic = false;
		// don't try to sync saves on quit
		// if there was an error
		// if developing nostlan
		// if user is not a patreon supporter
		if (ui != 'alertMenu_9999' && !arg.dev && premium.verify()) {
			await saveSync('quit');
		}
		// save the prefs file
		if (prefs.nlaDir) await prefsMng.save(prefs);
		app.quit();
	}

	cui.boxSelect_1.onAction(act, $cur) {
		if (ui == 'interfaceMenu_12') {
			if (act == 'toggleCover') {
				cui.buttonPressed('select');
			} else if (act == 'theme') {
				if (!premium.verify()) {
					cui.err(lang.premium.msg0);
					return;
				}
				cui.removeView('themeMenu_13');
				let themeMenu = 'h1.title0\n';
				for (let palette of (await themes.getColorPalettes())) {
					let p = palette.sys + ' ' + palette.name;
					if (!palette.name) palette.name = 'default';
					palette = systems[palette.sys].name + ' ' + palette.name;
					themeMenu += `.col.cui(name="${p}") ${palette}\n`;
				}
				$('#themeMenu_13').append(pug(themeMenu));
				cui.addView('themeMenu_13');
				cui.change('themeMenu_13');
			}
		} else if (ui == 'themeMenu_13') {
			act = act.split(' ');
			$('body').removeClass();
			cui.change('interfaceMenu_12', act[0]);
			$('body').addClass(act[1]);
			prefs[sys].colorPalette = act[1];
		} else if (ui == 'addSavesPathMenu_2') {
			if (act == 'add') {
				let save = {
					name: $('#saveName').val(),
					backups: $('#saveNumOfBackups').val()
				}
				if (!save.name || !save.backups) {
					// name and number of backups required
					cui.err(lang.addSavesPathMenu_2.err0);
					return;
				}
				save.backups = Number(save.backups);
				if (save.backups < 1) {
					// '1 save backup required'
					cui.err(lang.addSavesPathMenu_2.err1);
					return;
				}
				// 'Select a save sync location'
				let msg = lang.addSavesPathMenu_2.msg0;
				save.dir = await dialog.selectDir(msg);

				if (!(await fs.exists(save.dir))) {
					// 'Not a valid folder'
					cui.err(lang.addSavesPathMenu_2.err2);
					return;
				}
				if (!prefs.saves) prefs.saves = [];
				prefs.saves.push(save);
				await saveSync('syncUpdate');
			}
		} else if (ui == 'pauseMenu_10') {
			if (act == 'start') {
				// nostlan main menu is not available
				// when running emulators
				cui.err(lang.pauseMenu_10.err0);
			} else if (act == 'unpause' || act == 'b' || act == 'pause') {
				launcher.unpause();
			} else if (act == 'saveState') {
				cui.change('saveStateMenu_11');
			} else if (act == 'loadState') {
				cui.change('loadStateMenu_11');
			} else if (act == 'mute') {
				let $elem = $('#pauseMenu_10 .cui[name="mute"] .text');
				if ($elem.text().includes('un')) {
					launcher.unmute();
					// 'mute'
					$elem.text(lang.pauseMenu_10.opt4[1]);
				} else {
					launcher.mute();
					// 'unmute'
					$elem.text(lang.pauseMenu_10.opt4[0]);
				}
			} else if (act == 'stop') {
				await cui.change('playing_4');
				launcher.close();
			}
		} else if (ui == 'saveStateMenu_11' && /slot\d/.test(act)) {
			let slot = act.slice(4);
			log('saving state to slot ' + slot);
			launcher.saveState(slot);
			launcher.unpause();
		} else if (ui == 'loadStateMenu_11' && /slot\d/.test(act)) {
			let slot = act.slice(4);
			log('loading save state from slot ' + slot);
			launcher.loadState(slot);
			launcher.unpause();
		} else if (ui == 'nostlanMenu_10') {
			if (act == 'start') {
				cui.doAction('back');
			} else if (act == 'syncBackup' || act == 'forceUpdate') {
				await saveSync(act);
			} else if (act == 'fullscreen') {
				prefs.ui.launchFullScreen = !prefs.ui.launchFullScreen;
				electron.getCurrentWindow().focus();
				electron.getCurrentWindow().setFullScreen(
					prefs.ui.launchFullScreen);
			} else if (act == 'gameLibMenu') {
				cui.change('gameLibMenu_11');
			} else if (act == 'x') {
				cui.doAction('quit');
			} else if (act == 'settings') {
				cui.change('settingsMenu_11');
			} else if (act == 'minimize' ||
				act == 'prefs' || act == 'y') {
				electron.getCurrentWindow().minimize();
			} else if (act == 'patreon') {
				opn('https://www.patreon.com/nostlan');
			} else if (act == 'help') {
				// nostlan discord invite link
				opn('https://discord.gg/G8qrmT');
			}
		} else if (ui == 'gameLibMenu_11') {
			let recheckImgs = (act == 'scanForImages');
			let fullRescan = (act == 'rescanGameLib');
			if (act == 'scanForGames' || recheckImgs || fullRescan) {
				cui.removeView('libMain');
				cui.change('loading_1');
				await intro();
				if (!recheckImgs) {
					if (!fullRescan) {
						games = await scan.gameLib(games);
					} else {
						games = await scan.gameLib();
					}
				}
				await viewerLoad(recheckImgs);
				await removeIntro();
				cui.change('libMain');
				cui.scrollToCursor(0);
			} else if (act == 'info') {
				cui.change('gameLibInfoMenu_12');
			} else if (act == 'identifyGames' || act == 'imageSearch') {
				// "This option is not available yet!"
				// "Not Implemented"
				cui.alert(lang.alertMenu_9999.msg0,
					lang.alertMenu_9999.title4);
			}
		} else if (ui == 'settingsMenu_11') {
			if (act == 'editAppearance') {
				cui.change('interfaceMenu_12');
			} else if (act == 'controllerSettings') {
				cui.change('controllerMenu_12');
				let nameMsg = `<div>Name: ${cui.gamepadId}</div>`;
				let typeMsg = '';
				if (cui.gamepadConnected) {
					typeMsg = `<div>Type: ${cui.gamepadType}</div>`;
				}
				$('#controllerMenu_12 #controName').html(nameMsg);
				$('#controllerMenu_12 #controType').html(typeMsg);
				$('#prof0').text(prefs.ui.gamepad.xbox_ps.profile);
				$('#prof1').text(prefs.ui.gamepad.nintendo.profile);
				$('#prof2').text(prefs.ui.gamepad.other.profile);
			} else if (act == 'languageMenu') {
				await createLanguageMenu();
				cui.addListeners('#languageMenu');
				if (cui.ui == 'settingsMenu_11') {
					cui.removeView('libMain');
					cui.removeCursor();
				}
				cui.change('languageMenu');
			} else if (act == 'editPrefs') {
				opn(prefsMng.configPath);
				cui.doAction('quit');
			} else if (act == 'toggleConsole') {
				electron.getCurrentWindow().toggleDevTools();
				let $elem = $('#nostlanMenu_10 .cui[name="toggleConsole"] .text');
				if ($elem.text().includes('show')) {
					// 'hide console'
					$elem.text(lang.settingsMenu_11.opt2[1]);
				} else {
					// 'show console'
					$elem.text(lang.settingsMenu_11.opt2[0]);
				}
			}
		} else if (ui == 'donateMenu') {
			if (act == 'verify') {
				cui.change('checkDonationMenu_1');
			} else if (act == 'patreon') {
				opn('https://www.patreon.com/nostlan');
			} else if (act == 'remind') {
				await loadGameLib();
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
					// 'incorrect donor password'
					cui.err(lang.donateMenu.err0);
				}
			}
		} else if (ui == 'welcomeMenu') {
			if (act == 'full') {
				await prefsMng.update(prefs);
				cui.change('setupMenu_1');
			}
		} else if (ui == 'setupMenu_1') {
			if (act == 'finishSetup') {
				if (!(await fs.exists(systemsDir))) {
					// 'You must choose an install location!'
					cui.err(lang.setupMenu_1.err0);
					return false;
				}
				await prefsMng.save(prefs);
				cui.change('sysMenu_5');
				return;
			}
			if (act == 'newDefaultInstall') {
				systemsDir = util.absPath('$home') + '/Documents';
			} else if (act == 'newInstall') {
				// 'choose the folder you want the template to go in'
				let msg = lang.setupMenu_1.msg0;
				systemsDir = await dialog.selectDir(msg);
			}
			systemsDir += '/emu';
			if (!systemsDir) return false;
			await createTemplate();
			opn(systemsDir);
			if (!(await fs.exists(systemsDir))) return false;
		} else if (ui == 'languageMenu') {
			prefs.ui.lang = act;
			await start();
		} else if (ui == 'emuMenu_5' || ui == 'playMenu_5') {
			// change emu to the selected emu
			// or run with the previously selected emu
			// by double clicking/pressing x or y
			let acts = act.split('_');
			if (syst.emus.includes(acts[0])) {
				emu = acts[0];
			} else if (act != 'x' && act != 'y') {
				return;
			}
			$('body > :not(#dialogs)').addClass('dim');
			if (acts[1] == 'update') {
				await launcher.updateEmu();
			} else if (acts[1] == 'config' || ui == 'emuMenu_5') {
				await launcher.configEmu();
			} else {
				await launcher.launch(getCurGame());
			}
		} else if (ui == 'emuAppMenu_6') {
			if (act == 'install') {
				let res = await installEmuApp();
				if (!res) return;
				// 'Success!' 'Installed'
				cui.alert(lang.emuAppMenu_6.msg11 + ' ' +
					prefs[emu].name, lang.alertMenu_9999.title0,
					'doubleBack');
			} else if (act == 'find') {
				// 'Select emulator app'
				let emuApp = await dialog.selectFile(
					lang.playing_4.msg0);
				if (mac) {
					emuApp = await launcher.getMacExec(emuApp);
				}
				if (!(await fs.exists(emuApp))) {
					// 'Emulator app not found at'
					cui.err(lang.playing_4.err1 + ': ' + emuApp);
					return;
				}
				prefs[emu].app = emuApp;
				cui.doAction('back');
			}
		} else if (ui == 'emptyGameLibMenu_6') {
			if (act == 'find') {
				log('user selecting gameLibDir');
				// `select ${syst.name} games folder`
				let gameLibDir = await dialog.selectDir(
					lang.emptyGameLibMenu_6.msg0_0 + ' ' +
					syst.name + ' ' +
					lang.emptyGameLibMenu_6.msg0_1);
				log('user selected: ' + gameLibDir);
				if (!gameLibDir ||
					!(await fs.exists(gameLibDir))) {
					// 'Game library does not exist'
					cui.err(syst.name + ' ' +
						lang.sysMenu_5.msg0 + ': ' +
						gameLibDir, 404);
					return;
				}
				await loadGameLib(gameLibDir);
			} else if (act == 'install') {
				let app = await launcher.getEmuApp();
				if (app) {
					cui.err(lang.emptyGameLibMenu_6.err0 + ' ' + app);
					return;
				}
				app = await installEmuApp();
				if (!app) return;
				// 'Success!' 'Installed'
				cui.alert(lang.emuAppMenu_6.msg11 + ' ' +
					prefs[emu].name, lang.alertMenu_9999.title0,
					'sysMenu_5');
			}
		}
	}

	async function installEmuApp() {
		$('body > :not(#dialogs)').addClass('dim');
		cui.clearDialogs();
		$('#dialogs').show();
		let wdw = electron.getCurrentWindow();
		wdw.focus();
		wdw.setFullScreen(false);
		let res = await installer.install();
		wdw.focus();
		wdw.setFullScreen(prefs.ui.launchFullScreen);
		cui.clearDialogs();
		$('body > :not(#dialogs)').removeClass('dim');
		if (res) {
			await createTemplate();
		}
		return res;
	}

	cui.click($('#nav0'), 'x');
	cui.click($('#nav1'), 'start');
	cui.click($('#nav2'), 'y');
	cui.click($('#nav3'), 'b');

	async function editImgSrc($cursor, $img, game, name) {
		if (!game) return;
		let img = await scraper.imgExists(game, name);
		// log(img);
		if (!img) return;
		$img.prop('src', img);
		let prevClass = $img.attr('class');
		if (prevClass) {
			prevClass = prevClass.replace(/(hq|crop) */g, '');
		}
		let $elems;
		if (prevClass && prevClass != 'hide') {
			$elems = [
				$cursor.find('.hq.' + prevClass)
			];
		} else {
			$elems = [
				$cursor.find('section'),
				$cursor.find('section img.hq')
			];
		}
		for (let $elem of $elems) {
			$elem.removeClass(prevClass);
			$elem.addClass(name);
		}
		return img;
	}

	async function flipGameBox($cursor) {
		let game = getCurGame();
		let template = themes[game.sys || sys].template;
		if (!$cursor.hasClass('flip')) {
			$cursor.addClass('flip');
			let $box = $cursor.find('.box.hq').eq(0);
			if (!(await editImgSrc($cursor, $box, game, 'boxBack'))) {
				if (!(await editImgSrc($cursor, $box, template, 'boxBack'))) {
					await editImgSrc($cursor, $box, template, 'box');
				}
			} else {
				return;
			}
			$cursor.find('.shade').removeClass('hide');
			let $cover = $cursor.find('img.cover.hq');
			if (!$cover.length) {
				$cover = $cursor.find('img.coverFull.hq');
				if ($cover.length) {
					$cover.eq(0).removeClass('hide');
					return;
				}
				$cover = $cursor.find('section img.hq');
			}
			$cover = $cover.eq(0);
			for (let name of ['coverFull', 'coverBack']) {
				for (let g of [game, template]) {
					if (await editImgSrc($cursor, $cover, g, name)) break;
				}
			}
			$cover.removeClass('hide');
		} else {
			$cursor.removeClass('flip');
			let $box = $cursor.find('img.boxBack.hq');
			log($box);
			if (!$box.length) $box = $cursor.find('img.box.hq');
			if (!$box.length) return;
			$box = $box.eq(0);
			log($box);
			let hasBox = true;
			for (let g of [game, template]) {
				if (await editImgSrc($cursor, $box, g, 'box')) break;
				hasBox = false;
			}
			if ((game.sys || sys) != 'switch') $cursor.find('.shade').addClass('hide');
			let $cover = $cursor.find('img.coverBack.hq');
			if (!$cover.length) $cover = $cursor.find('img.coverFull.hq');
			if (!$cover.length) $cover = $cursor.find('section img.hq');
			$cover = $cover.eq(0);
			if (hasBox) {
				$cover.addClass('hide');
			} else {
				let name = '';
				for (name of ['coverFull', 'cover']) {
					if (await editImgSrc($cursor, $cover, game, name)) break;
				}
				if (name == 'coverFull') $cursor.find('.shade').removeClass('hide');
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
			// if box img is not found
			noBox = (!boxImg);
			if (noBox) {
				boxImg = await scraper.getImg(themes[_sys].template, 'box');
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
					log(`no images found for game: [${game.id}] ${game.title}`);
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
		let box = `game#${game.id}.${_sys}.cui`;
		// if game is a template don't let the user select it
		if (isTemplate) {
			box += '.cui-disabled';
		}
		box += '\n';
		box += `  img.box.lq(src="${boxImg}")\n`;
		box += `  img.box.hq\n`;
		// used to crop the cover/coverfull image
		box += `  section.crop${coverType}\n`;
		box += `    img${coverType}.lq`;
		if (!coverType) box += '.hide';
		box += `(src="${coverImg}")\n`;
		box += `    img${coverType}.hq\n`;
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
						$('#loadDialog2').text(`${i+1}/${games.length} ${lang.loading_1.msg4}`);
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
		if (!prefs.ui.mouse.delta) {
			prefs.ui.mouse.delta =
				100 * prefs.ui.mouse.wheel.multi;
		}
		cui.setMouseOptions(prefs.ui.mouse);
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
.reel .cui.cursor {
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
	}

	async function start() {
		if (!prefs.ui.lang) {
			cui.change('languageMenu');
			await delay(1000);
			cui.resize(true);
			return;
		}

		global.lang = JSON.parse(
			await fs.readFile(`${__root}/lang/${prefs.ui.lang}/${prefs.ui.lang}.json`, 'utf8'));

		if (prefs.ui.lang != 'en') {
			const deepExtend = require('deep-extend');
			let en = JSON.parse(
				await fs.readFile(`${__root}/lang/en/en.json`, 'utf8'));
			deepExtend(en, lang);
		}

		$('loadDialog0').text(lang.loading_1.msg3);

		// convert all markdown files to html
		let files = await klaw(`${__root}/lang/${prefs.ui.lang}/md`);
		for (let file of files) {
			let data = await fs.readFile(file, 'utf8');
			let fileName = path.parse(file).name;
			// this file has OS specific text
			if (fileName == 'setupMenu_1') {
				data = util.osmd(data);
			}
			data = data.replace(/\t/g, '  ');
			data = pug('.md', null, md(data));
			file = path.parse(file);
			$(`#${file.name} .md`).remove();
			$('#' + file.name).prepend(data);
		}
		files = null;
		delete files;

		// ensures the template dir structure exists
		// makes folders if they aren't there
		if (await prefsMng.canLoad()) {
			await createTemplate();
		}

		if (prefs.load.online) {
			try {
				if (!arg.dev && await updater.check()) {
					app.quit();
				}
			} catch (ror) {
				log('running in offline mode');
				offline = true;
			}
		}
		cui.clearDialogs();
		if ((arg.dev && !arg.testSetup) || premium.verify()) {
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

	// first function to be called
	await setup();
};
