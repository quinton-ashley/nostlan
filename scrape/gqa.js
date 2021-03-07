class GithubQuintonAshley {
	constructor() {
		this.name = "quinton-ashley on Github";
	}

	wrapUrl(url) {
		return 'q';
	}

	unwrapUrl(game, name) {
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
