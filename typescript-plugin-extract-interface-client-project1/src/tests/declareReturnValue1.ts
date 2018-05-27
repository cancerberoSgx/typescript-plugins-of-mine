
function g(): GResult {
  return { a: 1, b: 's' }
}
const h = () => HResult{
  return { a: 1, b: 's', log: (msg) => boolean, kill: function() { return 1 }}
}
function fn<T>(): FNResult<T> {
  return { a: 1, b: 's', log: (msg) => boolean, kill: function <T>() { return 1 } }
} 