module.exports = function(dir, options) {
	return new Promise((resolve, reject) => {
		let items = [];
		let i = 0;
		require('klaw')(dir, options)
			.on('data', item => {
				if (i > 0) {
					items.push(item.path);
				}
				i++;
			})
			.on('end', () => resolve(items))
			.on('error', (err, item) => reject(err, item));
	});
}
