
/**
 * a fruit is a living thing, produced by trees
 */
class Fruit extends LivingThing  { // suggested from anywhere inside the class declaration
  /**
   * use undefined for 100% transparency
   */
  color: string | undefined
  /** shouldn't be exported */
  private creationDate: Date
  /**
   * will resolve when it's worthwhile
   */
  foo() {
    return Promise.resolve([['smile']])
  }
  /**
   * @param greet the greeting to show in all user's screens 
   */
  bar(greet: string): Promise<string[]> { return null }
}

const obj21 = { // suggested from anywhere inside the object literal expression
  color: 'red',
  creationDate: new Date(),
  foo: () => Promise.resolve([new Date()]),
  bar(greet: string): Promise<string[]> { return null }
}






























