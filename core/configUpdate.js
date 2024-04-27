module.exports = async function (defaults) {
	let ver = cf.version || pkg.version;
	// update version number
	cf.version = pkg.version;
	if (cf.nlaDir) {
		systemsDir = path.join(cf.nlaDir, '..');
		systemsDir = systemsDir.replace(/\\/g, '/');
	}

	for (let _sys in systems) {
		let _syst = systems[_sys];
		if (!_syst.emus) continue;
		for (let _emu of _syst.emus) {
			if (!emus[_emu]) {
				console.warn(_emu + ' emulator support file for Nostlan not found!');
				_syst.emus.splice(_syst.emus.indexOf(_emu), 1);
				continue;
			}
			if (!cf[_emu]) cf[_emu] = {};

			let props = ['app', 'cmd', 'bios', 'dev', 'mute', 'volume', 'keyboard'];
			for (let prop of props) {
				// initialize to defaults if nothing is there yet
				if (
					prop == 'latestVersion' ||
					(typeof cf[_emu][prop] == 'undefined' && typeof emus[_emu][prop] != 'undefined')
				) {
					cf[_emu][prop] = emus[_emu][prop];
				}
			}
		}

		// remove all game library locations with backslashes
		if (cf[_sys] && cf[_sys].libs && cf[_sys].libs.length > 1) {
			for (let i in cf[_sys].libs) {
				if (/\\/g.test(cf[_sys].libs[i])) {
					cf[_sys].libs.splice(i, 1);
				}
			}
		}
	}

	if (semver.gte(ver, '2.3.0')) return;

	cf.ui.gamepad.gca = false;
	if (cf.ryujinx && cf.ryujinx.saves) cf.ryujinx.saves.dirs = [];

	if (semver.gte(ver, '2.2.0')) return;

	{
		let regions = {
			E: 'USA',
			J: 'Japan',
			P: 'Europe'
		};

		if (cf.region.length == 1) cf.region = regions[cf.region] || 'USA';
	}
};
