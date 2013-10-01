$ = {}
fs = require 'fs';
program = require 'commander'
cheerio = require 'cheerio'
HTMLFILE_DEFAULT = "index.html"
CHECKSFILE_DEFAULT = "checks.json"

sys = require 'util'
rest = require 'restler'


read_url = (url, cb) ->
  rest.get(url).on 'complete', (result) ->
    if result instanceof Error
      sys.puts('Error: ' + result.message);
      @retry(5000);
    else
      cb(result)
                   
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

get_content = (autocb) ->
  if program.url?
    await read_url program.url, defer content
    content
  else fs.readFileSync program.file

if require.main is module
  program
    .option('-c, --checks <check_file>', 'Path to checks.json',
            clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html',
            clone(assertFileExists), HTMLFILE_DEFAULT)
    .option('-u, --url <url_to_file', 'Url to html file')
    .parse(process.argv);
  await get_content defer content
  check = checkHtmlFile content, program.checks
  outJson = JSON.stringify check, null, 4
  sys.puts outJson
else
  exports.checkHtmlFile = checkHtmlFilecontent = Fs.readFileSync Program.file
