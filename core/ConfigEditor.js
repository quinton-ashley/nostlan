const deepExtend = require('deep-extend');

class ConfigEditor {
	constructor(configPath, configDefaultsPath) {
		this.configPath = configPath;
		this.configDefaultsPath = configDefaultsPath;
	}

	async getDefaults() {
		if (!this.configDefaultsPath) return;
		return JSON.parse(
			await fs.readFile(this.configDefaultsPath)
		);
	}

	async load(cfg) {
		if (!cfg) cfg = await this.getDefaults();
		if (await this.canLoad()) {
			let cfg1 = await JSON.parse(await fs.readFile(this.configPath));
			if (cfg) {
				let configDefaults = {};
				if (this.update) {
					deepExtend(configDefaults, cfg);
				}
				deepExtend(cfg, cfg1);
				if (this.update) {
					await this.update(configDefaults);
				}
			} else {
				cfg = cfg1;
			}
		}
		return cfg;
	}

	async save(cfg) {
		await fs.outputFile(this.configPath,
			JSON.stringify(cfg, null, '\t'));
	}

	async canLoad() {
		return await fs.exists(this.configPath);
	}
}

module.exports = ConfigEditor;
