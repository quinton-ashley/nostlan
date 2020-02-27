const requisition = require('requisition');
const tbl2json = require('tabletojson');
// mame db retrieved from the app itself
let sources = {
	ds: "https://www.gametdb.com/dstdb.txt?LANG=EN",
	mame: "$ ./mame64 --list",
	n3ds: "https://www.gametdb.com/3dstdb.txt?LANG=EN",
	ps1: "http://psxdatacenter.com/ulist.html",
	ps2: "https://psxdatacenter.com/psx2/ulist2.html",
	ps3: "https://www.gametdb.com/ps3tdb.txt?LANG=EN",
	psp: "http://psxdatacenter.com/psp/ulist.html",
	switch: "https://www.gametdb.com/switchtdb.txt?LANG=EN",
	wii: "https://www.gametdb.com/wiitdb.txt?LANG=EN",
	wiiu: "https://www.gametdb.com/wiiutdb.txt?LANG=EN",
	xbox360: "https://www.gamesdatabase.org/xbox_360_games_list_with_title_ids"
};
let regionFilter = {
	wii: {
		E: `\t\t\["\w\w\w[^e][^\n]*\n`
	}
};
let format = {
	gba: [{
		regex: `<game name="([^"]+)[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+<crc>([^<]+)[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+\n`,
		replace: `"id": "$2",\n\t"title": "$1"\n}, {\n`
	}],
	mame: [{
		regex: `(\S+)\s*("[^\n]+)`,
		replace: `"id": "$1",\n\t"title": $2\n}, {`
	}],
	ps2: [{
		regex: `\|([^\|]*)\|([^\|]*)\|[^\|]*[^\|\n]*\n`,
		replace: `\t"id": "$1",\n\t"title": "$2"\n}, {\n`
	}],
	snes: [{
		regex: `game\n[^\n]*\n[^\n]*\n[^:\n]*: *([^\n]*)\n[^\-\n]*\-[^\-\n]*\-*([^\n]*)\n[^\-\n]*\-([^\-\n]*)\-([^\n]*)\n[^:\n]*: *([^\n]*)\n`,
		replace: `}, {\n\t"id": "$5-$3-$2-$4",\n\t"title": "$1"`
	}, {
		regex: `\/\/[^\-]*[^\n]*\n[^\n]*\n`,
		replace: ``
	}],
	wii: [{
		regex: `\n([^\n ]*) = ([^\n]*)`,
		replace: `}, {\n\t"id": "$1",\n\t"title": "$2"`
	}],
	xbox360: [{
		regex: `([^\|]*)\|([^\|]*)\|[^\|]*\|[^\|]*\|[^\|\n]*\n`,
		replace: `\t"id": "$1",\n\t"title": "$2"\n}, {\n`
	}]
};

class GenDB {
	constructor() {}

	async generate() {

		if (sys != 'mame') {
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
