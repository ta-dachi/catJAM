export function urlHash2Obj(hash: string): any {
  return hash
    .split("&")
    .map((v) => v.split("="))
    .reduce((pre, [key, value]) => ({ ...pre, [key]: value }), {})
}