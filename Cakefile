 fs = require 'fs'

{exec} = require 'child_process'

option '-f', '--file [file]', 'file to compile. Will result in a useable command-line file'

task 'build:script', 'Build project adding shabang for command-line use', (options) ->
  exec "iced -c #{options.file}", (err, stdout, stderr) ->
  # exec 'iced -c grader_iced.iced', (err, stdout, stderr) ->
    throw err if err
    js_file = options.file.replace /((\.iced$)|(\.coffee$))/, ".js"
    js = fs.readFileSync(js_file)
    js = SHABANG + js
    fs.writeFileSync(js_file, js)
    exec "chmod 777 #{js_file}"

task 'list-ic', 'test', ->
  await list_ic_files defer ic_list
  console.log ic_list

# fetch a list of files matching /pattern/
# stdout : string with matching files, \n as separator
# skip last entry since it will always be empty (trailing \n)
list_files = (autocb, pattern = '.*') ->
  await exec "ls | egrep '#{pattern}'", defer err, stdout, stderr
  (stdout.split '\n')[...-1]

# List files matching .iced or .coffee
list_ic_files = (cb) ->
  list_files cb, '((\.iced$)|(\.coffee$))'

# transform a single string
# ***.(iced|coffee) => ***.js
replace_ic_with_js = (filename) ->
  filename.replace /((\.iced$)|(\.coffee$))/, ".js"

# Treat a whole list
replace_list_with_js = (list) ->
  replace_ic_with_js file for file in list

# Fetch the list of .iced & .coffee
# Returns an array of the corresping .js
list_ic_file_and_replace = (autocb) ->
  await list_ic_files defer list
  return replace_list_with_js list


# User either iced -c or coffee -c depending on .ext
# This avoids possible collapse with await or defer being use ine .coffee code
get_right_command = (file) ->
    if ("test.iced".search /\.iced$/) isnt -1 then "iced" else "coffee"

# Compile to corresponding js
# calls a callback with the content
compile_file = (ic_file, cb) ->
  cmd = get_right_command ic_file
  exec "#{cmd} -c #{ic_file}", (err, content, stderr) ->
    throw err if err
    cb content

compile_all = ->
  ic_files = await list_ic_files defer ic_list
  js_files = replace_list_with_js ic_list
  contents = []
  make_file_a_script ic_file for ic_file in ic_list
  
make_file_executable = (file) ->
  exec "chmod 777 #{file}"

add_shabang = (file) ->
  SHABANG = "#!/usr/bin/env node \n"
  ADDTEXT = SHABANG + "// Produce by X task\n"
  js = fs.readFileSync(file)
  js_script = ADDTEXT + js
  fs.writeFileSync(file, js_script)

make_file_a_script = (ic_file) ->
  compile_file ic_file, (content) ->
    js_file = replace_ic_with_js ic_file
    add_shabang js_file
    make_file_exectuable js_file
  

make_list_scripts = (ic_list) ->
  make_file_a_script ic_file for ic_file in ic_list
  return;

task 'make-ic-scripts', 'test',  ->
  # await list_ic_file_and_replace defer js_list
  await list_ic_files defer ic_list
  console.log ic_list
 
