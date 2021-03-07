const dl = require('./dl.js');
const probe = require('probe-image-size');

let gb = {
	key: '77fc79812677f482659ce5f0f4e53b936eafda23',
	base: 'https://www.giantbomb.com/api',
	regex: {}
};
gb.params = `api_key=${gb.key}&format=json`;
gb.search = `${gb.base}/search/?${gb.params}&resources=game&query=`;

async function dlFromGiant(game, dir, name) {
	// TODO
	let query;
	if (!gb.regex['ps3']) {
		let regexStr = '(packag|disc|back|JP|Japan';
		let elminSystems = [
			'wii', 'ds', '3ds', 'switch', 'xbox',
			'ps3', 'ps2', 'pc', 'gamecube', 'gcn'
		];
		for (let elimSys of elminSystems) {
			regexStr += '|' + elimSys;
		}
		regexStr += ')';
		regexStr.replace('\|ps3', '');
		gb.regex['ps3'] = new RegExp(regexStr, 'i');
	}
	let url = gb.search + query;
	let res = await (await fetch(url)).json();
	let tags = res.results[0].image_tags;
	url = tags.find(x => x.name === 'Box Art').api_detail_url;
	url += '&' + gb.params;
	res = await (await fetch(url)).json();
	let images = res.results;
	let largestImgUrl = '';
	let largest = 0;
	for (let i in images) {
		images[i] = images[i].original_url;
		let size = (await probe(images[i]));
		log(images[i]);
		log(size.width + 'x' + size.height);
		if (size.height > largest) {
			let name = images[i].split('-')[1];
			if (!gb.regex['ps3'].test(name)) {
				largest = size.height;
				largestImgUrl = images[i];
			}
		}
	}
	opn(largestImgUrl);
}
