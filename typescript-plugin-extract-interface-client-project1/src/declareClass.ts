
class C extends NonExistent implements NonExistentInterface, ExistentInterface{

}

class ExistentInterface{

}

/**
 * this class is awesome and this jsdoc will be broken because an issue. 
 */
class C extends ShowsJsDocIssue implements NonExistentInterface, ExistentInterface{

}