const Viewer = function() {
	const log = console.log;

	const spawn = require('await-spawn');
	const delay = require('delay');
	const fs = require('fs-extra');
	const os = require('os');
	const path = require('path');
	const req = require('requisition');
	const osType = os.type();
	const linux = (osType == 'Linux');
	const mac = (osType == 'Darwin');
	const win = (osType == 'Windows_NT');

	const {
		remote
	} = require('electron');

	let pos = 0;
	let games;
	let prefs;
	let sys;
	let defaultCoverImg;
	let $cover;

	async function dl(url, file) {
		if (!(await fs.exists(file))) {
			log('loading image: ' + url);
			log('saving to: ' + file);
			let res = await req(url);
			if (res.status == 404) {
				return false;
			}
			await res.saveTo(file);
		}
		return file;
	}

	async function getImg(game, name) {
		let dir = `${prefs.usrDir}/${sys}/${game.id}/img`;
		if (await fs.exists(dir)) {

		}
		let file = `${dir}/${name}.png`;
		let url;
		let res;
		if (sys == 'wii' && (name == 'coverfull' || name == 'coverfront') && !(await fs.exists(file))) {
			let title = game.title.replace(/ /g, '%20').replace(/[\:]/g, '');
			url = `http://andydecarli.com/Video%20Games/Collection/Nintendo%20Game%20Cube/Scans/Full%20Size/Nintendo%20Game%20Cube%20${title}%20Front%20Cover.jpg`;
			res = await dl(url, `${dir}/coverfront.jpg`);
			if (!res) {
				url = `http://andydecarli.com/Video%20Games/Collection/Nintendo%20Wii/Scans/Full%20Size/Nintendo%20Wii%20${title}%20Front%20Cover.jpg`;
				res = await dl(url, `${dir}/coverfront.jpg`);
			}
			if (name == 'coverfront') {
				if (res) {
					return res;
				}
				return false;
			}
		}
		url = `https://art.gametdb.com/${sys}/${name}HQ/US/${game.id}.png`;
		res = await dl(url, file);
		if (res) {
			return res;
		}
		url = url.replace(name + 'HQ', name + 'M');
		res = await dl(url, file);
		if (res) {
			return res;
		}
		url = url.replace(name + 'M', name);
		res = await dl(url, file);
		if (res) {
			return res;
		}
		return false;
	}

	async function loadImages() {
		for (let i = 0; i < games.length; i++) {
			let game = games[i];
			if (!(await fs.exists(`${prefs.usrDir}/${sys}/${game.id}/img`))) {
				await getImg(game, 'coverfull');
				await getImg(game, 'disc');
			}
		}
		defaultCoverImg = await getImg(prefs[sys].defaultCover, ((sys == 'wii') ? 'coverfront' : 'box'));

		games = games.sort((a, b) => a.title.localeCompare(b.title));
	}

	async function addCover(game, reelNum) {
		let cl1 = '';
		let file = `${prefs.usrDir}/${sys}/${game.id}/img/coverfront.jpg`;
		if (!(await fs.exists(file))) {
			file = `${prefs.usrDir}/${sys}/${game.id}/img/coverfull.png`;
			if (!(await fs.exists(file))) {
				log(`no images found for game: ${game.id} ${game.title}`);
				return;
			}
			cl1 = 'front-cover-crop';
		}
		$('.reel.r' + reelNum).append(`
			<div class="panel ${game.id}">
				${((cl1)?`<img src="${defaultCoverImg}">`:'')}
				<section class="${cl1}">
	      	<img src="${file}"/>
				</section>
	    </div>
		`);
	}

	function goTo(position, time) {
		pos = position;
		if (!pos) {
			log("pos can't be: " + pos);
			return;
		}
		time = time || 2000;
		$('html').stop().animate({
			scrollTop: pos
		}, time);
		$('.reel.reverse').stop().animate({
			bottom: pos * -1
		}, time);
		log(pos);
	}

	function scrollToGame(gameID, time) {
		let $cover = $('.' + gameID).eq(0);
		let $reel = $cover.parent();
		let pos = $cover.height() * ($cover.index() + .5);
		if ($reel.hasClass('reverse')) {
			pos += $(window).height() * .5;
			pos = $reel.height() - pos;
		} else {
			pos -= $(window).height() * .5;
		}
		goTo(pos, time);
	}

	function getSelectedID() {
		return $('.panel.selected').attr('class').split(' ')[1];
	}

	this.powerBtn = async function() {
		remote.BrowserWindow.getFocusedWindow().minimize();
		let emuExePath = path.join(prefs.usrDir, `../${prefs[sys].emu}/BIN/${prefs[sys].emu}.${((mac)?'app':'exe')}`);
		let game = games.find(x => x.id === getSelectedID()).file;
		this.remove();
		await spawn(emuExePath, [game]);
	}

	function coverClicked() {
		let $reel = $cover.parent();
		scrollToGame($cover.attr('class').split(' ')[1], 1000);
		$cover.toggleClass('selected');
		$reel.toggleClass('selected');
		$('.reel').toggleClass('bg');
		$('nav').toggleClass('gameView');
		if ($cover.hasClass('selected')) {
			$reel.css('left', `${$(window).width()*.5-$cover.width()*.5}px`);
			$cover.css('transform', `scale(${$(window).height()/$cover.height()})`);
		} else {
			$reel.css('left', '');
			$cover.css('transform', '');
		}
		log($cover);
	}

	this.remove = function() {
		coverClicked();
		$('.reel').empty();
	}

	this.load = async function(usrGames, usrPrefs, usrSys) {
		let reload;
		if (games) {
			reload = true;
		}
		games = usrGames;
		prefs = usrPrefs;
		sys = usrSys;
		await loadImages();
		for (let i = 0, j = 0; i < games.length; i++) {
			try {
				if (i < games.length * .125) {
					await addCover(games[i], 0);
				} else if (i < games.length * .25) {
					await addCover(games[i], 1);
				} else if (i < games.length * .375) {
					await addCover(games[i], 2);
				} else if (i < games.length * .50) {
					await addCover(games[i], 3);
				} else if (i < games.length * .625) {
					await addCover(games[i], 4);
				} else if (i < games.length * .75) {
					await addCover(games[i], 5);
				} else if (i < games.length * .875) {
					await addCover(games[i], 6);
				} else {
					await addCover(games[i], 7);
				}
				j++;
			} catch (ror) {
				log(ror);
			}
		}
		// for (let i = 0; i < 8; i++) {
		//   $('.reel.r' + i).clone().children().appendTo('.reel.r' + i);
		// }

		$('.panel').click(function() {
			$cover = $(this);
			coverClicked();
		});

		if (!reload) {
			$(window).bind('mousewheel', function(event) {
				event.preventDefault();
				if ($('.panel.selected').length) {
					return;
				}
				if (event.originalEvent.wheelDelta < 0) {
					pos += 100;
				} else {
					pos -= 100;
				}
				goTo(pos);
			});
		}
	}
}
module.exports = new Viewer();
