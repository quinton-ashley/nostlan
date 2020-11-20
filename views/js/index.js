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

	try {
		global.kb = require('robotjs');
		kb.setKeyboardDelay(0);
	} catch (ror) {
		er(ror);
	}
	global.sharp = require('sharp');

	global.nostlan = {};

	let core = __root + '/core';
	nostlan.launcher = require(core + '/launcher.js');
	nostlan.installer = require(core + '/installer.js');
	nostlan.saves = require(core + '/saves.js');
	nostlan.scan = require(core + '/scanner.js');
	nostlan.scraper = require(core + '/scraper.js');
	nostlan.themes = require(core + '/themes.js');
	nostlan.updater = require(core + '/updater.js');
	delete core;

	// only Patreon supporters can use premium features
	if (!arg.dev) {
		nostlan.premium = require(__root + '/dev/premium.js');
	} else {
		nostlan.premium = {
			verify: () => {}
		};
	}

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
			await cui.languageMenu.create();
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

	cui.passthrough = (contro) => {
		if (!nostlan.launcher.jsEmu) return;

		nostlan.launcher.jsEmu.executeJavaScript(
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

	function quit() {
		cui.opt.haptic = false;
		// don't try to sync saves on quit
		// if there was an error
		// if developing nostlan
		// if user is not a patreon supporter
		if (ui != 'alertMenu_9999' &&
			!arg.dev && nostlan.premium.verify()) {
			await cui.nostlanMenu.saveSync('quit');
		}
		// save the prefs file
		if (prefs.nlaDir) await prefsMng.save(prefs);
		app.quit();
	}

	cui.click($('#nav0'), 'x');
	cui.click($('#nav1'), 'start');
	cui.click($('#nav2'), 'y');
	cui.click($('#nav3'), 'b');

	cui.onAction = async (act) => {
		let ui = cui.ui;
		log(act + ' on ' + ui);
		if (act == 'quit') {
			quit();
		} else if (nostlan.launcher.state == 'running') {
			if (nostlan.launcher.jsEmu) {
				if (ui == 'playing_4') {
					if (act == 'pause') {
						log('pausing emulation');
						nostlan.launcher.pause();
					}
				}
			}
		} else if (/key-./.test(act)) {
			// letter by letter search for game
			searchForGame(act.slice(4));
		} else if (act == 'x' && (ui == 'libMain' || ui == 'boxSelect_1')) {
			if (cui.getCursor().hasClass('cui-disabled')) return false;
			if (syst.emus.length > 1) {
				cui.change('playMenu_5');
			} else {
				$('body > :not(#dialogs)').addClass('dim');
				await nostlan.launcher.launch(cui.libMain.getCurGame());
			}
		} else if (act == 'start' && cui.getLevel(ui) < 10) {
			cui.change('nostlanMenu_10');
		} else if (act == 'b' && (/menu/i.test(ui) || /select/i.test(ui)) &&
			ui != 'donateMenu' && ui != 'setupMenu_1' &&
			ui != 'pauseMenu_10' && cui.getParent() != 'loading_1') {
			cui.doAction('back');
		} else if (act == 'select') {
			$('nav').toggleClass('hide');
			prefs.ui.autoHideCover = $('nav').hasClass('hide');
			let $elem = $('#interfaceMenu_12 .cui[name="toggleCover"] .text');
			if (!prefs.ui.autoHideCover) {
				cui.resize(true);
				$elem.text(lang.interfaceMenu_12.opt1[0]);
			} else {
				$elem.text(lang.interfaceMenu_12.opt1[1]);
			}
		}
	}

	cui.onHeldAction = async (act, timeHeld) => {
		if (timeHeld < 2000) {
			return;
		}
		// log(act + ' held for ' + timeHeld);
		if (nostlan.launcher.state == 'running') {
			if (
				nostlan.launcher.jsEmu &&
				act == prefs.inGame.pause.hold &&
				timeHeld > prefs.inGame.pause.time
			) {
				cui.doAction('pause');
			} else if (
				act == prefs.inGame.quit.hold &&
				timeHeld > prefs.inGame.quit.time
			) {
				log('shutting down emulator');
				nostlan.launcher.close();
			} else if (
				act == prefs.inGame.reset.hold &&
				timeHeld > prefs.inGame.reset.time
			) {
				log('resetting emulator');
				launcher.reset();
			}
		}
	}

	cui.onChange = async (state, subState) => {
		if (state == 'languageMenu') {
			cui.clearDialogs();
			return;
		}
		let labels = [' ', ' ', ' '];
		if (/(game|menu)/i.test(state)) {
			labels[2] = lang.nostlanMenu_10.msg0;
		}
		$('#nav0Lbl').text(labels[0]);
		$('#nav2Lbl').text(labels[1]);
		$('#nav3Lbl').text(labels[2]);

		// TODO UI translation, english ui /lang/en.js

		for (let elem in lang[state]) {
			let txt = lang[state][elem];
			if (typeof txt != 'string') txt = txt[0];
			let $elem = $(`#${state} .${elem}`);
			if (!$elem.length) $elem = $('#' + elem);
			if (!$elem.length) continue;
			$elem.text(txt);
		}

		let lbls = ['#nav0Lbl', '#nav2Lbl', '#nav3Lbl'];
		for (let lbl of lbls) {
			let $lbl = $(lbl);
			let $parent = $lbl.parent();
			let txt = $lbl.text();
			if (txt.includes(' ')) {
				$lbl.addClass('twoLines');
				$parent.addClass('twoLines');
			} else {
				$lbl.removeClass('twoLines');
				$parent.removeClass('twoLines');
			}
		}

		$('nav .text').textfill();

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
				if (!arg.dev && await nostlan.updater.check()) {
					app.quit();
				}
			} catch (ror) {
				log('running in offline mode');
				offline = true;
			}
		}
		cui.clearDialogs();
		if ((arg.dev && !arg.testSetup) || nostlan.premium.verify()) {
			await cui.libMain.load();
			if (!arg.dev && !prefs.saves) {
				cui.change('addSavesPathMenu_2');
			}
		} else if (await prefsMng.canLoad() && !nostlan.premium.status) {
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
