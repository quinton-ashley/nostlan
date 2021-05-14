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
		page.openDevTools();

		page.executeJavaScript(`
const log = console.log;
let attempts = 0;
function attachClicks() {
	let imgs = document.getElementsByClassName('tile');
	if (!imgs || !imgs.length) {
		if (attempts < 30) {
			setTimeout(attachClicks, 250);
		} else {
			close();
		}
		return;
	}
	for (let img of imgs) {
		log(img);
		let attempts = 0;
		function lookForImg() {
			log('img clicked');

			let a = document.getElementsByClassName('detail__media__img-link')[0];
			log(a);
			sendToNostlan(JSON.stringify({
				src: a.href
			}));
		}
		img.onclick = () => {
			setTimeout(lookForImg, 250);
		};
	}
}
setTimeout(attachClicks, 250);`);
		await delay(2000);
		page.addEventListener('ipc-message', async (event) => {
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
