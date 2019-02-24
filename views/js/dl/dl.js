const req = require('requisition');

async function dlWithExt(url, file) {
	if (!(await fs.exists(file))) {
		let res = await req(url);
		if (res.status == 404) {
			return;
		}
		$('#loadDialog1').text(url.replace(/\%20/g, ' '));
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
			res = await dlWithExt(url + '.jpg', file + '.jpg');
		} else if (i == 1) {
			res = await dlWithExt(url + '.png', file + '.png');
		}
		if (res) {
			return res;
		}
	}
	return;
}

module.exports = async function(url, file, hasExt) {
	if (hasExt) {
		return await dlWithExt(url, file);
	}
	return await dlNoExt(url, file);
}
