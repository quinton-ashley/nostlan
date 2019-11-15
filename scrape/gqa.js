class GithubQuintonAshley {
	constructor() {}

	wrapUrl(url) {
		return 'q';
	}

	unwrapUrl(game, imgType) {
		let url = 'https://raw.githubusercontent.com/quinton-ashley';
		if (!game.id.includes('_TEMPLATE')) {
			url += `/bottlenose-${sys}/master/${sys}/${game.id}`;
		} else {
			url += `/bottlenose-img/master/${sys}/${game.id}`;
		}
		return url + `/${imgType}.png`;
	};
}

module.exports = new GithubQuintonAshley();
