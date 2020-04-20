/*
 * launcher.js : Nostlan : quinton-ashley
 *
 * Launches emulator apps with the command line args specified
 * in the user's prefs.json file.
 */
let child = require('child_process');

let identify = false;

class Launcher {
	constructor() {
		this.child = {}; // child process running an emulator
		this.state = 'closed'; // status of the process
		this.cmdArgs = [];
		this.emuAppDir = '';
	}

	async getemuApp(attempt) {
		if (!attempt) attempt = 0;
		let emuApp = util.absPath(prefs[emu].app);
		if (emuApp && await fs.exists(emuApp)) {
			return emuApp;
		}
		emuApp = '';
		let emuAppDir = '';
		// get emu dir path
		if (win || (linux && /(cemu|rpcs3)/.test(emu)) ||
			(mac && /(mame)/.test(emu))) {
			emuAppDir = `${emuDir}/${sys}/${emu}`;
			if (emu == 'citra') {
				if (await fs.exists(emuAppDir + '/nightly-mingw')) {
					emuAppDir += '/nightly-mingw';
				} else {
					emuAppDir += '/canary-mingw';
				}
			}
			if (emu == 'yuzu') {
				emuAppDir = '$home/AppData/Local/yuzu/yuzu-windows-msvc';
				if (attempt == 1) emuAppDir += '-early-access';
				emuAppDir = util.absPath(emuAppDir);
			}
		} else if (mac) {
			emuAppDir = '/Applications';
		}
		// try to find app in emu dir
		let name = prefs[emu].name.replace(/ /g, '');
		let emuNameCases = [
			name,
			name.toLowerCase(),
			name.toUpperCase()
		];

		function getMacExec() {
			let macExec = '';
			if (emu != 'mame') {
				macExec += '.app/Contents/MacOS';
			}
			if (emu == 'desmume') {
				macExec += '/' + emuNameCases[0];
			} else if (emu != 'mame') {
				macExec += '/' + emuNameCases[1];
			}
			if (emu == 'citra') macExec += '-qt';
			if (emu == 'mame') macExec += '64';
			if (emu == 'vba') macExec += '-m';
			if (emu == 'yuzu') macExec += '-bin';
			return macExec;
		}

		for (let i = 0; i < emuNameCases.length; i++) {
			if (i == 0 && emu == 'vba') continue;
			if (emuAppDir) {
				emuApp = emuAppDir + '/';
			}
			emuApp += emuNameCases[i];
			// add ons to the app's name
			if (emu == 'vba') emuApp += '-m';
			if (win) {
				if (emu == 'citra') emuApp += '-qt';
				if (emu == 'desmume') emuApp += '-VS2019-x64-Release';
				if (emu == 'mgba') emuApp += '-sdl';
				if (emu == 'mame') emuApp += '64';
				if (emu == 'snes9x') emuApp += '-x64';
				if (emu == 'yuzu' && identify) emuApp += '-cmd';
				emuApp += '.exe';
			} else if (mac) {
				if (emu == 'bsnes') {
					emuApp += '_hd';
				} else if (emu == 'citra') {
					emuApp += `/nightly/${emuNameCases[1]}-qt`;
				} else if (emu == 'yuzu') {
					emuApp += '/' + emuNameCases[1];
				}
				emuApp += getMacExec();
			} else if (linux) {
				if (emu == 'bsnes') emuApp += '_hd';
				if (emu == 'snes9x') emuApp += '-gtk';
				if (emu == 'dolphin') emuApp = 'dolphin-emu';
				if (emu == 'cemu') emuApp += '.exe';
				if (emu == 'rpcs3') emuApp += '.AppImage';
			}
			if ((linux && !/(cemu|yuzu|rpcs3)/.test(emu)) ||
				await fs.exists(emuApp)) {

				if (!identify) prefs[emu].app = emuApp;
				return emuApp;
			}
		}
		// attempt to auto-find the app in a different place
		if (win && emu == 'yuzu' && attempt == 0) {
			return this.getemuApp(1);
		}
		log(`couldn't find app at path:\n` + emuApp);
		emuApp = await dialog.selectFile('select emulator app');

		if (mac) emuApp += getMacExec();

		if (!(await fs.exists(emuApp))) {
			cui.err('app path not valid: ' + emuApp);
			return '';
		}
		if (!identify) prefs[emu].app = emuApp;
		return emuApp;
	}

