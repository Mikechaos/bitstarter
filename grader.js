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

var read_url = function(url) {
    var that = {}
    var ret_result = rest.get(url).on('complete', function(result) {
	if (result instanceof Error) {
	    sys.puts('Error: ' + result.message);
	    this.retry(5000); // try again after 5 sec
	} else {
	    that.result = this;
	}
    });
    console.log(ret_result);
};

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1); // http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};



var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};


var cheerioUrl = function(url) {
    return cheerio.load(read_url(url).result)
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(load_fn, load_content, checksfile) {
    $ = load_fn(load_content);
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

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists), CHECKSFILE_DEFAULT)
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists), HTMLFILE_DEFAULT)
	.option('-u, --url <url_to_file', 'Url to html file')
        .parse(process.argv);
    var checkJson;
    console.log(read_url(program.url));
    // if (program.url)
    // 	checkJson = checkHtmlFile(cheerioUrl, program.url, program.checks);
    // else
    // 	checkJson = checkHtmlFile(cheerioHtmlFile, program.file, program.checks);
    // var outJson = JSON.stringify(checkJson, null, 4);
    // console.log(outJson);
    // console.log(read_url(program.url));
} else {
    exports.checkHtmlFile = checkHtmlFile;
}
