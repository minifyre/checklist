util.optsItemFilter=function(state)
{
	const
	exclude=[],
	{selected}=state.view,
	anyDone=selected.some(curry(logic.isComplete,state))

	if(selected.length!==1) exclude.push('edit') 
	if(!anyDone) exclude.push('repeat') 

	return x=>!exclude.includes(x)
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
util.txt2txts=function(txt)
{
	return txt.split(config.newline)
			.filter(x=>x.length)
			.map(util.txtRepeat)
			.reduce(util.flatten,[])
}
util.txtRepeat=function(txt)
{
	const repeat=/X:\d+-\d+/

	if(!txt.match(repeat)) return [txt]

	const
	[replace]=txt.match(repeat),//X:11-2
	[min,max]=replace.split(':')[1]//11-2
			.split('-')//[11','2']
			.map(d=>parseInt(d))//[11,2]
			.sort((a,b)=>a-b)//[2,11]//sort() will keep 11 in front

	return Array(max-min+1)
			.fill(min)
			.map((d,i)=>d+i)
			.map(d=>txt.replace(repeat,d))
}