output.header=function(state)
{
	const
	style=`background:${state.view.theme[0]};`,
	fn=	logic.mode(state)==='move'?'optsMove':
		!state.view.selected.length?'optsList':
		'optsItem',
	btns=output[fn](state),

	mode=logic.mode(state),
	path=logic.path(state).filter(x=>!!x),
	back=mode==='move'||path.length>1

	return v('header',{data:{back},on:{pointerup:evt=>input(state,evt)},style},...btns)
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

	attrsDesc.style=`background-image:linear-gradient(to right,#fff9 ${percent}%, #f8f8f8 ${percent}%)`

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