/*
 * db.js : Nostlan : quinton-ashley
 *
 * NOTE: Not used by Nostlan yet, incomplete.
 * Converts database files to Nostlan's json db format.
 */
const tbl2json = require('tabletojson');
// mame arcade db retrieved from the app itself
let sources = {
	arcade: {
		win: ['${app}', '--list']
	},
	ds: "https://www.gametdb.com/dstdb.txt?LANG=EN",
	n3ds: "https://www.gametdb.com/3dstdb.txt?LANG=EN",
	n64: "https://github.com/libretro/libretro-database/raw/master/metadat/no-intro/Nintendo%20-%20Nintendo%2064.dat",
	nes: "https://github.com/libretro/libretro-database/raw/master/metadat/no-intro/Nintendo%20-%20Super%20Nintendo%20Entertainment%20System.dat",
	ps1: "http://psxdatacenter.com/ulist.html",
	ps2: "https://psxdatacenter.com/psx2/ulist2.html",
	ps3: "https://www.gametdb.com/ps3tdb.txt?LANG=EN",
	psp: "http://psxdatacenter.com/psp/ulist.html",
	switch: "https://www.gametdb.com/switchtdb.txt?LANG=EN",
	// "https://switchbrew.org/wiki/Title_list/Games"
	wii: "https://www.gametdb.com/wiitdb.txt?LANG=EN",
	wiiu: "https://www.gametdb.com/wiiutdb.txt?LANG=EN",
	xbox360: "https://www.gamesdatabase.org/xbox_360_games_list_with_title_ids"
};
let regionFilter = {
	wii: {
		E: /\t\t\["\w\w\w[^e][^\n]*\n/
	}
};
let format = {
	arcade: [{
		regex: /(\S+)\s*("[^\n]+)/gm,
		replace: `"id": "$1",\n\t"title": $2\n}, {`
	}],
	gba: [{
		regex: /<game name="([^"]+)[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+<crc>([^<]+)[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+\n/gm,
		replace: `"id": "$2",\n\t"title": "$1"\n}, {\n`
	}],
	nes: [{
		regex: /game \(\s+name "([^\(]+)\(([^\(]+)\)( \([^\d]* *([\d\.]*)\))*[^"]*"[^\n]*\n[^\n]*[^"]*"[^"]*" size \d* crc (\w{8})[^\n]*\n[^\n]*\n\n/gm,
		replace: `"id": "$5",\n\t\t"title": "$1",\n\t\t"region": "$2",\n\t\t"ver": "$4"\n\t}, {\n\t\t`
	}],
	n64: [{
		regex: /\)\s*game \(/gm,
		replace: `}, {`
	}, {
		regex: /\t*description [^\n]*\n/gm,
		replace: ``
	}, {
		regex: /\tname "/gm,
		replace: `\t"title": "`
	}, {
		regex: /\tregion "/gm,
		replace: `\t"region": "`
	}, {
		regex: /\tserial "/gm,
		replace: `\t"serial": "`
	}, {
		regex: /\tversion "/,
		replace: `"version": "`
	}, {
		regex: /\thomepage "[^"]*"\n/,
		replace: ``
	}, {
		regex: /\t"title": "[^"]*"/,
		replace: `"sys": "n64"`
	}, {
		regex: /clrmamepro \(/,
		replace: ''
	}, {
		regex: /"\n/g,
		replace: '",\n'
	}, {
		regex: /rom \( name "[^"]*" [^ ]* [^ ]* crc ([^ ]*) [^ ]* [^ ]* sha1 ([^ ]*)[^\)]*\)/gm,
		replace: `"id": "$1",\n\t"sha1": "$2"`
	}],
	ps1: [{
		regex: /\s*"\?[^\n]*(\s*")[^"]*([^\n]*\s*")[^"]*([^,]*),\n[^\n]*\s*\},\s*{/gm,
		replace: `$1id$2title$3\n\t}, {`
	}],
	ps2: [{
		regex: /\|([^\|]*)\|([^\|]*)\|[^\|]*[^\|\n]*\n/gm,
		replace: `\t"id": "$1",\n\t"title": "$2"\n}, {\n`
	}],
	snes: [{
		regex: /game\n[^:\n]*: *([^\n]*)\n[^:\n]*: *([^\n]*)\n[^:\n]*: *([^\n]*)\n[^:\n]*: *([^\n]*)\n[^\-\n]*\-[^\-\n]*\-([^\n]*)(\n[^g\n][^\n]*|\n)*/gm,
		replace: `}, {\n\t"id": "$4-$5",\n\t"title": "$2",\n\t"label": "$3"\n\t"sha256": "$1"\n`
	}, {
		regex: /database\n *revision: ([^\n]*)[^\}]*}, /gm,
		replace: ` {\n "version": "$1", \n "games": [`
	}, {
		regex: /\n$/gm,
		replace: `}]\n}`
	}],
	// switch: [{
	// 	regex: /\n\s*(\{[^\s]*)\s*"[^"]*("[^\n]*\n[^\s]*)\s*"[^"]*([^"]*"[^"]*"[^"]*")([^\}]*\} \w+)*[^\}]*\s+\}/gm,
	// 	replace: `$1\n\t "id$2\t"title$3\n},`
	// }],
	switch: [{
		regex: /\n([^\n ]*) = ([^\n]*)/gm,
		replace: `}, {\n\t"id": "$1",\n\t"title": "$2"\n`
	}, {
		regex: /[^\n]+\n/,
		replace: ''
	}],
	wii: [{
		regex: /\n([^\n ]*) = ([^\n]*\n*)/gm,
		replace: `}, {\n\t"id": "$1",\n\t"title": "$2"\n`
	}],
	xbox360: [{
		regex: /([^\|]*)\|([^\|]*)\|[^\|]*\|[^\|]*\|[^\|\n]*\n/gm,
		replace: `\t "id": "$1",\n\t "title": "$2"\n}, {\n `
	}]
};

