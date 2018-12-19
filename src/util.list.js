util.empty=txt=>!txt.replace(/\s/g,'').length
//useful when rerendering before array length is updated (e.g. pop/splice)
util.mapEmpty=(arr,fn)=>arr.filter(x=>!!x).map(fn)
util.rand=(max,min=1,seed=Math.random())=>Math.floor(seed*(max-min+1))
util.shuffle=function(arr)
{
	arr.map(()=>util.rand(arr.length-1,0))
	.forEach((j,i)=>[arr[i],arr[j]]=[arr[j],arr[i]])

	return arr
}