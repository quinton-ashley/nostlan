const Viewer = function() {
	const log = console.log;

	const {
		remote
	} = require('electron');
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

	let mouse;
	let recheckImgs = false;
	let pos = 0;
	let games;
	let prefs;
	let sys;
	let ui;
	let theme;
	let defaultCoverImg;
	let $cover;

	async function dl(url, file) {
		if (!(await fs.exists(file))) {
			let res = await req(url);
			if (res.status == 404) {
				return false;
			}
			log('loading image: ' + url);
			log('saving to: ' + file);
			await res.saveTo(file);
		}
		return file;
	}

	async function dlNoExt(url, file) {
		let res;
		for (let i = 0; i < 2; i++) {
			if (i == 0) {
				res = await dl(url + '.jpg', file + '.jpg');
			} else if (i == 1) {
				res = await dl(url + '.png', file + '.png');
			}
			if (res) {
				return res;
			}
		}
		return false;
	}

	async function getImg(game, name) {
		let dir = `${prefs.usrDir}/${sys}/${game.id}/img`;
		let file, res, url;
		// check if game img is specified in the gamesDB
		if (game.img && game.img[name]) {
			url = game.img[name];
			ext = url.substr(-3);
			file = `${dir}/${name}.${ext}`;
			res = await dl(url, file);
			if (res) {
				return res;
			}
		}
		// get high quality box for gamecube/wii
		if (sys == 'wii' && name == 'boxHQ') {
			file = `${dir}/${name}.jpg`;
			if (await fs.exists(file)) {
				return file;
			}
			let title = game.title.replace(/ /g, '%20').replace(/[\:]/g, '');
			url = `http://andydecarli.com/Video%20Games/Collection/Nintendo%20Game%20Cube/Scans/Full%20Size/Nintendo%20Game%20Cube%20${title}%20Front%20Cover.jpg`;
			res = await dl(url, file);
			if (!res) {
				url = `http://andydecarli.com/Video%20Games/Collection/Nintendo%20Wii/Scans/Full%20Size/Nintendo%20Wii%20${title}%20Front%20Cover.jpg`;
				res = await dl(url, file);
			}
			if (res) {
				return res;
			}
			return false;
		}
		if (name == 'boxHQ') {
			return false;
		}
		// get image from gametdb
		file = `${dir}/${name}`;
		let id = game.id;
		for (let i = 0; i < 3; i++) {
			if (sys != 'switch' && i == 1) {
				break;
			}
			if (i == 1) {
				id = id.substr(0, id.length - 1) + 'B';
			}
			if (i == 2) {
				id = id.substr(0, id.length - 1) + 'C';
			}
			url = `https://art.gametdb.com/${sys}/${name}HQ/US/${id}`;
			log(url);
			res = await dlNoExt(url, file);
			if (res) {
				return res;
			}
			url = url.replace(name + 'HQ', name + 'M');
			res = await dlNoExt(url, file);
			if (res) {
				return res;
			}
			url = url.replace(name + 'M', name);
			res = await dlNoExt(url, file);
			if (res) {
				return res;
			}
		}
		if (name == 'coverfull' && !(await imgExists(game, 'boxHQ'))) {
			res = await getImg(game, 'box');
			if (!res) {
				res = await getImg(game, 'cover');
			}
			return res;
		}
		return false;
	}

	async function loadImages() {
		let imgDir;
		for (let i = 0; i < games.length; i++) {
			let game = games[i];
			imgDir = `${prefs.usrDir}/${sys}/${game.id}/img`;
			if (recheckImgs || !(await fs.exists(imgDir))) {
				await getImg(game, 'boxHQ');
				await getImg(game, 'coverfull');
				if (sys != 'switch') {
					await getImg(game, 'disc');
				} else {
					await getImg(game, 'cart');
				}
			}
			await fs.ensureDir(imgDir);
		}
		defaultCoverImg = await imgExists(theme.default, 'boxHQ');
		if (!defaultCoverImg) {
			defaultCoverImg = await getImg(theme.default, 'box');
		}
		if (!defaultCoverImg) {
			log('ERROR: No cover image found');
			return false;
		}

		games = games.sort((a, b) => a.title.localeCompare(b.title));
	}

	async function imgExists(game, name) {
		let file = `${prefs.usrDir}/${sys}/${game.id}/img/${name}.png`;
		if (!(await fs.exists(file))) {
			file = file.substr(0, file.length - 3) + 'jpg';
			if (!(await fs.exists(file))) {
				return false;
			}
			return file;
		}
		return file;
	}

	async function addCover(game, reelNum) {
		let cl1 = '';
		let file = await imgExists(game, 'boxHQ');
		if (!file) {
			file = await imgExists(game, 'coverfull');
			cl1 = 'front-cover-crop ' + sys;
			if (!file) {
				file = await imgExists(game, 'cover');
				cl1 = 'front-cover ' + sys;
				if (!file) {
					file = await imgExists(game, 'box');
					cl1 = '';
					if (!file) {
						log(`no images found for game: ${game.id} ${game.title}`);
						return;
					}
				}
			}
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
		if (isNaN(pos)) {
			log("pos can't be: " + pos);
			return;
		}
		time = ((time == undefined) ? 2000 : time);
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
		let $gamePanel = $('.panel.selected').attr('class');
		if ($gamePanel) {
			return $gamePanel.split(' ')[1];
		}
		return '';
	}

	this.powerBtn = async function() {
		remote.getCurrentWindow().minimize();
		let emuExePath = path.join(prefs.usrDir, `../${prefs[sys].emu}/BIN/${prefs[sys].emu}.${((mac)?'app':'exe')}`);
		let game = games.find(x => x.id === getSelectedID());
		if (game) {
			game = game.file;
		}
		this.remove();
		let args;
		if (game) {
			args = [game];
		}
		await spawn(emuExePath, args);
		remote.getCurrentWindow().focus();
		remote.getCurrentWindow().setFullScreen(true);
	}

	function coverClicked() {
		if (!$cover) {
			return;
		}
		let $reel = $cover.parent();
		let id = $cover.attr('class').split(' ')[1];
		if (!id) {
			return;
		}
		scrollToGame(id, 1000);
		$cover.toggleClass('selected');
		$reel.toggleClass('selected');
		$('.reel').toggleClass('bg');
		// $('nav').toggleClass('gameView');
		if ($cover.hasClass('selected')) {
			$reel.css('left', `${$(window).width()*.5-$cover.width()*.5}px`);
			$cover.css('transform', `scale(${$(window).height()/$cover.height()})`);
		} else {
			$reel.css('left', '');
			$cover.css('transform', '');
		}
		log($cover);
	}

	this.remove = function(menu) {
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
		let uiPath = path.join(global.__rootDir, '/views/img/ui.json');
		ui = JSON.parse(await fs.readFile(uiPath));
		theme = prefs[sys].style || sys;
		theme = ui[theme];
		mouse = prefs.ui.mouse;
		mouse.wheel.delta = 100 * mouse.wheel.multi;
		$('body').addClass(sys + ' ' + prefs[sys].style);
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
				let scrollDelta = event.originalEvent.wheelDelta;
				if (mouse.wheel.smooth) {
					pos += scrollDelta * mouse.wheel.multi;
				} else {
					if (scrollDelta < 0) {
						pos += mouse.wheel.delta;
					} else {
						pos -= mouse.wheel.delta;
					}
				}
				goTo(pos, ((!mouse.wheel.smooth) ? 2000 : 0));
			});
		}
	}

	function resizeUI() {
		let $cv = $('.cover.view');
		let $cvSel = $cv.find('select')
		let cvHeight = $cv.height();
		let cpHeight = $('.cover.power').height();
		if (cvHeight < cpHeight) {
			$cvSel.css('margin-top', '40px');
			$cvSel.css('margin-bottom', '40px');
		} else if (cvHeight > cpHeight) {
			$cvSel.css('margin-top', '20px');
			$cvSel.css('margin-bottom', '20px');
		}
		if (cvHeight != cpHeight) {
			$cv.height(cpHeight);
		}
	}
	resizeUI();
	$(window).resize(resizeUI);
}
module.exports = new Viewer();
