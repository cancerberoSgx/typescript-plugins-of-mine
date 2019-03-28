let mist;
//TODO: to misc
export function dirname(s: string) {
  const i = s.lastIndexOf('/');
  return i === -1 ? '.' : s.substring(0, i);
}
