const tbl2json = require('tabletojson');
// mame db retrieved from the app itself
let sources = {
	ds: "https://www.gametdb.com/dstdb.txt?LANG=EN",
	n3ds: "https://www.gametdb.com/3dstdb.txt?LANG=EN",
	ps1: "http://psxdatacenter.com/ntsc-u_list.html",
	ps2: "https://psxdatacenter.com/psx2/ntsc-u_list2.html",
	ps3: "https://www.gametdb.com/ps3tdb.txt?LANG=EN",
	psp: "http://psxdatacenter.com/psp/ntsc-u_list.html",
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
	wii: [{
		regex: `\n([^\n ]*) = ([^\n]*)`,
		replace: `}, {\n\t"id": "$1",\n\t"title": "$2"`
	}],
	xbox360: [{
		regex: `([^\|]*)\|([^\|]*)\|[^\|]*\|[^\|]*\|[^\|\n]*\n`,
		replace: `\t"id": "$1",\n\t"title": "$2"\n}, {\n`
	}],
	ps2: [{
		regex: `\|([^\|]*)\|([^\|]*)\|[^\|]*[^\|\n]*\n`,
		replace: `\t"id": "$1",\n\t"title": "$2"\n}, {\n`
	}],
	gba: [{
		regex: `<game name="([^"]+)[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+<crc>([^<]+)[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+\n[^\n]+\n`,
		replace: `"id": "$2",\n\t"title": "$1"\n}, {\n`
	}],
	mame: [{
		src: `$ ./mame64 --list`
	}, {
		regex: `(\S+)\s*("[^\n]+)`,
		replace: `"id": "$1",\n\t"title": $2\n}, {`
	}],
	bsnes: [{
		regex: `game\n[^\n]*\n[^\n]*\n[^:\n]*: *([^\n]*)\n[^\-\n]*\-[^\-\n]*\-*([^\n]*)\n[^\-\n]*\-[^\-\n]*\-([^\n]*)\n[^:\n]*: *([^\n]*)\n((  )+[^\n]*\n)+`,
		replace: `}, {\n\t"id": "$4",\n\t"revision": "$3",\n\t"title": "$1",\n\t"region": "$2"`
	}, {
		regex: `\/\/[^\-]*[^\n]*\n[^\n]*\n`,
		replace: ``
	}]
};

class GenDB {
	constructor() {}

	async generate() {

	}
}

module.exports = new GenDB();
