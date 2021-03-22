class CuiState extends cui.State {
	async onAction(act) {
		let $cursor = cui.$cursor;
		if ($cursor.hasClass('cui-disabled')) return false;

		let isBtn = cui.isButton(act);

		if (act == 'a' && $cursor[0].id != cui.getCursor('libMain')[0].id) {
			this.fitCoverToScreen($cursor);
			cui.makeCursor($cursor, 'libMain');
			cui.scrollToCursor();
		} else if (act == 'a' || act == 'y') {

			// try to load/download open box menu images
			if (!$cursor.attr('class')) return;
			let style = $cursor.attr('class').split(/\s+/)[0] || sysStyle;
			let imgs = nostlan.themes[style].template;
			if (!(await nostlan.scraper.getExtraImgs(imgs))) return;

			if (act == 'a') {
				// TODO finish open box menus for all systems
				await cui.boxOpenMenu.load();
				cui.change('boxOpenMenu');
				$('#libMain').hide();
			} else if (act == 'y') { // edit
				cui.change('imgSelect_3');
			}
		} else if (act == 'r' || act == 'l') { // flip
			let ogHeight = $cursor.height();
			await this.flipGameBox($cursor);
			if (Math.abs(ogHeight - $cursor.height()) > 10) {
				cui.resize();
				cui.scrollToCursor(0, 0);
			}
		} else if (/key-./.test(act)) {
			// letter by letter search for game
			cui.libMain.searchForGame(act.slice(4));
		}
	}

	async editImgSrc($cursor, $img, game, name) {
		if (!game) return;
		let img = await nostlan.scraper.imgExists(game, name);
		// log(img);
		if (!img) return;
		$img.prop('src', img);
		let prevClass = $img.attr('class');
		if (prevClass) {
			prevClass = prevClass.replace(/(hq|crop) */g, '');
		}
		let $elems;
		if (prevClass && prevClass != 'hide') {
			$elems = [
				$cursor.find('.hq.' + prevClass)
			];
		} else {
			$elems = [
				$cursor.find('section'),
				$cursor.find('section img.hq')
			];
		}
		for (let $elem of $elems) {
			$elem.removeClass(prevClass);
			$elem.addClass(name);
		}
		return img;
	}

	async flipGameBox($cursor) {
		let game = cui.libMain.getCurGame();
		let template = nostlan.themes[game.sys || sys].template;
		if (!$cursor.hasClass('flip')) {
			$cursor.addClass('flip');
			let $box = $cursor.find('.box.hq').eq(0);
			if (!(await this.editImgSrc($cursor, $box, game, 'boxBack'))) {
				if (!(await this.editImgSrc($cursor, $box, template, 'boxBack'))) {
					await this.editImgSrc($cursor, $box, template, 'box');
				}
			} else {
				return;
			}
			$cursor.find('.shade').removeClass('hide');
			let $cover = $cursor.find('img.cover.hq');
			if (!$cover.length) {
				$cover = $cursor.find('img.coverFull.hq');
				if ($cover.length) {
					$cover.eq(0).removeClass('hide');
					return;
				}
				$cover = $cursor.find('section img.hq');
			}
			$cover = $cover.eq(0);
			for (let name of ['coverFull', 'coverBack']) {
				for (let g of [game, template]) {
					if (await this.editImgSrc($cursor, $cover, g, name)) break;
				}
			}
			$cover.removeClass('hide');
		} else {
			$cursor.removeClass('flip');
			let $box = $cursor.find('img.boxBack.hq');
			log($box);
			if (!$box.length) $box = $cursor.find('img.box.hq');
			if (!$box.length) return;
			$box = $box.eq(0);
			log($box);
			let hasBox = true;
			for (let g of [game, template]) {
				if (await this.editImgSrc($cursor, $box, g, 'box')) break;
				hasBox = false;
			}
			if ((game.sys || sys) != 'switch') $cursor.find('.shade').addClass('hide');
			let $cover = $cursor.find('img.coverBack.hq');
			if (!$cover.length) $cover = $cursor.find('img.coverFull.hq');
			if (!$cover.length) $cover = $cursor.find('section img.hq');
			$cover = $cover.eq(0);
			if (hasBox) {
				$cover.addClass('hide');
			} else {
				let name = '';
				for (name of ['coverFull', 'cover']) {
					if (await this.editImgSrc($cursor, $cover, game, name)) break;
				}
				if (name == 'coverFull') $cursor.find('.shade').removeClass('hide');
			}
		}
	}

	async changeImageResolution($cursor, changeToFullRes) {
		let $images = $cursor.find('img');
		for (let i = 0; i < 4; i += 2) {
			if ($images.eq(i).hasClass('hide')) continue;
			if ((changeToFullRes &&
					$images.eq(i).css('display') == 'none') ||
				(!changeToFullRes &&
					$images.eq(i).css('display') == 'block')) {
				continue;
			}
			let img = $images.eq(i).prop('src');
			if (!img) continue;
			img = path.parse(img);
			img.name = img.name.replace('Thumb', '');
			let src = img.dir + '/' + img.name + img.ext;
			let sliceAmt = (win) ? 8 : 7;
			if (!(await fs.exists(src.slice(sliceAmt)))) {
				src = img.dir + '/' + img.name;
				if (img.ext != '.jpg') {
					src += '.jpg';
				} else {
					src += '.png';
				}
			}
			let $img = $images.eq(i + 1);
			if ($img.prop('src') != src) {
				$img.prop('src', src);
			}

			function swap() {
				let showIdx = i + 1;
				let hideIdx = i;
				if (!changeToFullRes) {
					showIdx = i;
					hideIdx = i + 1;
				}
				$images.eq(showIdx).css('display', 'block');
				$images.eq(hideIdx).css('display', 'none');
				$img[0].onload = () => {};
			}

			if (!$img[0].complete) {
				$img[0].onload = swap;
			} else {
				swap();
			}
		}
	}

	fitCoverToScreen($cursor) {
		let $reel = $cursor.parent();
		let $menu = $reel.parent();
		let idx = $menu.children().index($reel);
		let scale = $(window).height() / $cursor.height();
		$menu[0].style.transform = `scale(${scale}) translate(${-($reel.width()*idx + $cursor.width()*.5 - $(window).width()*.5)}px, 0)`;
	}

	beforeMove($cursor, state) {
		this.changeImageResolution($cursor);
	}

	afterMove($cursor, state) {
		this.changeImageResolution($cursor, 'full');
		this.fitCoverToScreen($cursor);
		cui.makeCursor($cursor, 'libMain');
	}

	async onChange() {
		$('#libMain').show();
		$('.reel').removeClass('hide');
	}
}
module.exports = new CuiState();
