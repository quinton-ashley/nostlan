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
	regex: /("[^\n"]*"[^:"\n]*)"([^"\n]*)"/gm,
	replace: `$1\\"$2\\"`
}, {
	regex: /(™|©|®|℗)/gm,
	replace: ``
}, {
	regex: / - /gm,
	replace: `: `
}, {
	regex: /&apos;/gm,
	replace: `'`
}];

class GenDB {
	constructor() {}

	async generate() {
		let file, list;

		if (typeof sources[sys] == 'string') {
			log('downloading database');
			log(sources[sys]);
			let res = await requisition(sources[sys]);
			file = __root + `/db/${sys}DB_up`;
			await res.saveTo(file);
			list = await fs.readFile(file, 'utf-8');
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

		for (let form of format[sys]) {
			list = list.replace(form.regex, form.replace);
		}
		for (let strip of strips) {
			list = list.replace(strip.regex, strip.replace);
		}
		list = '{\n"games": [{\n' + list;
		list += '\n}]}';
		// to check for json formatting errors
		await fs.outputFile(file, list);
		try {
			list = JSON.parse(list);
		} catch (ror) {
			er(ror);
			return;
		}

		// special formatting
		for (let x of list.games) {
			if (sys == 'psp') {
				x.id = x.id.slice(0, 4) + x.id.slice(5);
				x.region = x.region.replace(/[\[\]]/g, '');
			}
		}
		// remove temp file
		await fs.remove(file);

		list = JSON.stringify(list, null, '\t');
		list = list.replace(/\},\s+\{/gm, '}, {');
		await fs.outputFile(file + '.json', list);

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
