// users can type to search, which has an auto timeout
let searchTerm = '';
let searchTimeout = 0;
setInterval(function () {
	if (searchTimeout > 1000) {
		searchTimeout -= 1000;
	} else {
		searchTimeout = 0;
	}
}, 1000);

let games = []; // array of current games from the systems' db
let gameDB = [];

class CuiState extends cui.State {

	async onAction(act, $cur) {
		let $cursor = cui.$cursor;
		let isBtn = cui.isButton(act);
		if (act == 'b' && !/menu/i.test(cui.ui)) {
			cui.change('sysMenu');
			return;
		}
		if ($cursor.hasClass('cui-disabled')) return;
		if (act == 'y') {
			cui.change('emuMenu');
		} else if (act == 'a') {
			let gameSys = $cursor.attr('class');
			if (gameSys) gameSys = gameSys.split(/\s+/)[0];
			cui.boxSelect.fitCoverToScreen($cursor);
			cui.scrollToCursor(500, 0);
			cui.change('boxSelect_1', gameSys);
		} else if (/key-./.test(act)) {
			// letter by letter search for game
			this.searchForGame(act.slice(4));
		}
	}

	getCurGame() {
		let id = cui.getCursor('libMain').attr('id');
		if (/^_TEMPLATE/.test(id)) return;
		let game = games.find(x => x.id === id);
		if (game && game.file) {
			return game;
		}
		cui.err(lang.libMain.err0 + ': ' + id);
	}

	async load(gameLibDir) {
		// sysStyle = prefs[sys].style || sys;
		sysStyle = sys;
		cui.change('loading', sysStyle);
		// 'loading your game library'
		let ld0 = lang.loading.msg0_0 + ' ';
		ld0 += syst.fullName + ' ';
		ld0 += lang.loading.msg0_1;
		$('#loadDialog0').text(ld0);
		// set emu to the default for the current OS
		for (let _emu of syst.emus) {
			if (!prefs[_emu].cmd && !emus[_emu].jsEmu) continue;
			emu = _emu;
			break;
		}
		await cui.loading.intro();

		if (prefs.args.testIntro) await delay(10000000);

		let dbPath = `${__root}/db/${sys}DB.json`;
		gameDB = JSON.parse(await fs.readFile(dbPath)).games;

		let gamesPath = `${systemsDir}/${sys}/${sys}Games.json`;
		// if prefs exist load them if not copy the default prefs
		games = [];
		if (await fs.exists(gamesPath)) {
			games = JSON.parse(await fs.readFile(gamesPath)).games || [];

			// user possibly has a fresh prefs.json file
			// if prefs[sys] doesn't exist but a
			// gameLib file does
			if (!prefs[sys] || !prefs[sys].libs) {
				prefs[sys] = {
					libs: []
				};
			}
		}
		if (games.length == 0) {
			if (!systemsDir) {
				await cui.loading.removeIntro(0);
				cui.change('setupMenu');
				return;
			}

			gameLibDir = gameLibDir ||
				`${systemsDir}/${sys}/games`;
			log('searching for games in: ' + gameLibDir);

			if (!(await fs.exists(gameLibDir))) {
				await cui.loading.removeIntro(0);
				await cui.change('sysMenu');
				// 'game library does not exist: '
				cui.err(syst.name + ' ' +
					lang.sysMenu.msg0 + ': ' +
					gameLibDir, 404, 'emptyGameLibMenu');
				return;
			}
			let files = await klaw(gameLibDir);
			if (!files.length || (
					files.length == 1 &&
					(['.DS_Store', 'dir.txt'].includes(
						path.parse(files[0]).base))
				)) {
				await cui.loading.removeIntro(0);
				await cui.change('sysMenu');
				// 'game library has no game files'
				cui.err(syst.name + ' ' +
					lang.sysMenu.msg1 + ': ' +
					gameLibDir, 404, 'emptyGameLibMenu');
				return;
			}
			if (!prefs[sys]) prefs[sys] = {};
			if (!prefs[sys].libs) prefs[sys].libs = [];
			if (!prefs[sys].libs.includes(gameLibDir)) {
				prefs[sys].libs.push(gameLibDir);
			}
			games = await nostlan.scan.gameLib(gameDB);
			if (!games.length) {
				await cui.loading.removeIntro(0);
				await cui.change('sysMenu');
				cui.change('emptyGameLibMenu');
				return;
			}
		}
		systemsDir = systemsDir.replace(/\\/g, '/');
		prefs.nlaDir = systemsDir + '/nostlan';
		try {
			await fs.ensureDir(prefs.nlaDir);
		} catch (ror) {
			er(ror);
		}
		prefs.session.sys = sys;
		cui.mapButtons(sys);
		await prefsMng.save(prefs);
		if (nostlan.premium.verify()) {
			await nostlan.saves.update();
		}
		await this.viewerLoad();
		if (!offline) {
			await cui.loading.loadSharedAssets();
		}
		cui.removeView('playMenu');
		cui.removeView('emuMenu');
		let playMenu = 'h1.title0\n';
		let emuMenu = 'h1.title0\n';
		for (let _emu of syst.emus) {
			// if cmd not found emulator is not available
			// for the operating system
			if (!prefs[_emu].cmd && !emus[_emu].jsEmu) continue;

			playMenu += `.col.cui(name="${_emu}") ${emus[_emu].name}\n`;

			// TODO check if user has the emulator
			// if they do add the configure and update buttons
			// else add a button to install
			emuMenu += `.col.cui(name="${_emu}_config") ` +
				`${lang.emuMenu.msg0} ${emus[_emu].name}\n`;

			if (emus[_emu].update) {
				emuMenu += `.col.cui(name="${_emu}_update") ` +
					`${lang.emuMenu.msg1} ${emus[_emu].name}\n`;
			}
		}
		$('#playMenu_5').append(pug(playMenu));
		$('#emuMenu_5').append(pug(emuMenu));
		cui.addView('playMenu');
		cui.addView('emuMenu');

		await cui.change('libMain', sysStyle);
		await cui.boxOpenMenu.load(true);
		await cui.loading.removeIntro();
		cui.resize(true);
	}

