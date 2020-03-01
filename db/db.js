const requisition = require('requisition');
const tbl2json = require('tabletojson');
// mame db retrieved from the app itself
let sources = {
	ds: "https://www.gametdb.com/dstdb.txt?LANG=EN",
	mame: {
		win: ['${app}', '--list']
	},
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
	gba: [{
		regex: /<game name="([^"]+)[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+<crc>([^<]+)[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+\n/g,
		replace: `"id": "$2",\n\t"title": "$1"\n}, {\n`
	}],
	mame: [{
		regex: /(\S+)\s*("[^\n]+)/g,
		replace: `"id": "$1",\n\t"title": $2\n}, {`
	}],
	ps2: [{
		regex: /\|([^\|]*)\|([^\|]*)\|[^\|]*[^\|\n]*\n/g,
		replace: `\t"id": "$1",\n\t"title": "$2"\n}, {\n`
	}],
	snes: [{
		regex: /game\n[^\n]*\n[^:\n]*: *([^\n]*)\n[^:\n]*: *([^\n]*)\n[^:\n]*: *([^\n]*)\n[^\-\n]*\-[^\-\n]*\-([^\n]*)(\n[^g\n][^\n]*|\n)*/g,
		replace: `}, {\n\t"id": "$3-$4",\n\t"title": "$1",\n\t"label": "$2"\n`
	}, {
		regex: /database\n *revision: ([^\n]*)[^\}]*}, /g,
		replace: `{\n"version": "$1",\n"games": [`
	}, {
		regex: /\n$/,
		replace: `}]\n}`
	}],
	switch: [{
		regex: /\n\s*(\{[^\s]*)\s*"[^"]*("[^\n]*\n[^\s]*)\s*"[^"]*([^"]*"[^"]*"[^"]*")([^\}]*\} \w+)*[^\}]*\s+\}/g,
		replace: `$1\n\t"id$2\t"title$3\n}, `
	}],
	wii: [{
		regex: /\n([^\n ]*) = ([^\n]*)/g,
		replace: `}, {\n\t"id": "$1",\n\t"title": "$2"`
	}],
	xbox360: [{
		regex: /([^\|]*)\|([^\|]*)\|[^\|]*\|[^\|]*\|[^\|\n]*\n/g,
		replace: `\t"id": "$1",\n\t"title": "$2"\n}, {\n`
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
}];

class GenDB {
	constructor() {}

	async generate() {

		if (typeof sources[sys] == 'string') {
			let res = await requisition(sources[sys]);
			let file = __root + `/db/${sys}DB`;
			await res.saveTo(file);
			let list = await fs.readFile(file, 'utf-8');
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
}

module.exports = new GenDB();