	async launch(game, opt) {
		opt = opt || {};
		if (game && game.id) {
			identify = false;
			log(game.id);
			if (!prefs.session[sys]) prefs.session[sys] = {};
			prefs.session[sys].gameID = game.id;
		}
		let emuApp;
		if (identify && sys == 'snes') {
			emuApp = __root + '/bin/icarus/icarus.exe';
		} else if (identify && sys == 'switch') {
			emuApp = await this.getemuApp();
			let f = path.parse(emuApp);
			emuApp = f.dir + '/' + f.name + '-cmd' + f.ext;
			log(emuApp);
		} else {
			emuApp = await this.getemuApp();
		}
		if (!emuApp) return;
		if (emu == 'mgba' && !game) {
			emuApp = emuApp.replace('-sdl', '');
		}
		this.cmdArgs = [];
		this.emuAppDir = path.join(emuApp, '..');
		if (linux) {
			if (emu == 'citra') {
				emuApp = 'org.citra.citra-canary'
			}
		}
		if (!identify) log(emu);
		let cmdArray = prefs[emu].cmd;

		let gameFile;
		if (game) {
			gameFile = game.file;
			if (emu == 'rpcs3') {
				gameFile += '/USRDIR/EBOOT.BIN';
			}
			if (emu == 'cemu') {
				let files = await klaw(game.file + '/code');
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
		if (!game && opt.update) {
			cmdArray = [];
			for (let cmdArg of prefs[emu].update) {
				cmdArray.push(util.absPath(cmdArg));
			}
		}

		if (identify && sys == 'snes') {
			let cmdIcarus = [
				"${app}",
				"--system",
				"Super Famicom",
				"--manifest",
				"${game}",
			];
			if (mac || linux) cmdIcarus.unshift("wine64");
			cmdArray = cmdIcarus;
		}
		for (let cmdArg of cmdArray) {
			if (cmdArg == '${app}') {
				this.cmdArgs.push(emuApp);
				if (!game) {
					break;
				}
			} else if (cmdArg == '${game}' || cmdArg == '${game.file}') {
				this.cmdArgs.push(gameFile);
			} else if (cmdArg == '${game.id}') {
				this.cmdArgs.push(game.id);
			} else if (cmdArg == '${game.title}') {
				this.cmdArgs.push(game.title);
			} else if (cmdArg == '${cwd}') {
				this.cmdArgs.push(this.emuAppDir);
			} else {
				this.cmdArgs.push(cmdArg);
			}
		}

		if (game && game.id || emu == 'mame') {
			// cui.removeView('libMain');
			await cui.change('playing_4');
			$('#libMain').hide();
			$('#dialogs').show();
			$('#loadDialog0').text(`Starting ${prefs[emu].name}`);
			$('#loadDialog1').text(`To close the emulator, press and hold the ` +
				`"${prefs.inGame.quit.hold}" button for ` +
				`${(prefs.inGame.quit.time/1000).toFixed(0)} seconds`);
			$('#loadDialog2').text(game.title);
		}
		if (!identify) log(this.cmdArgs);
		if (!identify) log('cwd: ' + this.emuAppDir);

		this._launch();

		if (game && game.id && cui.gca.connected) {
			$('#loadDialog1').text('Unfortunately only one app at a time can be connected to the Gamecube Controller Adapter.  Nostlan will quit.');
			await delay(2000);
			await cui.doAction('quit');
			return;
		}

		if (kb && cui.ui == 'playing_4') {
			if ((win || linux) && /(yuzu|vba|snes9x)/.test(emu)) {
				await delay(1500);
				kb.keyTap('f11');
			} else if (win && emu == 'desmume') {
				await delay(1500);
				kb.keyTap('enter', 'alt');
			} else if (mac && /(mgba|vba)/.test(emu)) {
				// switch focus to app
				if (emu == 'mgba') {
					await delay(5000);
					kb.keyTap('f', 'command');
				} else if (emu == 'vba') {
					await delay(1500);
					kb.keyToggle('tab', 'down', ['command', 'shift']);
					await delay(500);
					kb.keyToggle('tab', 'up', ['command', 'shift']);
					kb.keyTap('enter');
				}
			}
		}
	}

	_launch() {
		let spawnOpt = {
			cwd: this.emuAppDir,
			stdio: 'inherit',
			detached: true
		};
		if (identify) delete spawnOpt.stdio;

		this.child = child.spawn(
			this.cmdArgs[0],
			this.cmdArgs.slice(1) || [],
			spawnOpt
		);

		this.state = 'running';
		cui.disableSticks = true;

		this.child.on('close', (code) => {
			this._close(code);
		});
	}

	async configEmu() {
		await this.launch();
	}

	async updateEmu() {
		await this.launch(null, {
			update: true
		});
	}

	async identifyGame(game, attempt) {
		if (typeof attempt == 'number') {
			identify = attempt;
		} else {
			identify = 1;
		}
		let finished = false;
		await this.launch(game);

		return await Promise.race([
			new Promise((resolve, reject) => {
				let out = '';

				let idGame = () => {
					if (finished) return;
					let m;
					if (emu == 'yuzu' &&
						(m = /title_id=(\w{16})/.exec(out))) {

						game.tid = m[1];

					} else if (sys == 'snes' &&
						(m = /game(\n[^\n]*){3}\n[^:]*: *([^\n]*)\n[^\-\n]*\-[^\-\n]*\-([^\n]*)/.exec(out))) {

						game.id = `${m[2]}-${m[3]}`;

					} else {
						return;
					}
					finished = true;
					this.close();
					resolve(game);
				}

				let parseData = (data) => {
					if (this.state == 'closing' || finished) return;
					out += data.toString();
					idGame();
				}

				this.child.stdout.on('data', parseData);
				this.child.stderr.on('data', parseData);

				this.child.on('close', (code) => {
					this._close(code);
					if (!finished) idGame();
					if (!finished) reject();
				});
			}),
			delay.reject(3000)
		]);
	}

	reset() {
		this.state = 'resetting';
		this.child.kill('SIGINT');
	}

	close() {
		this.state = 'closing';
		this.child.kill('SIGINT');
	}

	async _close(code) {
		cui.disableSticks = false;
		if (!identify) {
			log(`emulator closed`);
			if (this.state == 'resetting') {
				this._launch();
				return;
			}
			cui.hideDialogs();
			log('exited with code ' + code);
			if (cui.ui == 'playing_4') {
				// only one app at a time can be connected to the gca
				if (cui.gca.connected) cui.gca.start();
				await cui.doAction('back');
			}
		}
		if (!identify && code) {
			let erMsg = `${prefs[emu].name} crashed!  If the game didn't start it might be because some emulators require  system firmware, BIOS, decryption keys, and other files not included with the emulator.  Search the internet for instructions on how to fully setup ${prefs[emu].name}.\n<code>`;
			for (let i in this.cmdArgs) {
				if (i == 0) erMsg += '$ ';
				erMsg += `${this.cmdArgs[i]} `;
			}
			erMsg += '</code>';
			cui.err(erMsg, code);
		}
		if (!identify) {
			electron.getCurrentWindow().focus();
			electron.getCurrentWindow().setFullScreen(true);
		}
		this.state = 'closed';
	}
}

module.exports = new Launcher();
