//@todo put curry into base silo utils
util.curry=(fn,...xs)=>(...ys)=>fn(...xs,...ys)

util.empty=txt=>!txt.replace(/\s/g,'').length
//useful when rerendering before array length is updated (e.g. pop/splice)
util.mapEmpty=(arr,fn)=>arr.filter(x=>!!x).map(fn)