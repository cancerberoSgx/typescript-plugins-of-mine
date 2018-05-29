
class C3 extends NonExistent implements NonExistentInterface, ExistentInterface{

}

class ExistentInterface{

}

/**
 * this class is awesome and this jsdoc will be broken because an issue. 
 */
class C2 extends ShowsJsDocIssue implements NonExistentInterface, ExistentInterface{

}