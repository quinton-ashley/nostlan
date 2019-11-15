let child = require('child_process');

class Launcher {
	constructor() {
		this.emuChild = {}; // emuChild process running an emulator
		this.emuChild.state = 'closed'; // status of the process
	}

	async getEmuAppPath(emu, sys) {
		let emuAppPath = util.absPath(prefs[sys].app[osType]);
		if (emuAppPath && await fs.exists(emuAppPath)) {
			return emuAppPath;
		}
		emuAppPath = '';
		let emuDirPath = '';
		if (win || (linux && (/(cemu|rpcs3)/).test(emu)) ||
			(mac && emu == 'mame')) {
			emuDirPath = `${emuDir}/${prefs[sys].emu}/BIN`;
			if (emu == 'citra') {
				if (await fs.exists(emuDirPath + '/nightly-mingw')) {
					emuDirPath += '/nightly-mingw';
				} else {
					emuDirPath += '/canary-mingw';
				}
			}
			if (emu == 'yuzu') {
				emuDirPath = '$home/AppData/Local/yuzu/yuzu-windows-msvc';
				emuDirPath = util.absPath(emuDirPath);
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
				if (emu == 'citra') emuAppPath += '-qt';
				if (emu == 'mgba') emuAppPath += '-sdl';
				if (emu == 'mame') emuAppPath += '64';
				emuAppPath += '.exe';
			} else if (mac) {
				if (emu == 'citra') {
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
					emuAppPath += '-qt-bin';
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
				prefs[sys].app[osType] = emuAppPath;
				return emuAppPath;
			}
		}
		log(`couldn't find app at path:\n` + emuAppPath);
		emuAppPath = dialog.selectFile('select emulator app');
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

	async launch(emu, sys, game) {
		let id = cui.getCur('libMain').attr('id');
		log(id);
		if (!prefs.session[sys]) prefs.session[sys] = {};
		if (id) prefs.session[sys].gameID = id;
		if (!id) id = prefs.session[sys].gameID;
		let emuAppPath = await this.getEmuAppPath(emu, sys);
		if (!emuAppPath) return;
		let cmdArgs = [];
		let emuDirPath = path.join(emuAppPath, '..');
		if (linux) {
			if (emu == 'citra') {
				emuAppPath = 'org.citra.citra-canary'
			}
		}
		if (game) {
			if (emu == 'rpcs3') {
				game.file += '/USRDIR/EBOOT.BIN';
			}
			if (emu == 'cemu') {
				let files = await klaw(game.file + '/code');
				log(files);
				let ext, file;
				for (let i = 0; i < files.length; i++) {
					file = files[i];
					ext = path.parse(file).ext;
					if (ext == '.rpx') {
						game.file = file;
						break;
					}
				}
			}
		}
		log(emu);
		let cmdArray = prefs[sys].cmd[osType];
		for (let cmdArg of cmdArray) {
			if (cmdArg == '${app}') {
				cmdArgs.push(emuAppPath);
				if (!game) {
					break;
				}
			} else if (cmdArg == '${game}' || cmdArg == '${game.file}') {
				cmdArgs.push(game.file);
			} else if (cmdArg == '${game.id}') {
				cmdArgs.push(game.id);
			} else if (cmdArg == '${game.title}') {
				cmdArgs.push(game.title);
			} else if (cmdArg == '${cwd}') {
				cmdArgs.push(emuDirPath);
			} else {
				cmdArgs.push(cmdArg);
			}
		}

		if (game || emu == 'mame') {
			// cui.removeView('libMain');
			cui.change('playingBack');
			$('#libMain').hide();
			$('#dialogs').show();
			$('#loadDialog0').text(`Starting ${prefs[sys].emu}`);
			if (game) $('#loadDialog1').text(game.title);
		}
		log(cmdArgs);
		log(emuDirPath);

		this.emuChild = child.spawn(cmdArgs[0], cmdArgs.slice(1) || [], {
			cwd: emuDirPath,
			stdio: 'inherit',
			detached: true
		});

		this.emuChild.state = 'running';

		this.emuChild.on('close', (code) => {
			this.closeEmu(code, sys, cmdArgs);
		});
	}

	async closeEmu(code, sys, cmdArgs) {
		log(`emulator closed`);
		if (this.emuChild.state == 'resetting') {
			await this.powerBtn();
			return;
		}
		$('#libMain').show();
		cui.hideDialogs();
		if (cui.getCur('libMain').hasClass('selected')) {
			cui.change('coverSelect');
		} else if (cui.ui != 'libMain') {
			cui.change('libMain');
		}
		if (code) {
			let erMsg = `${prefs[sys].emu} was unable to start the game or crashed.  This is probably not an issue with Nostlan.  Check online to make sure ${prefs[sys].emu} can boot the game.\n<code>`;
			for (let i in cmdArgs) {
				if (i == 0) erMsg += '$ ';
				erMsg += `${cmdArgs[i]} `;
			}
			erMsg += '</code>';
			cui.err(erMsg, code);
		}
		log('exited with code ' + code);
		electron.getCurrentWindow().focus();
		electron.getCurrentWindow().setFullScreen(true);
		this.emuChild.state = 'closed';
	}
}

module.exports = new Launcher();
