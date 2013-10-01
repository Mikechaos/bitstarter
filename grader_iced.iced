#!/usr/bin/env node

$ = {}
fs = require 'fs';
program = require 'commander'
cheerio = require 'cheerio'
HTMLFILE_DEFAULT = "index.html"
CHECKSFILE_DEFAULT = "checks.json"

sys = require 'util'
rest = require 'restler'

program.url = "http://ec2-54-200-102-151.us-west-2.compute.amazonaws.com:8080/"
# program.url = "http://google.ca"
program.checks = "checks.json"

get_url_content = (content) -> 
  return @result if arguments.length is 0
  @result = content


# make_autoclear_async = (predicate, body = (->), elapse = 500) ->
#   console.log predicate.call(null)
#   int = setInterval ->
#     if predicate.call(null)
#       clearInterval(int)
#       console.log 'true'
#       body.call(null, int)
#     else
#       console.log 'test'
#    , elapse
 
make_autoclear_async = (predicate) ->
  console.log predicate.call null
    await
      int = setInterval ->
        if predicate.call null
          clearInterval(int)
          console.log 'test'
          content = predicate.call null
          defer()
      , 500

read_url = (url) ->
        rest.get(url).on 'complete', (result) ->
                if result instanceof Error
                        sys.puts('Error: ' + result.message);
                        @retry(5000);
                else
                        get_url_content result
        await make_autoclear_async -> get_url_content()?
        console.log get_url_content()
        return get_url_content()


                   
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

get_content = ->
        if program.url?
                read_url program.url
        else fs.readFileSync program.file
        

if require.main is module
  program
    .option('-c, --checks <check_file>', 'Path to checks.json',
            clone(assertFileExists), CHECKSFILE_DEFAULT)
    .option('-f, --file <html_file>', 'Path to index.html',
            clone(assertFileExists), HTMLFILE_DEFAULT)
    .option('-u, --url <url_to_file', 'Url to html file')
    .parse(process.argv);
    # program.url = undefined
    # program.file = "index.html"
    content = get_content()
    console.log content
    check = checkHtmlFile content, program.checks
    outJson = JSON.stringify check, null, 4
    console.log outJson
else
  exports.checkHtmlFile = checkHtmlFilecontent = Fs.readFileSync Program.file
