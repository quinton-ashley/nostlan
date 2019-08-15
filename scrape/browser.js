const puppeteer = require('puppeteer-core');

class Browser {
	constructor(params) {
		this.usr;
		this.pup;
		this.page;
	}

	urlEncode(str) {
		let url = '';
		for (let c of str.replace(/ +/gi, '+')) {
			if (!c.match(/[^a-z0-9\+\-]/gi)) {
				url += c;
			} else {
				url += '%' + c.charCodeAt(0).toString(16).toUpperCase();
			}
		}
		return url;
	}

	async goTo(url) {
		// if a page is already open, then close it
		if (this.page) {
			await this.page.close();
		}
		this.page = await this.pup.newPage();
		if (this.usr) {
			this.page.setUserAgent(this.usr);
		}
		await this.page.setRequestInterception(true);
		this.page.on('request', request => {
			if (request.resourceType === 'image' || request.resourceType === 'media' || request.resourceType === 'font') {
				request.abort();
			} else {
				request.continue();
			}
		});
		try {
			await this.page.goto(url);
			return $('<div/>').append(await this.page.content());
		} catch (ror) {
			er(ror);
		}
		return;
	}

	async load(params) {
		this.usr = params.user;
		if (!prefs.chromium || !(await fs.exists(prefs.chromium))) {
			prefs.chromium = require('chrome-finder')();
		}
		// if (!prefs.chromium) {
		// 	prefs.chromium = elec.selectFile('select chromium or chrome');
		// }
		try {
			this.pup = await puppeteer.launch({
				executablePath: prefs.chromium
			});
		} catch (ror) {
			log(ror);
		}
	}
}

module.exports = new Browser();
