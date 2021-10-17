const streamPipeline = require('util').promisify(require('stream').pipeline);

async function dlWithExt(url, file, opt) {
	opt = opt || {};
	if (!(await fs.exists(file))) {
		let res;
		try {
			res = await Promise.race([
				new Promise((resolve, reject) => {
					fetch(url)
						.then((response) => resolve(response))
						.catch((ror) => reject(ror));
				}),
				new Promise((resolve, reject) => {
					delay(opt.timeout || 5000).then(() => {
						reject('request timed out');
					});
				})
			]);
		} catch (ror) {
			if (ror) er(ror);
			er('failed to download img: \n' + url);
			return;
		}
		if (res.status == 404) {
			return;
		}
		$('#loadDialog1').text(url.replace(/\%20/g, ' '));
		log('downloading: ' + url);
		log('saving to: ' + file);
		await streamPipeline(res.body, fs.createWriteStream(file));
		$('#loadDialog1').text(' ');
	}
	return file;
}

async function dlNoExt(url, file, opt) {
	opt = opt || {};
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

module.exports = async function (url, file, opt) {
	opt = opt || {};
	if (opt.unknownExt) {
		return await dlNoExt(url, file, opt);
	}
	return await dlWithExt(url, file, opt);
};
