fs = require 'fs'
{exec} = require 'child_process'

option '-f', '--file [file]', 'file to compile. Will result in a useable command-line file'

task 'build:script', 'Build project adding shabang for command-line use', (options) ->
  exec "iced -c #{options.file}", (err, stdout, stderr) ->
  # exec 'iced -c grader_iced.iced', (err, stdout, stderr) ->
    throw err if err
    js_file = options.file.replace /\.iced$/, ".js"
    js = fs.readFileSync(js_file)
    js = "#!/usr/bin/env node \n" + js
    fs.writeFileSync(js_file, js)
    exec "chmod 777 #{js_file}"
              
            
           
