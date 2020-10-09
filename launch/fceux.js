const FCEUX = require('em-fceux');

class Nostlan_fceux {
	constructor() {}

	async launch(game) {
		let fceux = await FCEUX();
		$('#emuJS').append(`<div style="height: 100vh; text-align: center">`);
		$('#emuJS div').append(`<canvas id="fceux">`);
		// Initialize the instance (creates Web Audio etc.)
		fceux.init('#fceux');

		await cui.change('playing_4');
		$('nav').hide();

		// Download a game ROM and start it.
		fceux.downloadGame(game.file);

		// Run the emulation update loop.
		// Use requestAnimationFrame() to synchronise to repaints.
		function updateLoop() {
			window.requestAnimationFrame(updateLoop);
			fceux.update();
		}
		window.requestAnimationFrame(updateLoop);

		// // Bind keyboard input events to controller 1.
		// // The array index below corresponds to the button bit index.
		// const keys = [
		// 	['KeyF', 'A'],
		// 	['KeyD', 'B'],
		// 	['KeyS', 'Select'],
		// 	['Enter', 'Start'],
		// 	['ArrowUp', 'Up'],
		// 	['ArrowDown', 'Down'],
		// 	['ArrowLeft', 'Left'],
		// 	['ArrowRight', 'Right'],
		// ];
		// let bits = 0;

		// function keyHandler(ev) {
		// 	for (let i = 0; i < keys.length; ++i) {
		// 		if (ev.code == keys[i][0]) {
		// 			if (ev.type == 'keydown') {
		// 				bits |= 1 << i;
		// 			} else {
		// 				bits &= ~(1 << i);
		// 			}
		// 			fceux.setControllerBits(bits);
		// 			ev.preventDefault();
		// 		}
		// 	}
		// }
		// window.addEventListener('keydown', keyHandler);
		// window.addEventListener('keyup', keyHandler);
		//
		// // Add HTML for the input keys.
		// const keysDiv = document.querySelector('#keys');
		// keysDiv.innerHTML += keys
		// 	.map((key) => `${key[1]} - ${key[0]}`)
		// 	.join('<br/>');
	}

	async close() {
		$('#emuJS').empty();
	}
}

module.exports = new Nostlan_fceux();
