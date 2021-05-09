class Browser {
	constructor() {}

	async goTo(url) {
		let preloadJS = __root + '/core/browser_preload.js';
		$('body').append(`<webview id="browser" enableremotemodule="false" src="${url}" preload="${preloadJS}"></webview>`);

		let page = $('#browser').eq(0)[0];
		await new Promise((resolve) => {
			page.addEventListener('dom-ready', () => {
				resolve();
			});
		});
		page.openDevTools();

		page.addEventListener('ipc-message', async (event) => {
			let ping = JSON.parse(event.channel);

			log(ping);
		});
		await delay(1000);
		await page.executeJavaScript(`
const log = console.log;
let imgs = document.getElementsByClassName('tile');
log(imgs);
for (let img of imgs) {
	log(img);
	img.onclick = () => {
		log('img clicked');
		let a = img.getElementsByClassName('tile--img__sub')[0];
		sendToNostlan(JSON.stringify({
			src: a.href
		}));
	}
}
`);
	}

	close() {
		$('#browser').remove();
	}
}

module.exports = new Browser();
