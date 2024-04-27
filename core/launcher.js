/*
 * launcher.js : Nostlan : quinton-ashley
 *
 * Launches emulator apps with the command line args specified
 * in the user's config.json file.
 */
let child = require('child_process');

let identify = false;

class Launcher {
	constructor() {
		this.child = {}; // child process running an emulator
		this.state = 'closed'; // status of the process
		this.cmdArgs = [];
		this.emuAppDir = '';
		this.game = {};
		this.stdout = '';
	}

	async getMacExec(file) {
		let macExec = file;

		file = path.parse(file);

		if (file.ext != '.app') return macExec;

		macExec += '/Contents/MacOS/';

		let name = emus[emu].name.replace(/ /g, '');
		let execNames = [file.name, name, name.toLowerCase(), name.toUpperCase()];

		for (let execName of execNames) {
			if (await fs.exists(macExec + execName)) {
				macExec += execName;
				return macExec;
			}
		}
		// not found
		return;
	}

	async getEmuApp() {
		let emuApp = util.absPath(cf[emu].app);
		if (emuApp) {
			let isCmd = !/\//.test(emuApp);
			if ((linux && isCmd) || ((!linux || !isCmd) && (await fs.exists(emuApp)))) {
				return emuApp;
			}
		}
		let emuAppDirs = emus[emu].appDirs || [];
		if (emus[emu].jsEmu && emus[emu].multiSys) {
			emuAppDirs.push(`${systemsDir}/nostlan/jsEmu/${emu}`);
		} else {
			emuAppDirs.push(`${systemsDir}/${sys}/${emu}`);
		}
		if (mac) emuAppDirs.push('/Applications');

		for (let dir of emuAppDirs) {
			dir = util.absPath(dir);
			if (!(await fs.exists(dir))) continue;
			let files;
			const filterFunc = (item) => {
				// ignore alias to folders on drives that are not connected
				return fs.existsSync(item);
			};
			try {
				files = await klaw(dir, {
					depthLimit: 2,
					filter: filterFunc
				});
			} catch (ror) {
				// 'Incorrect path to emulator app directory. Delete or edit your user preferences file.'
				await cui.err(lang.playing.err0 + ' ' + ror, '406');
				return;
			}
			if (!emus[emu].appRegex) return;
			let regex = new RegExp(emus[emu].appRegex, 'i');
			for (let file of files) {
				let f = path.parse(file);

				if (regex.test(f.base)) {
					emuApp = file;
					if (mac) emuApp = await this.getMacExec(emuApp);
					if (emuApp && (await fs.exists(emuApp))) {
						cf[emu].app = emuApp;
						return emuApp;
					}
				}
			}
		}

		log(`couldn't find app at path: ` + emuApp);
		return '';
	}