	searchForGame(char) {
		if (searchTimeout == 0) {
			searchTerm = '';
		}
		searchTimeout = 2000;
		searchTerm += char;
		log('search for: ' + searchTerm);
		for (let game of games) {
			let titleSlice = game.title.slice(0, searchTerm.length);
			let matched = (searchTerm == titleSlice.toLowerCase());
			if (game.keywords) {
				for (let keyword of game.keywords) {
					if (searchTerm == keyword.toLowerCase()) matched = true;
				}
			}
			if (matched) {
				let $cursor = $('#' + game.id).eq(0);
				if (!$cursor.length) continue;
				log('cursor to game: ' + game.title);
				cui.makeCursor($cursor);
				cui.scrollToCursor();
				break;
			}
		}
	}

	async addTemplateBoxes(cols) {
		for (let i = 0; i < cols; i++) {
			for (let j = 0; j < 4; j++) {
				let $box = await this.makeGameBox(
					nostlan.themes[sysStyle].template);
				$('.reel.r' + i).append($box);
			}
		}
	}

	async addGameBoxes(cols) {
		let mameSetRegex = /set [2-9]/i;
		// default layout is alphabetical order by column
		// altReelsScrolling places games alphabetical order by row
		for (let i = 0, col = 0; i < games.length; i++) {
			if (prefs.ui.altReelsScrolling &&
				i >= games.length * (col + 1) / cols) {
				col++;
			}
			if (!prefs.ui.altReelsScrolling && col == cols) {
				col = 0;
			}
			// TODO temp code for hiding other game versions
			// the ability to select different versions of MAME games
			// aka "sets" will be added in the future
			if (sys == 'arcade') {
				if (mameSetRegex.test(games[i].title)) continue;
				if (i != 0 && games[i - 1].img && games[i].img &&
					games[i - 1].img.box == games[i].img.box) continue;
			}

			try {
				let $box = await this.makeGameBox(games[i]);
				$('.reel.r' + col).append($box);
				$('#loadDialog2').text(`${i+1}/${games.length} ${lang.loading.msg4}`);
				if (!prefs.ui.altReelsScrolling) col++;
			} catch (ror) {
				er(ror);
			}
		}
	}