let strips = [{
	regex: /("title": "[^\n"]*)"([^"\n]*)"([^"\n]*)"/gm,
	replace: `$1\\"$2\\"$3"`
}, {
	regex: /(™|©|®|℗)/gm,
	replace: ``
}, {
	regex: / - /gm,
	replace: `: `
}, {
	regex: /&apos;/gm,
	replace: `'`
}, {
	regex: /&amp;/gm,
	replace: `&`
}];

class GenDB {
	constructor() {}

	async generate() {
		let file, list;

		if (typeof sources[sys] == 'string') {
			log('downloading ' + sys + ' database');
			log(sources[sys]);
			await delay(10);
			list = await (await fetch(sources[sys])).text();
			file = __root + `/db/${sys}DB_up`;
			await fs.outputFile(file, list);

			log(file);
		}

		// log(list);

		if (sys == 'psp') {
			let lists = tbl2json.convert(list);
			list = [];
			for (let l of lists) {
				for (let x of l) {
					let game = {
						id: x[1],
						title: x[2],
						region: x[3]
					}
					list.push(game);
				}
			}
		}
		// convert windows to unix line endings
		list = list.replace(/\r\n/gm, '\n');

		if (sys == 'n64') {
			strips.push({
				regex: / *\((USA|Europe|Japan|\w\w,[^\)]*)\)/gm,
				replace: ''
			});
		}

		log('re-formatting database...');

		for (let form of format[sys]) {
			list = list.replace(form.regex, form.replace);
		}
		for (let strip of strips) {
			list = list.replace(strip.regex, strip.replace);
		}
		if (sys == 'n64') {
			list = list.slice(0, list.length - 2);
			list = list.replace('}, {', '"games": [{');
			list = '{' + list;
			list += '}]}';
		} else {
			list = '{\n"games": [{\n' + list;
			list += '\n}]}';
		}

		log('saving file: ' + file);
		// to check for json formatting errors
		await fs.outputFile(file, list);

		log('converting to JSON...');
		try {
			list = JSON.parse(list);
		} catch (ror) {
			er(ror);
			return;
		}

		// special formatting
		if (sys == 'psp') {
			for (let x of list.games) {
				x.id = x.id.slice(0, 4) + x.id.slice(5);
				x.region = x.region.replace(/[\[\]]/g, '');
			}
		}

		// reduction
		if (sys == 'n64') {
			let games = [];
			let sub = 1;
			for (let i in list.games) {
				if (i == 0) continue;
				let x = list.games[i - sub];
				let y = list.games[i];
				if (x.title == y.title &&
					x.region == y.region &&
					x.serial == y.serial) {
					x.sha1 = [x.sha1, y.sha1];
					sub++;
				} else {
					games.push(x);
					if (sub == 1) games.push(y);
					sub = 1;
				}
			}
		}
		// remove temp file
		await fs.remove(file);

		list = JSON.stringify(list, null, '\t');
		list = list.replace(/\},\s+\{/gm, '}, {');
		file += '.json';
		await fs.outputFile(file, list);

		log('finished!');
		log('database generated: ' + file);
	}

	async merge(_sys) {
		_sys = _sys || sys;

		let deepExtend = require('deep-extend');

		let db0Path = `${__root}/db/${_sys}DB_up.json`;
		let db0 = JSON.parse(await fs.readFile(db0Path));
		let db1Path = `${__root}/db/${_sys}DB.json`;
		let db1 = JSON.parse(await fs.readFile(db1Path));

		let merged = 0;
		for (let game of db0.games) {
			// merge by id
			let match = db1.games.find(x => x.id === game.id);
			if (!match) continue;
			log(match.title);
			deepExtend(game, match);
			merged++;
		}

		for (let game of db1.games) {
			// merge by id
			let match = db0.games.find(x => x.id === game.id);
			if (!match) {
				db0.games.push(game);
				log(game.title);
				merged++;
			}
		}

		let list = JSON.stringify(db0, null, '\t');
		list = list.replace(/\},\s+\{/gm, '}, {');
		await fs.outputFile(db1Path, list);
		await fs.remove(db0Path);
		log('finished!');
		log('merged: ' + (merged / Math.max(db0.games.length, db1.games.length)).toFixed(2) * 100 + '%');
	}
}

module.exports = new GenDB();
