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
		this.emuDirPath = '';
	}

	async getEmuAppPath(attempt) {
		if (!attempt) attempt = 0;
		let emuAppPath = util.absPath(prefs[emu].app);
		if (emuAppPath && await fs.exists(emuAppPath)) {
			return emuAppPath;
		}
		emuAppPath = '';
		let emuDirPath = '';
		if (win || (linux && /(cemu|rpcs3)/.test(emu)) ||
			(mac && /(mame)/.test(emu))) {
			emuDirPath = `${emuDir}/${sys}/${emu}`;
			if (emu == 'citra') {
				if (await fs.exists(emuDirPath + '/nightly-mingw')) {
					emuDirPath += '/nightly-mingw';
				} else {
					emuDirPath += '/canary-mingw';
				}
			}
			if (emu == 'yuzu') {
				emuDirPath = '$home/AppData/Local/yuzu/yuzu-windows-msvc';
				if (attempt == 1) emuDirPath += '-early-access';
				emuDirPath = util.absPath(emuDirPath);
			}
		} else if (mac) {
			emuDirPath = '/Applications';
		}
		let emuNameCases = [
			prefs[emu].name,
			prefs[emu].name.toLowerCase(),
			prefs[emu].name.toUpperCase()
		];
		for (let i = 0; i < emuNameCases.length; i++) {
			if (emuDirPath) {
				emuAppPath = emuDirPath + '/';
			}
			emuAppPath += emuNameCases[i];
			if (win) {
				if (emu == 'citra') emuAppPath += '-qt';
				if (emu == 'mgba') emuAppPath += '-sdl';
				if (emu == 'mame') emuAppPath += '64';
				if (emu == 'yuzu' && identify) emuAppPath += '-cmd';
				emuAppPath += '.exe';
			} else if (mac) {
				if (emu == 'bsnes') {
					emuAppPath += '_hd';
				} else if (emu == 'citra') {
					emuAppPath += `/nightly/${emuNameCases[1]}-qt`;
				} else if (emu == 'yuzu') {
					emuAppPath += '/' + emuNameCases[1];
				}
				if (emu != 'mame') {
					emuAppPath += '.app/Contents/MacOS';
				}
				if (emu == 'desmume') {
					emuAppPath += '/' + emuNameCases[0];
				} else if (emu != 'mame') {
					emuAppPath += '/' + emuNameCases[1];
				}
				if (emu == 'citra') {
					emuAppPath += '-qt';
				} else if (emu == 'yuzu') {
					emuAppPath += '-bin';
				}
				if (emu == 'mame') emuAppPath += '64';
			} else if (linux) {
				if (emu == 'dolphin') {
					emuAppPath = 'dolphin-emu';
				} else if (emu == 'cemu') {
					emuAppPath += '.exe';
				} else if (emu == 'rpcs3') {
					emuAppPath += '.AppImage';
				}
			}
			if (
				(linux && !(/(cemu|yuzu|rpcs3)/).test(emu)) ||
				await fs.exists(emuAppPath)
			) {
				if (!identify) prefs[emu].app = emuAppPath;
				return emuAppPath;
			}
		}
		// attempt to auto-find the app in a different place
		if (win && emu == 'yuzu' && attempt == 0) {
			return this.getEmuAppPath(1);
		}
		log(`couldn't find app at path:\n` + emuAppPath);
		emuAppPath = await dialog.selectFile('select emulator app');
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
		if (!identify) prefs[emu].app = emuAppPath;
		return emuAppPath;
	}

	async launch(game, opt) {
		opt = opt || {};
		if (game && game.id) {
			identify = false;
			log(game.id);
			if (!prefs.session[sys]) prefs.session[sys] = {};
			prefs.session[sys].gameID = game.id;
		}
		let emuAppPath;
		if (identify && sys == 'snes') {
			emuAppPath = __root + '/bin/icarus/icarus.exe';
		} else if (identify && sys == 'switch') {
			emuAppPath = await this.getEmuAppPath();
			let f = path.parse(emuAppPath);
			emuAppPath = f.dir + '/' + f.name + '-cmd' + f.ext;
			log(emuAppPath);
		} else {
			emuAppPath = await this.getEmuAppPath();
		}
		if (!emuAppPath) return;
		if (emu == 'mgba' && !game) {
			emuAppPath = emuAppPath.replace('-sdl', '');
		}
		this.cmdArgs = [];
		this.emuDirPath = path.join(emuAppPath, '..');
		if (linux) {
			if (emu == 'citra') {
				emuAppPath = 'org.citra.citra-canary'
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
				this.cmdArgs.push(emuAppPath);
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
				this.cmdArgs.push(this.emuDirPath);
			} else {
				this.cmdArgs.push(cmdArg);
			}
		}

		if (!identify && game && game.id || emu == 'mame') {
			// cui.removeView('libMain');
			cui.change('playing_4');
			$('#libMain').hide();
			$('#dialogs').show();
			$('#loadDialog0').text(`Starting ${prefs[emu].name}`);
			if (game) $('#loadDialog1').text(game.title);
		}
		if (!identify) log(this.cmdArgs);
		if (!identify) log(this.emuDirPath);
		this._launch();
		if ((win || linux) && emu == 'yuzu' && kb) {
			await delay(1500);
			kb.keyTap('f11');
		}
	}

	_launch() {
		let spawnOpt = {
			cwd: this.emuDirPath,
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
