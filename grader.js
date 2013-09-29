#!/usr/bin/env node
/*
Automatically grade files for the presence of specified HTML tags/attributes.
Uses commander.js and cheerio. Teaches command line application development
and basic DOM parsing.

References:

 + cheerio
   - https://github.com/MatthewMueller/cheerio
   - http://encosia.com/cheerio-faster-windows-friendly-alternative-jsdom/
   - http://maxogden.com/scraping-with-node.html

 + commander.js
   - https://github.com/visionmedia/commander.js
   - http://tjholowaychuk.com/post/9103188408/commander-js-nodejs-command-line-interfaces-made-easy

 + JSON
   - http://en.wikipedia.org/wiki/JSON
   - https://developer.mozilla.org/en-US/docs/JSON
   - https://developer.mozilla.org/en-US/docs/JSON#JSON_in_Firefox_2
*/


var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var HTMLFILE_DEFAULT = "index.html";
var CHECKSFILE_DEFAULT = "checks.json";

var sys = require('util'),
    rest = require('restler');
var test = {};
 
var get_url_content = function (content) {
    if (arguments.length === 0) return this.result;
    this.result = content;
    return content;

};


var read_url = function(url) {
    var that = {}
    var ret_result = rest.get(url).on('complete', function(result) {
	if (result instanceof Error) {
	    sys.puts('Error: ' + result.message);
	    this.retry(5000);
	} else {
	    get_url_content(result)
	}
	return 'test';
    });
};

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};


var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(load_content, checksfile) {
    $ = cheerio.load(load_content);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

var make_autoclear_async = function (predicate, body, elapse) {
    var int;
    elapse = elapse || 500;
    body = body || function () {};
    return int = setInterval(function () {
	if (predicate()) {
	    clearInterval(int);
	    return body(int);
	}
    }, elapse)
};

var get_async_content = function (url) {
    var async = {};
    read_url(url);
    return async = make_autoclear_async(get_url_content)
};

if(require.main == module) {
    program
	.option('-c, --checks <check_file>', 'Path to checks.json',
		clone(assertFileExists), CHECKSFILE_DEFAULT)
	.option('-f, --file <html_file>', 'Path to index.html',
		clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url_to_file', 'Url to html file')
	.parse(process.argv);
    
    var checkJson;
    var content;
    
    if (program.url) get_async_content(program.url);
    else content = fs.readFileSync(program.file);
    
    // Also act as a predicate like use in make_autoclear_async
    var get_content = function () {return content || get_url_content();};
    var checkHtml = function () {
	var check = checkHtmlFile(get_content(), program.checks);
	var outJson = JSON.stringify(check, null, 4);
	console.log(outJson);
    };
    var outputJson = make_autoclear_async(get_content, checkHtml);
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
