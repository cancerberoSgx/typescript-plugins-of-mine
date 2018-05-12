ts-inquierer

# motivation

1) ts-plugin developer wants to implement move this class to that file. 
2) don't want to implement it and learn a particular editor's API (don't have time)
3) work in all editors / IDEs

so he need to interact with the user. this is more than normal refactor / suggestion flow. He need to define a language with states via the sourceFIle and the refactor suggestion visual methafor that the editor has

# Usecase examples

## Use case first iteration / attempt

1) user select classname
2) refactor suggestion appear "move class to another file"
3) user selects that suggestion
4) user sees at the end of that line in the sourcefile the following text: 
    // ~~tsinq~~ Please enter the target file path: HERE  ~~tsinq~~
5) user copy target file path and paste it replacing the word HERE with it
6) the class is moved from current file to that file. if error happens ( file ndont exist) - the same text changes and say 
    // ~~tsinq~~ Error ocurred moving class: file not found. operation aborted.  ~~tsinq~~



## alternative use case for the UI: https://github.com/s-a/node-prompt-here  + inquirer should work or node-pty

what about using a PTY TTY like cli-driver and really use inquirer ? is that possible from the plugin ? dont see see not WHy ? becuse there we can easily implement a file chooser with autocomplete !!! TODO: test if the PTY pops up on top of the editor! 


## alternative : user launch the terminal

1) user open in scode terminal before start: ts-inquirer 
2) the program greet and await
the in step 4 - instea of using the sourceFile, the plugin uses the terminal (it comunicates with ts-inquierer program somehow (socket?)) and the inquierer is performed on that terminal


## alternative use case for the UI: web server and browser!  

- npm run open browser pop up!
a lightweight webbrowser static pages can be spawned byt the tsserver so it doesn't interfere



# API

API ? how would be the API ? can it be simlar to inquiererjs api?

As an plugin developer (I want to develop ts-plugin-omve-class) i will use the library ts-inquierer to interact with the end user

I implement the language service that will suggest "move class" wne user select a class name

when that happen and user select my suggestion i will do:

const inquierer = require('ts-inquierer')
const ansewers = inquirer.prompt({
  type: text
})