/**
 * a fruit is a living thing, produced by trees
 */
interface IFruit {
  /**
   * use undefined for 100% transparency
   */
  color: string | undefined;
  /**
   * will resolve when it's worthwhile
   */
  foo(): () => Promise<string[][]>;
  /**
   * @param greet the greeting to show in all user's screens 
   */
  bar(greet: string): Promise<string[]>;
}

/**
 * a fruit is a living thing, produced by trees
 */
class Fruit extends LivingThing implements IFruit { // suggested from anywhere inside the class declaration
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

interface Iobj21 {
  color: string;
  creationDate: Date;
  foo(): Promise<Date[]>;
  bar(greet: string): Promise<string[]>;
}

const obj21: Iobj21 = { // suggested form anywhere inside the object literal expression
  color: 'red',
  creationDate: new Date(),
  foo: () => Promise.resolve([new Date()]),
  bar(greet: string): Promise<string[]> { return null }
}






























