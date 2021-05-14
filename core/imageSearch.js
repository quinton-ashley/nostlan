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
			let panes = document.getElementsByClassName('detail__pane');
			for (let pane of panes) {
				log(pane);
				const style = window.getComputedStyle(pane);
				const matrix = style.transform;
				log(matrix);
				log(matrix.slice(7, -1));
				const matrixValues = matrix.slice(7, -1).split(', ');
				if (matrixValues[4] == 0) {
					let a = pane.getElementsByClassName('detail__media__img-link')[0];
					sendToNostlan(JSON.stringify({
						src: a.href
					}));
					break;
				}
			}
		}
		img.onclick = () => {
			setTimeout(lookForImg, 250);
		};
	}
}
setTimeout(attachClicks, 250);
