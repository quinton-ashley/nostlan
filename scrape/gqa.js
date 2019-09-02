class GithubQuintonAshley {
	constructor() {}

	wrapUrl(url) {
		return 'q';
	}

	unwrapUrl(sys, game, imgType) {
		let url = 'https://raw.githubusercontent.com/quinton-ashley';
		if (game.id != '_TEMPLATE') {
			url += `/bottlenose-${sys}/master/${sys}/${game.id}/img`;
		} else {
			url += `/bottlenose-img/master/${sys}/${game.id}/img`;
		}
		return url + `/${imgType}.png`;
	};
}

module.exports = new GithubQuintonAshley();
