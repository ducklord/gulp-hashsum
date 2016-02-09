'use strict';

var crypto = require('crypto');
var gutil = require('gulp-util');
var _ = require('lodash');
var slash = require('slash');
var through = require('through');
var File = require('vinyl');
var path = require('path');

function hashsum(options) {
	options = _.defaults(options || {}, {
		dest: process.cwd(),
		hash: 'sha1',
		delimiter: '  '
	});
	options = _.defaults(options, { filename: options.hash.toUpperCase() + 'SUMS' });

	var hashesFilePath = path.resolve(options.dest, options.filename);
	var hashes = {};

	function processFile(file) {
		if (file.isNull()) {
			return;
		}
		if (file.isStream()) {
			this.emit('error', new gutil.PluginError('gulp-hashsum', 'Streams not supported'));
			return;
		}
		var filePath = path.resolve(options.dest, file.path);
		hashes[slash(path.relative(path.dirname(hashesFilePath), filePath))] = crypto
			.createHash(options.hash)
			.update(file.contents, 'binary')
			.digest('hex');
	}

	function writeSums() {
		var lines = _.keys(hashes).sort().map(function (key) {
			return hashes[key] + options.delimiter + key + '\n';
		});
		var data = new Buffer(lines.join(''));

		this.emit('data', new File({
			path: options.filename,
			contents: data
		}));
		this.emit('end');
	}

	return through(processFile, writeSums);
}

module.exports = hashsum;
