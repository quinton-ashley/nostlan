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

	async install() {
		// 'installing'
		$('#loadDialog0').text(lang.emuAppMenu_6.msg0 +
			' ' + prefs[emu].name);
		// 'preparing to install'
		$('#loadDialog2').text(lang.emuAppMenu_6.msg1);
		let ins = prefs[emu].install;
		if (!Object.keys(ins).length) {
			// This emulator is not available for your
			// computer's operating system
			cui.err(lang.emuAppMenu_6.err0 + ": " + osType);
			return;
		}
		log('installing ' + prefs[emu].name);
		let distro;

		if (linux) distro = (await getDistro()).os;

		if (linux && (ins.pkgManager_flatpak ||
				(/arch/.test(distro) && ins.pkgManager_arch))) {
			let cmds = ins.pkgManager_flatpak ||
				ins.pkgManager_arch;
			log('running install script, please wait...');
			$('#loadDialog0').text(lang.emuAppMenu_6.msg2);
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
		let prmIdx = url.indexOf('?');
		let _url = (prmIdx != -1) ? url.slice(prmIdx)[0] : url;
		let ext = path.parse(_url).ext.toLowerCase();
		if (ext == '.gz') ext = '.tar.gz';
		if (ext == '.xz') ext = '.tar.xz';
		let file = dir + '/pkg' + ext;
		log('downloading, please wait...');
		$('#loadDialog2').text(lang.emuAppMenu_6.msg3);
		let res = await dl(url, file);
		if (!res) {
			// 'Could not download app from'
			cui.err(lang.emuAppMenu_6.err2 + ': ' + url);
			return;
		}
		if (/(zip|7z|rar|tar)/.test(ext)) {
			log('download complete, extracting files...');
			$('#loadDialog2').text(lang.emuAppMenu_6.msg4);
			await fs.extract(file, dir);
		}
		let files = await klaw(dir, {
			depthLimit: 0
		});
		// check if there's a top level folder
		// put contents in dir
		if (files.length == 1 && (await fs.stat(files[0])).isDirectory()) {
			await fs.copy(files[0], dir, {
				overwrite: true
			});
			await fs.remove(files[0]);
		}
		if (ins.installer) {
			files = await klaw(dir, {
				depthLimit: 0
			});
			ext = path.parse(files[0]).ext;
			if (/dmg|exe/.test(ext)) {
				// 'Installer not found in package'
				cui.err(lang.emuAppMenu_6.err3 + ': ' + url);
				return;
			}
			await spawn(files[0]);
		} else if (mac && ins.standalone) {
			files = await klaw(dir, {
				depthLimit: 2
			});
			for (let file of files) {
				if (path.parse(file).ext == '.app') {
					log('moving stand alone app to /Applications');
					$('#loadDialog2').text(lang.emuAppMenu_6.msg6 + ' /Applications');
					await fs.move(file, '/Applications/' + path.parse(file).base);
					break;
				}
			}
			// cleanup
			await fs.remove(dir);
			// ensure template dir
			await fs.ensureDir(dir);
		}
		$('#loadDialog2').text(lang.emuAppMenu_6.msg5);
		res = await launcher.getEmuApp();
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
