# typescript-plugins-text-based-user-interaction

**high level API for external process providing with input user experience like inputText, selectOption, showMessage, etc**

Motivation: in one side I have  TypeScript plugins that are editor agnostic. But they need a way to ask the user for input. By default I'm solving this with project, that is also editor agnostic. 

This project is about easily providing Input UI from external editor extensions so TypeScript plugins can ask for input agnostically - if there is any provider. For example, vscode extension ../vscode-typescript-refactors provides with minimal input UI so typescript plugins delegate Input UI inquirer to that extension, using this package API to be agnostic

Heads up : Input UI APi is async while TypesScript language service API is sync - but since I'm implementing them with ts-simple-ast it doesn't matter.

Perform IPC comunication!

## Consumer

```ts
const consumer = createConsumer({port: 3000})
await consumer.askSupport()
if(consumer.hasSupport(ACTION.inputText)){
  const name = await consumer.inputText({prompt: 'Enter you name', placeHolder: 'John Doe'})
}
```

## Provider

```ts
class VsCodeInputProvider extends InputProviderImpl {
  private supports: InputSupport = { 
    inputText: true,
    askSupported: true
  }
  async inputText(options: InputTextOptions): Promise<InputTextResponse>{
    const answer = await vscode.window.showInputBox(options)
    return {answer}
  }
  askSupported(): Promise<InputSupport>{
    return Promise.resolve(this.supports)
  }
}
const provider = new VsCodeInputProvider({port: 3000})
```


# TODO

 * destroy() the socket
 * tests
 * showmessage, error, warning
 * select (multiple)
 * selectText and move cursor (change feedback) -  so we can selectthe text changed after the refactor and also control the cursor just in case. 


# Dones

 * askSupported not to send if this support already was setted