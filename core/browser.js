class Browser {
	constructor() {}

	async init(id, url) {
		let preloadJS = __root + '/core/browser_preload.js';
		$(id).prepend(`<webview id="browser" enableremotemodule="false" src="${url}" preload="${preloadJS}"></webview>`);

		let page = $('#browser').eq(0)[0];
		let isFirstPage = true;
		page.addEventListener('dom-ready', async () => {
			await page.insertCSS(await fs.readFile(__root + '/views/css/genericDark.css', 'utf8'));
			await page.insertCSS(await fs.readFile(__root + '/views/css/duckduckgo.css', 'utf8'));
			await page.executeJavaScript(await fs.readFile(__root + '/core/imageSearch.js', 'utf8'));
			cui.imgSearchMenu.imgUrl = '';
			if (isFirstPage) {
				page.addEventListener('ipc-message', (event) => {
					let ping = JSON.parse(event.channel);
					log(ping);
					cui.imgSearchMenu.imgUrl = ping.src;
				});
				if (prefs.args.dev) page.openDevTools();
				isFirstPage = false;
			}
		});
		this.page = page;
	}

	close() {
		$('#browser').remove();
	}
}

module.exports = new Browser();
