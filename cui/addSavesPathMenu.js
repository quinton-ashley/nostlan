class CuiState {

	async onAction(act) {
		if (act == 'add') {
			let save = {
				name: $('#saveName').val(),
				backups: $('#saveNumOfBackups').val()
			}
			if (!save.name || !save.backups) {
				// name and number of backups required
				cui.err(lang.addSavesPathMenu.err0);
				return;
			}
			save.backups = Number(save.backups);
			if (save.backups < 1) {
				// '1 save backup required'
				cui.err(lang.addSavesPathMenu.err1);
				return;
			}
			// 'Select a save sync location'
			let msg = lang.addSavesPathMenu.msg0;
			save.dir = await dialog.selectDir(msg);

			if (!(await fs.exists(save.dir))) {
				// 'Not a valid folder'
				cui.err(lang.addSavesPathMenu.err2);
				return;
			}
			if (!prefs.saves) prefs.saves = [];
			prefs.saves.push(save);
			await cui.nostlanMenu.saveSync('syncUpdate');
		}
	}
}
module.exports = new CuiState();