	async makeGameBox(game) {
		$('#loadDialog1').text(game.title);
		let _sys = game.sys || sys;
		let isTemplate = (game.id.slice(1, 9) == 'TEMPLATE');
		let isUnidentified = (game.id.slice(1, 13) == 'UNIDENTIFIED');
		game.hasNoImages = false;

		let noBox;
		let boxImg = '';
		let coverImg = '';
		let coverType = '';

		async function getBoxImg() {
			boxImg = await nostlan.scraper.imgExists(game, 'box');
			// if box img is not found
			noBox = (!boxImg);
			if (noBox) {
				boxImg = await nostlan.scraper.getImg(nostlan.themes[_sys].template, 'box');
			}
		}

		async function getCoverImg() {
			coverImg = await nostlan.scraper.imgExists(game, 'cover');
			coverType = '.cover';
			if (!coverImg) {
				coverImg = await nostlan.scraper.imgExists(game, 'coverFull');
				coverType = '.coverFull';
			}
			if (!coverImg) {
				if (!isTemplate) {
					log(`no images found for game: [${game.id}] ${game.title}`);
					game.hasNoImages = true;
				}
				coverImg = '';
				coverType = '';
			}
		}

		await getBoxImg();
		if (noBox || isTemplate) {
			await getCoverImg();
		}
		if (game.hasNoImages) {
			if (prefs[sys].onlyShowGamesWithImages) return;
			let id = game.id;
			game.id = '_TEMPLATE_' + _sys; // temporary
			await getBoxImg();
			await getCoverImg();
			game.id = id; // set back to original id
		}
		if (!boxImg) return $('<game></game>');
		boxImg = await nostlan.scraper.genThumb(boxImg);
		if (coverImg) coverImg = await nostlan.scraper.genThumb(coverImg);
		if (coverType != '.coverFull') {
			let img = await nostlan.scraper.imgExists(game, 'coverFull');
			if (img) {
				await nostlan.scraper.genThumb(img);
			}
		}
		let date = '?' + Date.now();
		if (boxImg) boxImg += date;
		if (coverImg) coverImg += date;
		let box = `game#${game.id}.${_sys}.cui`;
		// if game is a template don't let the user select it
		if (isTemplate) {
			box += '.cui-disabled';
		}
		box += '\n';
		box += `  img.box.lq(src="${boxImg}")\n`;
		box += `  img.box.hq(style="display:none;")\n`;
		// used to crop the cover/coverfull image
		box += `  section.crop${coverType}\n`;
		box += `    img${coverType}.lq`;
		if (!coverType) box += '.hide';
		box += `(src="${coverImg}")\n`;
		box += `    img${coverType}.hq(style="display:none;")\n`;
		box += `    .shade.p-0.m-0`;
		if (!(coverType || _sys == 'switch' || _sys == 'gba')) {
			box += '.hide';
		}
		if (game.hasNoImages) {
			box += '\n  ' + this.labelMaker(game).replace(/\n/g, '\n  ');
		} else {
			delete game.hasNoImages;
		}
		return $(pug(box));
	}

	addLabels($game, game) {
		let lbls = this.labelMaker(game);
		$game.append(pug(lbls));
		this.addAutocomplete($game.find('.title.label-input textarea'));
	}

