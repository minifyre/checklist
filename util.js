util.clone=x=>JSON.parse(JSON.stringify(x))
//@todo put curry into base silo utils
util.curry=(fn,...xs)=>(...ys)=>fn(...xs,...ys)

util.empty=txt=>!txt.replace(/\s/g,'').length
//useful when rerendering before array length is updated (e.g. pop/splice)
util.mapEmpty=(arr,fn)=>arr.filter(x=>!!x).map(fn)
util.rand=(max,min=1,seed=Math.random())=>Math.floor(seed*(max-min+1))
util.shuffle=function(arr)
{
	arr.map(()=>util.rand(arr.length)-1)//-1 makes this zero-based
	.forEach((arr,j,i)=>[arr[i],arr[j]]=[arr[j],arr[i]])

	return arr
}
util.themeGradient=function(theme,length)
{
	const
	h=100,
	w=1,
	can=Object.assign(document.createElement('canvas'),{height:h,width:w,style:`height:100px; width:100px;`}),
	ctx=can.getContext('2d'),
	grd=ctx.createLinearGradient(0,0,0,h)

	theme.forEach((color,i,{length})=>grd.addColorStop(i/length,color))
	ctx.fillStyle=grd
	ctx.fillRect(0,0,w,h)

	return Array(length)
	.fill(1)
	.map(function(_,i,{length})
	{
		const
		y=parseInt(i/length*100),
		rgb=ctx.getImageData(0,y,1,1).data.slice(0,3)

		return `rgb(${rgb.join(',')})`
	})
}