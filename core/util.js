class Utility {
	constructor() {}

	absPath(file) {
		if (!file) return '';
		let lib = file.match(/\$\d+/g);
		if (lib) {
			lib = lib[0].substr(1);
			file = file.replace(/\$\d+/g, prefs[emu].libs[lib]);
		}
		let tags = file.match(/\$[a-zA-Z]+/g);
		if (!tags) return file;
		let replacement = '';
		for (let tag of tags) {
			tag = tag.substr(1);
			if (tag == 'home') {
				replacement = os.homedir().replace(/\\/g, '/');
			}
			file = file.replace('$' + tag, replacement);
		}
		return file;
	}
}

module.exports = new Utility();
