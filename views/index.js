/*
 * index.js : Nostlan : quinton-ashley
 *
 * Main file. Handles user interaction with the UI.
 */
module.exports = async function(args) {
	await require(args.__root + '/core/setup.js')(args);
	log('version: ' + pkg.version);
	global.util = require(__root + '/core/util.js');
	require(__root + '/core/jquery.textfill.min.js')();
	require('jquery-ui-dist/jquery-ui');

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
	prefs.args = args;

	global.sys = ''; // current system (name)
	global.syst = {}; // current system (object)
	global.sysStyle = ''; // style of that system
	global.emu = ''; // current emulator (name)
	global.offline = false;
	global.timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	// get the built-in supported systems + emulators
	global.systems = require(__root + '/core/systems.js');
	global.emus = require(__root + '/core/emulators.js');
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
	try {
		global.sharp = require('sharp');
	} catch (ror) {
		er(ror);
		global.jimp = require('jimp');
	}

	global.nostlan = {};

	let core = __root + '/core';
	nostlan.browser = require(core + '/browser.js');
	nostlan.launcher = require(core + '/launcher.js');
	nostlan.installer = require(core + '/installer.js');
	nostlan.saves = require(core + '/saves.js');
	nostlan.scan = require(core + '/scanner.js');
	nostlan.scraper = require(core + '/scraper.js');
	nostlan.themes = require(core + '/themes.js');
	nostlan.updater = require(core + '/updater.js');
	delete core;

	// only Patreon supporters can use premium features
	if (!args.dev) {
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

	nostlan.setup = async () => {
		// after the user uses the app for the first time
		// a preferences file is created
		// if it exists load it
		if (await prefsMng.canLoad()) {
			prefs = await prefsMng.load(prefs);
			prefs.args = args;
		}
		electron.getCurrentWindow().setFullScreen(
			prefs.ui.launchFullScreen);

		let sysMenu = `h1.title0\n`;
		let i = 0;
		for (let _sys in systems) {
			let _syst = systems[_sys];
			if (!_syst.emus) continue;
			if (i % 2 == 0) sysMenu += `.row.row-x\n`;
			sysMenu += `\t.col.cui(name="${_sys}") ${_syst.name}\n`;
			i++;
		}
		delete i;
		$('#sysMenu_5').append(pug(sysMenu));
		if (prefs.ui.autoHideCover) {
			$('nav').toggleClass('hide');
		}
		$('nav').hover(() => {
			if (prefs.ui.autoHideCover) {
				$('nav').toggleClass('hide');
				if (!$('nav').hasClass('hide')) {
					cui.resize(true);
				}
			}
		});

		cui.click($('#nav0'), 'x');
		cui.click($('#nav1'), 'start');
		cui.click($('#nav2'), 'y');
		cui.click($('#nav3'), 'b');

		require(__root + '/cui/_cui.js')();

		sys = args.sys || prefs.session.sys;
		// deprecated system id, change to 'n3ds'
		if (sys == '3ds') sys = 'n3ds';
		syst = systems[sys];
		cui.mapButtons(sys);

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

		for (let file of (await klaw(__root + '/cui'))) {
			let name = path.parse(file).name;
			if (name.slice(2) == '__') continue;
			cui[name] = require(file);
		}

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

		// https://www.geeksforgeeks.org/drag-and-drop-files-in-electronjs/
		document.addEventListener('drop', async (event) => {
			event.preventDefault();
			event.stopPropagation();

			for (const f of event.dataTransfer.files) {
				// Using the path attribute to get absolute file path
				let file = f.path;
				log('file dragged: ', file);
				await fs.move(file, prefs[sys].libs[0] + '/' + path.parse(file).base);
			}
			await cui.libMain.rescanLib();
		});

		document.addEventListener('dragover', (e) => {
			e.preventDefault();
			e.stopPropagation();
		});

		document.addEventListener('dragenter', (event) => {
			log('file is in the Drop Space');
		});

		document.addEventListener('dragleave', (event) => {
			log('file has left the Drop Space');
		});

		await nostlan.start();
	}

	nostlan.start = async () => {
		if (!prefs.ui.lang) {
			await cui.change('languageMenu');
			await delay(1000);
			cui.resize(true);
			return;
		}
		$('body').addClass('waiting');

		global.lang = JSON.parse(
			await fs.readFile(`${__root}/lang/${prefs.ui.lang}/${prefs.ui.lang}.json`, 'utf8'));

		if (prefs.ui.lang != 'en') {
			const deepExtend = require('deep-extend');
			let en = JSON.parse(
				await fs.readFile(`${__root}/lang/en/en.json`, 'utf8'));
			deepExtend(en, lang);
			lang = en;
			log(lang);
		}
		$('#dialogs').show();
		$('#loadDialog0').text(lang.loading.msg3 + ' v' + pkg.version);

		// convert all markdown files to html
		let files = await klaw(`${__root}/lang/en/md`);
		for (let file of files) {
			let dir = `${__root}/lang/${prefs.ui.lang}/md`;
			if (prefs.ui.lang != 'en' && !(await fs.exists())) {
				dir = `${__root}/lang/en/md`;
			}
			let base = path.parse(file).base;
			let data = await fs.readFile(dir + '/' + base, 'utf8');
			// this file has OS specific text
			if (base == 'setupMenu_1.md') {
				data = util.osmd(data);
			}
			data = data.replace(/\t/g, '  ');
			data = pug('.md', null, md(data));
			file = path.parse(file);
			$(`#${file.name} .md`).remove();
			$('#' + file.name).prepend(data);
		}
		files = null;
		delete files; // remove references to these variables

		// ensures the template dir structure exists
		// makes folders if they aren't there
		if (await prefsMng.canLoad()) {
			await cui.setupMenu.createTemplate();
		}

		if (prefs.load.online) {
			try {
				if (!args.dev && await nostlan.updater.check()) {
					electron.app.quit();
				}
			} catch (ror) {
				log('running in offline mode');
				offline = true;
			}
		}

		if (!offline) {
			await cui.loading.loadSharedAssets(['labels']);
		}
		let lblImg = prefs.nlaDir + '/images/labels/long/lbl0.png';
		$('.label-input img').prop('src', lblImg + '?' + Date.now());

		cui.editView('boxOpenMenu', {
			keepBackground: true,
			hoverCurDisabled: true
		});

		$('body').removeClass('waiting');
		cui.clearDialogs();
		if ((args.dev && !args.testSetup) || nostlan.premium.verify()) {
			await cui.libMain.load();
			if (!args.dev && !prefs.saves) {
				cui.change('addSavesPathMenu');
			}
		} else if (!args.testSetup && await prefsMng.canLoad() && !nostlan.premium.status) {
			cui.change('donateMenu');
		} else {
			prefs.version = pkg.version;
			cui.change('welcomeMenu');
		}
		await delay(1000);
		cui.resize(true);
	}

	nostlan.quit = async () => {
		cui.opt.haptic = false;
		// don't try to sync saves on quit
		// if there was an error
		// if developing nostlan
		// if user is not a patreon supporter
		if (cui.ui != 'alertMenu' &&
			!args.dev && nostlan.premium.verify()) {
			await cui.nostlanMenu.saveSync('quit');
		}
		// save the prefs file
		delete prefs.args;
		if (prefs.nlaDir) await prefsMng.save(prefs);
		electron.app.quit();
	}

	// first function to be called
	await nostlan.setup();
};
