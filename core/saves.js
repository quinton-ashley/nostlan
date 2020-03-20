const path = require('path');

class Saves {
	constructor() {}

	async setup() {
		if (!prefs[emu].saves) prefs[emu].saves = {};

		if (emu == 'melonds' || emu == 'mgba') {
			prefs[emu].saves.dirs = prefs[emu].libs;
			return true;
		}
		let emuAppPath = util.absPath(prefs[emu].app);
		if (!emuAppPath || !(await fs.exists(emuAppPath))) {
			return;
		}
		let dir = path.join(emuAppPath, '..');
		dir = dir.replace(/\\/g, '/');

		if (emu == 'cemu') {
			prefs[emu].saves.dirs = [dir + '/mlc01/usr/save'];
		} else if (emu == 'citra') {
			dir = util.absPath('$home') + '/AppData/Roaming/Citra/sdmc';
			prefs[emu].saves.dirs = [dir];
		} else if (emu == 'desmume') {
			if (mac) dir = util.absPath('$home') + '/Library/Application Support/DeSmuME/0.9.11';
			prefs[emu].saves.dirs = [
				dir + '/Battery',
				dir + '/Cheats',
				dir + '/States'
			];
		} else if (emu == 'dolphin') {
			dir += '/User';
			if (mac && !(await fs.exists(dir))) {
				dir = util.absPath('$home') + '/Library/Application Support/Dolphin';
			}
			if (!(await fs.exists(dir))) {
				cui.err(`"User" folder not found. "User" folder needs to be in the same folder as "Dolphin.exe". To make a build use a local "User" directory, create a text file named "portable" next to the executable files of the app (Dolphin.exe). Including the file extension, it should be named "portable.txt". Dolphin will check if that file exists in the same directory, then it will not use a global "User" directory, instead it will create and use the local "User" directory in the same directory. For more info look at: https://dolphin-emu.org/docs/guides/controlling-global-user-directory/`);
				return;
			}
			prefs[emu].saves.dirs = [
				dir + '/GC',
				dir + '/Wii/title',
				dir + '/StateSaves'
			];
		} else if (emu == 'mame') {
			prefs[emu].saves.dirs = [dir + '/sta'];
		} else if (emu == 'pcsx2') {
			prefs[emu].saves.dirs = [
				dir + '/memcards',
				dir + '/sstates'
			];
		} else if (emu == 'ppsspp') {
			dir += '/memstick/PSP';
			prefs[emu].saves.dirs = [
				dir + '/SAVEDATA',
				dir + '/PPSSPP_STATE'
			];
		} else if (emu == 'rpcs3') {
			dir += '/dev_hdd0/home/00000001/savedata';
			prefs[emu].saves.dirs = [dir];
		} else if (emu == 'xenia') {
			dir = util.absPath('$home') + '/Documents/Xenia/content';
			prefs[emu].saves.dirs = [dir];
		} else if (emu == 'yuzu') {
			let dir0 = util.absPath('$home') + '/AppData/Roaming/yuzu';
			let dir1 = path.join(prefs.nlaDir, '../switch/yuzu');
			if (await fs.exists(dir1 + '/nand')) dir = dir1;
			prefs[emu].saves.dirs = [
				dir + '/nand/user/save',
				dir0 + '/load' // mods
			];
		} else {
			delete prefs[emu].saves;
			log('save sync not supported for this emu: ' + emu);
			return false;
		}
		return true;
	}

	async _backup(onQuit) {
		let date = Math.trunc(Date.now() / 10000);

		for (let save of prefs.saves) {

			if (save.noSaveOnQuit) {
				log('no save on quit for ' + save.name);
				continue;
			}

			let dir = `${save.dir}/nostlan_saves/${emu}/${date}`;

			for (let i in prefs[emu].saves.dirs) {
				let src = prefs[emu].saves.dirs[i];
				let dest = dir + '/' + i;
				log(`Backing up files to ${save.name} from ${src}`);
				$('#loadDialog0').text(`Backing up files to ${save.name} from`);
				$('#loadDialog1').text(src);
				try {
					await fs.ensureDir(dest);
				} catch (ror) {
					er(ror);
					cui.err('can not save to cloud/backup saves folder: ' + dest);
					return;
				}
				if (emu == 'melonds' || emu == 'mgba') {
					let files = await klaw(src, {
						depthLimit: 0
					});
					for (let file of files) {
						await fs.copy(file, dest + '/' + path.parse(file).base, {
							filter: function(file) {
								let ext = path.parse(file).ext.toLowerCase();
								if (ext == '.nds' || ext == '.gba' || ext == '') return;
								return true;
							}
						});
					}
				} else {
					await fs.copy(src, dest);
				}
			}
			$('#loadDialog0').text('');
			$('#loadDialog1').text('');
			prefs[emu].saves.date = date;

			dir = `${save.dir}/nostlan_saves/${emu}`;
			let backups = await klaw(dir, {
				depthLimit: 0
			});

			if (!save.backups || backups.length <= save.backups) {
				continue;
			}

			let oldest = 10000000000000;
			for (let backup of backups) {
				let backupDate = Number(path.parse(backup).base);
				if (oldest > backupDate) oldest = backupDate;
			}

			await fs.remove(dir + '/' + oldest);
		}
	}

	async _update(forced) {
		let save = prefs.saves[0];
		let dir = `${save.dir}/nostlan_saves/${emu}`;
		if (!(await fs.exists(dir))) return;
		let backups = await klaw(dir, {
			depthLimit: 0
		});

		if (!backups.length) return;

		let latest = 0;
		for (let backup of backups) {
			let date = Number(path.parse(backup).base);
			if (latest < date) latest = date;
		}

		log(`${prefs[emu].saves.date} : last saved locally`);
		log(`${latest} : last saved in ${save.name}`);
		if (forced) log('save sync update forced!');
		if (!forced && latest <= prefs[emu].saves.date) return;

		dir += '/' + latest;

		for (let i in prefs[emu].saves.dirs) {
			let src = dir + '/' + i;
			let dest = prefs[emu].saves.dirs[i];
			log(`Updating files from ${save.name} to ${dest}`);
			$('#loadDialog0').text(`Updating files from ${save.name} to`);
			$('#loadDialog1').text(dest);
			await fs.copy(src, dest);
		}
		$('#loadDialog0').text('');
		$('#loadDialog1').text('');
		prefs[emu].saves.date = latest;
		return true;
	}

	async update(forced) {
		if (!prefs.saves) {
			log('update save sync failed, no saves folder');
			return;
		}
		if (!prefs[emu].saves ||
			!prefs[emu].saves.dirs ||
			!prefs[emu].saves.dirs.length) {
			if (!(await this.setup())) return;
			if (!(await this._update(forced))) {
				await this._backup();
			}
			return;
		}

		log('update save sync starting...');
		if (await this._update(forced)) {
			log('update save sync complete!');
		} else {
			log('local save data already the most current');
		}
	}

	async backup() {
		if (!prefs[emu].saves ||
			!prefs[emu].saves.dirs ||
			!prefs[emu].saves.dirs.length) {
			if (!(await this.setup())) return;
		}
		// check if any require saving
		let saveOnQuit = false;
		for (let save of prefs.saves) {
			if (!save.noSaveOnQuit) {
				saveOnQuit = true;
				break;
			}
		}
		if (!saveOnQuit) return;

		log('backup save sync starting...');
		await this._backup();
		log('backup save sync completed!');
	}
}

module.exports = new Saves();
