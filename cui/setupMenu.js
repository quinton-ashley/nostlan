class CuiState extends cui.State {

	async onAction(act) {
		if (cui.isButton(act)) return;

		if (act == 'finishSetup') {
			if (!(await fs.exists(systemsDir))) {
				// 'You must choose an install location!'
				cui.err(lang.setupMenu.err0);
				return false;
			}
			await prefsMng.save(prefs);
			cui.change('sysMenu');
			return;
		}
		if (act == 'newDefaultInstall') {
			systemsDir = util.absPath('$home') + '/Documents';
		} else if (act == 'newInstall') {
			// 'choose the folder you want the template to go in'
			let msg = lang.setupMenu.msg0;
			systemsDir = await dialog.selectDir(msg);
		}
		systemsDir += '/emu';
		if (!systemsDir) return false;
		await this.createTemplate();
		opn(systemsDir);
		if (!(await fs.exists(systemsDir))) return false;
	}

	async createTemplate() {
		for (let _sys in systems) {
			let _syst = systems[_sys];
			if (!_syst.emus) continue;
			for (let i in _syst.emus) {
				let _emu = _syst.emus[i];
				let templateDir = `${systemsDir}/${_sys}/${_emu}`;

				let emuAppDirs = prefs[_emu].appDirs || [];
				for (let dir of emuAppDirs) {
					dir = util.absPath(dir);
					if (!(await fs.exists(dir))) continue;
					if (linux) {
						let testDir = dir + '/nostlanTest';
						try {
							await fs.ensureDir(testDir);
							await fs.remove(testDir);
						} catch (ror) {
							if (!prefs.load.readOnlyFS) {
								opn(dir);
								await cui.error(lang.setupMenu.err2 + '\n' + dir,
									lang.setupMenu.err1, 'quit');
							}
						}
					}
					try {
						await fs.ensureSymlink(dir, templateDir, 'dir');
					} catch (ror) {
						er(ror);
					}
					break;
				}
				if (!(await fs.exists(templateDir))) {
					await fs.ensureDir(templateDir);
				}
				if (i > 0) continue;
				// games and/or images dirs might be in a special place
				// for example the 'roms' folder of MAME
				async function ensureSysDirs(dirType) {
					let defaultDir = `${systemsDir}/${_sys}/${dirType}`;
					dirType += 'Dir';
					if (!prefs[_emu][dirType]) {
						await fs.ensureDir(defaultDir);
					} else if (!(await fs.exists(defaultDir))) {
						// look for dedicated games dir
						let dir = templateDir + '/' + prefs[_emu][dirType];
						await fs.ensureDir(dir);
						if (linux) {
							let testDir = dir + '/nostlanTest';
							try {
								await fs.ensureDir(testDir);
								await fs.remove(testDir);
							} catch (ror) {
								if (!prefs.load.readOnlyFS) {
									opn(dir);
									await cui.error(lang.setupMenu.err2 + '\n' + dir,
										lang.setupMenu.err1, 'quit');
								}
							}
						}
						try {
							await fs.ensureSymlink(dir, defaultDir, 'dir');
						} catch (ror) {
							er(ror);
						}
					}
				}

				await ensureSysDirs('games');
				await ensureSysDirs('images');
			}
		}
	}
}
module.exports = new CuiState();
