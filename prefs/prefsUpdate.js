module.exports = async function() {

	// only keeps the emu app path for the current os
	for (let _sys in systems) {
		let _syst = systems[_sys];
		for (let _emu of _syst.emus) {
			if (typeof prefs[_emu].app == 'string') continue;
			if (prefs[_emu].app[osType]) {
				prefs[_emu].app = prefs[_emu].app[osType];
			} else {
				delete prefs[_emu].app;
			}
		}
	}

	// prefs version added in v1.8.x
	if (prefs.version) {
		prefs.version = pkg.version;
		return;
	}
	// if prefs file is pre-v1.8.x
	// update older versions of the prefs file
	if (prefs.ui.gamepad.mapping) delete prefs.ui.gamepad.mapping;
	if (prefs.ui.recheckImgs) delete prefs.ui.recheckImgs;
	if (prefs.ui.gamepad.profile) {
		prefs.ui.gamepad.default.profile = prefs.ui.gamepad.profile;
		delete prefs.ui.gamepad.profile;
	}
	if (prefs.ui.gamepad.map) {
		prefs.ui.gamepad.default.map = prefs.ui.gamepad.map;
		delete prefs.ui.gamepad.map;
	}
	if (prefs['3ds']) prefs.n3ds = prefs['3ds'];
	delete prefs['3ds'];
	if (prefs.ui.maxRows) {
		prefs.ui.maxColumns = prefs.ui.maxRows;
		delete prefs.ui.maxRows;
	}
	// move old bottlenose directory
	if (prefs.btlDir) {
		prefs.nlaDir = path.join(prefs.btlDir, '..') + '/nostlan';
		if (await fs.exists(prefs.btlDir)) {
			await fs.move(prefs.btlDir, prefs.nlaDir);
		}
		delete prefs.btlDir;
		emuDir = path.join(prefs.nlaDir, '..');
	}
	if (typeof prefs.donor == 'boolean') prefs.donor = {};
	if (prefs.saves) {
		for (let save of prefs.saves) {
			if (!save.noSaveOnQuit) save.noSaveOnQuit = false;
		}
	}
	for (let _sys in systems) {
		if (prefs[_sys]) {
			delete prefs[_sys].style;
			if (prefs[_sys].emu) prefs[_sys].name = prefs[_sys].emu;
			delete prefs[_sys].emu;
			if (_sys == 'arcade') continue;
			let _emu = prefs[_sys].name.toLowerCase();
			prefs[_emu] = prefs[_sys];
			delete prefs[_sys];
		}
	}

	// in v1.8.x the file structure of emuDir was changed
	let errCount = 0;
	for (let _sys in systems) {
		let _syst = systems[_sys];
		let _emu = _syst.emus[0];
		let moveDirs = [{
			src: `${emuDir}/${prefs[_emu].name}`,
			dest: `${emuDir}/${_sys}`
		}, {
			src: `${emuDir}/nostlan/${_sys}`,
			dest: `${emuDir}/${_sys}/images`
		}, {
			src: `${emuDir}/${_sys}/BIN`,
			dest: `${emuDir}/${_sys}/${_emu}`
		}, {
			src: `${emuDir}/${_sys}/GAMES`, // make lowercase
			dest: `${emuDir}/${_sys}/_games` // temp folder
		}, {
			src: `${emuDir}/${_sys}/temp/_games`,
			dest: `${emuDir}/${_sys}/games`
		}];
		// remove old game lib files, rescanning must be done
		await fs.remove(`${usrDir}/_usr/${_sys}Games.json`);

		for (let moveDir of moveDirs) {
			let srcExists = await fs.exists(moveDir.src);
			let destExists = await fs.exists(moveDir.dest);

			if (srcExists && !destExists) {
				try {
					await fs.move(moveDir.src, moveDir.dest);
				} catch (ror) {
					er(ror);
					errCount++;
					break;
				}
				await fs.remove(moveDir.src);
			}
		}
		delete prefs[_emu].libs;
		if (prefs[_emu].saves) {
			delete prefs[_emu].saves.dirs;
		}
		await fs.remove(`${emuDir}/nostlan/${_sys}`);

		if (prefs[_emu].app) {
			let emuApp = util.absPath(prefs[_emu].app);
			if (emuApp &&
				!(await fs.exists(emuApp))) {
				delete prefs[_emu].app;
			}
		}
	}

	prefs.version = pkg.version;

	if (errCount > 0) {
		await cui.err('failed to automatically move some game library folders ' +
			'to conform to the new template structure (introduced in v1.8.x). ' + 'You must change them manually.  Read the update log to find out ' +
			'why these changes were made.' +
			'https://github.com/quinton-ashley/nostlan#nostlan-file-structure\n' +
			'https://github.com/quinton-ashley/nostlan/wiki/Update-Log-v1.8.x',
			400, 'quit');
	}
};
