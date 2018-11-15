output.header=function(state)
{
	const
	showBack=!!state.view.path.length,
	placeholder=showBack?'/'+state.view.path.map(id=>state.file.data[id].text).join('/')+'/':'search',
	{length}=state.view.selected,
	//show edit button if only 1 item is selected
	filter=length===1?()=>true:x=>x!=='edit',
	btns=!length?
	[
		v('button',{data:{pointerup:'backOrOpts'}},showBack?'<':'='),
		v('input.search',{placeholder,type:'text'}),
		v('button',{data:{pointerup:'add'}},'+')
	]:
	//repeat is to mark completed items in the list as uncompleted (move to list opts & add shuffle?)
	'complete,delete,repeat,deselect,edit'//@todo make deselect a back button ligature
	.split(',')
	.filter(filter)
	.map(function(act)
	{
		const attrs={data:{pointerup:act}}

		if(!input[act]) attrs.disabled='disabled'

		return v('button',attrs,act)
	}),
	style=`background:${state.view.theme[0]};`

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
output.list=function(state,id,i,path)
{
	const
	item=state.file.data[id],
	opened=path[i+1],
	list=item.list.filter(x=>!!x),
	//ignore the first item as that goes to the header
	theme=util.themeGradient(state.view.theme,list.length+1).slice(1)
	items=util.mapEmpty(item.list,(id,i)=>output.item(state,opened,id,theme[i]))

	return v('ul',{},...items)
}
output.render=function(state)
{
	const
	[pointerup,mkList]=[input,output.list].map(fn=>util.curry(fn,state)),
	lists=util.mapEmpty(['index',...state.view.path],mkList),
	main=v('main',{data:{view:state.view.layout},on:{pointerup}},...lists)

	return [output.header(state),main]
}