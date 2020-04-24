/*
 * db.js : Nostlan : quinton-ashley
 *
 * NOTE: Not used by Nostlan yet, incomplete.
 * Converts database files to Nostlan's json db format.
 */
const requisition = require('requisition');
const tbl2json = require('tabletojson');
// mame arcade db retrieved from the app itself
let sources = {
	arcade: {
		win: ['${app}', '--list']
	},
	ds: "https://www.gametdb.com/dstdb.txt?LANG=EN",
	n3ds: "https://www.gametdb.com/3dstdb.txt?LANG=EN",
	ps1: "http://psxdatacenter.com/ulist.html",
	ps2: "https://psxdatacenter.com/psx2/ulist2.html",
	ps3: "https://www.gametdb.com/ps3tdb.txt?LANG=EN",
	psp: "http://psxdatacenter.com/psp/ulist.html",
	switch: [
		"https://switchbrew.org/wiki/Title_list/Games",
		"https://www.gametdb.com/switchtdb.txt?LANG=EN"
	],
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
		regex: /(\S+)\s*("[^\n]+)/g,
		replace: `"id": "$1",\n\t"title": $2\n}, {`
	}],
	gba: [{
		regex: /<game name="([^"]+)[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+<crc>([^<]+)[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+\n/g,
		replace: `"id": "$2",\n\t"title": "$1"\n}, {\n`
	}],
	nes: [{
		regex: /game \(\s+name "([^\(]+)\(([^\(]+)\)( \([^\d]* *([\d\.]*)\))*[^"]*"[^\n]*\n[^\n]*[^"]*"[^"]*" size \d* crc (\w{8})[^\n]*\n[^\n]*\n\n/g,
		replace: `"id": "$5",\n\t\t"title": "$1",\n\t\t"region": "$2",\n\t\t"ver": "$4"\n\t}, {\n\t\t`
	}],
	ps1: [{
		regex: /\s*"\?[^\n]*(\s*")[^"]*([^\n]*\s*")[^"]*([^,]*),\n[^\n]*\s*\},\s*{/g,
		replace: `$1id$2title$3\n\t}, {`
	}],
	ps2: [{
		regex: /\|([^\|]*)\|([^\|]*)\|[^\|]*[^\|\n]*\n/g,
		replace: `\t"id": "$1",\n\t"title": "$2"\n}, {\n`
	}],
	snes: [{
		regex: /game\n[^:\n]*: *([^\n]*)\n[^:\n]*: *([^\n]*)\n[^:\n]*: *([^\n]*)\n[^:\n]*: *([^\n]*)\n[^\-\n]*\-[^\-\n]*\-([^\n]*)(\n[^g\n][^\n]*|\n)*/g,
		replace: `}, {\n\t"id": "$4-$5",\n\t"title": "$2",\n\t"label": "$3"\n\t"sha256": "$1"\n`
	}, {
		regex: /database\n *revision: ([^\n]*)[^\}]*}, /g,
		replace: ` {\
					n "version": "$1", \n "games": [`
	}, {
		regex: /\n$/,
		replace: `
					}]\ n
			}
			`
	}],
	switch: [{
		regex: /\n\s*(\{[^\s]*)\s*"[^"]*("[^\n]*\n[^\s]*)\s*"[^"]*([^"]*"[^"]*"[^"]*")([^\}]*\} \w+)*[^\}]*\s+\}/g,
		replace: `
			$1\ n\ t "id$2\t"
			title$3\ n
		},
		`
	}],
	wii: [{
		regex: /\n([^\n ]*) = ([^\n]*)/g,
		replace: `
	},
	{\
		n\ t "id": "$1",
		\n\ t "title": "$2"
		`
	}],
	xbox360: [{
		regex: /([^\|]*)\|([^\|]*)\|[^\|]*\|[^\|]*\|[^\|\n]*\n/g,
		replace: `\
		t "id": "$1",
		\n\ t "title": "$2"\
		n
	}, {\
		n `
	}]
};

let strip = [{
	regex: /("[^\n"]*)"([^:"\n]*)"([^"\n]*")/g,
	replace: `$1\"$2\"$3`
}, {
	regex: /(™|©|®|℗)/g,
	replace: ``
}, {
	regex: / - /g,
	replace: `: `
}, {
	regex: /&apos;/g,
	replace: `'`
}];

class GenDB {
	constructor() {}

	async generate() {
		let list;

		if (typeof sources[sys] == 'string') {
			let res = await requisition(sources[sys]);
			let file = __root + `/db/${sys}DB`;
			await res.saveTo(file);
			list = await fs.readFile(file, 'utf-8');
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

		if (format[sys]) {
			let regex = new RegExp(format[sys].regex, 'gm');
			list = list.replace(regex, format[sys].replace);
			list = JSON.parse(list);
		}

		for (let x of list) {
			if (sys == 'psp') {
				x.id = x.id.slice(0, 4) + x.id.slice(5);
				x.region = x.region.replace(/[\[\]]/g, '');
			}
			x.title = x.title.replace(/ - /g, ': ');
		}

		list = {
			games: list
		};
		await fs.remove(file);
		file += '.json';
		await fs.outputFile(file, JSON.stringify(list, null, '\t'));
	}

	async merge(_sys) {
		_sys = _sys || sys;

		let deepExtend = require('deep-extend');

		let db0Path = `${__root}/db/${_sys}DB.json`;
		let db0 = JSON.parse(await fs.readFile(db0Path));
		let db1Path = `${__root}/db/${_sys}DB1.json`;
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

		let file = `${__root}/db/${_sys}DBx.json`;
		await fs.outputFile(file, JSON.stringify(db0, null, '\t'));
		log('finished!');
		log('merged: ' + (merged / Math.max(db0.games.length, db1.games.length)).toFixed(2) * 100 + '%');
	}
}

module.exports = new GenDB();
