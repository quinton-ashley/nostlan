const deepExtend = require('deep-extend');

class PrefsManager {
	constructor() {
		this.prefsPath;
	}

	async loadDefaultPrefs() {
		let prefsDefaultPath = __rootDir + '/prefs/prefsDefault.json';
		let prefsDefault = JSON.parse(await fs.readFile(prefsDefaultPath));
		return prefsDefault;
	}

	async load() {
		if (!global.prefs) {
			global.prefs = await this.loadDefaultPrefs();
		}
		if (await this.canLoad()) {
			let prefs1 = await JSON.parse(await fs.readFile(this.prefsPath));
			deepExtend(global.prefs, prefs1);
		}
		return global.prefs;
	}

	async save() {
		return await fs.outputFile(this.prefsPath, JSON.stringify(global.prefs, null, '\t'));
	}

	async canLoad() {
		return await fs.exists(this.prefsPath);
	}
}

module.exports = new PrefsManager();
