class A{

}

function f(){
  return 1
}

function main(){

  i=f()

  // new A('hello') // create constructor : do it later

  // const a = new A("12")
  const a1 = new A()
  a1.nonexistenMethod()
}