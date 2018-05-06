class Banana {
  callee = 1
  caller = 2
  getDay() { }
  thisIsTheOnlyThatWillAutoComplete = 99
}
const banana = new Banana()
// banana.thisIsTheOnlyThatWillAutoComplete
/*
first we show that autocomplete in banana filter some 
members like callee, caller and getDay

Second, we show that when we select the class identifier
'banana' our refactor is suggested and it works, but
when we select other identifiers the suggestion is not 
shown
*/
