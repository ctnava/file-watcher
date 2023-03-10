const fs = require('fs');

const needsUpdate = (pathTo, accessTime) => {
	const lastModified = fs.statSync(pathTo).mtimeMs;
	return lastModified > accessTime;
};

const extension = (pathTo) =>
	pathTo.split('.')[pathTo.split('.').length - 1].toLowerCase();

const extract = (pathTo) => {
	let output = fs.readFileSync(pathTo);
	const ext = extension(pathTo);
	if (ext === 'json') return JSON.parse(output);
	return output;
};

const save = (pathTo, data) => {
	let prepared = data;

	const ext = extension(pathTo);
	if (ext === 'json') prepared = JSON.stringify(data, undefined, 2);

	fs.writeFileSync(pathTo, prepared);
};

module.exports = class FileWatcher {
	#pathTo;
	#accessTime;

	egress() {
		if (needsUpdate(this.#pathTo, this.#accessTime)) {
			this.data = extract(this.#pathTo);
			this.#accessTime = new Date().getTime();
		}
		return this.data;
	}

	ingress(data) {
		save(this.#pathTo, data);
		this.egress();
	}

	constructor(pathToFile) {
		this.#pathTo = pathToFile;
		this.#accessTime = 0;
		if (fs.existsSync(pathToFile)) this.egress();
		else this.ingress({});
	}
};
