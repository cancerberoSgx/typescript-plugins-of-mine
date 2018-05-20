


TODO

 * right now this is a typescript language service plugin but since it only rely on autocomplete it should be
   based on https://github.com/Microsoft/language-server-protocol so it's more widely supported

# What's this

(best way to explain with with gif)

I've made a couple of typescript plugins for code refactoring using Language server Protocol
(https://microsoft.github.io/language-server-protocol/) and although some of them don't need
anything else and LSP capable editors will handle them OK, there are other plugins that require
interaction with the user (for example user choosing target file where to move a file or a class, or
more complicated things like target class where to move a member)

Again I want to use these plugins on any ide - I want me and my work to be as much as IDE/editor agnostic as
wen can :)  Basically I  and don't want to learn each of the APIs to implement
this interactions. So the idea is, communicate with TypeScript Language server throw text in the same
SourceFile and refactor/autocomplete standard LSP commands. 


## Use case: move a file

1) User starts writing the following chars at the beggining of the file: 
```
//&%&
```

2) at that moment autocomplete or refactor suggestions start appear with all possible refactors
supported for the file, like move or rename or clear imports, or format.

3) User chooses "move file" and the server will write the following snippet: 
```
//%&%& moveThisFile dest: "$CURSOR-HERE"
```
4) user copy&past or start writing the file path where to move the file. The plugin can even put the current path
and autocommplete, with local FS - all using the source file - no GUI - no filechoosers. 

5) When user or pugin finish writing the target filename, user "closes" the comment and at that time a final
suggestion will ask user to confirm the action, if accepted the file wil lbe moved. 


## Use case 2: Move a method to another class


export interface Foo{
  //%&%&                    <==== here the user start typing that pattern
  /**
   * lorem
   */
  methodUserWantToMove(){

  }
}

Again the user starts writing the pattern "//%&%&" but this time just before the method he wants to move. The
plugin offer some refactor suggestions, among others "move to other interface"

User chooses that and the editor completes with the snippet: 

//%&%& moveNextMember dest: "$CURSOR-HERE"


User writes the name of the interface - plugin could even autocomplete or let him select in case there are two
with same name. 


## No mouse

for common refactors like extract interface, method delegation, change signature - this interaction could be
better for some userse -instead of selecting a method name with the mouse this allows to trigger refactors
quickyly with just the keyboard in the right context


# What's implemented on this project ? 

rght now nothnkg, just an idea. 

Currently this goes concretly against typescript/javascript  tsserver and tested in vscode but the idea could be expanded
to other servers and other similar languages 

 * plugins are in the other packages

 * With luck, here we will implement just the dialog with markings shown in use cases between user and plugin. It
will be a LS plugin interpreting that and responding with autocomplete I guess

 * it will be used as a library - so it will be a cofiguratble plugin... used by other that needs to dialogate
  wiht th user. 

Something like the following (plugin configuring this library):

tool.register({
  name: 'moveMember',
  'prefix': '&%&%',
  onPrefixSuggestions: (suggestPredicate: (sourcefile)=>boolean):Suggestion[]
  onSuggesstionSelected: ()=>string (snippet)
})