	labelMaker(game) {
		let title = game.title;
		if (title == '') title = ' ';
		if (!game.lblColor || (game.lblColor + '').length > 3) {
			game.lblColor = this.randomHue();
			this.shouldSaveChanges = true;
		}
		let lbls = '';
		let stksDir = prefs.nlaDir + '/images/stickers';

		let idx = Math.floor(Math.random() * 8);
		let stkSml = `${stksDir}/small/stk${idx}.png`;
		lbls += `img.sticker.sm.s${idx}(src="${stkSml}")\n`;

		if (Math.random() > .5) {
			idx = Math.floor(Math.random() * 7);
			let stkMed = `${stksDir}/medium/stk${idx}.png`;
			lbls += `img.sticker.md.s${idx}(src="${stkMed}")\n`;
		} else {
			idx = Math.floor(Math.random() * 6);
			let stkLrg = `${stksDir}/large/stk${idx}.png`;
			lbls += `img.sticker.lg.s${idx}(src="${stkLrg}")\n`;
		}
		lbls += `.title.label-input\n`;
		let fontSize = title.length.map(1, 80, 100, 50);
		let padding = title.length.map(1, 40, 15, 0);
		let titleLblImg = prefs.nlaDir + '/images/labels/large/lbl0.png';
		lbls += `  img(src="${titleLblImg}" style="filter: brightness(0.8) sepia(1) saturate(300%) hue-rotate(${game.lblColor}deg);")\n`;
		lbls += `  textarea(game_id="${game.id}" style="font-size:${fontSize}%; padding-top:${padding}%;") ${title}\n`;

		lbls += `.id.label-input\n`;
		let unidentified = game.id.includes("UNIDENTIFIED");
		let idLblImg = prefs.nlaDir + '/images/labels/medium/lbl0.png';
		if (unidentified) idLblImg = prefs.nlaDir + '/images/labels/long/lbl1.png';
		lbls += `  img(src="${idLblImg}")\n`;
		lbls += `  input(readonly="true" value="${game.id}")\n`;

		lbls += `.file.label-input\n`;
		let fileLblImg = prefs.nlaDir + '/images/labels/long/lbl0.png';
		lbls += `  img(src="${fileLblImg}" style="filter: brightness(0.8) sepia(1) saturate(300%) hue-rotate(${game.lblColor}deg);")\n`;
		lbls += `  input(readonly="true" value="${game.file.slice(1)}")\n`;
		return lbls;
	}

	randomHue() {
		let hues = [0, 15, 80, 100, 110, 140, 160, 180, 215, 250, 280, 300, 320, 335];
		return hues[Math.floor(Math.random() * hues.length)];
	}

	async viewerLoad(recheckImgs) {
		cui.resize(true);
		if (!prefs.ui.mouse.delta) {
			prefs.ui.mouse.delta =
				100 * prefs.ui.mouse.wheel.multi;
		}
		cui.mouse = prefs.ui.mouse;
		games = await nostlan.scraper.loadImages(games, recheckImgs);
		// determine the amount of columns based on the amount of games
		let cols = prefs.ui.maxColumns || 8;
		if (sys == 'snes') {
			if (games.length < 500) cols = 4;
		} else {
			if (games.length < 42) cols = 8;
			if (games.length < 18) cols = 4;
		}
		$('style.gameViewerColsStyle').remove();
		let $glv = $('#libMain');
		// the column style must change based on the number of columns
		let dynColStyle = '<style class="gameViewerColsStyle" type="text/css">' +
			`.reel {width: ${1 / cols * 100}%;}`
		for (let i = 0; i < cols; i++) {
			$glv.append(pug(
				`.reel.r${i}.row-y.${((prefs.ui.altReelsScrolling && i % 2 == 0)?'reverse':'normal')}`
			));
			dynColStyle += `.reel.r${i} {left:  ${i / cols * 100}%;}`;
		}
		dynColStyle += `
.reel .cui.cursor {
	outline: ${Math.abs(7-cols)}px dashed white;
	outline-offset: ${ 9-cols}px;
}`;
		dynColStyle += '</style>';
		$('body').append(dynColStyle);

		await this.addTemplateBoxes(cols);
		await this.addGameBoxes(cols);
		await this.addTemplateBoxes(cols);

		if (this.shouldSaveChanges) {
			await nostlan.scan.outputUsersGamesDB(games);
		}

		$('#libMain game .label-input').click(function (e) {
			if (cui.ui == 'editSelect') e.stopPropagation();
		});

		// full database for autocomplete
		this.ac_gameDB = [];
		for (let game of gameDB) {
			let g = Object.assign({}, game);
			g.value = g.title;
			this.ac_gameDB.push(g);
		}

		let $titles = $('#libMain game .title.label-input textarea');
		if ($titles.length) {
			this.addAutocomplete($titles);
		}

		cui.addView('libMain', {
			hoverCurDisabled: true
		});
		if (prefs[sys].colorPalette) {
			$('body').addClass(prefs[sys].colorPalette);
		}
	}

