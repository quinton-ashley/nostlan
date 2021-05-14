class Browser {
	constructor() {}

	async init(id, url) {
		let preloadJS = __root + '/core/browser_preload.js';
		$(id).prepend(`<webview id="browser" enableremotemodule="false" src="${url}" preload="${preloadJS}"></webview>`);

		let page = $('#browser').eq(0)[0];
		await new Promise((resolve) => {
			page.addEventListener('dom-ready', () => {
				// log('hi');
				resolve();
			});
		});
		// page.openDevTools();
		await page.insertCSS(await fs.readFile(__root + '/views/css/genericDark.css', 'utf8'));
		await page.insertCSS(await fs.readFile(__root + '/views/css/duckduckgo.css', 'utf8'));
		await page.executeJavaScript(await fs.readFile(__root + '/core/imageSearch.js', 'utf8'));
		await page.addEventListener('ipc-message', async (event) => {
			let ping = JSON.parse(event.channel);
			log(ping);
			cui.editSelect.imgUrl = ping.src;
		});
	}

	close() {
		$('#browser').remove();
	}
}

module.exports = new Browser();
