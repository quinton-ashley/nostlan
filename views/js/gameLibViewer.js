const Viewer = function(opt) {
	opt = opt || {};
	const log = console.log;

	const {
		remote
	} = require('electron');
	const {
		app
	} = remote;
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
	let themes;
	let theme;
	let defaultCoverImg;
	let cuis = {};
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
			<div id="${game.id}" class="uie ${((game.id != '_TEMPLATE')?'':'uie-disabled')}">
				${((cl1)?`<img src="${defaultCoverImg}">`:'')}
				<section class="${cl1}">
	      	<img src="${file}"/>
					${((cl1)?`<div class="shade p-0 m-0"></div>`:'')}
				</section>
	    </div>
		`);
	}

	function removeCursor() {
		if (!global.$cur) {
			return;
		}
		global.$cur.removeClass('cursor');
	}
	this.removeCursor = removeCursor;

	function makeCursor($cur, state) {
		removeCursor();
		global.$cur = $cur;
		global.$cur.addClass('cursor');
		if (!cuis[state || global.ui]) {
			cuis[state || global.ui] = {};
		}
		cuis[state || global.ui].$cur = global.$cur;
	}
	this.makeCursor = makeCursor;

	function uiStateChange(state) {
		if (state == global.ui) {
			doAction('b');
			return;
		}
		$('#lib').removeClass();
		$('#lib').addClass('row-x');
		$('#lib').addClass(state);
		let labels = ['Power', 'Reset', 'Open'];
		if (state == 'cover') {
			labels = ['Play', '', 'Back'];
		} else if (state == 'sysMenu') {
			labels = ['', '', 'Back'];
		} else if (state == 'pauseMenu') {
			labels = ['', '', 'Back'];
		} else if (state == 'introMenu') {
			labels = ['', '', ''];
		} else if (state == 'lib') {
			$('.menu').hide();
			if (global.ui != 'cover' && !(/menu/gi).test(global.ui)) {
				let $mid = $('.reel.r0').children();
				$mid = $mid.eq(Math.round($mid.length * .5) - 1);
				makeCursor($mid, 'lib');
				scrollToGame(null, 10);
			} else {
				makeCursor(cuis.lib.$cur, 'lib');
			}
		}
		if ((/menu/gi).test(state)) {
			$('#' + state).show();
			makeCursor($('#' + state).find('.row-y').eq(0).children().eq(0), state);
		}
		if (prefs && (prefs[sys].style || sys) == 'gcn') {
			for (let i = 0; i < labels.length; i++) {
				labels[i] = labels[i].toLowerCase();
			}
		}
		$('.cover.power .text').text(labels[0]);
		$('.cover.reset .text').text(labels[1]);
		$('.cover.open .text').text(labels[2]);
		resizeUI(true);
		global.ui = state;
		if (opt.v) {
			log('ui state: ' + state);
		}
	}
	this.uiStateChange = uiStateChange;

	function scrollTo(position, time) {
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

	function scrollToGame(gameID, time, noSmallDistScrolling) {
		if (gameID) {
			global.$cur = $('.' + gameID).eq(0);
		}
		if (opt.v) {
			log(global.$cur);
		}
		let $reel = global.$cur.parent();
		let position = 0;
		for (let i = 0; i < global.$cur.index(); i++) {
			position += $reel.children().eq(i).height();
		}
		position += global.$cur.height() * .5;
		if ($reel.hasClass('reverse')) {
			position += $(window).height() * .5;
			position = $reel.height() - position;
		} else {
			position -= $(window).height() * .5;
		}
		let scrollDist = Math.abs(pos - position);
		if (noSmallDistScrolling && scrollDist < $(window).height() * .4) {
			return;
		}
		if (noSmallDistScrolling && scrollDist > global.$cur.height() * 1.1) {
			time += scrollDist;
		}
		scrollTo(position, time);
	}

	this.scrollToCursor = function() {
		if (global.ui == 'lib') {
			scrollToGame(null, ($(window).height() * 2 - global.$cur.height()) / 5, true);
		}
	}

	this.powerBtn = async function() {
		let id = cuis.lib.$cur.attr('id');
		if (!id) {
			log('game not found:\n' + cuis.lib.$cur);
			return;
		}
		remote.getCurrentWindow().minimize();
		let emuDirPath;
		if (win) {
			emuDirPath = path.join(prefs.emuDir,
				`../${prefs[sys].emu}/BIN`);
			if (sys == '3ds') {
				emuDirPath += '/nightly-mingw';
			}
		} else if (mac) {
			emuDirPath = '/Applications';
		}
		let emuNameCases = [
			prefs[sys].emu,
			prefs[sys].emu.toLowerCase(),
			prefs[sys].emu.toUpperCase()
		];
		let emuAppPath;
		for (let i = 0; i < emuNameCases.length; i++) {
			emuAppPath = `${emuDirPath}/${emuNameCases[i]}`;
			if (win) {
				if (sys == '3ds') {
					emuAppPath += '-qt';
				}
				emuAppPath += '.exe';
			} else if (mac) {
				if (sys == '3ds') {
					emuAppPath += `/nightly/${emuNameCases[1]}-qt`;
				}
				emuAppPath += '.app/Contents/MacOS/' + emuNameCases[0];
				if (sys == '3ds') {
					emuAppPath += '-qt-bin';
				}
			}
			if (await fs.exists(emuAppPath)) {
				break;
			}
		}
		let gameFile = games.find(x => x.id === id);
		if (gameFile) {
			gameFile = gameFile.file;
		} else {
			log('game not found: ' + id);
			return;
		}
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
		} else if (sys == 'wii') {
			args.push('-b');
		}
		log(emuAppPath);
		log(args);
		log(emuDirPath);
		this.remove();
		try {
			await spawn(emuAppPath, args, {
				cwd: emuDirPath,
				stdio: 'inherit'
			});
			uiStateChange('played');
		} catch (ror) {
			err(`Error!\n
				The emulator was unable to start the game.
				This is probably not an issue with Bottlenose.
				Setup ${prefs[sys].emu} if you haven't already,
				make sure it will boot a game, and try again.\n
				${ror}`);
		}
		remote.getCurrentWindow().focus();
		remote.getCurrentWindow().setFullScreen(true);
	}

	function coverClicked() {
		let $reel = global.$cur.parent();
		let id = global.$cur.attr('id');
		scrollToGame(null, 1000);
		global.$cur.toggleClass('selected');
		$reel.toggleClass('selected');
		$('.reel').toggleClass('bg');
		// $('nav').toggleClass('gameView');
		if (global.$cur.hasClass('selected')) {
			$reel.css('left', `${$(window).width()*.5-global.$cur.width()*.5}px`);
			global.$cur.css('transform', `scale(${$(window).height()/global.$cur.height()})`);
			uiStateChange('cover');
		} else {
			$reel.css('left', '');
			global.$cur.css('transform', '');
			uiStateChange('lib');
		}
	}

	function flipCover() {
		log('flip cover not enabled yet');
	}

	this.remove = function(menu) {
		$('#lib').empty();
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
		let $cvSel = $cv.find('#view');
		let cvHeight = $cv.height();
		let cpHeight = $('.cover.power').height();
		if (adjust || cvHeight != cpHeight) {
			$cvSel.css('margin-top', (cpHeight + 24) * .5);
			$('nav').height(cpHeight + 24);
		}
	}

	async function doAction(act) {
		let ui = global.ui;
		let onMenu = (/menu/gi).test(ui);
		if (ui == 'lib') {
			if (act == 'a') {
				coverClicked();
			} else if (act == 'b' && !onMenu) {
				uiStateChange('sysMenu');
			} else {
				return false;
			}
		} else if (ui == 'cover') {
			if (act == 'b') {
				coverClicked();
			} else if (act == 'y') {
				flipCover();
			} else {
				return false;
			}
		} else {
			return false;
		}
		return true;
	}

	this.doAction = doAction;

	this.load = async function(usrGames, usrPrefs, usrSys) {
		resizeUI(true);
		let reload;
		if (games) {
			reload = true;
		}
		games = usrGames;
		prefs = usrPrefs;
		sys = usrSys;
		if (!themes) {
			let themesPath = path.join(global.__rootDir, '/prefs/themes.json');
			themes = JSON.parse(await fs.readFile(themesPath));
		}
		theme = themes[prefs[sys].style || sys];
		mouse = prefs.ui.mouse;
		mouseWheelDeltaNSS = 100 * mouse.wheel.multi;
		await loadImages();
		let rows = 8;
		if (games.length < 18) {
			rows = 4;
		}
		if (games.length < 8) {
			rows = 2;
		}
		$('style.gameViewerRowsStyle').remove();
		let $glv = $('#lib');
		let dynRowStyle = `<style class="gameViewerRowsStyle" type="text/css">.reel {width: ${1 / rows * 100}%;}`
		for (let i = 0; i < rows; i++) {
			$glv.append(`<div class="reel r${i} row-y ${((i % 2 == 0)?'reverse':'normal')}"></div>`)
			dynRowStyle += `.reel.r${i} {left:  ${i / rows * 100}%;}`
		}
		dynRowStyle += `#lib.lib .reel .uie.cursor {
	outline: ${Math.abs(7-rows)}px dashed white;
	outline-offset: ${ 9-rows}px;
}`;
		dynRowStyle += '</style>';
		$('body').append(dynRowStyle);
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
		$('#view').css('margin-top', '20px');
		if ($('.reel.bg').length) {
			coverClicked();
		}
		if (!reload) {
			$(window).bind('mousewheel', function(event) {
				event.preventDefault();
				if ($('.uie.selected').length) {
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
				scrollTo(pos, ((!mouse.wheel.smooth) ? 2000 : 0));
			});
			// remote.getCurrentWindow().setFullScreen(true);
		}
		resizeUI(true);
	}

	$(window).resize(resizeUI);
}
module.exports = new Viewer();
