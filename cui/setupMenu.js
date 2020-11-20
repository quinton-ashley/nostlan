class CuiState {

	async onAction(act) {
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
		await createTemplate();
		opn(systemsDir);
		if (!(await fs.exists(systemsDir))) return false;
	}
}
module.exports = new CuiState();
