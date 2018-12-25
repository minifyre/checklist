//+1 ignores the first item as that goes to the header
util.itemColor=({view},_,i,{length})=>util.themeGradient(view.theme,length+1)[i+1]
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
util.optsListFilter=function(state)
{
	const
	exclude=[],
	{list}=state.file.data[logic.listLowest(state)]||{list:[]},
	anyDone=list.some(curry(logic.isComplete,state))

	if(!anyDone) exclude.push('repeat')

	return x=>!exclude.includes(x)
}
util.themeGradientCreate=function(theme)
{
	const
	key=JSON.stringify(theme),
	cached=cache.themeGradients[key]

	if(cached) return cached

	const
	h=100,
	w=1,
	can=Object.assign(document.createElement('canvas'),{height:h,width:w,style:`height:100px; width:100px;`}),
	ctx=can.getContext('2d'),
	grd=ctx.createLinearGradient(0,0,0,h)

	theme.forEach((color,i,{length})=>grd.addColorStop(i/length,color))
	ctx.fillStyle=grd
	ctx.fillRect(0,0,w,h)

	return cache.themeGradients[key]=
	[...ctx.getImageData(0,0,1,100).data]
	.filter((_,i)=>(i+1)%4)//remove alpha channels
	.reduce(curry(util.groupBy,3),[])
	.map(arr=>`rgb(${arr.join(',')})`)
}
util.themeGradient=function(theme,length)
{
	const cached=util.themeGradientCreate(theme)

	return Array(length)
	.fill(1)
	.map((_,i,{length})=>parseInt(i/length*100))
	.map(i=>cached[i])
}
//generic
util.groupBy=function(groupSize,rtn,item,i)
{
	const j=Math.floor(i/groupSize)

	!rtn[j]?rtn[j]=[item]:
			rtn[j].push(item)

	return rtn
}