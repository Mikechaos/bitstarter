`#!/usr/bin/env node`

$ = {}
fs = require('fs');
program = require('commander');
cheerio = require('cheerio');
HTMLFILE_DEFAULT = "index.html";
CHECKSFILE_DEFAULT = "checks.json";

sys = require('util')
rest = require('restler');
test = {};

get_url_content = (content) -> 
  return @result if arguments.length is 0
  @result = content

read_url = (url) ->
  ret_result = rest.get(url).on 'complete', (result) ->
    if result instanceof Error
      sys.puts('Error: ' + result.message);
      @retry(5000);
    else 
      get_url_content result
  
assertFileExists = (infile) ->
  instr = infile.toString()
  if not fs.existsSync infile
    console.log "%s does not exist. Exiting", instr
    process.exit(1)
  instr

loadChecks = (checksfile) ->
  JSON.parse fs.readFileSync checksfile

checkHtmlFile = (content, checksfile) ->
  $ = cheerio.load content
  checks = loadChecks(checksfile).sort()
  out = {}
  presence = (tag) -> $(tag).length > 0
  out[tag] = presence(tag) for tag in checks
  out

clone = (fn) -> fn.bind {}

make_autoclear_async = (predicate, body = (->), elapse = 500) ->
  int = setInterval ->
    if predicate.call(null)
      clearInterval(int)
      body.call(null, int)
   , elapse

get_async_content = (url) -> 
  read_url url
  make_autoclear_async(get_url_content)

if require.main is module
  program
    .option('-c, --checks <check_file>', 'Path to checks.json',
            clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html',
            clone(assertFileExists), HTMLFILE_DEFAULT)
    .option('-u, --url <url_to_file', 'Url to html file')
    .parse(process.argv);

  if program.url isnt undefined then get_async_content program.url
  else content = fs.readFileSync program.file

  get_content = -> content || get_url_content()
  checkHtml = -> 
    check = checkHtmlFile get_content(), program.checks
    outJson = JSON.stringify check, null, 4
    console.log outJson
  outJson = make_autoclear_async get_content, checkHtml
else
  exports.checkHtmlFile = checkHtmlFilecontent = Fs.readFileSync Program.file
