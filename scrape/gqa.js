class GithubQuintonAshley {
	constructor() {}

	wrapUrl(url) {
		return 'q';
	}

	unwrapUrl(data) {
		let game = data[0];
		let name = data[1];
		let url = 'https://raw.githubusercontent.com/quinton-ashley';
		if (!game.id.includes('_TEMPLATE')) {
			url += `/nostlan-${sys}/master/${sys}/${game.id}`;
		} else {
			url += `/nostlan-img/master/${sys}/${game.id}`;
		}
		return url + `/${name}`;
	}
}

module.exports = new GithubQuintonAshley();