	async launch(game, opt) {
		opt = opt || {};
		if (emus[emu].jsEmu) {
			await cui.alert('<img src="../views/img/kb_layout.png">');
		}
		this.state = 'launching';
		$('#dialogs').show();
		// 'launching'
		$('#loadDialog0').text(lang.playing.msg4 + ' ' + emus[emu].name);
		if (game && game.id) {
			identify = false;
			log(game.id);
			if (!cf.session[sys]) cf.session[sys] = {};
			cf.session[sys].gameID = game.id;
			game.file = util.absPath(game.file);
			this.game = game;
		}

		let emuApp = await this.getEmuApp();
		if (!emuApp) {
			cui.change('emuAppMenu');
			this.state = 'closed';
			return;
		}

		if (emus[emu].jsEmu) {
			if (!game) {
				cui.alert('Not configurable yet.', 'Alert');
				this.state = 'closed';
				return;
			}
			let dir = `${systemsDir}/${sys}/${emu}`;
			if (emus[emu].multiSys) {
				dir = `${systemsDir}/nostlan/jsEmu/${emu}`;
			}
			let jsEmuDir = __root;
			if (__root.slice(-4) == 'asar') jsEmuDir += '.unpacked';
			jsEmuDir += `/jsEmu/${emu}`;

			if (cf[emu].dev || cf[emu].version != emus[emu].latestVersion) {
				await fs.copy(jsEmuDir, dir, {
					overwrite: true
				});
				cf[emu].version = emus[emu].latestVersion;
				log('updated ' + emus[emu].name + ' to v' + cf[emu].version);
			}

			let cfg = {};
			Object.assign(cfg, cf[emu]);

			if (cfg.bios) {
				cfg.bios = util.absPath('$emu/' + cfg.bios);
				if (!(await fs.exists(cfg.bios))) {
					// "This emulator requires system bios file(s), search the internet!"
					cui.err(lang.playMenu.err0 + ': ' + cfg.bios, 404, 'libMain');
					cui.clearDialogs();
					$('body > :not(#dialogs)').removeClass('dim');
					this.state = 'closed';
					return;
				}
			}

			if (await fs.exists(dir + '/states')) {
				let files = await klaw(dir + '/states');
				cfg.saveStates = {};
				let gameName = path.parse(game.file).name;
				for (let file of files) {
					if (path.parse(file).name == gameName) {
						let slot = file.slice(-1);
						cfg.saveStates[slot] = {
							file: file,
							// data: data,
							date: (await fs.stat(file)).mtime.toLocaleString('en-US', {
								timeZone: timeZone
							})
						};
					}
				}
				if (!Object.keys(cfg.saveStates).length) {
					delete cfg.saveStates;
				}
			}

			cui.setUISub('jsEmu', true);

			for (let port in cf.jsEmu.keyboard) {
				let board = {};
				// default keyboard controls
				Object.assign(board, cf.jsEmu.keyboard[port]);
				if (cfg.keyboard) {
					// overridden by keyboard control settings
					// in the preferences for the emu (stored in cfg)
					Object.assign(board, cfg.keyboard[port]);
				}
				for (let btn in board) {
					cui.keyPress(board[btn], {
						state: 'jsEmu',
						act: btn,
						port: port
					});
				}
			}

			cfg.sys = sys;
			let fileHtml = emuApp;
			if (emus[emu].multiSys) {
				let mult = emus[emu].multiSys[sys];
				if (mult.core) {
					fileHtml += '?core=' + mult.core;
				}
			}

			// NOT a good way to do it
			// if (emu == 'webretro') fileHtml += '&rom=' + game.file;

			let preloadJS = __root + '/jsEmu/preload.js';
			$('body').prepend(
				`<webview id="jsEmu" enableremotemodule="false" src="${fileHtml}" preload="${preloadJS}"></webview>`
			);

			let jsEmu = $('#jsEmu').eq(0)[0];
			await new Promise((resolve) => {
				jsEmu.addEventListener('dom-ready', () => {
					resolve();
				});
			});
			if (cfg.dev) jsEmu.openDevTools();

			// FAIL: does not load the scripts in time, this approach does not work, leaving this here to remind myself
			// for (let src of ['GamepadsSpoof.js', 'Nostlan_' + emu + '.js']) {
			// 	let s = document.createElement('script');
			// 	s.type = 'text/javascript';
			// 	s.src = src;
			// 	await jsEmu.executeJavaScript(`document.body.append('${s.outerHTML}');`);
			// }

			this.cfg = cfg;
			this.jsEmu = jsEmu;

			jsEmu.setAudioMuted(false);
			if (cfg.mute) this.mute();

			let _this = this;
			jsEmu.addEventListener('ipc-message', async (event) => {
				let ping = JSON.parse(event.channel);

				log(ping);

				let file = ping.saveState || ping.save;

				let { data, ext } = file;
				data = String.fromCharCode(...data);

				let g = path.parse(_this.game.file);

				let f = dir;

				if (ping.saveState) {
					f += '/states/' + g.name + '_' + file.slot + ext;
				}
				if (ping.save) {
					f += '/saves/' + g.name + ext;
				}

				await fs.outputFile(f, data);
				let date = (await fs.stat(f)).mtime;
				date = date.toLocaleString('en-US', {
					timeZone: timeZone
				});

				if (ping.saveState) {
					if (!_this.cfg.saveStates) {
						_this.cfg.saveStates = {};
					}
					_this.cfg.saveStates[file.slot] = {
						f,
						data,
						date
					};
				}
			});

			await delay(1500);

			try {
				await jsEmu.executeJavaScript(`jsEmu.launch(${JSON.stringify(game)}, ${JSON.stringify(cfg)})`);
			} catch (ror) {
				this.stdout = ror;
				this.close(500);
				return;
			}

			await cui.change('playing_4');
			$('nav').hide();
			cui.clearDialogs();
			$('#libMain').hide();
			$('#boxOpenMenu_2').hide();
			this.state = 'running';
			return;
		}

		if (identify && sys == 'switch') {
			let f = path.parse(emuApp);
			emuApp = f.dir + '/' + f.name + '-cmd' + f.ext;
			log(emuApp);
		}
		if (emu == 'mgba' && !game) {
			emuApp = emuApp.replace('-sdl', '');
		}
		this.cmdArgs = [];
		this.emuAppDir = path.join(emuApp, '..');
		if (this.emuAppDir == '.') {
			this.emuAppDir = `${systemsDir}/${sys}/${emu}`;
		}
		if (emu == 'mame' && !(await fs.exists(this.emuAppDir + '/mame.ini'))) {
			let defaultIni = '~/Library/Application Support/mame/mame.ini';
			if (linux) defaultIni = '~/.mame/mame.ini';
			let ini;
			if (await fs.exists(defaultIni)) {
				ini = await fs.readFile(defaultIni, 'utf8');
			} else {
				try {
					await spawn('./mame', ['-cc'], {
						cwd: this.emuAppDir
					});
					ini = await fs.readFile(this.emuAppDir + '/mame.ini', 'utf8');
				} catch (ror) {
					cui.err(ror);
					return;
				}
			}
			// Nostlan's MAME defaults:
			// bitmap prescale to 3x native resolution
			// wait for vertical sync to avoid screen tearing
			// window mode for a better casual user experience
			ini = ini.replace(/prescale\s*\d/, 'prescale 3');
			ini = ini.replace(/waitvsync\s*\d/, 'waitvsync 1');
			ini = ini.replace(/window\s*\d/, 'window 1');
			await fs.outputFile(this.emuAppDir + '/mame.ini', ini);
			await fs.writeFile(this.emuAppDir + '/mame.ini', ini);
		}
		if (!identify) log(emu);
		let cmdArray = cf[emu].cmd || [];

		let gameFile;
		if (game) gameFile = game.file;
		if (game && syst.gameFolders && (await fs.stat(gameFile)).isDirectory()) {
			if (syst.gameRoot) gameFile += '/' + syst.gameRoot;
			let limit = syst.gameFolderSearchDepthLimit || 0;
			let files = await klaw(gameFile, {
				depthLimit: limit
			});
			log(files);
			for (let file of files) {
				if (syst.gameExts.includes(path.parse(file).ext.slice(1))) {
					gameFile = file;
					break;
				}
			}
		}
		if (!game && opt.update) {
			cmdArray = [];
			for (let cmdArg of emus[emu].update) {
				cmdArray.push(util.absPath(cmdArg));
			}
		}

		for (let cmdArg of cmdArray) {
			if (cmdArg == '${app}') {
				this.cmdArgs.push(emuApp);
				if (!game && emu != 'mame') break;
			} else if (cmdArg == '${game}' || cmdArg == '${game.file}') {
				this.cmdArgs.push(gameFile);
			} else if (cmdArg == '${game.id}') {
				this.cmdArgs.push(game.id);
			} else if (cmdArg == '${game.title}') {
				this.cmdArgs.push(game.title);
			} else if (cmdArg == '${cwd}') {
				this.cmdArgs.push(this.emuAppDir);
				if (!game) break;
			} else {
				this.cmdArgs.push(cmdArg);
			}
		}

		if ((game && game.id) || emu == 'mame') {
			await cui.change('playing_4');
			$('#libMain').hide();
			$('#boxOpenMenu_2').hide();
			// 'Starting'
			$('#loadDialog0').text(`${lang.playing.msg1} ${emus[emu].name}`);
			// `To close the emulator, press and hold the
			// ${btn} button for ${time} seconds`
			$('#loadDialog1').text(
				lang.playing.msg2_0 +
					` ${cf.inGame.quit.hold} ` +
					lang.playing.msg2_1 +
					' ' +
					(cf.inGame.quit.time / 1000).toFixed(0) +
					' ' +
					lang.playing.msg2_2
			);
			if (game) $('#loadDialog2').text(game.title);
		}
		if (!identify) log(this.cmdArgs);
		if (!identify) log('cwd: ' + this.emuAppDir);

		this._launch();

		if (sys == 'wii' && game && game.id && cui.gca?.connected && !cui.gamepadConnected) {
			// 'Unfortunately only one app at a time can be
			// connected to your Gamecube Controller
			// Adapter.  Nostlan will quit.'
			$('#loadDialog1').text(lang.playing.msg3);
			await delay(2000);
			await cui.doAction('quit');
			return;
		}
	}

