const {
	urlExists
} = require('url-exists-promise');

class Updater {
	constructor() {}

	async check() {
		let url = 'https://github.com/quinton-ashley/nostlan/wiki/Update-Log-v';
		let ogVer = pkg.version.split('.');
		let ver = ogVer;
		let updateAvail = false;
		while (await urlExists(url + `${++ver[0]}.${0}`)) {}
		ver[0]--;
		if (ver[0] != ogVer[0]) {
			ver[1] = 1;
			updateAvail = true;
		}
		while (await urlExists(url + `${ver[0]}.${++ver[1]}`)) {}
		ver[1]--;
		if (ver[1] != ogVer[1]) updateAvail = true;

		// updateAvail = true;
		if (!updateAvail) return;
		let updateVer = `${ver[0]}.${ver[1]}`;
		url += updateVer;
		$('#dialogs').show();
		$('#loadDialog0').text(`Update to v${updateVer} available now!`);
		$('#loadDialog2').text(url);
		for (let i = 5; i > 0; i--) {
			$('#loadDialog1').text(`Opening the link to the update log in ${i} seconds`);
			await delay(1000);
		}
		opn(url);
		await delay(500);
		return updateVer;
	}
}

module.exports = new Updater();
