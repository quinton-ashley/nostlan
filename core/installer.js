/*
 * installer.js : Nostlan : quinton-ashley
 *
 * Installs emulator applications. Can be of type:
 * installer
 * pkgManager_flatpak
 * pkgManager_arch
 * portable
 * standalone
 */

const dl = require(__root + '/scrape/dl.js');
const getDistro = require('linux-distro');

class Installer {
	constructor() {}

	loadLog(msg) {
		log(msg);
		$('#loadDialog2').text(msg);
	}

	async install() {
		log('installing ' + prefs[emu].name);
		$('#loadDialog0').text(lang.emuAppMenu_6.msg0 +
			' ' + prefs[emu].name);
		// 'preparing to install'
		this.loadLog(lang.emuAppMenu_6.msg1);
		let ins = prefs[emu].install;
		if (!ins) {
			// This emulator is not available for your
			// computer's operating system
			cui.err(lang.emuAppMenu_6.err0 + ": " + osType);
			return;
		}
		let distro;

		if (linux) distro = (await getDistro()).os;

		if (linux && (ins.pkgManager_flatpak ||
				(/Arch/i.test(distro) && ins.pkgManager_arch))) {
			let cmds = ins.pkgManager_flatpak ||
				ins.pkgManager_arch;
			// 'running install script, please wait...'
			this.loadLog(lang.emuAppMenu_6.msg2);
			return await runInstallCmds(cmds);
		}

		let dir = `${systemsDir}/${sys}/${emu}`;
		await opn(dir);
		let url = ins.installer || ins.portable ||
			ins.standalone;
		if (!url) {
			// Automated install of this emulator with Nostlan
			// is not possible. You must install manually.
			cui.err(lang.emuAppMenu_6.err1);
			return;
		}
		url = url.split(' ');
		let ext;
		if (url.length == 2) ext = url[1];
		url = url[0];
		let prmIdx = url.indexOf('?');
		if (!ext) {
			let _url = (prmIdx != -1) ? url.slice(prmIdx)[0] : url;
			ext = path.parse(_url).ext.toLowerCase();
		}
		if (ext == '.gz') ext = '.tar.gz';
		if (ext == '.xz') ext = '.tar.xz';
		let file = dir + '/pkg' + ext;
		// 'downloading, please wait...'
		this.loadLog(lang.emuAppMenu_6.msg3);
		let res = await dl(url, file);
		if (!res) {
			// 'Could not download app from'
			cui.err(lang.emuAppMenu_6.err2 + ': ' + url);
			return;
		}
		if (/(zip|7z|rar|tar)/i.test(ext)) {
			// 'download complete, extracting files...'
			this.loadLog(lang.emuAppMenu_6.msg4);
			await fs.extract(file, dir);
		}
		let files = await klaw(dir, {
			depthLimit: 0
		});
		// check if there's a top level folder
		// put contents in dir
		if (files.length == 1 &&
			(await fs.stat(files[0])).isDirectory() &&
			(!mac || path.parse(files[0]).ext != '.app')) {
			await fs.copy(files[0], dir, {
				overwrite: true
			});
			await fs.remove(files[0]);
		}
		if (ins.installer) {
			files = await klaw(dir);
			res = false;
			for (let file of files) {
				ext = path.parse(file).ext;
				if (ext == '.dmg') {
					await opn(file);
					await delay(5000);
					res = file;
				} else if (ext == '.exe') {
					await spawn(file);
					res = file;
				}
			}
			if (!res) {
				// 'Installer not found in package'
				cui.err(lang.emuAppMenu_6.err3 + ': ' + url);
				return;
			}
			if (mac) {
				// find the ejectable install disk
				files = await klaw('/Volumes', {
					depthLimit: 0
				});
				let regex = `(${emu}|${emu.name}`;
				if (emu == 'citra') regex += '|dist';
				regex += ')';
				regex = new RegExp(regex, 'i');
				let disk;
				for (let file of files) {
					if (regex.test(file)) {
						disk = file;
					}
				}
				if (!disk) {
					// "couldn't find install disk,
					// finish install manually"
					this.loadLog(lang.emuAppMenu_6.err4);
					return true;
				}
				files = await klaw(disk, {
					depthLimit: 2
				});
				for (let file of files) {
					if (path.parse(file).ext == '.app') {
						if (/setup/i.test(file)) {
							file += '/Contents/MacOS/' +
								path.parse(file).name;
							// 'running setup app'
							this.loadLog(lang.emuAppMenu_6.msg7);
							try {
								await spawn(file);
							} catch (ror) {}
						} else {
							// move the app and any helper apps,
							// such as updaters, to Applications
							this.loadLog(lang.emuAppMenu_6.msg8 +
								' /Applications');
							let dest = '/Applications';
							dest += '/' + path.parse(file).base;
							await fs.copy(file, dest, {
								overwrite: true
							});
						}
					}
				}
				// 'finishing, ejecting all install disks'
				this.loadLog(lang.emuAppMenu_6.msg9);
				await spawn('osascript', ['-e',
					'tell application "Finder" to eject (every disk whose ejectable is true)'
				]);
				// 'finishing, deleting package file'
				this.loadLog(lang.emuAppMenu_6.msg10);
				await fs.remove(res);
			}
		} else if (mac && ins.standalone) {
			files = await klaw(dir);
			for (let file of files) {
				if (path.parse(file).ext == '.app') {
					// 'moving stand alone app to /Applications'
					this.loadLog(lang.emuAppMenu_6.msg6 +
						' /Applications');
					await fs.move(file, '/Applications/' +
						path.parse(file).base, {
							overwrite: true
						});
					break;
				}
			}
			// cleanup
			await fs.remove(dir);
			// ensure template dir
			await fs.ensureDir(dir);
		}
		this.loadLog(lang.emuAppMenu_6.msg5);
		res = await launcher.getEmuApp();
		if (!res) {
			// 'Install failed, you must manually install'
			cui.err(lang.emuAppMenu_6.err5 + ': ' + prefs[emu].name);
		}
		if (mac && res) {
			// fixes non-executable apps on macOS 10.15+
			await spawn('chmod', ['755', res]);
		}
		return res;
	}

	async runInstallCmds(cmds) {
		try {
			for (let cmd of cmds) {
				await spawn(cmd[0], this.cmdArgs.slice(1) || []);
			}
		} catch (ror) {
			er(ror);
			return;
		}
		return true;
	}
}

module.exports = new Installer();