	_launch() {
		let spawnOpt = {
			cwd: this.emuAppDir,
			stdio: 'pipe',
			detached: true
		};
		if (identify) delete spawnOpt.stdio;

		if (emu == 'ryujinx' || emu == 'ryujinx-ldn') {
			delete spawnOpt.detached;
		}
		this.child = child.spawn(this.cmdArgs[0], this.cmdArgs.slice(1) || [], spawnOpt);

		this.state = 'running';
		cui.disableSticks = true;

		let _this = this;

		function parseData(data) {
			_this.stdout += data;
		}

		this.child.stdout.on('data', parseData);
		this.child.stderr.on('data', parseData);

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

				/*
				 * Since Yuzu will no longer be updated, nostlan should
				 * not rely on Yuzu to identify nintendo switch games.
				 */

				// let idGame = () => {
				// 	if (finished) return;
				// 	let m;
				// 	if (emu == 'yuzu' && (m = /title_id=(\w{16})/.exec(out))) {
				// 		game.tid = m[1];
				// 	} else {
				// 		return;
				// 	}
				// 	finished = true;
				// 	this.close();
				// 	resolve(game);
				// };

				let parseData = (data) => {
					if (this.state == 'closing' || finished) return;
					out += data.toString();
					// idGame();
				};

				this.child.stdout.on('data', parseData);
				this.child.stderr.on('data', parseData);

				this.child.on('close', (code) => {
					this._close(code);
					// if (!finished) idGame();
					if (!finished) reject();
				});
			}),
			delay.reject(3000)
		]);
	}

	reset() {
		this.state = 'resetting';
		if (!emus[emu].jsEmu) {
			this.child.kill('SIGINT');
		} else {
			this.jsEmu.executeJavaScript('jsEmu.close();');
			this.jsEmu.remove();
			this.jsEmu = null;
			this.launch(this.game);
		}
	}

	async close(code) {
		this.state = 'closing';
		if (!emus[emu].jsEmu) {
			this.child.kill('SIGINT');
		} else {
			this._close(code);
			if (!code) await this.jsEmu.executeJavaScript('jsEmu.close();');
			this.jsEmu.remove();
			$('body').removeClass('jsEmu');
			this.jsEmu = null;
			cf[emu] = this.cfg;
			cui.setUISub(sys);
		}
	}

	pause() {
		this.state = 'paused';
		this.jsEmu.executeJavaScript('jsEmu.pause();');
		cui.change('pauseMenu');
		$('nav').show();
		$('body > :not(#dialogs)').removeClass('dim');
	}

	unpause() {
		this.state = 'running';
		this.jsEmu.executeJavaScript('jsEmu.unpause();');
		cui.change('playing_4');
		$('nav').hide();
		$('body > :not(#dialogs)').removeClass('dim');
	}

	saveState(slot) {
		this.jsEmu.executeJavaScript(`jsEmu.saveState(${slot || ''});`);
	}

	loadState(slot) {
		this.jsEmu.executeJavaScript(`jsEmu.loadState(${slot || ''});`);
	}

	mute() {
		this.jsEmu.executeJavaScript(`jsEmu.mute();`);
		this.jsEmu.setAudioMuted(true);
		this.cfg.mute = true;
	}

	unmute() {
		this.jsEmu.executeJavaScript(`jsEmu.unmute();`);
		this.jsEmu.setAudioMuted(false);
		this.cfg.mute = false;
	}

	openDevTools() {
		this.jsEmu.openDevTools();
	}

	async _close(code) {
		if (this.state == 'closed') return;
		cui.disableSticks = false;
		$('nav').show();
		if (!identify) {
			log(`emulator closed`);
			if (!this.jsEmu && this.state == 'resetting') {
				this._launch();
				return;
			}
			cui.hideDialogs();
			log('exited with code ' + code);
			if (cui.ui == 'playing') {
				// only one app at a time can be connected to the gca
				if (cui.gca?.connected) cui.gca.start();
				await cui.doAction('back');
			}
			$('body > :not(#dialogs)').removeClass('dim');
		}
		if (emu == 'project64' && code == 1) code = 0;
		if (linux && code == 1) {
			cui.change('emuAppMenu');
			this.state = 'closed';
			return;
		}
		if (!identify && code) {
			// ``${app} crashed! If the game didn't start it
			// might be because some emulators require
			// system firmware, BIOS, decryption keys, and
			// other files not included with the emulator.
			// Search the internet for instructions on how to
			// fully setup ${app}`
			let erMsg = '<p>' + emus[emu].name + ' ' + lang.playing.err2 + ' ' + `${emus[emu].name}.</p>\n`;
			erMsg += '<textarea rows=8>';
			for (let i in this.cmdArgs) {
				if (i == 0) erMsg += '$ ';
				erMsg += `${this.cmdArgs[i]} `;
			}
			erMsg += '\n' + this.stdout + '</textarea>';

			this.stdout = ''; // clear stdout
			cui.err(erMsg, code);
		}
		if (!identify) {
			electron.getCurrentWindow().focus();
			electron.getCurrentWindow().setFullScreen(cf.ui.launchFullScreen);
		}
		this.state = 'closed';
		identify = false;
	}
}

module.exports = new Launcher();
