const path = require('path');

class Saves {
	constructor() {}

	async setup() {
		if (emu == 'cemu') {
			let dir = path.join(prefs.wiiu.app[osType], '..');
			prefs.wiiu.saves = [dir + '/mlc01/usr/save'];
		} else if (emu == 'dolphin') {
			let dir = path.join(prefs.wii.app[osType], '..') + '/User';
			if (!(await fs.exists(dir))) {
				cui.err('"User" folder not found, saves could not be located.  ' +
					'"User" folder needs to be in the same folder as "Dolphin.exe"');
				return;
			}
			prefs.wii.saves = [
				dir + '/GC',
				dir + '/Wii',
				dir + '/StateSaves'
			];
		}
	}

	async sync() {
		if (!prefs[sys].saves) {
			await this.setup();
		}
		if (!prefs[sys].saves) return;

		for (let saveDir of prefs.saveDirs) {
			let dir = `${saveDir}/${emu}`;

			let backups = await klaw(dir);

			let date = new Date().toUTCString();
			dir += '/' + date;
			for (let i in prefs[sys].saves) {

				let src = prefs[sys].saves[i];
				let dest = dir + '/' + i;
				await fs.copy(src, dest);
				log(`${src} backed up to ${dest}`);
			}
		}
	}


}

module.exports = new Saves();
