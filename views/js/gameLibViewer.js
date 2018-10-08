const Viewer = function() {
	const log = console.log;

	const {
		remote
	} = require('electron');
	const spawn = require('await-spawn');
	const delay = require('delay');
	const fs = require('fs-extra');
	const klawSync = require('klaw-sync');
	const os = require('os');
	const path = require('path');
	const req = require('requisition');
	const osType = os.type();
	const linux = (osType == 'Linux');
	const mac = (osType == 'Darwin');
	const win = (osType == 'Windows_NT');

	let mouse;
	let mouseWheelDeltaNSS;
	let pos = 0;
	let games;
	let prefs;
	let sys;
	let ui;
	let uiState = 'lib';
	let theme;
	let defaultCoverImg;
	let $cover;
	let templateAmt = 4;

	async function dl(url, file) {
		if (!(await fs.exists(file))) {
			let res = await req(url);
			if (res.status == 404) {
				return;
			}
			$('#loadDialog1').text('loading image: ' + url);
			log('loading image: ' + url);
			log('saving to: ' + file);
			await res.saveTo(file);
			$('#loadDialog1').text(' ');
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
		return;
	}

	async function dlFromAndy(title, file, system) {
		let url = `http://andydecarli.com/Video%20Games/Collection/${system}/Scans/Full%20Size/${system}%20${title}%20Front%20Cover.jpg`;
		log(url);
		let res = await dl(url, file);
		if (res && prefs.ui.getBackCoverHQ) {
			url = `http://andydecarli.com/Video%20Games/Collection/${system}/Scans/Full%20Size/${system}%20${title}%20Back%20Cover.jpg`;
			await dl(url, file);
		}
		return res;
	}

	async function getImg(game, name, skip) {
		let dir = `${prefs.emuDir}/${sys}/${game.id}/img`;
		let file, res, url;
		// check if game img is specified in the gamesDB
		if (game.img && game.img[name]) {
			url = game.img[name].split(/ \\ /);
			if (url[1]) {
				ext = url[1];
				url = url[0];
			} else {
				url = url[0];
				ext = url.substr(-3);
			}
			file = `${dir}/${name}.${ext}`;
			res = await dl(url, file);
			if (res) {
				return res;
			}
		}
		$('#loadDialog0').html(`scraping for the <br>${name}<br> of <br>${game.title}`);
		// get high quality box for gamecube/wii
		if (sys != 'switch' && name == 'box') {
			file = `${dir}/${name}.jpg`;
			if (await fs.exists(file)) {
				return file;
			}
			let title = game.title.replace(/ /g, '%20').replace(/[\:]/g, '');
			if (sys == 'wiiu') {
				res = await dlFromAndy(title, file, 'Nintendo%20Wii%20U');
			} else if (sys == '3ds') {
				res = await dlFromAndy(title, file, 'Nintendo%203DS');
			} else if (sys == 'ds') {
				res = await dlFromAndy(title, file, 'Nintendo%20DS');
			} else if (sys == 'ps3') {
				res = await dlFromAndy(title, file, 'Sony%20PlayStation%203');
			} else if (game.id.length > 4) {
				res = await dlFromAndy(title, file, 'Nintendo%20Game%20Cube');
				if (!res) {
					res = await dlFromAndy(title, file, 'Nintendo%20Wii');
				}
			} else {
				res = await dlFromAndy(title, file, 'Nintendo%2064');
				if (!res) {
					res = await dlFromAndy(title, file, 'Super%20Nintendo');
				}
				if (!res) {
					res = await dlFromAndy(title, file, 'Nintendo');
				}
			}
			if (res) {
				return res;
			}
		}
		if (skip) {
			return;
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
			let locale = 'US';
			if (sys == 'ps3') {
				if (id[2] == 'E') {
					locale = 'EN';
				}
			}
			url = `https://art.gametdb.com/${sys}/${((name!='coverFull')?name:'coverfull')}HQ/${locale}/${id}`;
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
		return;
	}

	function getTemplate() {
		if (!theme.template.box) {
			theme.template.box = '';
		}
		return {
			id: '_TEMPLATE',
			title: 'Template',
			img: theme.template
		};
	}

	async function loadImages() {
		let imgDir;
		for (let i = 0; i < games.length + 1; i++) {
			let res;
			let game = games[i];
			if (i == games.length) {
				game = getTemplate();
			}
			imgDir = `${prefs.emuDir}/${sys}/${game.id}/img`;
			if (prefs.ui.recheckImgs || !(await fs.exists(imgDir))) {
				await getImg(game, 'box', true);
				res = await getImg(game, 'coverFull');
				if (!res && !(await imgExists(game, 'box'))) {
					res = await getImg(game, 'cover');
					if (!res) {
						await getImg(game, 'box');
					}
				}
				if (sys != 'switch' && sys != '3ds') {
					await getImg(game, 'disc');
				} else {
					await getImg(game, 'cart');
				}
			}
			await fs.ensureDir(imgDir);
		}
		defaultCoverImg = await getImg(theme.default, 'box');
		if (!defaultCoverImg) {
			log('ERROR: No default cover image found');
			return;
		}

		games = games.sort((a, b) => a.title.localeCompare(b.title));
	}

	async function imgExists(game, name) {
		let file = `${prefs.emuDir}/${sys}/${game.id}/img/${name}.png`;
		if (!(await fs.exists(file))) {
			file = file.substr(0, file.length - 3) + 'jpg';
			if (!(await fs.exists(file))) {
				return;
			}
			return file;
		}
		return file;
	}

	async function addCover(game, reelNum) {
		let cl1 = '';
		let file = await imgExists(game, 'box');
		if (!file) {
			file = await imgExists(game, 'coverFull');
			cl1 = 'front-cover-crop ' + sys;
			if (!file) {
				file = await imgExists(game, 'cover');
				cl1 = 'front-cover ' + sys;
				if (!file) {
					log(`no images found for game: ${game.id} ${game.title}`);
					return;
				}
			}
		}
		$('.reel.r' + reelNum).append(`
			<div class="uie panel ${game.id}">
				${((cl1)?`<img src="${defaultCoverImg}">`:'')}
				<section class="${cl1}">
	      	<img src="${file}"/>
					${((cl1)?`<div class="shade p-0 m-0"></div>`:'')}
				</section>
	    </div>
		`);
	}

	function uiStateChange(state) {
		uiState = state;
		$('#gameLibViewer').removeClass();
		$('#gameLibViewer').addClass('row-x');
		$('#gameLibViewer').addClass(uiState);
	}

	function goTo(position, time) {
		if (isNaN(position)) {
			log("pos can't be: " + position);
			return;
		}
		pos = position;
		time = ((time == undefined) ? 2000 : time);
		$('html').stop().animate({
			scrollTop: pos
		}, time);
		$('.reel.reverse').stop().animate({
			bottom: pos * -1
		}, time);
		// log(pos);
	}

	function scrollToGame(gameID, time) {
		if (gameID) {
			global.$cur = $('.' + gameID).eq(0);
		}
		$cover = global.$cur;
		let $reel = $cover.parent();
		let pos = 0;
		for (let i = 0; i < $cover.index(); i++) {
			pos += $reel.children().eq(i).height();
		}
		pos += $cover.height() * .5;
		if ($reel.hasClass('reverse')) {
			pos += $(window).height() * .5;
			pos = $reel.height() - pos;
		} else {
			pos -= $(window).height() * .5;
		}
		goTo(pos, time);
	}

	this.scrollToCursor = function() {
		scrollToGame();
	}

	function getPanelID($panel) {
		if (!$panel) {
			return '';
		}
		$panel = $panel.attr('class');
		if ($panel) {
			return $panel.split(' ')[1];
		}
		return '';
	}

	this.powerBtn = async function() {
		remote.getCurrentWindow().minimize();
		let emuDirPath = path.join(prefs.emuDir,
			`../${prefs[sys].emu}/BIN`);
		if (sys == '3ds') {
			emuDirPath += '/nightly-mingw';
		}
		let emuExePath;
		if (sys == '3ds') {
			emuExePath = `${emuDirPath}/${prefs[sys].emu}-qt.exe`;
		} else {
			emuExePath = `${emuDirPath}/${prefs[sys].emu}.exe`;
		}
		let gameFile = games.find(x => x.id === getPanelID($cover));
		if (gameFile) {
			gameFile = gameFile.file;
		} else {
			return;
		}
		this.remove();
		let args = [];
		if (sys == 'wiiu') {
			let files = klawSync(gameFile + '/code');
			let ext, file;
			for (let i = 0; i < files.length; i++) {
				file = files[i].path;
				ext = path.parse(file).ext;
				if (ext == '.rpx') {
					gameFile = file;
					break;
				}
			}
			args.push('-g');
		}
		args.push(gameFile);
		if (sys == 'wiiu' || sys == '3ds') {
			args.push('-f');
		}
		try {
			await spawn(emuExePath, args, {
				cwd: emuDirPath,
				stdio: 'inherit'
			});
		} catch (ror) {
			log(ror);
		}
		remote.getCurrentWindow().focus();
		remote.getCurrentWindow().setFullScreen(true);
	}

	this.openBtn = async function() {
		$('#gameLibViewer').append();
	}

	function coverClicked(noScroll) {
		$cover = global.$cur;
		let $reel = $cover.parent();
		let id = $cover.attr('class').split(' ')[1];
		if (!id || id == '_TEMPLATE') {
			return;
		}
		if (!noScroll) {
			scrollToGame(null, 1000);
		}
		$cover.toggleClass('selected');
		$reel.toggleClass('selected');
		$('.reel').toggleClass('bg');
		// $('nav').toggleClass('gameView');
		if ($cover.hasClass('selected')) {
			$reel.css('left', `${$(window).width()*.5-$cover.width()*.5}px`);
			$cover.css('transform', `scale(${$(window).height()/$cover.height()})`);
			uiStateChange('cover');
		} else {
			uiStateChange('lib');
			$reel.css('left', '');
			$cover.css('transform', '');
		}
		log('clicked: ')
		log($cover);
	}

	this.uieClicked = function() {
		if (global.$cur.hasClass('panel')) {
			coverClicked();
		}
	}

	this.remove = function(menu) {
		$('#gameLibViewer').empty();
	}

	async function addTemplates(template, rows, num) {
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < num; j++) {
				await addCover(template, i);
			}
		}
	}

	function resizeUI(adjust) {
		let $cv = $('.cover.view');
		let $cvSel = $cv.find('select')
		let cvHeight = $cv.height();
		let cpHeight = $('.cover.power').height();
		if (adjust || cvHeight != cpHeight) {
			$cvSel.css('margin-top', (cpHeight + 24) * .5);
			$('nav').height(cpHeight + 24);
		}
	}

	this.gamepad = async function(btn) {
		switch (btn.label) {
			case 'A':
				if (uiState == 'lib') {
					coverClicked('noScroll');
					break;
				}
				return;
			case 'B':
				if (uiState == 'cover') {
					coverClicked('noScroll');
					break;
				}
				return;
			default:
				return;
		}
		return true;
	}

	this.load = async function(usrGames, usrPrefs, usrSys) {
		resizeUI(true);
		let reload;
		if (games) {
			reload = true;
		}
		games = usrGames;
		prefs = usrPrefs;
		sys = usrSys;
		let uiPath = path.join(global.__rootDir, '/prefs/ui.json');
		ui = JSON.parse(await fs.readFile(uiPath));
		theme = prefs[sys].style || sys;
		theme = ui[theme];
		mouse = prefs.ui.mouse;
		mouseWheelDeltaNSS = 100 * mouse.wheel.multi;
		await loadImages();
		let rows = 8;
		if (games.length < 18) {
			rows = 4;
		}
		if (games.length < 12) {
			rows = 2;
		}
		$('style.gameViewerRowsStyle').remove();
		let $glv = $('#gameLibViewer');
		let dynRowStyle = `<style class="gameViewerRowsStyle" type="text/css">.reel {width: ${1 / rows * 100}%;}`
		for (let i = 0; i < rows; i++) {
			$glv.append(`<div class="reel r${i} row-y ${((i % 2 == 0)?'reverse':'normal')}"></div>`)
			dynRowStyle += `.reel.r${i} {left:  ${i / rows * 100}%;}`
		}
		dynRowStyle += `#gameLibViewer.lib .reel .panel.cursor {
	outline: 1px solid white;
	outline-offset: ${12-rows}px;
}`;
		dynRowStyle += '</style>';
		$('body').append(dynRowStyle);
		uiStateChange('lib');
		let template = getTemplate();
		await addTemplates(template, rows, templateAmt);
		for (let i = 0, j = 0; i < games.length; i++) {
			try {
				for (let k = 0; k < rows; k++) {
					if (i < games.length * (k + 1) / rows) {
						await addCover(games[i], k);
						break;
					}
				}
				j++;
			} catch (ror) {
				log(ror);
			}
		}
		await addTemplates(template, rows, templateAmt);
		// for (let i = 0; i < 8; i++) {
		//   $('.reel.r' + i).clone().children().appendTo('.reel.r' + i);
		// }

		$('#dialogs').hide();
		$('.cover.view select').css('margin-top', '20px');
		if ($('.reel.bg').length) {
			coverClicked();
		}
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
						pos += mouseWheelDeltaNSS;
					} else {
						pos -= mouseWheelDeltaNSS;
					}
				}
				goTo(pos, ((!mouse.wheel.smooth) ? 2000 : 0));
			});
			// remote.getCurrentWindow().setFullScreen(true);
		}
		global.ui = 'gameLibViewer';
		await delay(100);
		// scroll to game at center of reel 0
		let $mid = $('.reel.r0').children();
		log('mid: ' + Math.round($mid.length * .5) - 1)
		$mid = $mid.eq(Math.round($mid.length * .5) - 1);
		$mid.addClass('cursor');
		global.$cur = $mid
		scrollToGame(null, 10);
		resizeUI(true);
	}

	$(window).resize(resizeUI);
}
module.exports = new Viewer();
