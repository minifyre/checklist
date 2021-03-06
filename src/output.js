output.header=function(state)
{
	const
	style=`background:${state.view.theme[0]};`,
	fn=	logic.mode(state)==='move'?'optsMove':
		!state.view.selected.length?'optsList':
		'optsItem',
	btns=output[fn](state)

	return v('header',{on:{pointerup:evt=>input(state,evt)},style},...btns)
}
output.item=function(state,opened,id,color)
{
	const
	item=state.file.data[id],
	//@todo id attr could be an issue if child can have multiple parents 
		//& thus show up multiple times
	attrs={data:{pointerup:'open'},id,on:{},style:`background-color:${color};`},
	attrsDesc={data:{},on:{}}

	if(id===opened) attrs.data.opened=true

	if(id===state.view.edit)
	{
		attrsDesc.contenteditable=true
		attrsDesc.on.render=({target})=>target.focus()
		attrsDesc.on.blur=evt=>input.blur(state,evt)
	}
	else if(state.view.selected.includes(id)) attrs.data.selected=true

	if(item.complete) attrsDesc.data.completed=true
	//progress bars/icon text//@todo clean up
	const
	done=	item.complete?1:
			!item.list.length?0:
			item.list
			.map(id=>state.file.data[id])
			.filter(item=>item.complete)
			.length/item.list.length,
	percent=done*100,
	icon=	item.complete?'complete':
			item.list.length===0?'+':
			done?item.list
				.map(id=>state.file.data[id])
				.filter(item=>item.complete)
				.length+'/'+item.list.length:
			item.list.length

	attrsDesc.style=`background-image:linear-gradient(to right,transparent ${percent}%, #0003 ${percent}%)`

	return v('li',attrs,
		v('button.icon',{data:{pointerup:'toggleSelect'}},icon),
		v('span.desc',attrsDesc,item.text)
	)
}
output.list=function(state,filter,id,i,path)
{
	const
	item=state.file.data[id],
	opened=path[i+1],
	list=item.list.filter(x=>!!x),
	//ignore the first item as that goes to the header
	theme=util.themeGradient(state.view.theme,list.length+1).slice(1),
	items=item.list
	.filter(x=>!!x)
	.filter(filter)
	.map((id,i)=>output.item(state,opened,id,theme[i]))

	return v('ul',{},...items)
}
output.optsItem=function(state)
{
	const
	{length}=state.view.selected,
	edit=length===1?',edit':'',
	anyDone=state.view.selected.some(util.curry(logic.isComplete,state)),
	repeat=anyDone?'repeat,':'',
	btns='complete,delete,'+repeat+'move,deselect'+edit

	return btns.split(',').map(act=>v('button',{data:{pointerup:act}},act))
}
output.optsList=function(state)
{
	const
	mode=logic.mode(state),
	path=logic.path(state).filter(x=>!!x),
	showBack=mode==='move'||path.length>1,
	placeholder=showBack?'/'+path.slice(1).map(id=>state.file.data[id].text).join('/')+'/':'search',
	{list}=state.file.data[logic.listLowest(state)]||{list:[]},
	anyDone=list.some(util.curry(logic.isComplete,state)),
	repeat=anyDone?v('button',{data:{pointerup:'repeat'}},'repeat'):false

	return [
		v('button',{data:{pointerup:'backOrOpts'}},showBack?'<':'='),
		v('input.search',{placeholder,type:'text'}),
		repeat,
		v('button',{data:{pointerup:'shuffle'}},'shuffle'),
		v('button',{data:{pointerup:'download'}},'v'),
		v('button',{data:{pointerup:'add'}},'+')
	]
	.filter(x=>!!x)
}
output.optsMove=function(state)
{
	const
	path=logic.path(state).filter(x=>!!x),
	placeholder='/'+path.slice(1).map(id=>state.file.data[id].text).join('/')+'/'

	return [//@todo make a ligature named back that is an arrow pointing left
		v('button',{data:{pointerup:'backOrOpts'}},'<'),
		v('input.search',{placeholder,type:'text'}),
		v('button',{data:{pointerup:'moveHere'}},'complete')
		//@todo add ligature for check
	]
	.filter(x=>!!x)
}
output.render=function(state)
{
	const
	move=state.view.move.filter(x=>!!x),
	[pointerup,mkList]=[input,output.list].map(fn=>util.curry(fn,state)),
	[path,filter]=move.length?[move,id=>!state.view.selected.includes(id)]:[state.view.path,()=>true],
	lists=path.filter(x=>!!x).map(util.curry(mkList,filter)),
	main=v('main',{data:{view:state.view.layout},on:{pointerup}},...lists)

	return [output.header(state),main]
}