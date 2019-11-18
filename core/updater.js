const request = require('request');
const rp = require('request-promise-native');

class Updater {
	constructor() {}

	async urlExists(url) {
		try {
			const res = await rp({
				uri: url,
				resolveWithFullResponse: true
			});
			return (/^(?!4)\d\d/.test(res.statusCode));
		} catch (ror) {}
		return false;
	}

	async check() {
		$('#dialogs').show();
		$('#loadDialog0').text(`Checking for an update...`);
		let url = 'https://github.com/quinton-ashley/nostlan/releases/tag/';
		let ogVer = pkg.version.split('.');
		for (let i in ogVer) {
			ogVer[i] = Number(ogVer[i]);
		}
		let ver = [...ogVer];
		let updateAvail = false;
		while (await this.urlExists(url + `${++ver[0]}.0.x`)) {
			log(url + `${ver[0]}.0.x`);
		}
		ver[0]--;
		if (ver[0] != ogVer[0]) {
			ver[1] = 1;
			updateAvail = true;
		}
		while (await this.urlExists(url + `${ver[0]}.${++ver[1]}.x`)) {
			log(url + `${ver[0]}.${ver[1]}.x`);
		}
		ver[1]--;
		if (ver[1] != ogVer[1]) updateAvail = true;

		// updateAvail = true;
		if (!updateAvail) return;
		let updateVer = `${ver[0]}.${ver[1]}.x`;
		url += updateVer;
		$('#loadDialog0').text(`Update to v${updateVer} available now!`);
		$('#loadDialog2').text(url);
		for (let i = 5; i > 0; i--) {
			$('#loadDialog1').text(`Opening the link to the update log in ${i} seconds`);
			await delay(1000);
		}
		opn(`https://github.com/quinton-ashley/nostlan/wiki/Update-Log-v${updateVer}`);
		await delay(500);
		return updateVer;
	}
}

module.exports = new Updater();