	addAutocomplete($el) {
		let _this = this;
		$el.autocomplete({
				minLength: 1,
				source: _this.ac_gameDB,
				focus: (event, ui) => {
					let $this = $(event.target);
					let title = ui.item.title;
					$this.val(title);
					let fontSize = title.length.map(1, 80, 100, 50);
					let padding = title.length.map(1, 40, 15, 0);
					$this.css('font-size', fontSize + '%');
					$this.css('padding-top', padding + '%');
					return false;
				},
				select: async (event, ui) => {
					let $this = $(event.target);
					$this.val(ui.item.title);
					let $game = $this.parent().parent();
					let id = $game.attr('id');
					$game.attr('id', ui.item.id);
					for (let i in games) {
						if (games[i].id != id) continue;
						let sel = Object.assign({}, ui.item);
						delete sel.value;
						delete sel.label;
						let file = games[i].file;
						games[i] = sel;
						games[i].file = file;
						$game.find('.id.label-input input').val(games[i].id);
						let unidentified = games[i].id.includes("UNIDENTIFIED");
						let idLblImg = prefs.nlaDir + '/images/labels/medium/lbl0.png';
						if (unidentified) idLblImg = prefs.nlaDir + '/images/labels/long/lbl1.png';
						$game.find('.id.label-input img').prop('src', idLblImg);
						$('#dialogs').show();
						$('body').addClass('waiting');
						let _games = await nostlan.scraper.loadImages([games[i]], true, true);
						if (_games.length) games[i] = _games[0];
						let $box = await cui.libMain.makeGameBox(games[i]);
						cui.hideDialogs();
						cui.editSelect.game.hasNoImages = false;
						$game.empty();
						$game.append($box.children());
						await cui.boxSelect.fitCoverToScreen($game);
						await cui.change('boxSelect');
						await nostlan.scan.outputUsersGamesDB(games);
						$('body').removeClass('waiting');
						break;
					}
					return false;
				}
			})
			.autocomplete('instance')._renderItem = (ul, item) => {
				return $('<li>')
					.append('<div>' + (item.title || '') + '<br>' + (item.id || '') + '</div>')
					.appendTo(ul);
			};

		// $el.on('keydown', function(e) {
		// 	if (e.key == 'Enter') {
		// 		e.preventDefault();
		// 		let game = cui.libMain.getCurGame();
		// 		game.title = $(this).text();
		// 		log('user edited game title: ');
		// 		log(game);
		// 		nostlan.scan.outputUsersGamesDB(games);
		// 	}
		// });
	}

	async rescanLib(fullRescan) {
		if (!fullRescan) {
			games = await nostlan.scan.gameLib(gameDB, games);
		} else {
			games = await nostlan.scan.gameLib(gameDB);
		}
	}

	async onChange() {
		$('#libMain')[0].style.transform = 'scale(1) translate(0,0)';
		$('#libMain').removeClass('no-outline');
	}

	async afterChange() {
		if (cui.uiPrev == 'loading' && prefs.session[sys] && prefs.session[sys].gameID) {
			let $cursor = $('#' + prefs.session[sys].gameID).eq(0);
			if (!$cursor.length) $cursor = $('#' + games[0].id).eq(0);
			cui.makeCursor($cursor);
			cui.scrollToCursor(250, 0);
		} else if (cui.uiPrev == 'boxSelect') {
			await cui.boxSelect.flipGameBox(cui.$cursor, true);
			await cui.boxSelect.changeImageResolution(cui.$cursor);
		}
	}
}
module.exports = new CuiState();
